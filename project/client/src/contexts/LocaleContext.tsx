import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { localeMeta, locales, translations, type Locale, type Translation } from "@/lib/i18n";
import { safeLocalStorageSet } from "@/lib/safeStorage";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translation;
  dir: "ltr" | "rtl";
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children, initialLocale = "en" }: { children: ReactNode; initialLocale?: Locale }) {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  useEffect(() => {
    const { dir } = localeMeta[locale];
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    safeLocalStorageSet("al-ghanem-locale", locale);
  }, [locale]);

  const value = useMemo(
    () => ({ locale, setLocale, t: translations[locale], dir: localeMeta[locale].dir }),
    [locale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used within LocaleProvider");
  return context;
}
