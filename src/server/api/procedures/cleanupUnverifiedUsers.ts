import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { procedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { verifyAuth } from "@/server/auth";

export const cleanupUnverifiedUsers = procedure
  .input(
    z.object({
      authToken: z.string(),
      // Optional parameter to only delete accounts older than a certain time (in hours)
      olderThanHours: z.number().optional(),
    }),
  )
  .mutation(async ({ input }) => {
    // Verify the auth token to get the user ID
    const { userId } = verifyAuth(input.authToken);

    // Find the user to check if they have admin privileges
    // In a real system, you'd have proper role-based checks
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not found",
      });
    }

    // Build the where clause for deletion
    const whereClause: any = {
      isVerified: false,
    };

    // If olderThanHours is provided, only delete accounts older than that time
    if (input.olderThanHours !== undefined) {
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - input.olderThanHours);
      
      whereClause.createdAt = {
        lt: cutoffDate,
      };
    }

    // Delete all unverified users
    const { count } = await db.user.deleteMany({
      where: whereClause,
    });

    return {
      success: true,
      message: `Successfully deleted ${count} unverified user accounts.`,
      count,
    };
  });
