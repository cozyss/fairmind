import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";

import { procedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { verifyAuth } from "@/server/auth";

const questionSchema = z.object({
  question: z.string().describe("A critical question that would help improve the current interest statement the most"),
  explanation: z.string().describe("Brief explanation (within 20 words) of why this question is important for improving the statement"),
});

export const generateEnhancementQuestion = procedure
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
        userId, // Ensure the project belongs to the authenticated user
      },
      select: {
        partyA: true,
        partyB: true,
        partyAScoreReasoning: true,
        partyBScoreReasoning: true,
      },
    });

    if (!project) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Project not found",
      });
    }

    const interestStatement = input.partyType === "A" ? project.partyA : project.partyB;
    const scoreReasoning = input.partyType === "A" ? project.partyAScoreReasoning : project.partyBScoreReasoning;

    const { object } = await generateObject({
      model: anthropic("claude-3-7-sonnet-latest"),
      schema: questionSchema,
      prompt: `You are an expert negotiation coach helping someone improve their interest statement.

Current interest statement:
${interestStatement}

${scoreReasoning ? `Previous feedback: ${scoreReasoning}` : ""}

Based on the core principle that focusing on interests rather than positions leads to better outcomes, ask ONE specific question that helps the user uncover their deeper underlying interests.

Your question should help them:
- Move from what they want (positions) to why they want it (interests)
- Identify needs, concerns, hopes, and fears driving their requests
- Consider what problem they're truly trying to solve
- Explore multiple ways their core interests could be satisfied

Frame your question to help them discover what's truly important to them beyond their stated position. The question should be short and easy to understand. Include a brief explanation of how answering this will strengthen their negotiation stance.`,
    });

    return object;
  });
