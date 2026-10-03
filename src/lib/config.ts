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

// Product rule, set 2026-10-03. Enforced in the database by the children insert policy,
// see projects/little-hero-library/children-limit.sql. This constant exists so the
// message the parent reads and the rule the database applies stay the same number.
export const MAX_CHILDREN_PER_ACCOUNT = 2;
