export type SubscriptionTier = "free" | "starter" | "growth" | "business";

export interface BillingProvider {
  createCheckoutSession(
    userId: string,
    userEmail: string,
    tier: Exclude<SubscriptionTier, "free">
  ): Promise<{ url: string }>;
  
  getCustomerPortalUrl(
    subscriptionId: string
  ): Promise<string | null>;
  
  verifyWebhookSignature(
    payload: string,
    signature: string
  ): boolean;
  
  handleWebhookEvent(
    event: any
  ): Promise<void>;
}
