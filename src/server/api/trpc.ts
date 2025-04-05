/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { db } from "../data";
import { decodeAndVerifyJwtToken } from "../auth/decodeAndVerifyJwtToken";
import { BLOG_USERS_COLLECTION, type BlogUser } from "../data/models";
import type { AppJwtPayload } from "../auth/claims";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async ({ req }: CreateNextContextOptions) => {
  async function getPayloadFromHeader() {
    if (!req) {
      return null;
    }

    if (!req.headers.authorization) {
      return null;
    }

    const tokenPayload = decodeAndVerifyJwtToken(
      req.headers.authorization.split(" ")[1] ?? "", // "Bearer <token>"
    );

    return tokenPayload;
  }

  const tokenPayload = await getPayloadFromHeader();

  return {
    tokenPayload,
    db,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

const authenticationMiddleware = t.middleware(async ({ next, ctx }) => {
  if (ctx.tokenPayload === null) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const usersCollection = ctx.db.collection<BlogUser>(BLOG_USERS_COLLECTION);
  const user = await usersCollection.findOne({
    username: ctx.tokenPayload.claims.username,
  });

  if (user === null) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return await next({
    ctx: { ...ctx, user },
  });
});

/**
 * Private (authenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does
 * guarantee that a user querying is authorized.
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(authenticationMiddleware);
