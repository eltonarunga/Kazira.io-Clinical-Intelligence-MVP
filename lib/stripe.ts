import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_key', {
  apiVersion: '2024-11-20.acacia',
  appInfo: {
    name: 'Kazira Clinical Intelligence',
    version: '1.0.0',
  },
})
