import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";

import { procedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { verifyAuth } from "@/server/auth";

const responseSuggestionsSchema = z.object({
  suggestions: z
    .array(
      z.object({
        title: z
          .string()
          .describe("A short title describing the approach of this response"),
        content: z.string().describe("The suggested response text"),
        reasoning: z
          .string()
          .describe("Brief explanation of why this response is effective"),
      }),
    )
    .length(3)
    .describe("Three different response suggestions"),
});

export const generateResponseSuggestions = procedure
  .input(
    z
      .object({
        authToken: z.string(),
        projectId: z.number(),
        otherPartyResponse: z.string().min(1).optional(),
        screenshot: z
          .string()
          .optional()
          .describe("Base64 encoded image of chat conversation"),
      })
      .refine((data) => data.otherPartyResponse || data.screenshot, {
        message: "Either otherPartyResponse or screenshot must be provided",
        path: ["otherPartyResponse"],
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
        partyAName: true,
        partyBName: true,
      },
    });

    if (!project) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Project not found",
      });
    }

    const { object } = await generateObject({
      model: anthropic("claude-3-7-sonnet-latest"),
      schema: responseSuggestionsSchema,
      messages: [
        {
          role: "user",
          content: input.screenshot
            ? [
                {
                  type: "text",
                  text: `
You are an expert negotiation coach helping craft effective responses during a negotiation.

Your interests (${project.partyAName || "Your"} interests):
${project.partyA}

The other party's interests (${project.partyBName || "The other party's"} interests):
${project.partyB}

${
  input.otherPartyResponse
    ? `The other party's latest response:
${input.otherPartyResponse}`
    : ""
}

I've attached a screenshot of our conversation history. In this screenshot, messages on the right side represent my messages, while messages on the left side represent the other party's messages. Please use this to understand the conversation flow and the other party's latest response.

Generate three different response suggestions that will help advance the negotiation in a way that maximizes your interests while maintaining good negotiation principles. Each suggestion should:

1. Focus on interests, not positions
2. Look for mutual gains where possible
3. Use objective criteria when appropriate
4. Separate the people from the problem

For each suggestion, provide:
1. A short title describing the approach (e.g., "Collaborative Problem-Solving", "Exploring Alternatives", "Clarifying Interests")
2. The suggested response text (written in first person, as if from the user)
3. A brief explanation of why this response is effective

Make each suggestion distinct in its approach and should be fewer than 50 worlds. One should be more collaborative, one more assertive (but still principled), and one more creative/innovative.

Keep the responses concise, clear, and focused on moving the negotiation forward constructively.
`,
                },
                {
                  type: "image",
                  image: Buffer.from(input.screenshot.split(",")[1], "base64"),
                },
              ]
            : `
You are an expert negotiation coach helping craft effective responses during a negotiation.

Your interests (${project.partyAName || "Your"} interests):
${project.partyA}

The other party's interests (${project.partyBName || "The other party's"} interests):
${project.partyB}

The other party's latest response:
${input.otherPartyResponse}

Generate three different response suggestions that will help advance the negotiation in a way that maximizes your interests while maintaining good negotiation principles. Each suggestion should:

1. Focus on interests, not positions
2. Look for mutual gains where possible
3. Use objective criteria when appropriate
4. Separate the people from the problem

For each suggestion, provide:
1. A short title describing the approach (e.g., "Collaborative Problem-Solving", "Exploring Alternatives", "Clarifying Interests")
2. The suggested response text (written in first person, as if from the user)
3. A brief explanation of why this response is effective

Make each suggestion distinct in its approach. One should be more collaborative, one more assertive (but still principled), and one more creative/innovative.

Keep the responses concise, clear, and focused on moving the negotiation forward constructively.
`,
        },
      ],
    });

    return {
      suggestions: object.suggestions,
    };
  });
