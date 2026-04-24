import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

export function validateRequest(schema: {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}) {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (schema.body) {
      request.body = schema.body.parse(request.body);
    }

    if (schema.query) {
      request.query = schema.query.parse(request.query) as Request["query"];
    }

    if (schema.params) {
      request.params = schema.params.parse(request.params) as Request["params"];
    }

    next();
  };
}
