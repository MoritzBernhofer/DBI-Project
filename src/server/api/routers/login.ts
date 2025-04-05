import { createTRPCRouter, publicProcedure } from "../trpc";
import { BLOG_USERS_COLLECTION, type BlogUser } from "~/server/data/models";
import { z } from "zod";
import {
  EMAIL_SCHEMA,
  PASSWORD_SCHEMA,
  USERNAME_SCHEMA,
} from "~/lib/global-zod-schemas";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { AppJwtPayload } from "~/server/auth/claims";
import { env } from "~/env";

export const loginRouter = createTRPCRouter({
  signUp: publicProcedure
    .input(
      z.object({
        username: USERNAME_SCHEMA,
        email: EMAIL_SCHEMA,
        password: PASSWORD_SCHEMA,
        firstName: z.string(),
        lastName: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const usersCollection = ctx.db.collection<BlogUser>(
        BLOG_USERS_COLLECTION,
      );

      const userByUsername = await usersCollection.findOne({
        username: input.username,
      });

      if (userByUsername !== null) {
        return new Error(
          "Sorry, it seems like this username is already taken.",
        );
      }

      const userByEmail = await usersCollection.findOne({ email: input.email });

      if (userByEmail !== null) {
        return new Error(
          "Sorry, it seems like this email address is already taken.",
        );
      }

      const res = await usersCollection.insertOne({
        username: input.username,
        email: input.email,
        passwordHash: await bcrypt.hash(input.password, 11),
        profilePicture: null,
        firstName: input.firstName,
        lastName: input.lastName,
      });

      if (!res.acknowledged) {
        return new Error(
          "Sorry, it seems like the user could not be added to the database.",
        );
      }

      return {
        jwt: createJwt(input.username, res.insertedId.toString()),
      };
    }),

  signIn: publicProcedure
    .input(
      z.union([
        z.object({
          username: USERNAME_SCHEMA,
          password: PASSWORD_SCHEMA,
        }),
        z.object({
          email: EMAIL_SCHEMA,
          password: PASSWORD_SCHEMA,
        }),
      ]),
    )
    .mutation(async ({ input, ctx }) => {
      const usersCollection = ctx.db.collection<BlogUser>(
        BLOG_USERS_COLLECTION,
      );

      const user = (input as { email: string }).email
        ? await usersCollection.findOne({
            email: (input as { email: string }).email,
          })
        : await usersCollection.findOne({
            username: (input as { username: string }).username,
          });

      if (user === null) {
        return new Error(
          "Either the username/email or the password provided is (or both are) incorrect.",
        );
      }

      return {
        jwt: createJwt(user.username, user._id.toString()),
      };
    }),
});

function createJwt(username: string, userId: string) {
  return jwt.sign(
    {
      claims: {
        username: username,
        userId: userId,
      },
    } as AppJwtPayload,
    env.JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );
}
