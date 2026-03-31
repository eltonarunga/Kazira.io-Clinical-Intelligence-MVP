'use server'

import { prisma } from '@/lib/prisma'
import { subHours, subDays, startOfWeek, endOfWeek } from 'date-fns'
import { revalidatePath } from 'next/cache'
import { sendWeeklyReportEmail } from '@/lib/email'
import { z } from 'zod'
import PostHogClient from '@/lib/analytics'

const clinicIdSchema = z.string().uuid()
const flagIdSchema = z.string().uuid()
const resolveFlagSchema = z.object({
  flagId: z.string().uuid(),
  status: z.enum(['resolved', 'dismissed']),
  resolutionNote: z.string().optional()
})

export async function detectBillingGaps(clinicId: string) {
  try {
    const parsedClinicId = clinicIdSchema.parse(clinicId)
    let flagsCreated = 0
    let totalGapKes = 0
    const breakdownByType = {
      unbilled_procedure: 0,
      missing_invoice: 0,
      partial_charge: 0,
    }

    const now = new Date()

    // 1. Unbilled procedure
    const unbilledProcedures = await prisma.procedure.findMany({
      where: {
        clinic_id: parsedClinicId,
        billing_status: 'unbilled',
        performed_at: { lt: subHours(now, 24) },
        invoice_line_items: { none: {} },
        billing_flags: { none: { flag_type: 'unbilled_procedure' } }
      }
    })

    for (const proc of unbilledProcedures) {
      await prisma.billingFlag.create({
        data: {
          clinic_id: parsedClinicId,
          procedure_id: proc.id,
          flag_type: 'unbilled_procedure',
          estimated_gap_kes: proc.estimated_value_kes,
        }
      })
      flagsCreated++
      totalGapKes += Number(proc.estimated_value_kes)
      breakdownByType.unbilled_procedure++
    }

    // 2. Missing invoice
    const billedProcedures = await prisma.procedure.findMany({
      where: {
        clinic_id: parsedClinicId,
        billing_status: 'billed',
        billing_flags: { none: { flag_type: 'missing_invoice' } }
      },
      include: {
        patient: { include: { invoices: true } }
      }
    })

    for (const proc of billedProcedures) {
      const procDate = new Date(proc.performed_at)
      const fortyEightHoursLater = new Date(procDate.getTime() + 48 * 60 * 60 * 1000)
      
      const hasInvoiceWithin48h = proc.patient.invoices.some(inv => {
        const invDate = new Date(inv.issued_at)
        return invDate >= procDate && invDate <= fortyEightHoursLater
      })

      if (!hasInvoiceWithin48h) {
        await prisma.billingFlag.create({
          data: {
            clinic_id: parsedClinicId,
            procedure_id: proc.id,
            flag_type: 'missing_invoice',
            estimated_gap_kes: proc.estimated_value_kes,
          }
        })
        flagsCreated++
        totalGapKes += Number(proc.estimated_value_kes)
        breakdownByType.missing_invoice++
      }
    }

    // 3. Partial charge
    const proceduresWithLineItems = await prisma.procedure.findMany({
      where: {
        clinic_id: parsedClinicId,
        invoice_line_items: { some: {} },
        billing_flags: { none: { flag_type: 'partial_charge' } }
      },
      include: { invoice_line_items: true }
    })

    for (const proc of proceduresWithLineItems) {
      const sumLineItems = proc.invoice_line_items.reduce((sum, item) => sum + Number(item.line_total_kes), 0)
      const estimatedValue = Number(proc.estimated_value_kes)
      
      if (sumLineItems < estimatedValue * 0.8) {
        const gap = estimatedValue - sumLineItems
        await prisma.billingFlag.create({
          data: {
            clinic_id: parsedClinicId,
            procedure_id: proc.id,
            flag_type: 'partial_charge',
            estimated_gap_kes: gap,
          }
        })
        flagsCreated++
        totalGapKes += gap
        breakdownByType.partial_charge++
      }
    }

    revalidatePath('/dashboard')
    revalidatePath('/flags')
    
    const ph = PostHogClient()
    if (ph) {
      ph.capture({
        distinctId: parsedClinicId,
        event: 'billing_gaps_detected',
        properties: {
          flagsCreated,
          totalGapKes,
          breakdownByType
        }
      })
    }
    
    return { success: true, flagsCreated, totalGapKes, breakdownByType }
  } catch (error) {
    console.error('Error detecting billing gaps:', error)
    return { success: false, error: 'Failed to detect billing gaps' }
  }
}

export async function resolveFlag(flagId: string, status: 'resolved' | 'dismissed', resolutionNote?: string) {
  try {
    const parsed = resolveFlagSchema.parse({ flagId, status, resolutionNote })
    await prisma.billingFlag.update({
      where: { id: parsed.flagId },
      data: {
        status: parsed.status,
        resolved_at: new Date(),
        resolution_note: parsed.resolutionNote,
      }
    })
    revalidatePath('/dashboard')
    revalidatePath('/flags')
    
    const ph = PostHogClient()
    if (ph) {
      ph.capture({
        distinctId: 'system', // or get user id if available
        event: 'flag_resolved',
        properties: {
          flagId: parsed.flagId,
          status: parsed.status,
          hasNote: !!parsed.resolutionNote
        }
      })
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error resolving flag:', error)
    return { success: false, error: 'Failed to resolve flag' }
  }
}

export async function generateWeeklyReport(clinicId: string) {
  try {
    const parsedClinicId = clinicIdSchema.parse(clinicId)
    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
    
    const priorWeekStart = subDays(weekStart, 7)
    const priorWeekEnd = subDays(weekEnd, 7)

    // 1. Pull revenue totals for the week
    const currentWeekInvoices = await prisma.invoice.findMany({
      where: {
        clinic_id: parsedClinicId,
        issued_at: { gte: weekStart, lte: weekEnd }
      }
    })
    const totalRevenueKes = currentWeekInvoices.reduce((sum, inv) => sum + Number(inv.total_amount_kes), 0)

    // 2. Pull prior week revenue
    const priorWeekInvoices = await prisma.invoice.findMany({
      where: {
        clinic_id: parsedClinicId,
        issued_at: { gte: priorWeekStart, lte: priorWeekEnd }
      }
    })
    const priorWeekRevenueKes = priorWeekInvoices.reduce((sum, inv) => sum + Number(inv.total_amount_kes), 0)

    const deltaPercent = priorWeekRevenueKes === 0 ? 100 : ((totalRevenueKes - priorWeekRevenueKes) / priorWeekRevenueKes) * 100

    // 3. Pull BillingFlags for the week
    const flags = await prisma.billingFlag.findMany({
      where: {
        clinic_id: parsedClinicId,
        detected_at: { gte: weekStart, lte: weekEnd }
      },
      include: {
        procedure: {
          include: { patient: true }
        }
      }
    })

    const missedBillingKes = flags.reduce((sum, f) => sum + Number(f.estimated_gap_kes), 0)
    const unbilledCount = flags.filter(f => f.flag_type === 'unbilled_procedure').length

    // 4. Call Anthropic API
    const clinic = await prisma.clinic.findUnique({ where: { id: parsedClinicId } })
    if (!clinic) throw new Error('Clinic not found')

    const prompt = `
SYSTEM:
You are a financial intelligence assistant for a private dental clinic in Nairobi, Kenya. 
You write clear, direct weekly revenue reports for clinic owner-operators. 
Your audience is busy — write like a trusted advisor, not a software tool.
Never use jargon. Use plain English. Be specific about amounts in KES.
Always end with 3 specific, numbered action items the owner can act on today.

USER:
Here is this week's clinic data for ${clinic.name}:

Week: ${weekStart.toISOString().split('T')[0]} to ${weekEnd.toISOString().split('T')[0]}

Revenue collected: KES ${totalRevenueKes.toLocaleString()}
Prior week revenue: KES ${priorWeekRevenueKes.toLocaleString()}
Change: ${deltaPercent.toFixed(1)}%

Missed billing detected: KES ${missedBillingKes.toLocaleString()}
Number of unbilled procedures: ${unbilledCount}
Number of flagged gaps: ${flags.length}

Billing gaps (list each one):
${flags.map(f => `- ${f.procedure.procedure_name} for patient ${f.procedure.patient.patient_ref} on ${f.procedure.performed_at.toISOString().split('T')[0]}: estimated KES ${f.estimated_gap_kes} — ${f.flag_type}`).join('\n')}

Write the weekly report now.
`

    let reportText = "Report generation failed."
    
    if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your-anthropic-api-key') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }]
        })
      })
      const data = await response.json()
      if (data.content && data.content[0]) {
        reportText = data.content[0].text
      }
    } else {
      // Mock report for dev if no API key
      reportText = `Weekly Revenue Report for ${clinic.name}\n\nThis week you collected KES ${totalRevenueKes.toLocaleString()}. We detected KES ${missedBillingKes.toLocaleString()} in missed billing opportunities across ${flags.length} procedures.\n\nAction Items:\n1. Invoice patients for unbilled procedures.\n2. Follow up on partial payments.\n3. Review missing invoices from this week.`
    }

    // 5. Save report
    const report = await prisma.weeklyReport.create({
      data: {
        clinic_id: parsedClinicId,
        week_start: weekStart,
        week_end: weekEnd,
        total_revenue_kes: totalRevenueKes,
        missed_billing_kes: missedBillingKes,
        procedures_count: await prisma.procedure.count({ where: { clinic_id: parsedClinicId, performed_at: { gte: weekStart, lte: weekEnd } } }),
        invoices_count: currentWeekInvoices.length,
        report_text: reportText,
        report_status: 'draft', // Draft until sent
      }
    })

    // 6. Send email
    const emailResult = await sendWeeklyReportEmail(clinic.email, clinic.name, reportText)

    if (emailResult.success) {
      await prisma.weeklyReport.update({
        where: { id: report.id },
        data: {
          report_status: 'sent',
          delivered_at: new Date()
        }
      })
    }

    revalidatePath('/reports')
    
    const ph = PostHogClient()
    if (ph) {
      ph.capture({
        distinctId: parsedClinicId,
        event: 'weekly_report_generated',
        properties: {
          reportId: report.id,
          totalRevenueKes,
          missedBillingKes,
          proceduresCount: report.procedures_count,
          invoicesCount: report.invoices_count,
          emailSent: emailResult.success
        }
      })
    }
    
    return { success: true, reportId: report.id }
  } catch (error) {
    console.error('Error generating report:', error)
    return { success: false, error: 'Failed to generate report' }
  }
}
