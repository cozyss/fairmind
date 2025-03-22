import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { procedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { generateToken, verifyAuth } from "@/server/auth";

export const verifyEmail = procedure
  .input(
    z.object({
      authToken: z.string(),
      verificationCode: z.string().length(6),
    }),
  )
  .mutation(async ({ input }) => {
    // Verify the auth token to get the user ID
    const { userId } = verifyAuth(input.authToken);

    // Find the user
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // Check if user is already verified
    if (user.isVerified) {
      return {
        success: true,
        message: "Email already verified",
        token: input.authToken,
      };
    }

    // Check if verification code exists and hasn't expired
    if (
      !user.verificationCode ||
      !user.verificationExpires ||
      user.verificationExpires < new Date()
    ) {
      // Delete the user account since verification has expired
      await db.user.delete({
        where: { id: userId },
      });
      
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Verification code has expired. Please register again.",
      });
    }

    // Check if verification code matches
    if (user.verificationCode !== input.verificationCode) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid verification code",
      });
    }

    // Update user to mark as verified and clear verification data
    await db.user.update({
      where: { id: userId },
      data: {
        isVerified: true,
        verificationCode: null,
        verificationExpires: null,
        lastLoginAt: new Date(), // Set the initial login timestamp when email is verified
      },
    });

    // Generate a new token
    const token = generateToken(userId);

    return {
      success: true,
      message: "Email verified successfully",
      token,
    };
  });