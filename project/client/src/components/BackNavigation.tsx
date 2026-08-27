import { useLocale } from "@/contexts/LocaleContext";
import { toLocalePath } from "@/lib/localePaths";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState, type AnchorHTMLAttributes, type MouseEvent } from "react";
import { useLocation } from "wouter";

type BackNavigationProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  fallback: string;
};

const backLabels = {
  en: "Back to hotel directory",
  ar: "العودة إلى دليل الفنادق",
  ms: "Kembali ke direktori hotel",
  ur: "ہوٹل ڈائریکٹری پر واپس جائیں",
  id: "Kembali ke direktori hotel",
  hi: "होटल निर्देशिका पर वापस जाएँ",
};

export default function BackNavigation({ fallback, className = "", ...props }: BackNavigationProps) {
  const { locale } = useLocale();
  const [, navigate] = useLocation();
  const [showFloatingBack, setShowFloatingBack] = useState(false);
  const fallbackHref = toLocalePath(locale, fallback);
  const isRtl = locale === "ar" || locale === "ur";
  const Icon = isRtl ? ArrowRight : ArrowLeft;

  useEffect(() => {
    const updateFloatingBack = () => setShowFloatingBack(window.scrollY > 120);
    updateFloatingBack();
    window.addEventListener("scroll", updateFloatingBack, { passive: true });
    return () => window.removeEventListener("scroll", updateFloatingBack);
  }, []);

  function navigateBack() {
    const hasSameSiteHistory = Boolean(
      document.referrer
      && new URL(document.referrer).origin === window.location.origin
      && window.history.length > 1,
    );

    if (hasSameSiteHistory) {
      window.history.back();
      return;
    }

    navigate(fallbackHref);
  }

  function handleBack(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    navigateBack();
  }

  return (
    <>
      <a
        {...props}
        href={fallbackHref}
        onClick={handleBack}
        aria-label={backLabels[locale]}
        className={`group inline-flex min-h-12 items-center gap-3 rounded-full border border-[#a9853d]/45 bg-white/95 px-5 py-3 text-sm font-extrabold text-[#173e35] shadow-[0_12px_28px_rgba(23,62,53,.12)] ring-1 ring-white/70 transition duration-200 hover:-translate-y-0.5 hover:border-[#173e35] hover:bg-[#173e35] hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#dfc27f]/70 active:scale-[.98] ${className}`}
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f3ead5] text-[#a9853d] transition group-hover:bg-white/15 group-hover:text-white" aria-hidden="true">
          <Icon size={18} />
        </span>
        <span className="leading-none">{backLabels[locale]}</span>
      </a>
      {showFloatingBack && (
        <button
          type="button"
          onClick={navigateBack}
          aria-label={backLabels[locale]}
          title={backLabels[locale]}
          className="fixed bottom-[9.5rem] end-4 z-40 inline-flex min-h-12 max-w-[min(78vw,18rem)] items-center gap-2 rounded-full border border-white/25 bg-[#153a31] px-4 py-3 text-[11px] font-extrabold text-white shadow-[0_18px_38px_rgba(15,50,42,.36)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#a9853d] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#dfc27f]/70 active:scale-[.98] sm:bottom-8 sm:end-8 sm:px-5 sm:text-xs"
        >
          <Icon size={17} aria-hidden="true" />
          <span className="truncate">{backLabels[locale]}</span>
        </button>
      )}
    </>
  );
}
