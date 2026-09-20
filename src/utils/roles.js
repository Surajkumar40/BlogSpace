// ─── Role helpers ─────────────────────────────────────────────────────────
// Admin access is granted with an Appwrite *user label* named "admin"
// (Appwrite Console → Auth → Users → select user → Labels).
// The label is issued by the server and is part of the signed-in user object,
// so it cannot be forged from the browser the way a client-side PIN can.
// Real enforcement lives in the Appwrite collection permissions (see README).

export const ADMIN_LABEL = "admin";

export function isAdmin(user) {
  return Array.isArray(user?.labels) && user.labels.includes(ADMIN_LABEL);
}
