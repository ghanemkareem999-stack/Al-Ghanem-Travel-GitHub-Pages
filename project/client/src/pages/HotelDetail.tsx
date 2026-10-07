import HotelMapRoute from "@/components/HotelMapRoute";
import HotelPropertyLocation from "@/components/HotelPropertyLocation";
import BackNavigation from "@/components/BackNavigation";
import HotelGalleryLightbox from "@/components/HotelGalleryLightbox";
import SeoHead from "@/components/SeoHead";
import SiteShell from "@/components/SiteShell";
import { useLocale } from "@/contexts/LocaleContext";
import { getHotelWhatsAppInquiryUrl } from "@/lib/contact";
import { planningCopy } from "@/lib/planningCopy";
import { orderGalleryForDisplay } from "@/lib/curatedGalleryExpansion";
import { getHotelAreaLabel, getHotelContent, getHotelDisplayName, getPublicLocationState, getPublicLocationUrl, hotelProfiles, legacyHotelSlugAliases, ownerPublishedProfile, portfolioLabels } from "@/lib/portfolio";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ArrowUpRight, BedDouble, Building2, ImageOff, MapPin, ShieldCheck } from "lucide-react";
import Link from "@/components/LocaleLink";
import { useParams } from "wouter";

const galleryAltLabels = {
  en: { exterior: "hotel exterior", room: "guest room", public: "lobby or public space", dining: "dining space", generic: "hotel gallery image" },
  ar: { exterior: "واجهة الفندق", room: "غرفة ضيوف", public: "اللوبي أو مساحة عامة", dining: "مساحة طعام", generic: "صورة من معرض الفندق" },
  ms: { exterior: "bahagian luar hotel", room: "bilik tetamu", public: "lobi atau ruang awam", dining: "ruang makan", generic: "imej galeri hotel" },
  ur: { exterior: "ہوٹل کا بیرونی منظر", room: "مہمانوں کا کمرہ", public: "لابی یا عوامی جگہ", dining: "کھانے کی جگہ", generic: "ہوٹل گیلری کی تصویر" },
  id: { exterior: "eksterior hotel", room: "kamar tamu", public: "lobi atau ruang publik", dining: "ruang makan", generic: "gambar galeri hotel" },
  hi: { exterior: "होटल का बाहरी दृश्य", room: "अतिथि कक्ष", public: "लॉबी या सार्वजनिक स्थान", dining: "भोजन स्थल", generic: "होटल गैलरी छवि" },
};

function hotelGalleryAlt(locale: keyof typeof galleryAltLabels, hotelName: string, imageUrl: string, imageIndex: number, isDestinationPlaceholder = false) {
  if (isDestinationPlaceholder) {
    return {
      en: "Madinah destination image — not hotel property photography",
      ar: "صورة عامة للمدينة المنورة وليست صورة للمنشأة الفندقية",
      ms: "Imej destinasi Madinah — bukan foto hartanah hotel",
      ur: "مدینہ کی عمومی تصویر — ہوٹل کی پراپرٹی کی تصویر نہیں",
      id: "Gambar destinasi Madinah — bukan foto properti hotel",
      hi: "मदीना गंतव्य की छवि — होटल संपत्ति की तस्वीर नहीं",
    }[locale];
  }
  const filename = imageUrl.toLowerCase();
  const type = /exterior|facade|entrance|front/.test(filename) ? "exterior"
    : /room|suite|bed/.test(filename) ? "room"
      : /lobby|reception|atrium|lounge|public/.test(filename) ? "public"
        : /dining|restaurant|breakfast/.test(filename) ? "dining"
          : "generic";
  const label = galleryAltLabels[locale][type];
  return type === "generic" ? `${hotelName} — ${label} ${imageIndex + 1}` : `${hotelName} — ${label}`;
}

export default function HotelDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { locale } = useLocale();
  const text = portfolioLabels[locale];
  const managedRecords = trpc.catalogue.published.useQuery();
  const resolvedSlug = legacyHotelSlugAliases[slug as keyof typeof legacyHotelSlugAliases] ?? slug;
  const hotel = managedRecords.data?.map(ownerPublishedProfile).find(item => item?.slug === resolvedSlug) ?? hotelProfiles.find(item => item.slug === resolvedSlug);

  if (!hotel) {
    return <SiteShell><SeoHead title="Property not found | Al Ghanem Travel" description="Return to the Al Ghanem Travel Madinah hotel portfolio." /><div className="mx-auto max-w-[1440px] px-5 py-24 md:px-8"><p className="eyebrow">AL GHANEM TRAVEL</p><h1 className="mt-4 font-serif text-5xl text-[#173e35]">Property not found</h1><Link href="/hotels" className="mt-7 inline-flex items-center gap-2 font-semibold text-[#a9853d]"><ArrowLeft size={16} /> {text.title}</Link></div></SiteShell>;
  }

  const displayGallery = orderGalleryForDisplay(hotel.gallery);
  const content = getHotelContent(hotel, locale);
  const displayName = getHotelDisplayName(hotel, locale);
  const hasLongDisplayName = displayName.length > 42 || (locale === "ar" && displayName.includes(" — ") && displayName.length > 24);
  const hasArabicBilingualName = locale === "ar" && Boolean(hotel.arabicName);
  const areaLabel = getHotelAreaLabel(hotel, locale);
  const planning = hotel.planning ? planningCopy[locale] : null;
  const isVerificationPending = hotel.status === "verification_pending";
  const isDestinationPlaceholder = hotel.galleryKind === "destination_placeholder";
  const profileLabel = { en: "HOTEL PROFILE", ar: "ملف الفندق", ms: "PROFIL HOTEL", ur: "ہوٹل پروفائل", id: "PROFIL HOTEL", hi: "होटल प्रोफ़ाइल" }[locale];
  const locationOnlyLabel = { en: "REVIEWED LOCATION", ar: "موقع مُراجع", ms: "LOKASI DISEMAK", ur: "جائزہ شدہ مقام", id: "LOKASI DITINJAU", hi: "समीक्षित स्थान" }[locale];
  const propertyGalleryLabel = { en: "HOTEL GALLERY", ar: "معرض صور الفندق", ms: "GALERI HOTEL", ur: "ہوٹل گیلری", id: "GALERI HOTEL", hi: "होटल गैलरी" }[locale];
  const destinationGalleryLabel = { en: "MADINAH DESTINATION IMAGE", ar: "صورة من المدينة المنورة", ms: "IMEJ DESTINASI MADINAH", ur: "مدینہ کی عمومی تصویر", id: "GAMBAR DESTINASI MADINAH", hi: "मदीना गंतव्य छवि" }[locale];
  const placeholderMediaDisclosure = {
    en: "This is a general Madinah destination image. It is not a photograph of this hotel; property photography will be added when available.",
    ar: "هذه صورة عامة من المدينة المنورة وليست صورة لهذا الفندق. ستُضاف صور المنشأة عند توفرها.",
    ms: "Ini ialah imej umum destinasi Madinah, bukan foto hotel ini. Imej hartanah akan ditambah apabila tersedia.",
    ur: "یہ مدینہ کی عمومی تصویر ہے، اس ہوٹل کی تصویر نہیں۔ دستیاب ہونے پر پراپرٹی کی تصاویر شامل کی جائیں گی۔",
    id: "Ini adalah gambar umum destinasi Madinah, bukan foto hotel ini. Foto properti akan ditambahkan saat tersedia.",
    hi: "यह मदीना गंतव्य की सामान्य छवि है, इस होटल की तस्वीर नहीं। उपलब्ध होने पर संपत्ति की तस्वीरें जोड़ी जाएंगी।",
  }[locale];
  const mediaStatus = {
    en: "Property imagery will be added when it is authorized for use.",
    ar: "ستُضاف صور المنشأة عند اعتماد استخدامها.",
    ms: "Imej hartanah akan ditambah apabila penggunaannya dibenarkan.",
    ur: "پراپرٹی کی تصاویر استعمال کی اجازت ملنے پر شامل کی جائیں گی۔",
    id: "Gambar properti akan ditambahkan setelah penggunaannya diotorisasi.",
    hi: "संपत्ति की छवियां उपयोग की अनुमति मिलने पर जोड़ी जाएंगी।",
  }[locale];
  const routeContext = hotel.nearestGate && hotel.verification.routeReviewedOn ? {
    en: `Destination: ${hotel.nearestGate.name}. Route reviewed on ${new Date(`${hotel.verification.routeReviewedOn}T00:00:00.000Z`).toLocaleDateString("en-GB")}; live distance and duration may change with pedestrian access conditions.`,
    ar: `الوجهة: ${hotel.nearestGate.name}. تمت مراجعة المسار في ${new Date(`${hotel.verification.routeReviewedOn}T00:00:00.000Z`).toLocaleDateString("ar-SA")}، وقد تتغير المسافة والمدة المباشرتان بحسب ظروف وصول المشاة.`,
    ms: `Destinasi: ${hotel.nearestGate.name}. Laluan disemak pada ${new Date(`${hotel.verification.routeReviewedOn}T00:00:00.000Z`).toLocaleDateString("ms-MY")}; jarak dan tempoh langsung boleh berubah mengikut keadaan akses pejalan kaki.`,
    ur: `منزل: ${hotel.nearestGate.name}۔ راستے کا جائزہ ${new Date(`${hotel.verification.routeReviewedOn}T00:00:00.000Z`).toLocaleDateString("ur-PK")} کو لیا گیا؛ پیدل رسائی کی صورتحال کے مطابق براہ راست فاصلہ اور مدت بدل سکتے ہیں۔`,
    id: `Tujuan: ${hotel.nearestGate.name}. Rute ditinjau pada ${new Date(`${hotel.verification.routeReviewedOn}T00:00:00.000Z`).toLocaleDateString("id-ID")}; jarak dan durasi langsung dapat berubah sesuai kondisi akses pejalan kaki.`,
    hi: `गंतव्य: ${hotel.nearestGate.name}। मार्ग की समीक्षा ${new Date(`${hotel.verification.routeReviewedOn}T00:00:00.000Z`).toLocaleDateString("hi-IN")} को की गई; पैदल पहुंच की परिस्थितियों के अनुसार लाइव दूरी और अवधि बदल सकती हैं।`,
  }[locale] : null;
  const locationState = getPublicLocationState(hotel);
  const hasVerifiedLocation = locationState === "gate_route";
  const hasReviewedPropertyPin = locationState === "property_location";
  const hotelWhatsAppInquiryUrl = getHotelWhatsAppInquiryUrl(locale, displayName);
  const locationContext = {
    en: { eyebrow: "PROPERTY LOCATION", title: "Reviewed hotel location", body: "This map shows the reviewed hotel property point. A named walking-gate route will be added only when the practical pedestrian approach is confirmed.", pending: "Our accommodation team confirms the most suitable location and arrival guidance for your programme.", action: "Open property location" },
    ar: { eyebrow: "موقع المنشأة", title: "موقع الفندق المُراجع", body: "تعرض هذه الخريطة نقطة موقع الفندق المُراجعة. ويُضاف مسار المشي إلى بوابة محددة عند تأكيد مسار المشاة العملي.", pending: "يؤكد لكم فريق الإقامة أنسب ترتيبات الموقع والوصول وفقاً لبرنامجكم.", action: "فتح موقع المنشأة" },
    ms: { eyebrow: "LOKASI HARTANAH", title: "Lokasi hotel yang disemak", body: "Peta ini menunjukkan titik hartanah hotel yang telah disemak. Laluan berjalan ke pintu tertentu hanya akan ditambah apabila pendekatan pejalan kaki yang praktikal disahkan.", pending: "Pasukan penginapan kami akan mengesahkan lokasi dan panduan ketibaan yang sesuai untuk program anda.", action: "Buka lokasi hartanah" },
    ur: { eyebrow: "پراپرٹی لوکیشن", title: "جائزہ شدہ ہوٹل لوکیشن", body: "یہ نقشہ ہوٹل کی جائزہ شدہ پراپرٹی پوائنٹ دکھاتا ہے۔ مخصوص گیٹ تک پیدل راستہ صرف عملی پیدل رسائی کی تصدیق کے بعد شامل کیا جائے گا۔", pending: "ہماری رہائش ٹیم آپ کے پروگرام کے لیے مناسب مقام اور آمد کی رہنمائی کی تصدیق کرے گی۔", action: "پراپرٹی لوکیشن کھولیں" },
    id: { eyebrow: "LOKASI PROPERTI", title: "Lokasi hotel yang ditinjau", body: "Peta ini menunjukkan titik properti hotel yang telah ditinjau. Rute jalan kaki ke gerbang tertentu hanya akan ditambahkan setelah pendekatan pejalan kaki yang praktis dikonfirmasi.", pending: "Tim akomodasi kami akan mengonfirmasi lokasi dan panduan kedatangan yang sesuai untuk program Anda.", action: "Buka lokasi properti" },
    hi: { eyebrow: "संपत्ति स्थान", title: "समीक्षित होटल स्थान", body: "यह मानचित्र समीक्षित होटल संपत्ति बिंदु दिखाता है। किसी विशिष्ट गेट तक पैदल मार्ग केवल व्यावहारिक पैदल पहुंच की पुष्टि होने पर जोड़ा जाएगा।", pending: "हमारी आवास टीम आपके कार्यक्रम के लिए उपयुक्त स्थान और आगमन मार्गदर्शन की पुष्टि करेगी।", action: "संपत्ति स्थान खोलें" },
  }[locale];
  const structuredData = hotel.status === "verified" ? { "@context": "https://schema.org", "@type": "Hotel", name: hotel.name, description: content.summary, address: { "@type": "PostalAddress", addressLocality: "Madinah Al Munawwarah", addressCountry: "SA", streetAddress: hotel.address }, amenityFeature: content.amenities.map(name => ({ "@type": "LocationFeatureSpecification", name, value: true })) } : undefined;

  return <SiteShell>
    <SeoHead title={`${hotel.name} — ${text.title}`} description={content.summary} structuredData={structuredData} />
    <section className="border-b border-[#173e35]/10 bg-[#f3eee1]"><div className="mx-auto max-w-[1440px] px-5 py-10 md:px-8"><BackNavigation fallback="/hotels" /><div className="mt-10 grid gap-8 lg:grid-cols-[1fr_.9fr]"><div><p className="eyebrow">{isVerificationPending ? text.pending : planning ? planning.planning : `${hotel.status === "verification_pending" ? locationOnlyLabel : text[hotel.category]} · ${text.city}`}</p><h1 className={`mt-5 break-words font-serif leading-[1.1] text-[#173e35] ${hasLongDisplayName ? "text-[2.25rem] sm:text-5xl md:text-5xl" : "text-5xl md:text-6xl"}`}>{hasArabicBilingualName ? <><span>{hotel.arabicName}</span><span aria-hidden="true" className="hidden sm:inline"> — </span><span dir="ltr" className="block max-w-full text-left sm:inline-block sm:whitespace-nowrap">{hotel.name}</span></> : displayName}</h1><p className="mt-6 max-w-2xl text-[15px] leading-7 text-[#58726a]">{content.summary}</p><div className="mt-7 flex flex-wrap gap-3"><a href={hotelWhatsAppInquiryUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#173e35] px-5 py-3 text-xs font-bold uppercase tracking-[.1em] text-white">{text.inquiry}<ArrowUpRight size={15} /></a></div></div><div className="rounded-[1.5rem] border border-[#173e35]/10 bg-white p-6"><p className="text-xs font-bold uppercase tracking-[.12em] text-[#a9853d]">{isVerificationPending ? text.pending : planning ? planning.source : text.details}</p><div className="mt-6 grid gap-5 text-sm text-[#496a61]"><p className="flex gap-3"><MapPin size={18} className="shrink-0 text-[#a9853d]" />{areaLabel}</p>{planning && hotel.planning ? <p className="flex gap-3"><Building2 size={18} className="shrink-0 text-[#a9853d]" />{text.city}</p> : <><p className="flex gap-3"><Building2 size={18} className="shrink-0 text-[#a9853d]" />{content.highlights[0]}</p><p className="flex gap-3"><ShieldCheck size={18} className="shrink-0 text-[#a9853d]" />{profileLabel}</p></>}</div></div></div></div></section>

    {hotel.gallery.length > 0 && <><HotelGalleryLightbox hotelName={displayName} images={displayGallery} locale={locale} galleryLabel={isDestinationPlaceholder ? destinationGalleryLabel : propertyGalleryLabel} getImageAlt={(image, index) => hotelGalleryAlt(locale, displayName, image, index, isDestinationPlaceholder)} />{isDestinationPlaceholder && <section className="mx-auto max-w-[1440px] px-5 pb-4 md:px-8"><div className="flex max-w-3xl items-start gap-4 rounded-[1.5rem] border border-[#a9853d]/35 bg-[#f8f5ed] p-5 text-sm leading-7 text-[#58726a]"><ImageOff className="mt-1 shrink-0 text-[#a9853d]" size={20} /><p>{placeholderMediaDisclosure}</p></div></section>}</>}
    {hotel.gallery.length === 0 && <section className="mx-auto max-w-[1440px] px-5 py-12 md:px-8"><div className="flex max-w-3xl items-start gap-4 rounded-[1.5rem] border border-[#173e35]/10 bg-[#f8f5ed] p-6 text-sm leading-7 text-[#58726a]"><ImageOff className="mt-1 shrink-0 text-[#a9853d]" size={21} /><p>{mediaStatus}</p></div></section>}

    {planning ? <section className="border-y border-[#173e35]/10 bg-[#f6f4ee]"><div className="mx-auto max-w-[1440px] px-5 py-14 md:px-8"><p className="eyebrow">{planning.source}</p><p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#58726a]">{planning.noDetails}</p></div></section> : <section className="border-y border-[#173e35]/10 bg-[#f6f4ee]"><div className={`mx-auto grid max-w-[1440px] gap-12 px-5 py-16 md:px-8 ${content.rooms.length > 0 && content.amenities.length > 0 ? "lg:grid-cols-2" : "max-w-3xl"}`}>{content.rooms.length > 0 && <div><p className="eyebrow">{text.rooms}</p><div className="mt-5 grid gap-3">{content.rooms.map(room => <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-5" key={room.name}><p className="flex items-center gap-3 font-serif text-xl text-[#173e35]"><BedDouble size={20} className="text-[#a9853d]" />{room.name}</p><p className="text-xs font-semibold text-[#607771]">{room.detail}</p></div>)}</div></div>}{content.amenities.length > 0 && <div><p className="eyebrow">{text.amenities}</p><div className="mt-5 grid grid-cols-2 gap-3">{content.amenities.map(amenity => <div className="rounded-2xl border border-[#173e35]/10 bg-white p-4 text-sm font-semibold text-[#496a61]" key={amenity}>{amenity}</div>)}</div></div>}</div></section>}

    {hasVerifiedLocation && <section className="mx-auto max-w-[1440px] px-5 py-16 md:px-8"><p className="eyebrow">{text.map}</p><h2 className="mt-4 font-serif text-3xl text-[#173e35]">{hotel.name} → {hotel.nearestGate!.name}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[#607771]">{routeContext}</p><div className="mt-7"><HotelMapRoute hotelName={hotel.name} mapAddress={hotel.mapAddress!} nearbySites={[{ name: hotel.nearestGate!.name, address: hotel.nearestGate!.address }]} labels={{ loading: text.mapLoading, unavailable: text.mapUnavailable, action: text.mapAction, routeShown: text.routeShown, routeUnavailable: text.routeUnavailable, propertyUnavailable: text.propertyUnavailable, destinationUnavailable: text.destinationUnavailable }} /></div></section>}
    {hasReviewedPropertyPin && <section className="mx-auto max-w-[1440px] px-5 py-16 md:px-8"><p className="eyebrow">{locationContext.eyebrow}</p><h2 className="mt-4 font-serif text-3xl text-[#173e35]">{locationContext.title}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[#607771]">{locationContext.body}</p><div className="mt-7"><HotelPropertyLocation hotelName={hotel.name} mapAddress={hotel.mapAddress!} locationUrl={getPublicLocationUrl(hotel)} labels={{ loading: text.mapLoading, unavailable: text.mapUnavailable, action: locationContext.action }} /></div></section>}
    {locationState === "on_request" && <section className="border-y border-[#173e35]/10 bg-[#f8f5ed]"><div className="mx-auto max-w-[1440px] px-5 py-10 md:px-8"><p className="eyebrow">{locationContext.eyebrow}</p><p className="mt-3 max-w-3xl text-sm leading-7 text-[#58726a]">{locationContext.pending}</p></div></section>}
  </SiteShell>;
}
