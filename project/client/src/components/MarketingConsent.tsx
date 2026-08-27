import { useEffect, useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { canLoadMarketingScripts, hasConfiguredMarketing, marketingIds, type MarketingConsentChoice, type MarketingIds } from "@/lib/marketing";
import { safeLocalStorageGet, safeLocalStorageSet } from "@/lib/safeStorage";

const CONSENT_KEY = "al-ghanem-marketing-consent-v1";

const copy = {
  en: { title: "Privacy preference", body: "With your permission, we use marketing measurement to understand site performance and improve corporate travel enquiries. You can choose to allow or decline optional marketing cookies.", accept: "Allow marketing", decline: "Decline" },
  ar: { title: "تفضيلات الخصوصية", body: "بموافقتك نستخدم أدوات قياس تسويقية لفهم أداء الموقع وتحسين طلبات الإقامة للشركات. يمكنك قبول أو رفض ملفات تعريف الارتباط التسويقية الاختيارية.", accept: "السماح بالتسويق", decline: "رفض" },
  ms: { title: "Keutamaan privasi", body: "Dengan izin anda, kami menggunakan pengukuran pemasaran untuk memahami prestasi laman dan menambah baik pertanyaan perjalanan korporat. Anda boleh membenarkan atau menolak kuki pemasaran pilihan.", accept: "Benarkan pemasaran", decline: "Tolak" },
  ur: { title: "رازداری کی ترجیح", body: "آپ کی اجازت سے ہم سائٹ کی کارکردگی سمجھنے اور کارپوریٹ سفری انکوائریز بہتر بنانے کے لیے مارکیٹنگ پیمائش استعمال کرتے ہیں۔ آپ اختیاری مارکیٹنگ کوکیز کی اجازت دے یا رد کر سکتے ہیں۔", accept: "مارکیٹنگ کی اجازت دیں", decline: "رد کریں" },
  id: { title: "Preferensi privasi", body: "Dengan izin Anda, kami menggunakan pengukuran pemasaran untuk memahami kinerja situs dan meningkatkan permintaan perjalanan korporat. Anda dapat mengizinkan atau menolak cookie pemasaran opsional.", accept: "Izinkan pemasaran", decline: "Tolak" },
  hi: { title: "गोपनीयता प्राथमिकता", body: "आपकी अनुमति से हम साइट के प्रदर्शन को समझने और कॉर्पोरेट यात्रा अनुरोधों को बेहतर बनाने के लिए मार्केटिंग मापन का उपयोग करते हैं। आप वैकल्पिक मार्केटिंग कुकीज़ की अनुमति दे सकते हैं या अस्वीकार कर सकते हैं।", accept: "मार्केटिंग की अनुमति दें", decline: "अस्वीकार करें" },
} as const;

type TrackingWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  fbq?: ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue?: unknown[]; loaded?: boolean; version?: string };
};

type Fbq = NonNullable<TrackingWindow["fbq"]>;

function injectScript(id: string, src: string) {
  if (document.getElementById(id)) return;
  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

export function loadMarketingScripts(ids: MarketingIds) {
  const trackingWindow = window as TrackingWindow;

  if (ids.gtm) {
    trackingWindow.dataLayer = trackingWindow.dataLayer ?? [];
    trackingWindow.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    injectScript("al-ghanem-gtm", `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(ids.gtm)}`);
  }

  if (ids.ga4) {
    trackingWindow.dataLayer = trackingWindow.dataLayer ?? [];
    trackingWindow.gtag = (...args: unknown[]) => trackingWindow.dataLayer?.push(args);
    trackingWindow.gtag("js", new Date());
    trackingWindow.gtag("config", ids.ga4, { anonymize_ip: true });
    injectScript("al-ghanem-ga4", `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ids.ga4)}`);
  }

  if (ids.metaPixel) {
    const existing = trackingWindow.fbq;
    if (!existing) {
      const fbq = ((...args: unknown[]) => {
        if (fbq.callMethod) fbq.callMethod(...args);
        else fbq.queue?.push(args);
      }) as Fbq;
      fbq.queue = [];
      fbq.loaded = true;
      fbq.version = "2.0";
      trackingWindow.fbq = fbq;
    }
    trackingWindow.fbq?.("init", ids.metaPixel);
    trackingWindow.fbq?.("track", "PageView");
    injectScript("al-ghanem-meta-pixel", "https://connect.facebook.net/en_US/fbevents.js");
  }
}

export default function MarketingConsent() {
  const { locale } = useLocale();
  const [choice, setChoice] = useState<MarketingConsentChoice>(null);
  const isConfigured = hasConfiguredMarketing(marketingIds);
  const content = copy[locale];

  useEffect(() => {
    if (!isConfigured) return;
    const savedChoice = safeLocalStorageGet(CONSENT_KEY);
    if (savedChoice === "accepted" || savedChoice === "declined") {
      setChoice(savedChoice);
      if (canLoadMarketingScripts(savedChoice, marketingIds)) loadMarketingScripts(marketingIds);
    }
  }, [isConfigured]);

  const saveChoice = (nextChoice: "accepted" | "declined") => {
    safeLocalStorageSet(CONSENT_KEY, nextChoice);
    setChoice(nextChoice);
    if (canLoadMarketingScripts(nextChoice, marketingIds)) loadMarketingScripts(marketingIds);
  };

  if (!isConfigured || choice) return null;

  return (
    <section className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-3xl rounded-2xl border border-[#dfc27f]/45 bg-[#153a31] p-5 text-white shadow-[0_22px_60px_rgba(15,48,41,.35)] sm:bottom-5" aria-label={content.title}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <h2 className="font-serif text-xl text-[#f3dda6]">{content.title}</h2>
          <p className="mt-2 text-sm leading-6 text-white/78">{content.body}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button type="button" onClick={() => saveChoice("declined")} className="rounded-full border border-white/35 px-4 py-2.5 text-xs font-bold uppercase tracking-[.08em] text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#a9853d]/35 active:scale-[.97]">{content.decline}</button>
          <button type="button" onClick={() => saveChoice("accepted")} className="rounded-full bg-[#dfc27f] px-4 py-2.5 text-xs font-bold uppercase tracking-[.08em] text-[#153a31] transition hover:bg-[#efcf82] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#a9853d]/35 active:scale-[.97]">{content.accept}</button>
        </div>
      </div>
    </section>
  );
}
