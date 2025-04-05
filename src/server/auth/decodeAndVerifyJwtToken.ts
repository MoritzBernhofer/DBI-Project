import { env } from "~/env";

import jwt from "jsonwebtoken";
import type { AppJwtPayload } from "./claims";

export function decodeAndVerifyJwtToken(token: string) {
  if (!token) {
    return null;
  }

  let res: AppJwtPayload;
  try {
    res = jwt.verify(token, env.JWT_SECRET) as AppJwtPayload;
  } catch {
    return null;
  }

  return res;
}
