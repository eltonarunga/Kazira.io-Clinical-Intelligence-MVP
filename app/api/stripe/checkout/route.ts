import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { priceId } = await req.json()

    if (!priceId) {
      return new NextResponse('Price ID is required', { status: 400 })
    }

    // Bypass Stripe if using placeholder key
    if (process.env.STRIPE_SECRET_KEY === 'sk_test_your_stripe_key' || !process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ url: '/dashboard?upgraded=true' })
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
      payment_method_types: ['card'],
      mode: 'subscription',
      billing_address_collection: 'auto',
      customer_email: session.user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
      },
    })

    return NextResponse.json({ url: stripeSession.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
