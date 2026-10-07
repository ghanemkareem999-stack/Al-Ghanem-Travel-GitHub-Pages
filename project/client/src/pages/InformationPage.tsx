import SeoHead from "@/components/SeoHead";
import SiteShell from "@/components/SiteShell";
import { useLocale } from "@/contexts/LocaleContext";
import { infoCopy } from "@/lib/infoCopy";
import Link from "@/components/LocaleLink";

export type InformationKind = "about" | "contact" | "privacy" | "terms";
export default function InformationPage({ kind }: { kind: InformationKind }) {
  const { locale } = useLocale(); const copy = infoCopy[locale][kind];
  return <SiteShell><SeoHead title={`${copy.title} | Al Ghanem Travel`} description={copy.intro} /><section className="border-b border-[#173e35]/10 bg-[#f3eee1]"><div className="mx-auto max-w-[1120px] px-5 py-16 md:px-8 lg:py-20"><p className="eyebrow">{copy.eyebrow}</p><div className="mt-4 gold-rule" /><h1 className="mt-5 max-w-4xl font-serif text-5xl leading-tight text-[#173e35] md:text-6xl">{copy.title}</h1><p className="mt-6 max-w-3xl text-[15px] leading-7 text-[#59726b]">{copy.intro}</p></div></section><section className="mx-auto max-w-[1120px] px-5 py-14 md:px-8 lg:py-20"><div className="grid gap-5">{copy.sections.map(section => <article key={section.heading} className="rounded-[1.5rem] border border-[#173e35]/10 bg-white p-7"><h2 className="font-serif text-3xl text-[#173e35]">{section.heading}</h2><p className="mt-4 max-w-4xl text-sm leading-7 text-[#59726b]">{section.body}</p></article>)}</div>{copy.action && <Link href="/inquiry" className="mt-8 inline-flex rounded-full bg-[#173e35] px-6 py-4 text-xs font-bold uppercase tracking-[.1em] text-white">{copy.action}</Link>}</section></SiteShell>;
}
