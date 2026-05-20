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

// ─── Avatar Functions ───────────────────────────────────────────
export async function uploadAvatar(file) {
  try {
    // Delete old avatar if exists
    const user = await account.get()
    const prefs = user.prefs || {}
    if (prefs.avatarId) {
      try {
        await storage.deleteFile(
          import.meta.env.VITE_APPWRITE_BUCKET_ID,
          prefs.avatarId
        )
      } catch (e) {
        // ignore if file doesn't exist
      }
    }

    // Upload new avatar
    const uploaded = await storage.createFile(
      import.meta.env.VITE_APPWRITE_BUCKET_ID,
      ID.unique(),
      file
    )

    // Save avatarId to user prefs
    await account.updatePrefs({ ...prefs, avatarId: uploaded.$id })

    return uploaded.$id
  } catch (error) {
    throw error
  }
}

export async function deleteAvatar() {
  try {
    const user = await account.get()
    const prefs = user.prefs || {}
    if (prefs.avatarId) {
      await storage.deleteFile(
        import.meta.env.VITE_APPWRITE_BUCKET_ID,
        prefs.avatarId
      )
      await account.updatePrefs({ ...prefs, avatarId: null })
    }
  } catch (error) {
    throw error
  }
}

export function getAvatarUrl(avatarId) {
  if (!avatarId) return null
  const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT
  const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID
  const bucketId = import.meta.env.VITE_APPWRITE_BUCKET_ID
  return `${endpoint}/storage/buckets/${bucketId}/files/${avatarId}/view?project=${projectId}`
}
