import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("client/src/components/SiteShell.tsx", "utf8");
const informationPageSource = readFileSync("client/src/pages/InformationPage.tsx", "utf8");

describe("SiteShell brand treatment", () => {
  it("shows the full approved AL GHANEM TRAVEL name in both header and footer identity treatments", () => {
    expect(source.match(/AL GHANEM TRAVEL/g)?.length).toBeGreaterThanOrEqual(2);
    expect(source).not.toContain(">AL GHANEM</div>");
    expect(source).toContain("whitespace-nowrap");
    expect(source).toContain('<div className="leading-none">');
  });

  it("retains WhatsApp and email contact actions without reintroducing a public call action", () => {
    expect(source).toContain('const isolatedContactValue = (value: string) => <bdi dir="ltr"');
    expect(source).toContain("[unicode-bidi:isolate]");
    expect(source).toContain("resolvePublicContacts(siteSettings.data)");
    expect(source).toContain("contacts.secondaryWhatsAppUrl");
    expect(source).toContain("contacts.corporateEmailHref");
    expect(source).not.toContain("primaryPhoneHref");
    expect(informationPageSource).not.toContain("primaryPhoneHref");
  });

  it("places the floating WhatsApp action opposite the back control with a mobile safe offset", () => {
    expect(source).toContain('fixed bottom-6 start-5');
    expect(source).toContain('sm:bottom-8 sm:start-8');
  });
});
