import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { procedure } from "@/server/api/trpc";
import { env } from "@/env";
import { generateToken } from "@/server/auth";

export const adminLogin = procedure
  .input(
    z.object({
      password: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    // Verify admin password
    if (input.password !== env.ADMIN_PASSWORD) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid admin password",
      });
    }

    // Generate special admin token
    // Using userId: -1 to indicate this is an admin token
    const token = generateToken(-1);

    return {
      token,
    };
  });
