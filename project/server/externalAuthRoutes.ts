import type { Express, Request, Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { createExternalSession, isExternalAuthEnabled, verifyExternalAdminPassword } from "./externalAuth";
import { getOrCreateExternalAdmin } from "./db";

export function registerExternalAuthRoutes(app: Express) {
  app.post("/api/auth/local/login", async (req: Request, res: Response) => {
    if (!isExternalAuthEnabled()) {
      res.status(404).json({ error: "Local authentication is disabled." });
      return;
    }
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const expectedEmail = process.env.AUTH_ADMIN_EMAIL?.trim().toLowerCase() ?? "";
    const passwordHash = process.env.AUTH_ADMIN_PASSWORD_HASH ?? "";
    if (!expectedEmail || !passwordHash || email !== expectedEmail || !verifyExternalAdminPassword(password, passwordHash)) {
      res.status(401).json({ error: "Invalid administrator credentials." });
      return;
    }
    try {
      await getOrCreateExternalAdmin(email);
      const token = await createExternalSession(email);
      res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(req), maxAge: ONE_YEAR_MS });
      res.json({ success: true });
    } catch (error) {
      console.error("[ExternalAuth] Login failed", error);
      res.status(500).json({ error: "Administrator session could not be created." });
    }
  });
}
