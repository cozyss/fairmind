import { Resend } from "resend";
import { env } from "@/env";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendVerificationEmail({
  email,
  username,
  verificationCode,
}: {
  email: string;
  username: string;
  verificationCode: string;
}) {
  try {
    await resend.emails.send({
      from: "verification@randomshit.world",
      to: email,
      subject: "Verify your email address",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify your email address</h2>
          <p>Hi ${username},</p>
          <p>Thank you for registering. Please use the following verification code to complete your registration:</p>
          <div style="background-color: #f4f4f4; padding: 12px; border-radius: 4px; margin: 20px 0; text-align: center; font-size: 24px; letter-spacing: 2px;">
            <strong>${verificationCode}</strong>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this verification, you can safely ignore this email.</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { success: false, error };
  }
}
