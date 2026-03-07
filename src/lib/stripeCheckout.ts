const CHECKOUT_WEBHOOK = "https://bashk1.app.n8n.cloud/webhook/create-checkout";

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

  window.location.href = url;
}
