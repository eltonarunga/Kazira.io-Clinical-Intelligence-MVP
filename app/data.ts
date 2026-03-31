import { prisma } from '@/lib/prisma'
import { subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns'

export async function getDashboardSummary(clinicId: string, period: 'day' | 'week' | 'month' = 'week') {
  const now = new Date()
  let startDate: Date
  let endDate: Date
  let priorStartDate: Date
  let priorEndDate: Date

  if (period === 'day') {
    startDate = startOfDay(now)
    endDate = endOfDay(now)
    priorStartDate = startOfDay(subDays(now, 1))
    priorEndDate = endOfDay(subDays(now, 1))
  } else if (period === 'month') {
    startDate = startOfMonth(now)
    endDate = endOfMonth(now)
    priorStartDate = startOfMonth(subDays(startDate, 1))
    priorEndDate = endOfMonth(subDays(startDate, 1))
  } else {
    // week
    startDate = startOfWeek(now, { weekStartsOn: 1 })
    endDate = endOfWeek(now, { weekStartsOn: 1 })
    priorStartDate = startOfWeek(subDays(startDate, 1), { weekStartsOn: 1 })
    priorEndDate = endOfWeek(subDays(startDate, 1), { weekStartsOn: 1 })
  }

  const currentInvoices = await prisma.invoice.findMany({
    where: { clinic_id: clinicId, issued_at: { gte: startDate, lte: endDate } }
  })
  const periodRevenueKes = currentInvoices.reduce((sum, inv) => sum + Number(inv.total_amount_kes), 0)

  const priorInvoices = await prisma.invoice.findMany({
    where: { clinic_id: clinicId, issued_at: { gte: priorStartDate, lte: priorEndDate } }
  })
  const priorRevenueKes = priorInvoices.reduce((sum, inv) => sum + Number(inv.total_amount_kes), 0)

  const vsPreviousPeriodPercent = priorRevenueKes === 0 ? 100 : ((periodRevenueKes - priorRevenueKes) / priorRevenueKes) * 100

  const flags = await prisma.billingFlag.findMany({
    where: { clinic_id: clinicId, detected_at: { gte: startDate, lte: endDate } }
  })
  const missedBillingKes = flags.reduce((sum, f) => sum + Number(f.estimated_gap_kes), 0)

  const proceduresCount = await prisma.procedure.count({
    where: { clinic_id: clinicId, performed_at: { gte: startDate, lte: endDate } }
  })

  const openFlagsCount = await prisma.billingFlag.count({
    where: { clinic_id: clinicId, status: 'open' }
  })

  const totalPotentialRevenue = periodRevenueKes + missedBillingKes
  const collectionRatePercent = totalPotentialRevenue === 0 ? 0 : (periodRevenueKes / totalPotentialRevenue) * 100

  return {
    period_revenue_kes: periodRevenueKes,
    missed_billing_kes: missedBillingKes,
    collection_rate_percent: collectionRatePercent,
    procedures_count: proceduresCount,
    invoices_issued: currentInvoices.length,
    open_flags_count: openFlagsCount,
    vs_previous_period_percent: vsPreviousPeriodPercent
  }
}

export async function getRevenueTrend(clinicId: string, period: 'week' | 'month' = 'week') {
  const now = new Date()
  let startDate: Date
  let endDate: Date
  let days: number

  if (period === 'month') {
    startDate = startOfMonth(now)
    endDate = endOfMonth(now)
    days = 30
  } else {
    startDate = startOfWeek(now, { weekStartsOn: 1 })
    endDate = endOfWeek(now, { weekStartsOn: 1 })
    days = 7
  }

  const trendData = []
  
  for (let i = 0; i < days; i++) {
    const date = subDays(endDate, days - 1 - i)
    const dayStart = startOfDay(date)
    const dayEnd = endOfDay(date)

    const invoices = await prisma.invoice.findMany({
      where: { clinic_id: clinicId, issued_at: { gte: dayStart, lte: dayEnd } }
    })
    const collectedKes = invoices.reduce((sum, inv) => sum + Number(inv.total_amount_kes), 0)

    const flags = await prisma.billingFlag.findMany({
      where: { clinic_id: clinicId, detected_at: { gte: dayStart, lte: dayEnd } }
    })
    const missedKes = flags.reduce((sum, f) => sum + Number(f.estimated_gap_kes), 0)

    trendData.push({
      date: date.toISOString().split('T')[0],
      collected_kes: collectedKes,
      missed_kes: missedKes
    })
  }

  return trendData
}

export async function getFlags(clinicId: string, status?: string) {
  const whereClause: any = { clinic_id: clinicId }
  if (status && status !== 'all') {
    whereClause.status = status
  }

  const flags = await prisma.billingFlag.findMany({
    where: whereClause,
    include: {
      procedure: {
        include: {
          patient: true
        }
      }
    },
    orderBy: { detected_at: 'desc' }
  })

  return flags
}

export async function getReports(clinicId: string) {
  const reports = await prisma.weeklyReport.findMany({
    where: { clinic_id: clinicId },
    orderBy: { week_start: 'desc' }
  })
  return reports
}
