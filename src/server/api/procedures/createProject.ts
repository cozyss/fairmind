import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { procedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { verifyAuth } from "@/server/auth";
import { generateInterestScore } from "@/lib/server/generateInterestScore";

export const createProject = procedure
  .input(
    z.object({
      authToken: z.string(),
      name: z.string().min(1).max(100),
      partyAName: z.string().min(1).max(100),
      partyBName: z.string().min(1).max(100),
      partyA: z.string().min(1).max(1000),
      partyB: z.string().min(1).max(1000),
    }),
  )
  .mutation(async ({ input }) => {
    const { userId } = verifyAuth(input.authToken);

    // Get user to check tier
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { tier: true },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // If user is on free tier, check project count
    if (user.tier === "free") {
      const projectCount = await db.project.count({
        where: { userId },
      });

      if (projectCount >= 2) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Free tier users are limited to 2 projects. Please upgrade to create more.",
        });
      }
    }

    // First create the project without scores
    const project = await db.project.create({
      data: {
        name: input.name,
        partyAName: input.partyAName,
        partyBName: input.partyBName,
        partyA: input.partyA,
        partyB: input.partyB,
        userId,
      },
    });

    try {
      // Generate scores for both parties in parallel
      const [partyAResult, partyBResult] = await Promise.all([
        generateInterestScore(input.partyA),
        generateInterestScore(input.partyB),
      ]);

      // Update the project with the generated scores
      const updatedProject = await db.project.update({
        where: {
          id: project.id,
        },
        data: {
          partyAScore: partyAResult.score,
          partyAScoreReasoning: partyAResult.reasoning,
          partyBScore: partyBResult.score,
          partyBScoreReasoning: partyBResult.reasoning,
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
          createdAt: true,
          updatedAt: true,
        },
      });

      return { project: updatedProject };
    } catch (error) {
      console.error("Error generating scores during project creation:", error);
      
      // If score generation fails, return the project without scores
      const projectWithoutScores = await db.project.findUnique({
        where: {
          id: project.id,
        },
        select: {
          id: true,
          name: true,
          partyAName: true,
          partyBName: true,
          partyA: true,
          partyB: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return { project: projectWithoutScores };
    }
  });