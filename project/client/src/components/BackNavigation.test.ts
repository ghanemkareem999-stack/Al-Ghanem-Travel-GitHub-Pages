import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("client/src/components/BackNavigation.tsx", "utf8");

describe("BackNavigation", () => {
  it("uses same-site history only and safely falls back to a locale-aware internal route", () => {
    expect(source).toContain("document.referrer");
    expect(source).toContain("new URL(document.referrer).origin === window.location.origin");
    expect(source).toContain("window.history.back()");
    expect(source).toContain("navigate(fallbackHref)");
    expect(source).toContain("toLocalePath(locale, fallback)");
  });

  it("uses a localized label and direction-aware icon for RTL visitors", () => {
    expect(source).toContain('ar: "العودة إلى دليل الفنادق"');
    expect(source).toContain('const isRtl = locale === "ar" || locale === "ur"');
    expect(source).toContain("const Icon = isRtl ? ArrowRight : ArrowLeft");
  });

  it("shows an accessible floating return control only after the visitor has scrolled", () => {
    expect(source).toContain('const [showFloatingBack, setShowFloatingBack] = useState(false)');
    expect(source).toContain('window.scrollY > 120');
    expect(source).toContain('window.addEventListener("scroll", updateFloatingBack, { passive: true })');
    expect(source).toContain('{showFloatingBack && (');
    expect(source).toContain('aria-label={backLabels[locale]}');
    expect(source).toContain('onClick={navigateBack}');
    expect(source).toContain('bottom-[9.5rem]');
    expect(source).toContain('end-4');
    expect(source).toContain('sm:bottom-8 sm:end-8');
  });

  it("renders the top return control as a prominent button-like link", () => {
    expect(source).toContain('aria-label={backLabels[locale]}');
    expect(source).toContain('group inline-flex min-h-12');
    expect(source).toContain('rounded-full border border-[#a9853d]/45 bg-white/95');
    expect(source).toContain('shadow-[0_12px_28px_rgba(23,62,53,.12)]');
    expect(source).toContain('active:scale-[.98]');
  });
});
