import SeoHead from "@/components/SeoHead";
import SiteShell from "@/components/SiteShell";
import { useLocale } from "@/contexts/LocaleContext";
import { infoCopy } from "@/lib/infoCopy";
import Link from "@/components/LocaleLink";
import { Compass } from "lucide-react";

export default function NotFound() {
  const { locale } = useLocale(); const copy = infoCopy[locale].notFound;
  return <SiteShell><SeoHead title={`404 | Al Ghanem Travel`} description={copy.body} /><section className="mx-auto grid min-h-[62vh] max-w-[1120px] place-items-center px-5 py-16 md:px-8"><div className="w-full max-w-2xl rounded-[2rem] border border-[#173e35]/10 bg-[#f3eee1] p-8 text-center md:p-14"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[#a9853d]/50 bg-white text-[#a9853d]"><Compass size={28} /></div><p className="mt-7 eyebrow">{copy.eyebrow}</p><h1 className="mt-4 font-serif text-6xl text-[#173e35]">404</h1><h2 className="mt-3 font-serif text-4xl text-[#173e35]">{copy.title}</h2><p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-[#59726b]">{copy.body}</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/" className="rounded-full bg-[#173e35] px-6 py-4 text-xs font-bold uppercase tracking-[.1em] text-white">{copy.action}</Link><Link href="/hotels" className="rounded-full border border-[#173e35]/20 px-6 py-4 text-xs font-bold uppercase tracking-[.1em] text-[#173e35]">{locale === "ar" ? "دليل الفنادق" : "Hotel portfolio"}</Link></div></div></section></SiteShell>;
}
