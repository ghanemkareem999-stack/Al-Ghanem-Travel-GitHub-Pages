import { locales, type Locale } from "@/lib/i18n";

const localeSet = new Set<string>(locales);

export function isLocale(value: string | undefined): value is Locale {
  return Boolean(value && localeSet.has(value));
}

export function getLocaleFromPath(pathname: string): Locale {
  const segment = pathname.split("/").filter(Boolean)[0];
  return isLocale(segment) ? segment : "en";
}

export function stripLocalePrefix(path: string): string {
  const [beforeHash, hash = ""] = path.split("#", 2);
  const [pathname = "/", search = ""] = beforeHash.split("?", 2);
  const parts = pathname.split("/").filter(Boolean);
  if (isLocale(parts[0])) parts.shift();
  const normalized = `/${parts.join("/")}`.replace(/\/+$/, "") || "/";
  return `${normalized}${search ? `?${search}` : ""}${hash ? `#${hash}` : ""}`;
}

export function toLocalePath(locale: Locale, path: string): string {
  if (/^(?:https?:)?\/\//i.test(path) || path.startsWith("mailto:") || path.startsWith("tel:")) return path;
  const clean = stripLocalePrefix(path);
  return `/${locale}${clean === "/" ? "" : clean}`;
}
