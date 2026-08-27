import { afterEach, describe, expect, it, vi } from "vitest";
import { safeLocalStorageGet, safeLocalStorageSet } from "./safeStorage";

describe("safeLocalStorage", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns a safe fallback and does not throw when browser privacy settings deny localStorage", () => {
    const deniedWindow = {} as Window;
    Object.defineProperty(deniedWindow, "localStorage", {
      get: () => {
        throw new DOMException("Access is denied for this document", "SecurityError");
      },
    });
    vi.stubGlobal("window", deniedWindow);

    expect(() => safeLocalStorageSet("preference", "accepted")).not.toThrow();
    expect(safeLocalStorageGet("preference")).toBe("accepted");
  });
});
