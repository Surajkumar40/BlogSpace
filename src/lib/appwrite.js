import { Client, Account, Databases, Storage, ID, Query } from "appwrite";

export const ENDPOINT = "https://sgp.cloud.appwrite.io/v1";

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const account   = new Account(client);
export const databases = new Databases(client);
export const storage   = new Storage(client);
export { ID, Query };

export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const POSTS_ID    = import.meta.env.VITE_APPWRITE_POSTS_ID;
export const DRAFTS_ID   = import.meta.env.VITE_APPWRITE_DRAFTS_ID;
export const BUCKET_ID   = import.meta.env.VITE_APPWRITE_BUCKET_ID;
export const MESSAGES_ID = import.meta.env.VITE_APPWRITE_MESSAGES_ID;
export const PROFILES_ID = import.meta.env.VITE_APPWRITE_PROFILES_ID;