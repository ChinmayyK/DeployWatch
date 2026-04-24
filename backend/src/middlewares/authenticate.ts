import type { NextFunction, Request, Response } from "express";

import { verifyAccessToken } from "../utils/jwt";
import { AppError } from "../utils/http-error";

export function authenticate(request: Request, _response: Response, next: NextFunction) {
  const authorization = request.headers.authorization;
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined;

  if (!token) {
    return next(new AppError(401, "UNAUTHORIZED", "Authentication token is required"));
  }

  try {
    const payload = verifyAccessToken(token);
    request.auth = {
      userId: payload.sub,
      email: payload.email,
      role: payload.role
    };
    return next();
  } catch {
    return next(new AppError(401, "UNAUTHORIZED", "Authentication token is invalid or expired"));
  }
}
