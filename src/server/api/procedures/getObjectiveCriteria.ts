import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { procedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { verifyAuth } from "@/server/auth";
import { env } from "@/env";

// Define the schema for the Perplexity API response
const perplexityResponseSchema = z.object({
  id: z.string(),
  model: z.string(),
  object: z.string(),
  created: z.number(),
  citations: z.array(z.string()),
  choices: z.array(
    z.object({
      index: z.number(),
      finish_reason: z.string(),
      message: z.object({
        role: z.string(),
        content: z.string(),
      }),
      delta: z.object({
        role: z.string(),
        content: z.string(),
      }),
    }),
  ),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }),
});

// Define the schema for the objective criteria
const objectiveCriteriaSchema = z.object({
  criteria: z.array(
    z.object({
      title: z.string().describe("Title of the objective criterion"),
      description: z
        .string()
        .describe("Description of the objective criterion"),
      source: z.string().optional().describe("Source of the information"),
      relevance: z
        .string()
        .describe("Why this criterion is relevant to the negotiation"),
    }),
  ),
  searchQuery: z
    .string()
    .describe("The search query used to find the criteria"),
});

// Filter out content enclosed in <think> tags
function removeThinkingContent(content: string): string {
  return content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}

export const getObjectiveCriteria = procedure
  .input(
    z.object({
      authToken: z.string(),
      projectId: z.number(),
    }),
  )
  .query(async ({ input }) => {
    // Verify authentication
    const { userId } = verifyAuth(input.authToken);

    // Fetch project details
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
        objectiveCriteria: true,
        objectiveCriteriaSearchQuery: true,
        objectiveCriteriaCitations: true,
        objectiveCriteriaRawContent: true,
      },
    });

    if (!project) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Project not found",
      });
    }

    // Check if we already have criteria stored for this project
    if (
      project.objectiveCriteria !== null && 
      project.objectiveCriteria !== undefined
    ) {
      console.log("Returning stored objective criteria");
      return {
        criteria: (project.objectiveCriteria as any).criteria || [],
        searchQuery: project.objectiveCriteriaSearchQuery || "",
        citations: project.objectiveCriteriaCitations || [],
        rawContent: project.objectiveCriteriaRawContent || "",
      };
    }

    // Construct search query based on project details
    const searchQuery = `Find objective criteria for a negotiation about "${project.name}" where:

    - ${project.partyAName || "Party A"} interests: "${project.partyA}"
    - ${project.partyBName || "Party B"} interests: "${project.partyB}"

    Identify 3-5 specific, measurable standards that both parties could accept as fair and legitimate regardless of their willingness to agree. Focus on:
    1. Industry benchmarks and professional standards
    2. Scientific research and expert recommendations
    3. Legal precedents or regulations
    4. Market rates or common practices
    5. Comparable cases or situations

    Present each as a structured criterion in this format:\n\n### [CRITERION TITLE]\n- **Standard**: [Clear description of the standard with specific metrics when possible]\n- **Source**: [Specific research, institution, or publication]\n- **Relevance**: [How this standard applies to both parties' interests]\n\nEnsure each criterion:\n- Is legitimately objective and independent of either party's will\n- Contains specific numbers or measurable benchmarks\n- Comes from authoritative sources (research institutions, professional organizations, etc.)\n- Addresses both parties' concerns\n\nAvoid conversational language or thinking out loud. Present each criterion as a clear, authoritative standard.
    `;

    try {
      // Call Perplexity API
      const response = await fetch(
        "https://api.perplexity.ai/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.PERPLEXITY_API_KEY}`,
          },
          body: JSON.stringify({
            model: "sonar-reasoning-pro",
            messages: [
              {
                role: "system",
                content:
                  "You are an expert in finding objective criteria for negotiations as described in 'Getting to Yes' by Fisher and Ury. For this negotiation, identify 3-5 specific, measurable standards from credible sources.",
              },
              {
                role: "user",
                content: searchQuery,
              },
            ],
            max_tokens: 1024,
            temperature: 0.2,
            return_citations: true,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Perplexity API error: ${response.status} ${errorText}`,
        );
      }

      const rawData = await response.json();

      // Validate the response against our schema
      const validatedResponse = perplexityResponseSchema.parse(rawData);

      // Extract the content from the response
      const content = validatedResponse.choices[0]?.message.content;
      console.log(content);

      if (!content) {
        throw new Error("No content returned from Perplexity API");
      }

      // Filter out any thinking content
      const filteredContent = removeThinkingContent(content);

      // Helper function to extract and clean text from markdown sections
      function extractSectionText(block: string, sectionName: string): string {
        // Try to match the section with various markdown formats
        const patterns = [
          // Bold with colon format: **Section**: Text
          new RegExp(
            `\\*\\*${sectionName}\\*\\*:\\s*(.+?)(?=\\n\\s*\\*\\*|\\n\\s*$|$)`,
            "s",
          ),
          // Bold with no colon: **Section** Text
          new RegExp(
            `\\*\\*${sectionName}\\*\\*\\s+(.+?)(?=\\n\\s*\\*\\*|\\n\\s*$|$)`,
            "s",
          ),
          // Heading format: ### Section\nText
          new RegExp(
            `###\\s*${sectionName}\\s*\\n+(.+?)(?=\\n\\s*###|\\n\\s*$|$)`,
            "s",
          ),
          // Bullet point format: - Section: Text
          new RegExp(
            `-\\s*${sectionName}:\\s*(.+?)(?=\\n\\s*-|\\n\\s*$|$)`,
            "s",
          ),
          // Bullet point with bold: - **Section**: Text
          new RegExp(
            `-\\s*\\*\\*${sectionName}\\*\\*:\\s*(.+?)(?=\\n\\s*-|\\n\\s*$|$)`,
            "s",
          ),
          // Colon format without bold: Section: Text
          new RegExp(
            `${sectionName}:\\s*(.+?)(?=\\n\\s*[A-Za-z]+:|\\n\\s*$|$)`,
            "s",
          ),
        ];

        // Try each pattern
        for (const pattern of patterns) {
          const match = block.match(pattern);
          if (match && match[1]) {
            // Clean up the extracted text more thoroughly
            return match[1]
              .replace(/\n/g, " ") // Replace newlines with spaces
              .replace(/\s+/g, " ") // Replace multiple spaces with a single space
              .replace(/- /g, "") // Remove bullet points
              .replace(/\*\*/g, "") // Remove bold markdown
              .replace(/•/g, "") // Remove bullet point characters
              .replace(/\d+\.\s+/g, "") // Remove numbered list markers
              .replace(/\[\d+\]/g, "") // Remove citation markers like [1]
              .trim();
          }
        }

        return "";
      }

      // Process the content to extract structured criteria
      const criteria = [];

      // First try to split by markdown headers
      let criteriaBlocks = filteredContent
        .split(/(?=###|##\s+[^#])/g)
        .filter((block) => block.trim());

      // If no headers found, try to split by numbered list items
      if (criteriaBlocks.length <= 1 && filteredContent.match(/\d+\.\s+[A-Z]/)) {
        criteriaBlocks = filteredContent
          .split(/(?=\d+\.\s+[A-Z])/g)
          .filter((block) => block.trim());
      }

      // If still no blocks found, try to split by blank lines between paragraphs
      if (criteriaBlocks.length <= 1) {
        criteriaBlocks = filteredContent
          .split(/\n\s*\n/)
          .filter((block) => block.trim());
      }

      console.log(`Found ${criteriaBlocks.length} criteria blocks`);

      // Process each criterion block
      for (let i = 0; i < criteriaBlocks.length; i++) {
        const block = criteriaBlocks[i];
        
        // Skip blocks that are too short or likely not criteria
        if (block.length < 20 || block.trim().startsWith("Note:") || block.trim().startsWith("Sources:")) {
          continue;
        }

        // Extract the title (first line after removing ### or ##)
        let title = "";
        const titleMatch = block.match(/^(?:###|##)\s*(.+?)(?:\n|$)/);
        if (titleMatch) {
          title = titleMatch[1].trim();
        } else {
          // Try to extract title from numbered list format (e.g., "1. Title")
          const numberedTitleMatch = block.match(/^\d+\.\s+(.+?)(?:\n|$)/);
          if (numberedTitleMatch) {
            title = numberedTitleMatch[1].trim();
          } else {
            // Try to extract the first line as title
            const firstLineMatch = block.match(/^(.+?)(?:\n|$)/);
            if (firstLineMatch) {
              title = firstLineMatch[1].replace(/^[#\-*]+\s*/, "").trim();
            } else {
              title = `Criterion ${i + 1}`;
            }
          }
        }

        // Extract sections using the helper function
        const standard = extractSectionText(block, "Standard");
        const source = extractSectionText(block, "Source");
        const relevance = extractSectionText(block, "Relevance");

        // If we couldn't extract a standard section but have content, use the whole block as description
        let description = standard;
        if (!description) {
          // Remove the title line and any markdown formatting
          description = block
            .replace(/^(?:###|##)\s*(.+?)(?:\n|$)/, "")
            .replace(/^\d+\.\s+(.+?)(?:\n|$)/, "")
            .replace(/- \*\*.*?\*\*:/g, "")
            .replace(/\*\*/g, "")
            .replace(/- /g, "") // Remove bullet points
            .replace(/•/g, "") // Remove bullet point characters
            .replace(/\d+\.\s+/g, "") // Remove numbered list markers
            .replace(/\[\d+\]/g, "") // Remove citation markers like [1]
            .trim();

          // Convert multiple newlines to single spaces to create a continuous paragraph
          description = description
            .replace(/\n+/g, " ")
            .replace(/\s+/g, " ")
            .trim();
        }

        // Try to match a citation with this criterion if available
        let citationUrl;
        if (source && validatedResponse.citations.length > 0) {
          // Try to find a citation that contains keywords from the source
          const sourceKeywords = source
            .toLowerCase()
            .split(/\s+/)
            .filter((word) => word.length > 4)
            .filter(
              (word) =>
                ![
                  "from",
                  "this",
                  "that",
                  "with",
                  "based",
                  "according",
                  "such",
                  "these",
                  "those",
                  "their",
                  "other",
                ].includes(word),
            );

          // Try to find a citation that contains any of the keywords
          citationUrl = validatedResponse.citations.find((citation) =>
            sourceKeywords.some((keyword) =>
              citation.toLowerCase().includes(keyword),
            ),
          );
        }

        // If no specific citation matched, use the citation at the same index if available
        if (!citationUrl && i < validatedResponse.citations.length) {
          citationUrl = validatedResponse.citations[i];
        }

        // Only add criteria that have meaningful content
        if (title && (description || standard)) {
          criteria.push({
            title,
            description: description || "No detailed description available.",
            source: citationUrl || undefined,
            relevance:
              relevance ||
              "This criterion is relevant to the negotiation topic and interests of both parties.",
          });
        }
      }

      console.log(`Extracted ${criteria.length} structured criteria`);

      // Prepare the result object
      const result = {
        criteria: criteria.length > 0 ? criteria : [
          {
            title: "Objective Criterion",
            description: filteredContent.replace(/\n+/g, " ").trim(),
            source: validatedResponse.citations.length > 0 ? validatedResponse.citations[0] : undefined,
            relevance: "This criterion is relevant to the negotiation topic and interests of both parties.",
          }
        ],
        searchQuery,
        citations: validatedResponse.citations,
        rawContent: filteredContent, // Include the filtered content for debugging
      };

      // Save the criteria to the database
      try {
        await db.project.update({
          where: {
            id: input.projectId,
          },
          data: {
            objectiveCriteria: { criteria: result.criteria },
            objectiveCriteriaSearchQuery: searchQuery,
            objectiveCriteriaCitations: validatedResponse.citations,
            objectiveCriteriaRawContent: filteredContent,
            updatedAt: new Date(), // Update the timestamp
          },
        });
        console.log("Saved objective criteria to database");
      } catch (dbError) {
        console.error("Error saving objective criteria to database:", dbError);
        // Continue to return the result even if saving fails
      }

      // Return all available data
      return result;
    } catch (error) {
      console.error("Error fetching objective criteria:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch objective criteria",
      });
    }
  });