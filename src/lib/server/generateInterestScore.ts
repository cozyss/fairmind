import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";

export const scoreSchema = z.object({
  score: z.number().int().min(0).max(100).describe(
    "Score between 0-100 evaluating the interests based on clarity, completeness, and usefulness for negotiation"
  ),
  reasoning: z.string().describe(
    "A concise explanation (within 30 words) of the score"
  ),
});

export async function generateInterestScore(interests: string) {
  try {
    const { object } = await generateObject({
      model: anthropic("claude-3-7-sonnet-latest"),
      schema: scoreSchema,
      prompt: `Evaluate these negotiation interests (0-100) based on:

      1. Separation of people from problem (focuses on issues, not personalities)
      2. Expression of underlying interests, not positions (explains why, not just what)
      3. Potential for inventing options for mutual gain
      4. Reference to objective criteria or fair standards

      Interests to evaluate:
      ${interests}

      Score: [X/100]

      Brief explanation: [Provide a concise analysis in 35 words or less that focuses on how well these interests enable principled negotiation and creative problem-solving]

      To strengthen these interests:
- What underlying needs remain unexpressed?
- How could you focus on interests rather than positions?
- What objective standards would make any solution feel fair?
- What might the other party value that costs you little?
      `,
    });

    return {
      score: object.score,
      reasoning: object.reasoning,
    };
  } catch (error) {
    console.error("Error generating interest score:", error);
    throw error;
  }
}
