import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export function requestContext(request: Request, response: Response, next: NextFunction) {
  const requestId = request.header("x-request-id") ?? crypto.randomUUID();
  request.requestId = requestId;
  response.setHeader("x-request-id", requestId);
  next();
}
