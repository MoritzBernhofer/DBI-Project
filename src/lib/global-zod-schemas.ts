import { z } from "zod";

export const PASSWORD_SCHEMA = z
  .string()
  .nonempty("Password cannot be empty.")
  .min(5, "Password must be at least 5 characters long.")
  .regex(/[a-z]/, "Password must contain at least one lower-case letter.")
  .regex(/[A-Z]/, "Password must contain at least one upper-case letter.")
  .regex(/[0-9]/, "Password must contain at least one digit.")
  .regex(
    /[@$!%*#?&'"\-\(\)\{\}\[\]]/,
    "Password must contain at least one special character.",
  )
  .regex(
    /^[a-zA-Z0-9@$!%*#?&'"\-\(\)\{\}\[\]]+$/,
    "Password can only contain lower and upper-case letters, numbers and these characters: @$!%*#?&'\"-(){}[]",
  );

export const EMAIL_SCHEMA = z
  .string()
  .trim()
  .nonempty("Please provide an email address.")
  .email("This does not seem like a valid email address.");

export const USERNAME_SCHEMA = z
  .string()
  .min(4, "Your username must be at least 4 characters long.");
