import crypto from "crypto";
import QRCode from "qrcode";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/**
 * Generates an RFC 4648 Base32 encoded random secret string
 */
export function generateBase32Secret(length = 20): string {
  const buffer = crypto.randomBytes(length);
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Decodes an RFC 4648 Base32 string into a Buffer
 */
export function base32Decode(base32: string): Buffer {
  const clean = base32.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const index = BASE32_ALPHABET.indexOf(clean[i]);
    if (index === -1) continue;
    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Calculates a 6-digit TOTP code per RFC 6238 (HMAC-SHA1)
 */
export function generateTOTP(secret: string, timeStep = 30, forTime = Date.now()): string {
  const key = base32Decode(secret);
  const counter = Math.floor(forTime / 1000 / timeStep);
  const buffer = Buffer.alloc(8);
  buffer.writeBigInt64BE(BigInt(counter));

  const hmac = crypto.createHmac("sha1", key);
  hmac.update(buffer);
  const digest = hmac.digest();

  const offset = digest[digest.length - 1] & 0xf;
  const code =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  return (code % 1000000).toString().padStart(6, "0");
}

/**
 * Verifies a 6-digit TOTP code against the secret within a drift window (default ±1 interval = ±30s)
 */
export function verifyTOTP(secret: string, token: string, window = 1): boolean {
  if (!token || token.trim().length !== 6) return false;
  const cleanToken = token.trim();
  const now = Date.now();
  const timeStep = 30;

  for (let i = -window; i <= window; i++) {
    const time = now + i * timeStep * 1000;
    if (generateTOTP(secret, timeStep, time) === cleanToken) {
      return true;
    }
  }
  return false;
}

/**
 * Builds the otpauth:// URI for authenticator applications
 */
export function buildTotpUri(
  accountName: string,
  secret: string,
  issuer = "Jharkhand State Innovation Council"
): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(accountName);
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Generates a base64 Data URL QR code for authenticator apps
 */
export async function generateTotpQrCode(
  accountName: string,
  secret: string,
  issuer = "Jharkhand State Innovation Council"
): Promise<string> {
  const uri = buildTotpUri(accountName, secret, issuer);
  return QRCode.toDataURL(uri, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 256,
  });
}
