import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { procedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { verifyAuth } from "@/server/auth";

export const getProjectDetails = procedure
  .input(
    z.object({
      authToken: z.string(),
      projectId: z.number(),
    }),
  )
  .query(async ({ input }) => {
    const { userId } = verifyAuth(input.authToken);

    const project = await db.project.findUnique({
      where: {
        id: input.projectId,
        userId, // Ensure the project belongs to the authenticated user
      },
      select: {
        id: true,
        name: true,
        partyAName: true,
        partyBName: true,
        partyA: true,
        partyB: true,
        partyAScore: true,
        partyBScore: true,
        partyAScoreReasoning: true,
        partyBScoreReasoning: true,
        options: true,
        objectiveCriteria: true,
        objectiveCriteriaSearchQuery: true,
        objectiveCriteriaCitations: true,
        objectiveCriteriaRawContent: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!project) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Project not found",
      });
    }

    return { project };
  });