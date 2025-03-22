import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { procedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { verifyAuth } from "@/server/auth";

export const deleteProject = procedure
  .input(
    z.object({
      authToken: z.string(),
      projectId: z.number(),
    }),
  )
  .mutation(async ({ input }) => {
    // Verify authentication
    const { userId } = verifyAuth(input.authToken);

    // Check if project exists and belongs to the user
    const project = await db.project.findUnique({
      where: { id: input.projectId },
      select: { id: true, userId: true },
    });

    if (!project) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Project not found",
      });
    }

    if (project.userId !== userId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to delete this project",
      });
    }

    // Delete the project
    await db.project.delete({
      where: { id: input.projectId },
    });

    return { success: true };
  });
