import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { BLOG_ENTRIES_COLLECTION, type BlogEntry } from "~/server/data/models";

export const blogsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const blogsCollection = ctx.db.collection<BlogEntry>(
      BLOG_ENTRIES_COLLECTION,
    );
    return await blogsCollection.find().toArray();
  }),
});
