import "server-only";
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  if (!resend) throw new Error("RESEND_API_KEY is not set");

  await resend.emails.send({
    from: "Gym Tracker <onboarding@resend.dev>",
    to,
    subject: "Reset your Gym Tracker password",
    html: `
      <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #16151a;">
        <p style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #6b6b73; margin: 0 0 4px;">Gym Tracker</p>
        <h1 style="font-size: 22px; margin: 0 0 16px;">Reset your password</h1>
        <p style="font-size: 14px; line-height: 1.6; color: #333;">
          We got a request to reset your Gym Tracker password. This link expires in 1 hour.
          If you didn't request this, you can safely ignore this email.
        </p>
        <p style="margin: 28px 0;">
          <a href="${resetUrl}" style="background: #16151a; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; font-size: 14px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p style="font-size: 12px; color: #8a8a8a; word-break: break-all;">${resetUrl}</p>
      </div>
    `,
  });
}
