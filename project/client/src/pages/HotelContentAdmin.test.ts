import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("client/src/pages/HotelContentAdmin.tsx", "utf8");

describe("HotelContentAdmin image upload", () => {
  it("keeps the internal image uploader focused on the saved hotel and image file", () => {
    expect(source).toContain('<h2 className="text-xl font-semibold">Image upload</h2>');
    expect(source).toContain('Hotel record<select value={selectedHotelId}');
    expect(source).toContain('Image file<Input type="file"');
    expect(source).toContain("'Upload Image'");
    expect(source).not.toContain("Rights evidence");
    expect(source).not.toContain("Authorized media upload");
    expect(source).not.toContain("Upload approved media");
    expect(source).not.toContain("hold partner authorization");
  });

  it("does not require an operator-supplied rights field before enabling the upload", () => {
    expect(source).toContain('disabled={!selectedHotelId || !imageFile || upload.isPending}');
    expect(source).not.toContain("rightsEvidence");
    expect(source).not.toContain("rightsStatus:");
  });

  it("allows an administrator to remove a gallery reference with confirmation", () => {
    expect(source).toContain("trpc.catalogue.removeImage.useMutation");
    expect(source).toContain("Remove this image from the hotel gallery?");
    expect(source).toContain('aria-label="Remove image"');
    expect(source).toContain("await removeImage.mutateAsync({ imageId: id })");
  });
});
