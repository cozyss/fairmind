import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";

import { procedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { verifyAuth } from "@/server/auth";
import { generateInterestScore } from "@/lib/server/generateInterestScore";

const enhancedStatementSchema = z.object({
  enhancedStatement: z.string().describe("An improved version of the interest statement that incorporates the new information"),
});

export const enhanceInterestStatement = procedure
  .input(
    z.object({
      authToken: z.string(),
      projectId: z.number(),
      partyType: z.enum(["A", "B"]),
      originalStatement: z.string(),
      question: z.string(),
      answer: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    const { userId } = verifyAuth(input.authToken);

    const project = await db.project.findUnique({
      where: {
        id: input.projectId,
        userId, // Ensure the project belongs to the authenticated user
      },
    });

    if (!project) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Project not found",
      });
    }

    // Generate enhanced statement
    const { object: enhancedObject } = await generateObject({
      model: anthropic("claude-3-7-sonnet-latest"),
      schema: enhancedStatementSchema,
      prompt: `
You are an expert negotiation coach helping improve an interest statement.

Original statement:
${input.originalStatement}

Question asked:
${input.question}

Their answer:
${input.answer}

Create an concise and effective enhanced interest statement that:

1. Separates people from the problem (focuses on issues, not personalities)
2. Articulates underlying interests, not positions (explains why, not just what)
3. Creates space for inventing options for mutual gain
4. References objective criteria or fair standards where possible

The enhanced statement should:
- Express interests in terms of needs, concerns, hopes and fears
- Avoid fixed positions that limit creative solutions
- Identify potential areas of compatibility with the other side
- Use neutral, problem-solving language
- Be structured to facilitate joint problem-solving

Provide the enhanced statement in a clear, concise format that would serve as a strong foundation for principled negotiation. Organize the statement into a list of less than 4 bullet points for easy reading. Be as concise as possible.
      `,
    });

    // Update the database with the enhanced statement
    await db.project.update({
      where: {
        id: input.projectId,
      },
      data: {
        ...(input.partyType === "A"
          ? { partyA: enhancedObject.enhancedStatement }
          : { partyB: enhancedObject.enhancedStatement }),
      },
    });

    // Generate a new score for the enhanced statement using the shared generateInterestScore function
    const { score, reasoning } = await generateInterestScore(enhancedObject.enhancedStatement);

    // Update the score and reasoning in the database
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
      enhancedStatement: enhancedObject.enhancedStatement,
      score,
      reasoning,
    };
  });
