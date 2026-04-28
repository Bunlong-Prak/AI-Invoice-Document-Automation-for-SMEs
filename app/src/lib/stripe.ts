import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy", {
  apiVersion: "2025-01-27-acacia" as any,
});

export const STRIPE_PLANS = {
  starter: {
    priceId: process.env.STRIPE_STARTER_PRICE_ID,
    limit: 1000,
  },
  growth: {
    priceId: process.env.STRIPE_GROWTH_PRICE_ID,
    limit: 10000,
  },
};
