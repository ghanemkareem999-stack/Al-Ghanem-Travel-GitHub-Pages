import { randomBytes, scryptSync } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { isExternalAuthEnabled, verifyExternalAdminPassword } from "./externalAuth";

const originalProvider = process.env.AUTH_PROVIDER;

afterEach(() => {
  if (originalProvider === undefined) delete process.env.AUTH_PROVIDER;
  else process.env.AUTH_PROVIDER = originalProvider;
});

describe("external administrator authentication", () => {
  it("verifies a valid scrypt password hash and rejects an incorrect password", () => {
    const password = "A long, unique administrator password";
    const salt = randomBytes(16);
    const hash = scryptSync(password, salt, 64);
    const encoded = `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
    expect(verifyExternalAdminPassword(password, encoded)).toBe(true);
    expect(verifyExternalAdminPassword("incorrect password", encoded)).toBe(false);
    expect(verifyExternalAdminPassword(password, "not-a-supported-format")).toBe(false);
  });

  it("enables the independent administrator route only in local auth mode", () => {
    delete process.env.AUTH_PROVIDER;
    expect(isExternalAuthEnabled()).toBe(false);
    process.env.AUTH_PROVIDER = "local";
    expect(isExternalAuthEnabled()).toBe(true);
  });
});
