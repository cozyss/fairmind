import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { procedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { verifyAuth } from "@/server/auth";

export const upgradeUserTier = procedure
  .input(
    z.object({
      authToken: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    const { userId } = verifyAuth(input.authToken);

    // Instead of immediately upgrading to paid tier, add user to waitlist
    try {
      const updatedUser = await db.user.update({
        where: { id: userId },
        data: { tier: "waitlist" },
        select: { 
          id: true,
          email: true,
          username: true,
          tier: true
        },
      });

      return { 
        success: true,
        user: updatedUser
      };
    } catch (error) {
      console.error("Error adding user to premium waitlist:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to add user to premium waitlist",
      });
    }
  });