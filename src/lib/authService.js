import { account, storage, ID } from "./appwrite";

const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID;

// ── Signup ────────────────────────────────────────────────────────────
export async function signup(name, email, password) {
  await account.create(ID.unique(), email, password, name); // creates the user
  await account.createEmailPasswordSession(email, password); // logs them in
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

// ── Get the current user (null when not signed in) ────────────────────
export async function getCurrentUser() {
  try {
    return await account.get();
  } catch {
    return null;
  }
}

// ── Avatar helpers ────────────────────────────────────────────────────
export async function uploadAvatar(file) {
  const user  = await account.get();
  const prefs = user.prefs || {};

  // Remove the previous avatar if there is one (ignore "not found" errors)
  if (prefs.avatarId) {
    try {
      await storage.deleteFile(BUCKET_ID, prefs.avatarId);
    } catch {
      /* old file may already be gone */
    }
  }

  const uploaded = await storage.createFile(BUCKET_ID, ID.unique(), file);
  await account.updatePrefs({ ...prefs, avatarId: uploaded.$id });
  return uploaded.$id;
}

export async function deleteAvatar() {
  const user  = await account.get();
  const prefs = user.prefs || {};
  if (prefs.avatarId) {
    await storage.deleteFile(BUCKET_ID, prefs.avatarId);
    await account.updatePrefs({ ...prefs, avatarId: null });
  }
}

export function getAvatarUrl(avatarId) {
  if (!avatarId) return null;
  const endpoint  = import.meta.env.VITE_APPWRITE_ENDPOINT;
  const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;
  return `${endpoint}/storage/buckets/${BUCKET_ID}/files/${avatarId}/view?project=${projectId}`;
}
