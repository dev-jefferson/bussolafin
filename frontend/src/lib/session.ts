export const SESSION_COOKIE_NAME = process.env.JWT_COOKIE_NAME ?? "cf_session";

export function getBackendUrl(): string {
  return process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8080";
}

/**
 * Secure defaults to false so the session cookie also works over plain HTTP
 * (local dev, docker-compose without TLS). Set COOKIE_SECURE=true when the
 * app is actually served over HTTPS (e.g. behind the nginx prod profile).
 */
export function isSecureCookie(): boolean {
  return process.env.COOKIE_SECURE === "true";
}
