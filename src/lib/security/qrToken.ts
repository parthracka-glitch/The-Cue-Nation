import { createHmac, timingSafeEqual } from "crypto";
import { env } from "@/lib/env";

export function signTable(tableId: string, secret: string): string {
  const hmac = createHmac("sha256", env.QR_SIGNING_KEY)
    .update(`${tableId}:${secret}`)
    .digest("base64url");
  return `${tableId}.${hmac}`;
}

export function verifyTable(token: string, secret: string): string | null {
  try {
    const [tableId, signature] = token.split(".");
    if (!tableId || !signature) return null;

    const expectedSig = signTable(tableId, secret).split(".")[1];
    if (!expectedSig) return null;

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSig);

    if (sigBuffer.length !== expectedBuffer.length) return null;
    return timingSafeEqual(sigBuffer, expectedBuffer) ? tableId : null;
  } catch {
    return null;
  }
}
