import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";

import { procedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { verifyAuth } from "@/server/auth";

const optionsSchema = z.object({
  options: z.array(z.string()).describe("List of negotiation options that could benefit both parties"),
});

export const generateProjectOptions = procedure
  .input(
    z.object({
      authToken: z.string(),
      projectId: z.number(),
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
        name: true,
        partyA: true,
        partyB: true,
        partyAName: true,
        partyBName: true,
        options: true,
      },
    });

    if (!project) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Project not found",
      });
    }

    // If options already exist in the database, return them
    if (project.options && project.options.length > 0) {
      return {
        options: project.options
      };
    }

    const { object } = await generateObject({
      model: anthropic("claude-3-7-sonnet-latest"),
      schema: optionsSchema,
      prompt: `
Given these negotiation interests:

${project.partyAName || "You"}: ${project.partyA}
${project.partyBName || "The other Party"}: ${project.partyB}

Generate creative options that might satisfy both parties by:

1. Looking for shared and compatible interests
2. Inventing options for mutual gain (expand the pie before dividing it)
3. Identifying package deals that address different priorities
4. Using objective criteria to resolve competing interests

For each option:
- Explain which specific interests from each party it addresses
- Identify any objective standards that support its fairness
- Note how it might "expand the pie" rather than just divide fixed resources
- Consider low-cost/high-value trades based on different priorities

Aim for options that solve the underlying problem rather than splitting differences. Include at least one option that neither party might have initially considered.

Present only the 3-5 strongest options that solve the underlying problem rather than splitting differences. Include at least one option that neither party might have initially considered. Rank options from strongest to most innovative.

IMPORTANT: Format each option with a clear subtitle/topic before a colon. For example: "Revenue Sharing: ..." or "Timeline Extension: ...". These subtitles should be concise and descriptive.
`,
    });

    // Post-process options to format subtitles in bold using markdown
    const formattedOptions = object.options.map(option => {
      // Find the first colon in the option text
      const colonIndex = option.indexOf(':');
      
      // If there's a colon, format the text before it as bold
      if (colonIndex > 0) {
        const subtitle = option.substring(0, colonIndex);
        const restOfText = option.substring(colonIndex);
        return `**${subtitle}**${restOfText}`;
      }
      
      // If no colon is found, return the original option
      return option;
    });

    // Save the options to the database
    await db.project.update({
      where: {
        id: input.projectId,
      },
      data: {
        options: formattedOptions,
      },
    });

    return {
      options: formattedOptions
    };
  });