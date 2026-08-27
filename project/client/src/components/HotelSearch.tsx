import { useLocale } from "@/contexts/LocaleContext";
import { getHotelAreaLabel, getHotelDisplayName, searchHotelsByName, type HotelProfile } from "@/lib/portfolio";
import { ArrowUpRight, Building2, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import Link from "@/components/LocaleLink";

export const hotelSearchLabels = {
  en: { label: "Find a hotel", prompt: "Search by hotel name", placeholder: "Try Pullman, Dallah, or Al Aqeeq", hint: "Arabic and English hotel names both work.", results: "Matching hotels", noResults: "No hotel matches that name yet. Try the Arabic or English hotel name, or clear the search to browse the directory.", clear: "Clear search", allHotels: "Browse all hotels" },
  ar: { label: "ابحث عن فندق", prompt: "اكتب اسم الفندق أو جزءاً منه", placeholder: "مثال: بولمان، دلة، أو العقيق", hint: "يمكنكم البحث بالاسم العربي أو الإنجليزي.", results: "الفنادق المطابقة", noResults: "لا توجد نتيجة مطابقة لهذا الاسم حالياً. جرّبوا الاسم العربي أو الإنجليزي، أو امسحوا البحث لاستعراض الدليل.", clear: "مسح البحث", allHotels: "استعرض كل الفنادق" },
  ms: { label: "Cari hotel", prompt: "Cari mengikut nama hotel", placeholder: "Cuba Pullman, Dallah atau Al Aqeeq", hint: "Nama hotel dalam bahasa Arab atau Inggeris kedua-duanya berfungsi.", results: "Hotel sepadan", noResults: "Tiada hotel sepadan dengan nama itu. Cuba nama Arab atau Inggeris, atau kosongkan carian untuk melihat direktori.", clear: "Kosongkan carian", allHotels: "Lihat semua hotel" },
  ur: { label: "ہوٹل تلاش کریں", prompt: "ہوٹل کا نام یا اس کا حصہ لکھیں", placeholder: "مثال: بولمان، دلا یا العقیق", hint: "عربی اور انگریزی دونوں ناموں سے تلاش کی جاسکتی ہے۔", results: "ملتے جلتے ہوٹل", noResults: "اس نام سے کوئی ہوٹل نہیں ملا۔ عربی یا انگریزی نام آزمائیں، یا ڈائریکٹری دیکھنے کے لیے تلاش صاف کریں۔", clear: "تلاش صاف کریں", allHotels: "تمام ہوٹل دیکھیں" },
  id: { label: "Cari hotel", prompt: "Cari berdasarkan nama hotel", placeholder: "Coba Pullman, Dallah, atau Al Aqeeq", hint: "Nama hotel dalam bahasa Arab atau Inggris sama-sama dapat digunakan.", results: "Hotel yang cocok", noResults: "Belum ada hotel yang cocok dengan nama tersebut. Coba nama Arab atau Inggris, atau hapus pencarian untuk melihat direktori.", clear: "Hapus pencarian", allHotels: "Lihat semua hotel" },
  hi: { label: "होटल खोजें", prompt: "होटल का नाम या उसका भाग लिखें", placeholder: "Pullman, Dallah या Al Aqeeq लिखें", hint: "होटल का अरबी या अंग्रेज़ी नाम—दोनों से खोज की जा सकती है।", results: "मिलते-जुलते होटल", noResults: "इस नाम से कोई होटल नहीं मिला। अरबी या अंग्रेज़ी नाम आज़माएँ, या निर्देशिका देखने के लिए खोज साफ़ करें।", clear: "खोज साफ़ करें", allHotels: "सभी होटल देखें" },
} as const;

export default function HotelSearch({ hotels }: { hotels: HotelProfile[] }) {
  const { locale } = useLocale();
  const text = hotelSearchLabels[locale];
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchHotelsByName(hotels, query).slice(0, 6), [hotels, query]);
  const hasQuery = Boolean(query.trim());

  return <section className="mt-9 max-w-2xl" aria-label={text.label}>
    <p className="mb-3 text-[11px] font-bold uppercase tracking-[.16em] text-[#efcf82]">{text.label}</p>
    <div className="relative" role="search">
      <label className="sr-only" htmlFor="hotel-name-search">{text.prompt}</label>
      <Search aria-hidden="true" size={19} className="pointer-events-none absolute start-5 top-1/2 -translate-y-1/2 text-[#a9853d]" />
      <input id="hotel-name-search" value={query} onChange={event => setQuery(event.target.value)} placeholder={text.placeholder} autoComplete="off" className="h-14 w-full rounded-2xl border border-white/30 bg-white px-12 text-sm font-medium text-[#173e35] shadow-[0_14px_35px_rgba(0,0,0,.15)] outline-none transition placeholder:text-[#6b837b] focus:border-[#dfc27f] focus:ring-4 focus:ring-[#dfc27f]/25" />
      {hasQuery && <button type="button" onClick={() => setQuery("")} aria-label={text.clear} className="absolute end-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-[#58726a] transition hover:bg-[#f4f0e6] hover:text-[#173e35]"><X size={17} /></button>}
      {hasQuery && <div className="absolute z-30 mt-3 w-full overflow-hidden rounded-2xl border border-[#173e35]/10 bg-white text-[#173e35] shadow-[0_20px_45px_rgba(4,39,31,.25)]" aria-live="polite">
        {results.length > 0 ? <><p className="border-b border-[#173e35]/10 px-5 py-3 text-[10px] font-bold uppercase tracking-[.14em] text-[#a9853d]">{text.results}</p><ul className="max-h-80 overflow-y-auto py-1">{results.map(hotel => <li key={hotel.slug}><Link href={`/hotels/${hotel.slug}`} className="group flex items-center gap-4 px-5 py-3.5 transition hover:bg-[#f7f3e9] focus-visible:bg-[#f7f3e9] focus-visible:outline-none"><span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#173e35] text-[#efcf82]">{hotel.gallery[0] ? <img src={hotel.gallery[0]} alt="" className="h-full w-full object-cover" /> : <Building2 size={18} />}</span><span className="min-w-0 flex-1"><span className="block truncate font-serif text-lg leading-tight">{getHotelDisplayName(hotel, locale)}</span><span className="mt-1 block text-xs text-[#607771]">{getHotelAreaLabel(hotel, locale)}</span></span><ArrowUpRight size={17} className="shrink-0 text-[#a9853d] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link></li>)}</ul></> : <div className="px-5 py-5"><p className="text-sm text-[#58726a]">{text.noResults}</p><Link href="/hotels" className="mt-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.11em] text-[#173e35] hover:text-[#a9853d]">{text.allHotels}<ArrowUpRight size={14} /></Link></div>}
      </div>}
    </div>
    <p className="mt-3 text-xs leading-5 text-white/75">{text.hint}</p>
  </section>;
}
