import { WEBHOOKS } from "./config";

const CHECKOUT_WEBHOOK = WEBHOOKS.createCheckout;

export const PENDING_PRICE_KEY = "pendingPriceId";

export async function redirectToStripeCheckout(
  priceId: string,
  customerEmail?: string,
  profileId?: string,
  childId?: string
) {
  const origin = window.location.origin;

  const res = await fetch(CHECKOUT_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      priceId,
      email: customerEmail ?? "",
      profileId: profileId ?? "",
      childId: childId ?? "",
      successUrl: `${origin}/dashboard?checkout=success`,
      cancelUrl: `${origin}/pricing`,
    }),
  });

  if (!res.ok) throw new Error("Failed to create checkout session");

  const { url } = await res.json();
  if (!url) throw new Error("No checkout URL returned");

  // Validate the URL points to Stripe before handing the browser to it.
  //
  // Checked as an exact host or a true subdomain rather than endsWith("stripe.com"), because
  // "evilstripe.com".endsWith("stripe.com") is true and would have passed the guard. The URL
  // comes back from our own checkout webhook, so this only matters if that response is ever
  // tampered with, which is exactly the case the guard exists for.
  try {
    const { hostname } = new URL(url);
    if (hostname !== "stripe.com" && !hostname.endsWith(".stripe.com")) {
      throw new Error("Invalid checkout URL");
    }
  } catch {
    throw new Error("Invalid checkout URL");
  }

  window.location.href = url;
}
