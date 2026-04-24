import type { Request, Response } from "express";

import { authService } from "./auth.service";

export class AuthController {
  signup = async (request: Request, response: Response) => {
    const result = await authService.signup(request.body);
    return response.status(201).json(result);
  };

  login = async (request: Request, response: Response) => {
    const result = await authService.login(request.body);
    return response.status(200).json(result);
  };

  me = async (request: Request, response: Response) => {
    const user = await authService.getCurrentUser(request.auth!.userId);
    return response.status(200).json({
      user
    });
  };
}

export const authController = new AuthController();
