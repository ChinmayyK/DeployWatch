import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate";
import { validateRequest } from "../../middlewares/validate-request";
import { asyncHandler } from "../../utils/async-handler";
import { authController } from "./auth.controller";
import { loginBodySchema, signupBodySchema } from "./auth.schema";

export const authRoutes = Router();

authRoutes.post("/signup", validateRequest({ body: signupBodySchema }), asyncHandler(authController.signup));
authRoutes.post("/login", validateRequest({ body: loginBodySchema }), asyncHandler(authController.login));
authRoutes.get("/me", authenticate, asyncHandler(authController.me));
