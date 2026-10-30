import { WEBHOOKS } from "./config";

const CHECKOUT_WEBHOOK = WEBHOOKS.createCheckout;

export const PENDING_PRICE_KEY = "pendingPriceId";

// Is this URL really Stripe?
//
// Exported because the same check is needed in three places and was only right in one.
// `endsWith("stripe.com")` is the trap: "evilstripe.com".endsWith("stripe.com") is true, so
// the guard passed a hostname an attacker controls. The March launch pass fixed that here and
// left the copies in Settings and Dashboard untouched, which is the argument for one function
// rather than three inline checks.
export function isStripeUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === "stripe.com" || hostname.endsWith(".stripe.com");
  } catch {
    return false;
  }
}

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
  if (!isStripeUrl(url)) throw new Error("Invalid checkout URL");

  window.location.href = url;
}
