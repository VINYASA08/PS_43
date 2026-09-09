import crypto from "crypto";

interface OtpRecord {
  hashedOtp: string;
  expiresAt: number;
  attempts: number;
  purpose: string;
}

// In-memory OTP storage keyed by identifier (phone or email)
const otpStore = new Map<string, OtpRecord>();

// Cleanup expired OTPs every minute
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of otpStore.entries()) {
      if (now > record.expiresAt) {
        otpStore.delete(key);
      }
    }
  }, 60 * 1000);
}

function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp.trim()).digest("hex");
}

/**
 * Generates a 6-digit numeric OTP, saves it with a 10-minute expiry, and returns the plain OTP
 */
export function createAndStoreOtp(identifier: string, purpose = "login"): string {
  const otp = crypto.randomInt(100000, 1000000).toString();
  const hashedOtp = hashOtp(otp);
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(identifier, {
    hashedOtp,
    expiresAt,
    attempts: 0,
    purpose,
  });

  return otp;
}

/**
 * Verifies a submitted OTP against the stored hash
 */
export function verifyAndConsumeOtp(
  identifier: string,
  submittedOtp: string,
  purpose = "login"
): { success: boolean; message: string; remainingAttempts?: number } {
  const record = otpStore.get(identifier);

  if (!record) {
    return { success: false, message: "No active verification code found or code expired." };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(identifier);
    return { success: false, message: "Verification code has expired. Please request a new one." };
  }

  if (record.attempts >= 5) {
    otpStore.delete(identifier);
    return { success: false, message: "Maximum attempts exceeded. Please request a new code." };
  }

  const submittedHash = hashOtp(submittedOtp);
  if (submittedHash !== record.hashedOtp) {
    record.attempts += 1;
    const remaining = 5 - record.attempts;
    return {
      success: false,
      message: `Invalid verification code. ${remaining} attempts remaining.`,
      remainingAttempts: remaining,
    };
  }

  // Verification succeeded - consume OTP
  otpStore.delete(identifier);
  return { success: true, message: "Verification successful." };
}
