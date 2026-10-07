import { useEffect, useRef, useState } from "react";
import { Globe2 } from "lucide-react";
import { useLocation } from "wouter";
import { useLocale } from "@/contexts/LocaleContext";
import { localeMeta, locales, type Locale } from "@/lib/i18n";
import {
  hasSelectedLanguage,
  languageChoicePath,
  rememberLanguageChoice,
  shouldPromptForLanguage,
} from "@/lib/languagePreference";

export default function LanguageChooser() {
  const { setLocale } = useLocale();
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const firstLanguageRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsOpen(shouldPromptForLanguage(location, hasSelectedLanguage()));
  }, [location]);

  useEffect(() => {
    if (isOpen) firstLanguageRef.current?.focus();
  }, [isOpen]);

  const selectLanguage = (nextLocale: Locale) => {
    rememberLanguageChoice(nextLocale);
    setLocale(nextLocale);
    setIsOpen(false);
    setLocation(languageChoicePath(nextLocale, location));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-[#0c2f29]/75 px-4 py-8 backdrop-blur-sm" role="presentation">
      <section
        className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-[#dfc27f]/50 bg-[#fbfaf6] shadow-[0_32px_90px_rgba(7,32,27,.4)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="language-chooser-title"
        aria-describedby="language-chooser-description"
      >
        <div className="border-b border-[#173e35]/10 bg-[#f4f0e6] px-6 py-7 text-center sm:px-10">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-[#a9853d]/40 bg-white text-[#a9853d]">
            <Globe2 size={22} aria-hidden="true" />
          </span>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#a9853d]">Al Ghanem Travel</p>
          <h1 id="language-chooser-title" className="mt-2 font-serif text-3xl text-[#173e35] sm:text-4xl">Choose your language</h1>
          <p id="language-chooser-description" lang="ar" dir="rtl" className="mt-2 text-lg font-semibold text-[#496a61]">اختر اللغة المناسبة لك</p>
          <p className="mt-3 text-sm leading-6 text-[#50645e]">You can change your language at any time from the top menu.</p>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2 sm:gap-4 sm:p-8">
          {locales.map((code, index) => {
            const meta = localeMeta[code];
            return (
              <button
                key={code}
                ref={index === 0 ? firstLanguageRef : undefined}
                type="button"
                onClick={() => selectLanguage(code)}
                className="group flex min-h-16 items-center justify-between rounded-2xl border border-[#173e35]/15 bg-white px-5 text-start text-[#173e35] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#a9853d]/60 hover:bg-[#fffdf7] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#a9853d]/30 active:scale-[.98]"
              >
                <span lang={code} dir={meta.dir} className="text-lg font-bold">{meta.name}</span>
                <span aria-hidden="true" className="text-sm font-semibold text-[#a9853d] transition group-hover:translate-x-0.5">{meta.dir === "rtl" ? "←" : "→"}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
