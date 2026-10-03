// All outbound endpoints in one place, read from the environment so a moved n8n
// instance is a Vercel setting rather than a code change.
const base = import.meta.env.VITE_N8N_WEBHOOK_BASE;

if (!base) {
  throw new Error(
    "VITE_N8N_WEBHOOK_BASE is not set. Copy .env.example to .env.local for local work, " +
      "or add it to the Vercel project's Environment Variables and redeploy."
  );
}

export const N8N_WEBHOOK_BASE = base;

export const WEBHOOKS = {
  createCheckout: `${N8N_WEBHOOK_BASE}/create-checkout`,
  customerPortal: `${N8N_WEBHOOK_BASE}/customer-portal`,
  leadMagnet: `${N8N_WEBHOOK_BASE}/lead-magnet`,
} as const;
