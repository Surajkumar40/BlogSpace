import {
  databases, storage, ID, Query,
  DATABASE_ID, POSTS_ID, DRAFTS_ID, BUCKET_ID, ENDPOINT,
} from "./appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;

// IMAGE

export function getImageUrl(fileId) {
  if (!fileId || fileId === "") return null;
  return `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${PROJECT_ID}`;
}

export function getImagePreview(fileId, width = 600, height = 400) {
  if (!fileId || fileId === "") return null;
  return `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/preview?width=${width}&height=${height}&project=${PROJECT_ID}`;
}

export async function uploadImage(file) {
  const uploaded = await storage.createFile(BUCKET_ID, ID.unique(), file);
  return uploaded.$id;
}

export async function deleteImage(fileId) {
  if (!fileId || fileId === "") return;
  try { await storage.deleteFile(BUCKET_ID, fileId); } catch {}
}

// POSTS

export async function createPost({ title, content, category, author, userId, excerpt, imageId, readTime }) {
  return await databases.createDocument(DATABASE_ID, POSTS_ID, ID.unique(), {
    title, content, category, author, userId,
    excerpt:  excerpt  || content.slice(0, 120),
    imageId:  imageId  || "",
    readTime: readTime || "5 min read",
  });
}

export async function getAllPosts() {
  const res = await databases.listDocuments(DATABASE_ID, POSTS_ID, [
    Query.orderDesc("$createdAt"),
    Query.limit(100),
  ]);
  return res.documents;
}

export async function getUserPosts(userId) {
  const res = await databases.listDocuments(DATABASE_ID, POSTS_ID, [
    Query.equal("userId", userId),
    Query.orderDesc("$createdAt"),
  ]);
  return res.documents;
}

export async function getPost(postId) {
  return await databases.getDocument(DATABASE_ID, POSTS_ID, postId);
}

export async function updatePost(postId, data) {
  return await databases.updateDocument(DATABASE_ID, POSTS_ID, postId, data);
}

export async function deletePost(postId) {
  await databases.deleteDocument(DATABASE_ID, POSTS_ID, postId);
}

// DRAFTS

export async function saveDraft({ title, content, category, author, userId, excerpt, imageId, readTime }) {
  return await databases.createDocument(DATABASE_ID, DRAFTS_ID, ID.unique(), {
    title:    title    || "",
    content:  content  || "",
    category: category || "",
    author:   author   || "",
    userId,
    excerpt:  excerpt  || content?.slice(0, 120) || "",
    imageId:  imageId  || "",
    readTime: readTime || "1 min read",
  });
}

export async function getDraft(draftId) {
  return await databases.getDocument(DATABASE_ID, DRAFTS_ID, draftId);
}

export async function getUserDrafts(userId) {
  const res = await databases.listDocuments(DATABASE_ID, DRAFTS_ID, [
    Query.equal("userId", userId),
    Query.orderDesc("$createdAt"),
  ]);
  return res.documents;
}

export async function getAllDrafts() {
  const res = await databases.listDocuments(DATABASE_ID, DRAFTS_ID, [
    Query.orderDesc("$createdAt"),
    Query.limit(100),
  ]);
  return res.documents;
}

export async function updateDraft(draftId, data) {
  return await databases.updateDocument(DATABASE_ID, DRAFTS_ID, draftId, data);
}

export async function deleteDraft(draftId) {
  await databases.deleteDocument(DATABASE_ID, DRAFTS_ID, draftId);
}

export async function publishDraft(draft) {
  const post = await createPost(draft);
  await deleteDraft(draft.$id);
  return post;
}

export async function uploadProfilePicture(file) {
  const uploaded = await storage.createFile(BUCKET_ID, ID.unique(), file);
  return uploaded.$id;
}

export function getProfilePictureUrl(fileId) {
  if (!fileId || fileId === "") return null;
  return `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${PROJECT_ID}`;
}