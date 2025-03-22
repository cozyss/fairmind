import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { procedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { verifyAuth } from "@/server/auth";

export const deleteUser = procedure
  .input(
    z.object({
      authToken: z.string(),
      userId: z.number(),
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

    try {
      // Delete all projects associated with the user first
      await db.project.deleteMany({
        where: { userId: input.userId },
      });

      // Then delete the user
      await db.user.delete({
        where: { id: input.userId },
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error deleting user:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete user",
      });
    }
  });
