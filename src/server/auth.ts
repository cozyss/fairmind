import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { env } from "@/env";

const userTokenSchema = z.object({
  userId: z.number(),
});

export type UserToken = z.infer<typeof userTokenSchema>;

export function generateToken(userId: number): string {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: "1y" });
}

export function verifyToken(token: string): UserToken {
  try {
    const verified = jwt.verify(token, env.JWT_SECRET);
    return userTokenSchema.parse(verified);
  } catch (error) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid or expired token",
    });
  }
}

export function verifyAuth(authToken: string | undefined): UserToken {
  if (!authToken) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  return verifyToken(authToken);
}
