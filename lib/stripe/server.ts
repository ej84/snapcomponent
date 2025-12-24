import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  //apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Pro Plan 가격 (월 $12)
export const PRO_PLAN_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID; // Stripe Dashboard에서 생성 후 입력