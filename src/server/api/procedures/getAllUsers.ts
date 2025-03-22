import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { procedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { verifyAuth } from "@/server/auth";

export const getAllUsers = procedure
  .input(
    z.object({
      authToken: z.string(),
    }),
  )
  .query(async ({ input }) => {
    const { userId } = verifyAuth(input.authToken);

    // Only allow admin access (userId: -1)
    if (userId !== -1) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    // Get all users with their project counts
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        tier: true,
        isVerified: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            projects: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Debug log for lastLoginAt values
    if (process.env.NODE_ENV === "development") {
      console.log("User lastLoginAt values:", users.map(user => ({
        id: user.id,
        email: user.email,
        lastLoginAt: user.lastLoginAt,
      })));
    }

    // Get waitlist users
    const waitlistUsers = users.filter((user) => user.tier === "waitlist");

    return {
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        username: user.username,
        tier: user.tier,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        projectCount: user._count.projects,
      })),
      waitlistUsers: waitlistUsers.map((user) => ({
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        projectCount: user._count.projects,
      })),
    };
  });