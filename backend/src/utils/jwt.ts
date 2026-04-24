import jwt, { type SignOptions } from "jsonwebtoken";

import { env } from "../config/env";

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: string;
}

export function signAccessToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"]
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
}
