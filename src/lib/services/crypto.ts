import crypto from "crypto";

const SECRET_SALT_KEY = process.env.QR_SIGNING_KEY || "cue-nation-parlour-lounge-super-secret-key-32";

/**
 * Hash password using Node crypto scrypt (secure, OWASP approved)
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Verify password against stored hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, "hex");
    const derivedBuffer = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedBuffer);
  } catch {
    return false;
  }
}

/**
 * Create a signed session token
 */
export function createSessionToken(payload: { id: string; role: string; name: string; email: string }): string {
  const data = JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 });
  const b64Data = Buffer.from(data).toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET_SALT_KEY).update(b64Data).digest("base64url");
  return `${b64Data}.${signature}`;
}

/**
 * Verify signed session token
 */
export function verifySessionToken(token: string): { id: string; role: string; name: string; email: string } | null {
  try {
    const [b64Data, signature] = token.split(".");
    if (!b64Data || !signature) return null;
    const expectedSig = crypto.createHmac("sha256", SECRET_SALT_KEY).update(b64Data).digest("base64url");
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
    const json = Buffer.from(b64Data, "base64url").toString("utf-8");
    const parsed = JSON.parse(json);
    if (parsed.exp && Date.now() > parsed.exp) {
      return null; // Expired
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Hash 6-digit booking PIN with SHA-256
 */
export function hashPin(pin: string): string {
  return crypto.createHash("sha256").update(pin).digest("hex");
}

/**
 * Generate 6-digit numeric PIN
 */
export function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate unique booking code e.g. CN-A78B92
 */
export function generateBookingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "CN-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
