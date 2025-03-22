import { TRPCError } from "@trpc/server";
import bcrypt from "bcrypt";
import { z } from "zod";

import { procedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { generateToken } from "@/server/auth";

export const login = procedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    // Find user by email
    const user = await db.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Invalid email or password",
      });
    }

    // Verify password
    const isValid = await bcrypt.compare(input.password, user.hashedPassword);

    if (!isValid) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Please verify your email before logging in",
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Update last login timestamp
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      token,
    };
  });