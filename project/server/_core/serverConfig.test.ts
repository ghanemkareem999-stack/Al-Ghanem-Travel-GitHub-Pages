import { describe, expect, it } from "vitest";
import { getExternalStorageUrl } from "./externalStorage";
import { getServerPort } from "./serverConfig";

describe("external-hosting runtime configuration", () => {
  it("uses the platform-assigned port exactly", () => {
    expect(getServerPort("4567")).toBe(4567);
    expect(getServerPort("")).toBe(3000);
  });

  it("rejects invalid platform ports", () => {
    expect(() => getServerPort("0")).toThrow("PORT must be an integer");
    expect(() => getServerPort("not-a-port")).toThrow("PORT must be an integer");
  });

  it("builds a stable HTTPS object-storage URL from a mirrored asset key", () => {
    expect(
      getExternalStorageUrl(
        "https://assets.example.com/al-ghanem/",
        "hotels/pullman/exterior.webp",
      ),
    ).toBe("https://assets.example.com/al-ghanem/hotels/pullman/exterior.webp");
  });

  it("does not allow a storage key to escape the configured asset origin", () => {
    expect(() => getExternalStorageUrl("https://assets.example.com/media", "../private.webp")).toThrow(
      "Invalid storage key",
    );
    expect(() => getExternalStorageUrl("http://assets.example.com/media", "hotel.webp")).toThrow(
      "ASSET_STORAGE_ORIGIN must use HTTPS",
    );
  });
});
