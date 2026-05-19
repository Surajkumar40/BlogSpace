import { account, ID } from "./appwrite";

// ── Signup ────────────────────────────────────────────────────────────
export async function signup(name, email, password) {
  // creates the user
  await account.create(ID.unique(), email, password, name);
  // logs them in right after signup
  await account.createEmailPasswordSession(email, password);
  // returns user data
  return await account.get();
}

// ── Login ─────────────────────────────────────────────────────────────
export async function login(email, password) {
  await account.createEmailPasswordSession(email, password);
  return await account.get();
}

// ── Logout ────────────────────────────────────────────────────────────
export async function logout() {
  await account.deleteSession("current");
}

// ── Get current logged in user ────────────────────────────────────────
// Returns user object if logged in, null if not
export async function getCurrentUser() {
  try {
    return await account.get();
  } catch {
    return null;
  }
}