import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { procedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { verifyAuth } from "@/server/auth";
import { generateInterestScore, scoreSchema } from "@/lib/server/generateInterestScore";

export const generatePartyScore = procedure
  .input(
    z.object({
      authToken: z.string(),
      projectId: z.number(),
      partyType: z.enum(["A", "B"]),
    }),
  )
  .mutation(async ({ input }) => {
    const { userId } = verifyAuth(input.authToken);

    const project = await db.project.findUnique({
      where: {
        id: input.projectId,
        userId,
      },
      select: {
        partyA: true,
        partyB: true,
        partyAScore: true,
        partyBScore: true,
      },
    });

    if (!project) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Project not found",
      });
    }

    // Check if score already exists
    if (
      (input.partyType === "A" && project.partyAScore !== null) ||
      (input.partyType === "B" && project.partyBScore !== null)
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Score already exists for this party",
      });
    }

    const interests = input.partyType === "A" ? project.partyA : project.partyB;

    // Use the helper function to generate the score
    const { score, reasoning } = await generateInterestScore(interests);

    // Update both score and reasoning in the database
    await db.project.update({
      where: {
        id: input.projectId,
      },
      data: {
        ...(input.partyType === "A"
          ? {
              partyAScore: score,
              partyAScoreReasoning: reasoning,
            }
          : {
              partyBScore: score,
              partyBScoreReasoning: reasoning,
            }),
      },
    });

    return {
      score,
      reasoning,
    };
  });