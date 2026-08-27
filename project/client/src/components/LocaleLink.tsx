import { useLocale } from "@/contexts/LocaleContext";
import { toLocalePath } from "@/lib/localePaths";
import { Link } from "wouter";
import type { AnchorHTMLAttributes } from "react";

type LocaleLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export default function LocaleLink({ href, ...props }: LocaleLinkProps) {
  const { locale } = useLocale();
  return <Link {...props} href={toLocalePath(locale, href)} />;
}
