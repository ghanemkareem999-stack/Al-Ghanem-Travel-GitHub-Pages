import { timingSafeEqual, scryptSync } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { parse as parseCookie } from "cookie";
import type { Request } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { User } from "../drizzle/schema";
import { getOrCreateExternalAdmin } from "./db";

type ExternalSession = { email: string; provider: "local" };

function secret() {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 32) throw new Error("JWT_SECRET must be configured with at least 32 characters for external authentication.");
  return new TextEncoder().encode(value);
}

export function isExternalAuthEnabled() {
  return process.env.AUTH_PROVIDER === "local";
}

export function verifyExternalAdminPassword(password: string, encoded: string) {
  const [algorithm, salt, expected] = encoded.split("$");
  if (algorithm !== "scrypt" || !salt || !expected) return false;
  const actual = scryptSync(password, Buffer.from(salt, "base64"), 64);
  const expectedBuffer = Buffer.from(expected, "base64");
  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
}

export async function createExternalSession(email: string) {
  return new SignJWT({ email, provider: "local" satisfies ExternalSession["provider"] })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(Math.floor((Date.now() + ONE_YEAR_MS) / 1000))
    .sign(secret());
}

async function readExternalSession(req: Request): Promise<ExternalSession | null> {
  const cookies = parseCookie(req.headers.cookie ?? "");
  const bearer = typeof req.headers.authorization === "string" && req.headers.authorization.startsWith("Bearer ") ? req.headers.authorization.slice(7) : undefined;
  const token = cookies[COOKIE_NAME] || bearer;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    return payload.provider === "local" && typeof payload.email === "string" ? { provider: "local", email: payload.email } : null;
  } catch {
    return null;
  }
}

export async function authenticateExternalAdminRequest(req: Request): Promise<User | null> {
  if (!isExternalAuthEnabled()) return null;
  const session = await readExternalSession(req);
  return session ? getOrCreateExternalAdmin(session.email) : null;
}
