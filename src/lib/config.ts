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
  // Account deletion has to run server side and this is why.
  //
  // Two parts of an erasure are impossible from a browser. Storage objects have no foreign key
  // to stories, so a database cascade cannot reach a child's illustrations, and deleting the
  // Supabase auth user needs the service key, which must never ship to a client. Until
  // 2026-10-29 this page deleted the profile and children rows and signed out, which left both
  // the images and the parent's email address in place forever, against a privacy policy
  // promising deletion within 30 days.
  //
  // The endpoint takes no user id. It reads the caller's own session token, asks Supabase who
  // it belongs to, and erases only that account, so a request body naming someone else is
  // ignored. It is also idempotent, which is why retrying after a failure is safe advice.
  deleteAccount: `${N8N_WEBHOOK_BASE}/lhl-delete-account`,
} as const;

// Product rule, set 2026-10-03. Enforced in the database by the children insert policy,
// see projects/little-hero-library/children-limit.sql. This constant exists so the
// message the parent reads and the rule the database applies stay the same number.
export const MAX_CHILDREN_PER_ACCOUNT = 2;
