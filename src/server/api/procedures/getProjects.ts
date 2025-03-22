import { z } from "zod";

import { procedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { verifyAuth } from "@/server/auth";

export const getProjects = procedure
  .input(
    z.object({
      authToken: z.string(),
    }),
  )
  .query(async ({ input }) => {
    const { userId } = verifyAuth(input.authToken);

    // Get projects
    const projects = await db.project.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        partyAName: true,
        partyBName: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Get user tier
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { tier: true, username: true },
    });

    return { 
      projects,
      userTier: user?.tier || "free",
      username: user?.username || "",
      projectCount: projects.length,
      projectLimit: user?.tier === "paid" ? null : 2
    };
  });