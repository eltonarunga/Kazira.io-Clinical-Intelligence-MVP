import { PrismaClient } from '@prisma/client'
import { subDays, addDays } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
  // Clean up existing data
  await prisma.weeklyReport.deleteMany()
  await prisma.billingFlag.deleteMany()
  await prisma.invoiceLineItem.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.procedure.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.clinic.deleteMany()

  // 1. Create Clinic
  const clinic = await prisma.clinic.create({
    data: {
      name: 'Westlands Dental Centre',
      owner_name: 'Dr. Sarah Kamau',
      email: 'sarah@westlandsdental.co.ke',
      phone: '+254700000000',
      location: 'Westlands, Nairobi',
      subscription_status: 'active',
      subscription_tier: 'standard',
    },
  })

  // 2. Create Patients
  const patientNames = [
    'Wanjiku Mutua', 'Kamau Njoroge', 'Akinyi Omondi', 'Kipchoge Keino', 'Muthoni Ndung\'u',
    'Ochieng Odhiambo', 'Nyambura Mwangi', 'Kariuki Maina', 'Auma Obama', 'Wekesa Simiyu',
    'Njeri Karanja', 'Kiprop Koech', 'Atieno Otieno', 'Waweru Kimani', 'Moraa Nyaboke',
    'Omondi Oloo', 'Wangari Maathai', 'Kiplagat Sang', 'Nanjala Wafula', 'Onyango Opiyo',
    'Wanjiru Ng\'ang\'a', 'Kiprono Bett', 'Awino Odera', 'Mwangi Kiarie', 'Kemunto Nyanchama',
    'Odera Ooko', 'Nyokabi Kinyanjui', 'Kipkemboi Rono', 'Nekesa Wanjala', 'Ouma Omondi'
  ]

  const patients = await Promise.all(
    patientNames.map((name, i) =>
      prisma.patient.create({
        data: {
          clinic_id: clinic.id,
          patient_ref: `PT-${(i + 1).toString().padStart(4, '0')}`,
          name,
        },
      })
    )
  )

  // 3. Create Procedures
  const procedureTypes = [
    { code: 'D0120', name: 'Periodic Oral Evaluation', value: 3000 },
    { code: 'D1110', name: 'Prophylaxis - Adult', value: 5000 },
    { code: 'D2140', name: 'Amalgam - One Surface', value: 4500 },
    { code: 'D2330', name: 'Resin-Based Composite', value: 6000 },
    { code: 'D2740', name: 'Crown - Porcelain/Ceramic', value: 35000 },
    { code: 'D3310', name: 'Endodontic Therapy', value: 25000 },
    { code: 'D7140', name: 'Extraction', value: 4000 },
  ]

  const procedures = []
  const now = new Date()

  for (let i = 0; i < 90; i++) {
    const patient = patients[i % patients.length]
    const procType = procedureTypes[i % procedureTypes.length]
    const daysAgo = Math.floor(Math.random() * 30)
    const performedAt = subDays(now, daysAgo)

    // Mix of billed and unbilled
    // 60 billed, 30 unbilled
    const billingStatus = i < 60 ? 'billed' : 'unbilled'

    const procedure = await prisma.procedure.create({
      data: {
        clinic_id: clinic.id,
        patient_id: patient.id,
        procedure_code: procType.code,
        procedure_name: procType.name,
        performed_at: performedAt,
        performed_by: 'Dr. Sarah Kamau',
        billing_status: billingStatus,
        estimated_value_kes: procType.value,
      },
    })
    procedures.push(procedure)
  }

  // 4. Create Invoices
  // 60 invoices. Some matching procedures, some not.
  const invoices = []
  for (let i = 0; i < 60; i++) {
    const procedure = procedures[i] // Link first 60 procedures
    const patient = patients.find(p => p.id === procedure.patient_id)!
    
    // Create partial charge for some
    const isPartial = i % 10 === 0 // Every 10th invoice is partial
    const unitPrice = isPartial ? Number(procedure.estimated_value_kes) * 0.5 : Number(procedure.estimated_value_kes)

    const invoice = await prisma.invoice.create({
      data: {
        clinic_id: clinic.id,
        patient_id: patient.id,
        invoice_number: `INV-${(i + 1).toString().padStart(4, '0')}`,
        issued_at: addDays(procedure.performed_at, 1),
        due_at: addDays(procedure.performed_at, 15),
        paid_at: i % 5 !== 0 ? addDays(procedure.performed_at, 5) : null, // 80% paid
        total_amount_kes: unitPrice,
        status: i % 5 !== 0 ? 'paid' : 'issued',
        line_items: {
          create: {
            procedure_id: procedure.id,
            description: procedure.procedure_name,
            quantity: 1,
            unit_price_kes: unitPrice,
            line_total_kes: unitPrice,
          }
        }
      },
    })
    invoices.push(invoice)
  }

  // 5. Create Billing Flags
  // Unbilled procedure flag
  await prisma.billingFlag.create({
    data: {
      clinic_id: clinic.id,
      procedure_id: procedures[61].id, // This is an unbilled procedure
      flag_type: 'unbilled_procedure',
      estimated_gap_kes: procedures[61].estimated_value_kes,
      status: 'open',
    }
  })

  // Missing invoice flag
  // Let's make procedure 59 billed but no invoice (we linked it above, let's delete the invoice)
  await prisma.invoiceLineItem.deleteMany({ where: { invoice_id: invoices[59].id } })
  await prisma.invoice.delete({ where: { id: invoices[59].id } })
  
  await prisma.billingFlag.create({
    data: {
      clinic_id: clinic.id,
      procedure_id: procedures[59].id,
      flag_type: 'missing_invoice',
      estimated_gap_kes: procedures[59].estimated_value_kes,
      status: 'open',
    }
  })

  // Partial charge flag
  await prisma.billingFlag.create({
    data: {
      clinic_id: clinic.id,
      procedure_id: procedures[10].id, // We made every 10th invoice partial
      flag_type: 'partial_charge',
      estimated_gap_kes: Number(procedures[10].estimated_value_kes) * 0.5,
      status: 'open',
    }
  })

  // 6. Create Weekly Reports
  for (let i = 1; i <= 4; i++) {
    const weekEnd = subDays(now, i * 7)
    const weekStart = subDays(weekEnd, 7)
    
    await prisma.weeklyReport.create({
      data: {
        clinic_id: clinic.id,
        week_start: weekStart,
        week_end: weekEnd,
        total_revenue_kes: 150000 + (Math.random() * 50000),
        missed_billing_kes: 15000 + (Math.random() * 10000),
        procedures_count: 45,
        invoices_count: 40,
        report_status: 'sent',
        delivered_at: weekEnd,
        report_text: `Weekly Revenue Report for Westlands Dental Centre\n\nThis week you collected KES 175,000. We detected KES 20,000 in missed billing opportunities across 3 procedures.\n\nAction Items:\n1. Invoice PT-0012 for Crown procedure.\n2. Follow up on partial payment for PT-0005.\n3. Review unbilled consultations from Tuesday.`,
      }
    })
  }

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
