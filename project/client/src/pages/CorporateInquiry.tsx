import SiteShell from "@/components/SiteShell";
import SeoHead from "@/components/SeoHead";
import { useLocale } from "@/contexts/LocaleContext";
import { inquiryCopy } from "@/lib/inquiryCopy";
import { seoCopy } from "@/lib/seoCopy";
import { resolvePublicContacts } from "@/lib/publicSiteSettings";
import { trpc } from "@/lib/trpc";
import { Mail, MessageCircle, Send, Share2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useSearch } from "wouter";

const responseTimeCopy = {
  en: "We respond within two hours during service hours.",
  ar: "نرد خلال ساعتين في ساعات الخدمة.",
  ms: "Kami membalas dalam masa dua jam pada waktu perkhidmatan.",
  ur: "ہم سروس کے اوقات میں دو گھنٹے کے اندر جواب دیتے ہیں۔",
  id: "Kami merespons dalam dua jam selama jam layanan.",
  hi: "हम सेवा समय के दौरान दो घंटे के भीतर उत्तर देते हैं।",
} as const;

export default function CorporateInquiry() {
  const { locale } = useLocale();
  const copy = inquiryCopy[locale];
  const search = useSearch();
  const preferredHotel = new URLSearchParams(search).get("hotel")?.replaceAll("-", " ") ?? "";
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const createInquiry = trpc.inquiries.create.useMutation();
  const siteSettings = trpc.siteSettings.get.useQuery();
  const contacts = resolvePublicContacts(siteSettings.data);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(false);
    const data = new FormData(event.currentTarget);
    try {
      await createInquiry.mutateAsync({
        contactName: String(data.get("contactName") ?? ""),
        phone: String(data.get("phone") ?? ""),
        preferredCity: String(data.get("preferredCity") ?? "madinah") as "madinah" | "makkah",
        checkIn: String(data.get("checkIn") ?? "") || undefined,
        checkOut: String(data.get("checkOut") ?? "") || undefined,
        preferredHotels: preferredHotel || undefined,
        website: String(data.get("website") ?? "") || undefined,
        locale,
      });
      setSubmitted(true);
      event.currentTarget.reset();
    } catch { setError(true); }
  };

  const fieldClass = "mt-2 h-12 w-full rounded-xl border border-[#173e35]/15 bg-white px-4 text-sm text-[#173e35] outline-none transition placeholder:text-[#83958f] focus:border-[#a9853d] focus:ring-2 focus:ring-[#a9853d]/15";
  const labelClass = "text-xs font-bold uppercase tracking-[.09em] text-[#496a61]";

  return <SiteShell>
    <SeoHead title={seoCopy[locale].inquiry.title} description={seoCopy[locale].inquiry.description} />
    <section className="border-b border-[#173e35]/10 bg-[#f3eee1]"><div className="mx-auto max-w-[1440px] px-5 py-16 md:px-8 lg:py-20"><p className="eyebrow">{copy.eyebrow}</p><div className="mt-4 gold-rule" /><h1 className="mt-5 max-w-3xl font-serif text-5xl leading-tight text-[#173e35] md:text-6xl">{copy.title}</h1><p className="mt-6 max-w-3xl text-[15px] leading-7 text-[#59726b]">{copy.body}</p></div></section>
    <section className="mx-auto grid max-w-[1440px] gap-10 px-5 py-14 md:px-8 lg:grid-cols-[.7fr_1.3fr] lg:py-20"><aside className="lg:sticky lg:top-28 lg:self-start"><div className="rounded-[1.5rem] bg-[#153a31] p-7 text-white"><p className="eyebrow text-[#efcf82]">AL GHANEM TRAVEL</p><h2 className="mt-5 font-serif text-3xl leading-tight">{copy.direct}</h2><p className="mt-4 rounded-xl border border-[#efcf82]/30 bg-white/10 p-4 text-sm leading-6 text-[#f4e5b7]">{responseTimeCopy[locale]}</p><div className="mt-7 grid gap-3"><a href={contacts.secondaryWhatsAppUrl} target="_blank" rel="noreferrer" className="contact-card"><MessageCircle size={18} />{copy.whatsapp2}</a><a href={contacts.corporateEmailHref} className="contact-card"><Mail size={18} />{copy.emailAction}</a><a href={contacts.facebookUrl} target="_blank" rel="noreferrer" className="contact-card"><Share2 size={18} />Facebook</a></div></div></aside>
      <div className="rounded-[1.5rem] border border-[#173e35]/10 bg-[#f8f7f2] p-5 md:p-8"><form onSubmit={onSubmit} className="grid gap-6"><p className="rounded-xl border border-[#a9853d]/25 bg-[#fffaf0] p-4 text-sm leading-6 text-[#58726a]">{responseTimeCopy[locale]}</p><div className="grid gap-5 md:grid-cols-2"><label className={labelClass}>{copy.contactName}<input className={fieldClass} name="contactName" required minLength={2} autoComplete="name" /></label><label className={labelClass}>{copy.phone}<input className={fieldClass} name="phone" required minLength={7} autoComplete="tel" /></label><label className={labelClass}>{copy.city}<select className={fieldClass} name="preferredCity" defaultValue="madinah"><option value="madinah">{copy.cityMadinah}</option><option value="makkah">{copy.cityMakkah}</option></select></label><div className="grid grid-cols-2 gap-3"><label className={labelClass}>{copy.checkIn}<input className={fieldClass} name="checkIn" type="date" /></label><label className={labelClass}>{copy.checkOut}<input className={fieldClass} name="checkOut" type="date" /></label></div></div><input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" /><button disabled={createInquiry.isPending} className="inline-flex h-14 items-center justify-center gap-3 rounded-full bg-[#173e35] px-7 text-xs font-bold uppercase tracking-[.1em] text-white transition hover:bg-[#285b4e] disabled:opacity-60">{createInquiry.isPending ? copy.sending : copy.submit}<Send size={16} /></button>{submitted && <p role="status" className="rounded-xl border border-[#5d8076]/35 bg-[#e8f1e9] p-4 text-sm leading-6 text-[#245747]">{copy.success}</p>}{error && <p role="alert" className="rounded-xl border border-[#b42318]/25 bg-[#fff2f1] p-4 text-sm leading-6 text-[#99201b]">{copy.error}</p>}</form></div></section>
  </SiteShell>;
}
