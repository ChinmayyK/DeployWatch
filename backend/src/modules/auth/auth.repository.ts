import { prisma } from "../../db/prisma";

export class AuthRepository {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email
      }
    });
  }

  findUserById(id: string) {
    return prisma.user.findUnique({
      where: {
        id
      }
    });
  }

  createUser(input: { name: string; email: string; passwordHash: string }) {
    return prisma.user.create({
      data: input
    });
  }
}

export const authRepository = new AuthRepository();
