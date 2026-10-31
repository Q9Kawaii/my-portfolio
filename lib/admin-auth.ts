import "server-only";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { firebaseConfig, isAdminEmail } from "./firebase-config";

// Google's public keys for Firebase Auth ID tokens.
const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

/**
 * Verifies the Firebase ID token in the Authorization header and checks the
 * email against the admin allowlist. Returns the token payload, or null.
 */
export async function verifyAdmin(req: Request): Promise<JWTPayload | null> {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  try {
    const { payload } = await jwtVerify(header.slice(7), JWKS, {
      issuer: `https://securetoken.google.com/${firebaseConfig.projectId}`,
      audience: firebaseConfig.projectId,
      algorithms: ["RS256"],
    });
    if (payload.email_verified !== true) return null;
    if (!isAdminEmail(payload.email as string | undefined)) return null;
    return payload;
  } catch {
    return null;
  }
}
