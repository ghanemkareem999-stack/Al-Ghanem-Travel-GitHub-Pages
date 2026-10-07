import type { Locale } from "@/lib/i18n";
import { stripLocalePrefix, toLocalePath } from "@/lib/localePaths";
import { safeLocalStorageGet, safeLocalStorageSet } from "@/lib/safeStorage";

export const LANGUAGE_PREFERENCE_KEY = "al-ghanem-language-selected";

export function hasSelectedLanguage(): boolean {
  return Boolean(safeLocalStorageGet(LANGUAGE_PREFERENCE_KEY));
}

export function rememberLanguageChoice(locale: Locale): void {
  safeLocalStorageSet(LANGUAGE_PREFERENCE_KEY, locale);
}

export function shouldPromptForLanguage(pathname: string, hasSelection: boolean): boolean {
  return (pathname === "/" || pathname === "") && !hasSelection;
}

export function languageChoicePath(locale: Locale, currentPath: string): string {
  return toLocalePath(locale, stripLocalePrefix(currentPath));
}
