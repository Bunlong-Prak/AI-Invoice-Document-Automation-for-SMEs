import {
  lemonSqueezySetup,
  createCheckout,
  getSubscription,
} from "@lemonsqueezy/lemonsqueezy.js";
import { BillingProvider, SubscriptionTier } from "./types";
import crypto from "node:crypto";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export class LemonSqueezyProvider implements BillingProvider {
  constructor() {
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    if (!apiKey) {
      console.warn("LEMONSQUEEZY_API_KEY is not set");
      return;
    }
    lemonSqueezySetup({ apiKey });
  }

  async createCheckoutSession(
    userId: string,
    userEmail: string,
    tier: Exclude<SubscriptionTier, "free">
  ) {
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;
    if (!storeId) throw new Error("LEMONSQUEEZY_STORE_ID is not set");

    const variantId = this.getVariantId(tier);
    if (!variantId) throw new Error(`No variant ID found for tier: ${tier}`);

    const { data, error } = await createCheckout(storeId, variantId, {
      checkoutData: {
        email: userEmail,
        custom: {
          user_id: userId,
          tier: tier,
        },
      },
      productOptions: {
        enabledVariants: [Number(variantId)],
      },
    });

    if (error) {
      console.error("Lemon Squeezy error:", error);
      throw new Error(error.message);
    }

    return { url: data!.data.attributes.url };
  }

  async getCustomerPortalUrl(subscriptionId: string) {
    const { data, error } = await getSubscription(subscriptionId);
    if (error) {
      console.error("Lemon Squeezy error fetching subscription:", error);
      return null;
    }

    return data!.data.attributes.urls.customer_portal;
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    if (!secret) {
      console.error("LEMONSQUEEZY_WEBHOOK_SECRET is not set");
      return false;
    }

    const hmac = crypto.createHmac("sha256", secret);
    const digest = Buffer.from(hmac.update(payload).digest("hex"), "utf8");
    const signatureBuffer = Buffer.from(signature, "utf8");

    if (digest.length !== signatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(digest, signatureBuffer);
  }

  async handleWebhookEvent(event: any) {
    const eventName = event.meta.event_name;
    const customData = event.meta.custom_data;
    const userId = customData?.user_id;

    if (!userId) {
      console.warn("No user_id found in webhook custom_data");
      return;
    }

    const attributes = event.data.attributes;
    const subscriptionId = event.data.id;
    const customerId = String(attributes.customer_id);
    const variantId = String(attributes.variant_id);

    if (eventName === "subscription_created" || eventName === "subscription_updated") {
      const status = attributes.status;
      const tier = customData.tier as SubscriptionTier;

      // Map LS status to our tier logic
      // Statuses: on_trial, active, paused, past_due, unpaid, cancelled, expired
      if (status === "active" || status === "on_trial") {
        await db
          .update(users)
          .set({
            subscriptionTier: tier || "starter", // Fallback if tier not in custom_data
            lemonsqueezySubscriptionId: subscriptionId,
            lemonsqueezyCustomerId: customerId,
            lemonsqueezyVariantId: variantId,
          })
          .where(eq(users.id, userId));
      } else if (status === "expired" || status === "unpaid") {
        await db
          .update(users)
          .set({
            subscriptionTier: "free",
          })
          .where(eq(users.id, userId));
      }
    }

    if (eventName === "subscription_cancelled") {
      // User cancelled but might still have access until end of period
      // For now, we'll wait for 'expired' to downgrade, but we could mark as 'cancelling'
    }

    if (eventName === "subscription_expired") {
      await db
        .update(users)
        .set({
          subscriptionTier: "free",
        })
        .where(eq(users.id, userId));
    }
  }

  private getVariantId(tier: Exclude<SubscriptionTier, "free">): string | undefined {
    switch (tier) {
      case "starter":
        return process.env.LEMONSQUEEZY_VARIANT_ID_STARTER;
      case "growth":
        return process.env.LEMONSQUEEZY_VARIANT_ID_GROWTH;
      case "business":
        return process.env.LEMONSQUEEZY_VARIANT_ID_BUSINESS;
      default:
        return undefined;
    }
  }
}
