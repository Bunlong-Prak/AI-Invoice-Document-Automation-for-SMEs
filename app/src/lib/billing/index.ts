import { LemonSqueezyProvider } from "./lemonsqueezy";
import { BillingProvider } from "./types";

// We use Lemon Squeezy as our primary provider
// In the future, we could switch this based on an env var
export const billing: BillingProvider = new LemonSqueezyProvider();

export * from "./types";
