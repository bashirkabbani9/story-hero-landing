import { loadStripe } from "@stripe/stripe-js";

const STRIPE_PUBLISHABLE_KEY =
  "pk_test_51T1ruhBf7Ygg5uvwJEUecbSbxQ0KWSBYBSoMsTGmoY4LGW62UiIJAX28a6uNnYWKjXoL7SogKZ9SUvKwpbMOtlo500ZLy7GXCE";
const SUCCESS_URL =
  "https://story-hero-landing-jet.vercel.app/dashboard?checkout=success";
const CANCEL_URL = "https://story-hero-landing-jet.vercel.app/#pricing";

export const PENDING_PRICE_KEY = "pendingPriceId";

export async function redirectToStripeCheckout(
  priceId: string,
  customerEmail?: string
) {
  const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
  if (!stripe) throw new Error("Stripe failed to load");

  // @ts-expect-error redirectToCheckout is available in legacy Stripe.js
  await stripe.redirectToCheckout({
    lineItems: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    successUrl: SUCCESS_URL,
    cancelUrl: CANCEL_URL,
    customerEmail: customerEmail ?? undefined,
  });
}
