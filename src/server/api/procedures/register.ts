import { TRPCError } from "@trpc/server";
import bcrypt from "bcrypt";
import { z } from "zod";
import crypto from "crypto";

import { procedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { generateToken } from "@/server/auth";
import { sendVerificationEmail } from "@/lib/server/email";

export const register = procedure
  .input(
    z.object({
      email: z.string().email(),
      username: z.string().min(3).max(20),
      password: z.string().min(8),
    }),
  )
  .mutation(async ({ input }) => {
    // Check if email or username already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ email: input.email }, { username: input.username }],
      },
    });

    if (existingUser) {
      // If the existing user is unverified and their verification code has expired,
      // delete the account and allow re-registration
      if (!existingUser.isVerified && 
          existingUser.verificationExpires && 
          existingUser.verificationExpires < new Date()) {
        
        // Delete the expired unverified account
        await db.user.delete({
          where: { id: existingUser.id }
        });
        
        // Continue with registration process
      } 
      // If the existing user is unverified but verification hasn't expired yet,
      // allow them to register again by deleting the old account
      else if (!existingUser.isVerified) {
        // Delete the unverified account
        await db.user.delete({
          where: { id: existingUser.id }
        });
        
        // Continue with registration process
      }
      // If the user is verified, throw a conflict error
      else {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email or username already exists",
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(input.password, 10);

    // Generate verification code (6 digits)
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    
    // Set expiration time (10 minutes from now)
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Create unverified user
    const user = await db.user.create({
      data: {
        email: input.email,
        username: input.username,
        hashedPassword,
        isVerified: false,
        verificationCode,
        verificationExpires,
      },
      select: {
        id: true,
        email: true,
        username: true,
      },
    });

    // Send verification email
    const emailResult = await sendVerificationEmail({
      email: input.email,
      username: input.username,
      verificationCode,
    });

    if (!emailResult.success) {
      // If email sending fails, delete the user and throw an error
      await db.user.delete({ where: { id: user.id } });
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to send verification email. Please try again.",
      });
    }

    // Generate temporary token for verification
    const token = generateToken(user.id);

    return {
      user,
      token,
      requiresVerification: true,
    };
  });