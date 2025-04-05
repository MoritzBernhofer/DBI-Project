import { MongoClient } from "mongodb";
import {
  BLOG_COMMENTS_COLLECTION,
  BLOG_ENTRIES_COLLECTION,
  BLOG_USERS_COLLECTION,
  type BlogEntry,
  type BlogUser,
  type BlogComment,
} from "./models";

const client = new MongoClient("mongodb://localhost:27017");
export const db = client.db();
await ensureCollectionsCreated();

async function ensureCollectionsCreated() {
  const collections = await db.listCollections().toArray();

  if (!collections.some((c) => c.name === BLOG_ENTRIES_COLLECTION)) {
    await db.createCollection<BlogEntry>(BLOG_ENTRIES_COLLECTION);
  }

  if (!collections.some((c) => c.name === BLOG_USERS_COLLECTION)) {
    const usersCollection = await db.createCollection<BlogUser>(
      BLOG_USERS_COLLECTION,
    );
    await usersCollection.createIndex({ username: 1 }, { unique: true });
  }
  if (!collections.some((c) => c.name === BLOG_COMMENTS_COLLECTION)) {
    await db.createCollection<BlogComment>(BLOG_COMMENTS_COLLECTION);
  }
}
