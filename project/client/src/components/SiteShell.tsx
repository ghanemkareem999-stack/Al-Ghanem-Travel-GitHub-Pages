import { useLocation } from "wouter";
import LocaleLink from "@/components/LocaleLink";
import { stripLocalePrefix, toLocalePath } from "@/lib/localePaths";
import { type ReactNode, useState } from "react";
import { Mail, Menu, MessageCircle, Share2, Star, X } from "lucide-react";
import { localeMeta, locales, type Locale } from "@/lib/i18n";
import { rememberLanguageChoice } from "@/lib/languagePreference";
import { reviewCopy } from "@/lib/reviewCopy";
import { infoCopy } from "@/lib/infoCopy";
import { useLocale } from "@/contexts/LocaleContext";
import { trpc } from "@/lib/trpc";
import { resolvePublicContacts } from "@/lib/publicSiteSettings";

const logoUrl = "/manus-storage/al-ghanem-travel-logo-cropped_e862fc19.webp";

export default function SiteShell({ children }: { children: ReactNode }) {
  const { locale, setLocale, t, dir } = useLocale();
  const [location, setLocation] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const siteSettings = trpc.siteSettings.get.useQuery();
  const contacts = resolvePublicContacts(siteSettings.data);
  const whatsappChatUrl = contacts.primaryWhatsAppUrl;
  const reviewText = reviewCopy[locale];
  const infoText = infoCopy[locale];
  const reviewNavLabel = { en: "Reviews", ar: "الآراء", ms: "Ulasan", ur: "آراء", id: "Ulasan", hi: "समीक्षाएँ" }[locale];
  const secondaryWhatsAppLabel = { en: "WhatsApp", ar: "واتساب", ms: "WhatsApp", ur: "واٹس ایپ", id: "WhatsApp", hi: "व्हाट्सऐप" }[locale];
  const isolatedContactValue = (value: string) => <bdi dir="ltr" className="inline-block whitespace-nowrap [unicode-bidi:isolate]">{value}</bdi>;
  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/hotels", label: t.nav.hotels },
    { href: "/#approach", label: t.nav.approach },
    { href: "/reviews", label: reviewNavLabel },
    { href: "/about", label: infoText.footer.about },
    { href: "/contact", label: infoText.footer.contact },
  ];

  const selectLocale = (value: string) => {
    const nextLocale = value as Locale;
    rememberLanguageChoice(nextLocale);
    setLocale(nextLocale);
    setLocation(toLocalePath(nextLocale, stripLocalePrefix(location)));
  };

  return (
    <div className="min-h-screen bg-[#fbfaf6] text-[#173e35]">
      <div className="hidden border-b border-[#173e35]/10 bg-[#f4f0e6] lg:block">
        <div className="mx-auto flex h-10 max-w-[1440px] items-center justify-between px-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#50645e]">
          <p>Al Ghanem Travel | Islamic Tourism &amp; Travel Services · <span lang="ar" dir="rtl">الراحة والأمان لضيوف الرحمن</span></p>
          <div className="flex items-center gap-5">
            <a className="contact-link" href={contacts.corporateEmailHref}><Mail size={13} /> {contacts.email}</a>
            <a className="contact-link" href={contacts.facebookUrl} target="_blank" rel="noreferrer" aria-label="Al Ghanem Travel on Facebook"><Share2 size={13} /> Facebook</a>
          </div>
        </div>
      </div>
      <header className="sticky top-0 z-50 border-b border-[#173e35]/10 bg-[#fbfaf6]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between gap-2 px-3 sm:gap-4 sm:px-5 md:px-8">
          <LocaleLink href="/" className="flex min-w-0 items-center gap-2 sm:gap-3" aria-label="Al Ghanem Travel home">
            <img src={logoUrl} alt="Al Ghanem Travel emblem" className="h-10 w-11 object-contain object-center sm:h-12 sm:w-16 md:h-14 md:w-20" />
            <div className="leading-none">
              <div className="whitespace-nowrap font-serif text-[10px] font-semibold tracking-[0.035em] text-[#a9853d] sm:text-[16px] sm:tracking-[0.055em] lg:text-[17px]">AL GHANEM TRAVEL</div>
              <div className="mt-1 hidden text-[8px] font-bold tracking-[0.12em] text-[#173e35] sm:block">ISLAMIC TOURISM &amp; TRAVEL SERVICES</div>
            </div>
          </LocaleLink>
          <nav className="hidden items-center gap-4 xl:flex" aria-label="Primary navigation">
            {navLinks.map(link => <LocaleLink key={link.href} href={link.href} className="nav-link">{link.label}</LocaleLink>)}
          </nav>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="language-switcher">Language</label>
            <select id="language-switcher" aria-label="Select language" value={locale} onChange={event => selectLocale(event.target.value)} className="language-select">
              {locales.map(code => <option key={code} value={code}>{localeMeta[code].name}</option>)}
            </select>
            <LocaleLink href="/inquiry" className="hidden rounded-full bg-[#173e35] px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-[#285b4e] lg:block">{t.nav.inquiry}</LocaleLink>
            <button className="grid h-10 w-10 place-items-center rounded-full border border-[#173e35]/15 xl:hidden" aria-label={isMenuOpen ? "Close menu" : "Open menu"} onClick={() => setIsMenuOpen(value => !value)}>
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {isMenuOpen && <div className="absolute inset-x-0 top-[76px] border-b border-[#173e35]/10 bg-[#fbfaf6] px-5 py-6 shadow-xl xl:hidden">
          <div className="mx-auto grid max-w-[1440px] gap-4">
            {navLinks.map(link => <LocaleLink key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className="border-b border-[#173e35]/10 pb-4 text-base font-semibold">{link.label}</LocaleLink>)}
            <LocaleLink href="/inquiry" onClick={() => setIsMenuOpen(false)} className="rounded-full bg-[#173e35] px-5 py-3 text-center text-xs font-bold uppercase tracking-[0.1em] text-white">{t.nav.inquiry}</LocaleLink>
            <div className="grid gap-3 border-t border-[#173e35]/10 pt-4 text-sm text-[#496a61]">
              <a className="inline-flex items-center gap-2" href={contacts.secondaryWhatsAppUrl} target="_blank" rel="noreferrer"><MessageCircle size={16} /> <span>{secondaryWhatsAppLabel}: {isolatedContactValue(contacts.secondaryWhatsAppDisplay)}</span></a>
              <a className="inline-flex items-center gap-2" href={contacts.corporateEmailHref}><Mail size={16} /> {contacts.email}</a>
              <a className="inline-flex items-center gap-2" href={contacts.facebookUrl} target="_blank" rel="noreferrer"><Share2 size={16} /> Facebook</a>
            </div>
          </div>
        </div>}
      </header>
      <main>{children}</main>
      <footer className="border-t border-white/10 bg-[#153a31] text-white">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-14 md:grid-cols-[1.15fr_.85fr_.85fr] md:px-8">
          <div>
            <div className="flex items-center gap-3">
              <img src={logoUrl} alt="Al Ghanem Travel emblem" className="h-16 w-20 rounded-xl bg-white/95 object-contain" />
              <div><p className="whitespace-nowrap font-serif text-lg tracking-[0.055em] text-[#dfc27f]">AL GHANEM TRAVEL</p><p className="text-[9px] font-bold tracking-[0.11em] text-white/70">ISLAMIC TOURISM &amp; TRAVEL SERVICES</p></div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/70">Al Ghanem Travel | Islamic Tourism &amp; Travel Services</p>
            <p lang="ar" dir="rtl" className="mt-2 max-w-sm text-sm leading-6 text-[#dfc27f]">الراحة والأمان لضيوف الرحمن</p>
            <p className="mt-6 text-xs leading-5 text-white/50">{t.footer.disclaimer}</p>
            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/70"><LocaleLink href="/about">{infoText.footer.about}</LocaleLink><LocaleLink href="/contact">{infoText.footer.contact}</LocaleLink><LocaleLink href="/privacy">{infoText.footer.privacy}</LocaleLink><LocaleLink href="/terms">{infoText.footer.terms}</LocaleLink></div>
          </div>
          <div>
            <p className="footer-heading">{t.footer.contact}</p>
            <div className="mt-5 grid gap-3 text-sm text-white/75">
              <a className="footer-link" href={contacts.secondaryWhatsAppUrl} target="_blank" rel="noreferrer" aria-label={`${secondaryWhatsAppLabel} contact for Al Ghanem Travel`}><MessageCircle size={16} /> <span>{secondaryWhatsAppLabel}: {isolatedContactValue(contacts.secondaryWhatsAppDisplay)}</span></a>
              <a className="footer-link" href={contacts.corporateEmailHref} aria-label="Email Al Ghanem Travel"><Mail size={16} /> <span>{t.contact.email}: {isolatedContactValue(contacts.email)}</span></a>
              <a className="footer-link" href={contacts.facebookUrl} target="_blank" rel="noreferrer" aria-label="Al Ghanem Travel on Facebook"><Share2 size={16} /> Facebook: Al Ghanem Travel</a>
              <LocaleLink className="footer-link" href="/reviews"><Star size={16} /> {reviewText.footerAction}</LocaleLink>
            </div>
          </div>
          <div>
            <p className="footer-heading">{t.nav.inquiry}</p>
            <p className="mt-5 text-sm leading-6 text-white/70">{t.cta.body}</p>
            <LocaleLink href="/inquiry" className="mt-5 inline-flex rounded-full border border-[#dfc27f]/60 px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-[#f3dda6] transition hover:bg-[#dfc27f] hover:text-[#153a31]">{t.cta.action}</LocaleLink>
          </div>
        </div>
        <div className="border-t border-white/10 px-5 py-5 text-center text-[11px] tracking-[0.05em] text-white/45">{t.footer.rights}</div>
      </footer>
      <a
        href={whatsappChatUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`${t.contact.whatsapp}: Al Ghanem Travel`}
        className="fixed bottom-6 start-5 z-40 inline-flex h-14 items-center gap-2 rounded-full border border-[#efcf82]/50 bg-[#1f6d5d] px-4 text-xs font-bold uppercase tracking-[0.08em] text-white shadow-[0_16px_38px_rgba(23,62,53,.3)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#285b4e] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#a9853d]/35 active:scale-[.97] sm:bottom-8 sm:start-8 sm:px-5"
      >
        <MessageCircle size={21} aria-hidden="true" />
        <span className="hidden sm:inline">{t.contact.whatsapp}</span>
      </a>
      {dir === "rtl" && <style>{`.site-direction { direction: rtl; }`}</style>}
    </div>
  );
}
