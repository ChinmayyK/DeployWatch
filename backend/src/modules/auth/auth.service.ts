import { authRepository } from "./auth.repository";
import type { AuthResponse, AuthUserDto, LoginInput, SignupInput } from "./auth.types";
import { AppError } from "../../utils/http-error";
import { hashPassword, verifyPassword } from "../../utils/hash";
import { signAccessToken } from "../../utils/jwt";

export class AuthService {
  private toUserDto(user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
  }): AuthUserDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };
  }

  private buildAuthResponse(user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
  }): AuthResponse {
    return {
      token: signAccessToken({
        sub: user.id,
        email: user.email,
        role: user.role
      }),
      user: this.toUserDto(user)
    };
  }

  async signup(input: SignupInput) {
    const existing = await authRepository.findUserByEmail(input.email.toLowerCase());
    if (existing) {
      throw new AppError(409, "EMAIL_ALREADY_EXISTS", "A user with this email already exists");
    }

    const passwordHash = await hashPassword(input.password);
    const user = await authRepository.createUser({
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash
    });

    return this.buildAuthResponse(user);
  }

  async login(input: LoginInput) {
    const user = await authRepository.findUserByEmail(input.email.toLowerCase());
    if (!user) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Email or password is incorrect");
    }

    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Email or password is incorrect");
    }

    return this.buildAuthResponse(user);
  }

  async getCurrentUser(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new AppError(404, "USER_NOT_FOUND", "Authenticated user no longer exists");
    }

    return this.toUserDto(user);
  }
}

export const authService = new AuthService();
