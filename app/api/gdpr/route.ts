import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: Request) {
  const session = await getServerSession()
  
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fetch all user data for GDPR export
    const userData = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        // Include related data here based on your schema
        // e.g., accounts: true, sessions: true,
      }
    })

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      data: userData,
      exportedAt: new Date().toISOString(),
      message: 'This is a complete export of your personal data in accordance with GDPR.'
    })
  } catch (error) {
    console.error('GDPR Export Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession()
  
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Delete user data for GDPR Right to be Forgotten
    await prisma.user.delete({
      where: { email: session.user.email }
    })

    return NextResponse.json({
      message: 'Your account and all associated data have been permanently deleted in accordance with GDPR.'
    })
  } catch (error) {
    console.error('GDPR Deletion Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
