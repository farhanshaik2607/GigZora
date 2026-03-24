/**
 * GigZora Auth Utilities
 * JWT signing and verification using the `jose` library.
 */

import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'gigzora-fallback-secret-key'
);

const ISSUER = 'gigzora';
const AUDIENCE = 'gigzora-app';
const EXPIRATION = '7d';

/**
 * Sign a JWT token with the given payload.
 * @param {Object} payload - e.g. { id, email, name }
 * @returns {Promise<string>} signed JWT string
 */
export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(EXPIRATION)
    .sign(SECRET);
}

/**
 * Verify and decode a JWT token.
 * @param {string} token
 * @returns {Promise<Object|null>} decoded payload or null if invalid
 */
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, SECRET, {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    return payload;
  } catch {
    return null;
  }
}
