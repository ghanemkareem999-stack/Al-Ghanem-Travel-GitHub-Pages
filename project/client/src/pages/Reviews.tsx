import SeoHead from "@/components/SeoHead";
import SiteShell from "@/components/SiteShell";
import { useLocale } from "@/contexts/LocaleContext";
import { reviewCopy } from "@/lib/reviewCopy";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, MessageSquareQuote, Star } from "lucide-react";
import { FormEvent, useState } from "react";

export default function Reviews() {
  const { locale } = useLocale();
  const copy = reviewCopy[locale];
  const approved = trpc.reviews.approved.useQuery();
  const submitReview = trpc.reviews.submit.useMutation();
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(false);
    setError(null);
    if (!rating) {
      setError(copy.ratingError);
      return;
    }
    const data = new FormData(event.currentTarget);
    try {
      await submitReview.mutateAsync({
        companyName: String(data.get("companyName") ?? ""), email: String(data.get("email") ?? ""),
        phone: String(data.get("phone") ?? "") || undefined, rating,
        reviewBody: String(data.get("reviewBody") ?? ""), locale, experienceConfirmed: true,
        publishConsent: true, displayCompanyName: data.get("displayCompanyName") === "on", website: String(data.get("website") ?? "") || undefined,
      });
      event.currentTarget.reset();
      setRating(0);
      setSubmitted(true);
    } catch {
      setError(copy.error);
    }
  };

  const fieldClass = "mt-2 h-12 w-full rounded-xl border border-[#173e35]/15 bg-white px-4 text-sm text-[#173e35] outline-none transition placeholder:text-[#83958f] focus:border-[#a9853d] focus:ring-2 focus:ring-[#a9853d]/15";
  const labelClass = "text-xs font-bold uppercase tracking-[.09em] text-[#496a61]";

  return <SiteShell>
    <SeoHead title={`${copy.footerAction} | Al Ghanem Travel`} description={copy.body} />
    <section className="border-b border-[#173e35]/10 bg-[#f3eee1]"><div className="mx-auto max-w-[1440px] px-5 py-16 md:px-8 lg:py-20"><p className="eyebrow">{copy.eyebrow}</p><div className="mt-4 gold-rule" /><h1 className="mt-5 max-w-3xl font-serif text-5xl leading-tight text-[#173e35] md:text-6xl">{copy.title}</h1><p className="mt-6 max-w-3xl text-[15px] leading-7 text-[#59726b]">{copy.body}</p></div></section>
    <section className="mx-auto grid max-w-[1440px] gap-10 px-5 py-14 md:px-8 lg:grid-cols-[.78fr_1.22fr] lg:py-20"><div><p className="eyebrow">{copy.approvedTitle}</p><h2 className="mt-4 font-serif text-4xl leading-tight text-[#173e35]">{copy.approvedTitle}</h2><p className="mt-4 max-w-xl text-sm leading-7 text-[#59726b]">{copy.approvedBody}</p><div className="mt-8 grid gap-4">{approved.data?.length ? approved.data.map(review => <article key={review.id} className="rounded-[1.5rem] border border-[#173e35]/10 bg-white p-6"><div className="flex items-center gap-1 text-[#a9853d]" aria-label={`${review.rating} of 5`}><span className="sr-only">{review.rating}/5</span>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={15} fill={index < review.rating ? "currentColor" : "none"} className={index < review.rating ? "" : "text-[#d7dfda]"} />)}</div><p className="mt-4 text-sm leading-7 text-[#496a61]">“{review.reviewBody}”</p><p className="mt-5 text-xs font-bold uppercase tracking-[.1em] text-[#173e35]">{review.companyName ?? copy.anonymousCompany}</p>{review.serviceType && <p className="mt-1 text-xs text-[#71857f]">{review.serviceType}</p>}</article>) : <div className="rounded-[1.5rem] border border-dashed border-[#a9853d]/60 bg-[#f8f5ed] p-7 text-sm leading-7 text-[#58726a]"><MessageSquareQuote size={25} className="text-[#a9853d]" /><p className="mt-4">{copy.approvedEmpty}</p></div>}</div></div>
      <div id="share" className="scroll-mt-24 rounded-[1.5rem] border border-[#173e35]/10 bg-[#f8f7f2] p-5 md:p-8"><p className="eyebrow">{copy.formTitle}</p><h2 className="mt-4 font-serif text-4xl leading-tight text-[#173e35]">{copy.formTitle}</h2><p className="mt-4 text-sm leading-7 text-[#59726b]">{copy.formBody}</p><form onSubmit={onSubmit} className="mt-8 grid gap-6"><div className="grid gap-5 md:grid-cols-2"><label className={labelClass}>{copy.companyName}<input name="companyName" className={fieldClass} required minLength={2} autoComplete="organization" /></label><label className={labelClass}>{copy.email}<input name="email" type="email" className={fieldClass} required autoComplete="email" /></label><label className={labelClass}>{copy.phone}<input name="phone" className={fieldClass} minLength={7} autoComplete="tel" /></label><div className={labelClass}>{copy.rating}<div className="mt-2 flex h-12 items-center gap-2 rounded-xl border border-[#173e35]/15 bg-white px-4">{Array.from({ length: 5 }, (_, index) => <button type="button" key={index} onClick={() => setRating(index + 1)} className="rounded p-1 text-[#a9853d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a9853d]" aria-label={`${index + 1} / 5`}><Star size={21} fill={index < rating ? "currentColor" : "none"} /></button>)}</div></div></div><label className={labelClass}>{copy.reviewBody}<textarea name="reviewBody" className="mt-2 min-h-36 w-full rounded-xl border border-[#173e35]/15 bg-white p-4 text-sm text-[#173e35] outline-none transition placeholder:text-[#83958f] focus:border-[#a9853d] focus:ring-2 focus:ring-[#a9853d]/15" required minLength={20} maxLength={3000} placeholder={copy.reviewPlaceholder} /></label><input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" /><div className="grid gap-3 text-sm leading-6 text-[#496a61]"><label className="flex gap-3"><input name="experienceConfirmed" type="checkbox" required className="mt-1 h-4 w-4 accent-[#173e35]" /><span>{copy.experienceConfirmed}</span></label><label className="flex gap-3"><input name="publishConsent" type="checkbox" required className="mt-1 h-4 w-4 accent-[#173e35]" /><span>{copy.publishConsent}</span></label><label className="flex gap-3"><input name="displayCompanyName" type="checkbox" className="mt-1 h-4 w-4 accent-[#173e35]" /><span>{copy.displayCompanyName}</span></label></div><button disabled={submitReview.isPending} className="inline-flex h-14 items-center justify-center gap-3 rounded-full bg-[#173e35] px-7 text-xs font-bold uppercase tracking-[.1em] text-white transition hover:bg-[#285b4e] disabled:opacity-60">{submitReview.isPending ? copy.sending : copy.submit}<CheckCircle2 size={16} /></button>{submitted && <p role="status" className="rounded-xl border border-[#5d8076]/35 bg-[#e8f1e9] p-4 text-sm leading-6 text-[#245747]">{copy.success}</p>}{error && <p role="alert" className="rounded-xl border border-[#b42318]/25 bg-[#fff2f1] p-4 text-sm leading-6 text-[#99201b]">{error}</p>}</form></div></section>
  </SiteShell>;
}
