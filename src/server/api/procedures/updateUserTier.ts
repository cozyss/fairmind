import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { procedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { verifyAuth } from "@/server/auth";

export const updateUserTier = procedure
  .input(
    z.object({
      authToken: z.string(),
      userId: z.number(),
      tier: z.enum(["free", "waitlist", "paid"]),
    }),
  )
  .mutation(async ({ input }) => {
    const { userId: adminId } = verifyAuth(input.authToken);

    // Only allow admin access (userId: -1)
    if (adminId !== -1) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: input.userId },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // Update user tier
    try {
      const updatedUser = await db.user.update({
        where: { id: input.userId },
        data: { tier: input.tier },
        select: {
          id: true,
          email: true,
          username: true,
          tier: true,
        },
      });

      return {
        success: true,
        user: updatedUser,
      };
    } catch (error) {
      console.error("Error updating user tier:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update user tier",
      });
    }
  });
