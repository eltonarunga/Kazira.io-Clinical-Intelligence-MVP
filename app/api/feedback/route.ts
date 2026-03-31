import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'

export async function POST(req: Request) {
  const session = await getServerSession()
  
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { reason, comments, type } = body

    // In a real app, save this to the database
    logger.info('User feedback received', {
      user: session.user.email,
      type: type || 'general',
      reason,
      comments
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Failed to process feedback', { error })
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
