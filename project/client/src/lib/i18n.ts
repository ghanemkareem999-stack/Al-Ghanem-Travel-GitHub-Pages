export const locales = ["en", "ar", "ms", "ur", "id", "hi"] as const;

export type Locale = (typeof locales)[number];

export const localeMeta: Record<Locale, { name: string; dir: "ltr" | "rtl" }> = {
  en: { name: "English", dir: "ltr" },
  ar: { name: "العربية", dir: "rtl" },
  ms: { name: "Bahasa Melayu", dir: "ltr" },
  ur: { name: "اردو", dir: "rtl" },
  id: { name: "Bahasa Indonesia", dir: "ltr" },
  hi: { name: "हिन्दी", dir: "ltr" },
};

export type Translation = {
  nav: { home: string; hotels: string; approach: string; inquiry: string };
  contact: { call: string; whatsapp: string; email: string; whatsappGreeting: string };
  hero: { eyebrow: string; title: string; highlight: string; body: string; primary: string; secondary: string; note: string };
  trust: { language: string; portfolio: string; support: string };
  standards: { eyebrow: string; title: string; body: string; items: Array<{ title: string; body: string }> };
  city: { label: string; title: string; body: string; madinah: string; makkah: string; active: string; comingSoon: string; action: string; madinahDetail: string; makkahDetail: string };
  process: { eyebrow: string; title: string; body: string; steps: Array<{ number: string; title: string; body: string }> };
  cta: { title: string; body: string; action: string; auxiliary: string };
  footer: { line: string; rights: string; contact: string; disclaimer: string };
};

export const translations: Record<Locale, Translation> = {
  en: {
    nav: { home: "Home", hotels: "Hotel Portfolio", approach: "Our Approach", inquiry: "Corporate Inquiry" },
    contact: { call: "Call", whatsapp: "WhatsApp", email: "Email", whatsappGreeting: "Hello Al Ghanem Travel, I would like to discuss corporate accommodation in Madinah." },
    hero: {
      eyebrow: "B2B ACCOMMODATION • MADINAH",
      title: "Corporate stays, arranged with",
      highlight: "reverence and precision.",
      body: "A refined accommodation desk for companies, groups, and travel professionals coordinating meaningful stays in Madinah.",
      primary: "Request corporate accommodation",
      secondary: "Explore the portfolio",
      note: "Madinah active now · Makkah architecture ready",
    },
    trust: { language: "6 supported languages", portfolio: "City-scalable portfolio", support: "Direct WhatsApp access" },
    standards: {
      eyebrow: "THE AL GHANEM STANDARD",
      title: "An accommodation partner that understands both the itinerary and its purpose.",
      body: "We bring corporate clarity to religious travel: structured requirements, considered property detail, and a calm path from the first brief to the final rooming list.",
      items: [
        { title: "Built for group decisions", body: "Clear rooming, group-size, stay-duration, and requirement capture for corporate coordinators." },
        { title: "Proximity with context", body: "Property maps are designed around the route to Al-Masjid an-Nabawi, not generic city pins." },
        { title: "Made for global teams", body: "RTL and LTR experiences keep international decision-makers aligned from the first visit." },
      ],
    },
    city: {
      label: "DESTINATION PORTFOLIO",
      title: "Start in Madinah. Scale without compromise.",
      body: "The portfolio is modeled by city, hotel, room, amenity, gallery, and verified location—so Makkah can activate on the same elevated foundation.",
      madinah: "Madinah Al Munawwarah",
      makkah: "Makkah Al Mukarramah",
      active: "ACTIVE PORTFOLIO",
      comingSoon: "PREPARED FOR ACTIVATION",
      action: "View Madinah hotels",
      madinahDetail: "Source-reviewed hotel profiles, accommodation enquiries, and walking-route information.",
      makkahDetail: "The same city, hotel, room, amenity, and enquiry model will activate when source and commercial details are ready.",
    },
    process: {
      eyebrow: "A QUIETER WAY TO COORDINATE",
      title: "From requirement to rooming list in three considered steps.",
      body: "Every corporate request begins with a dedicated brief, not a generic search.",
      steps: [
        { number: "01", title: "Share the brief", body: "Tell us your group size, dates, preferred proximity, and rooming requirements." },
        { number: "02", title: "Review the fit", body: "Assess structured hotel detail, corporate amenities, and map-based walking context." },
        { number: "03", title: "Coordinate with confidence", body: "Continue directly with Al Ghanem Travel through your preferred contact channel." },
      ],
    },
    cta: { title: "Your Madinah accommodation brief starts here.", body: "For bulk bookings, long-stay accommodation, and religious-travel programmes, our team is ready to structure the conversation.", action: "Start an inquiry", auxiliary: "Prefer WhatsApp? Message our team" },
    footer: { line: "Islamic Tourism & Travel Services", rights: "© Al Ghanem Travel. All rights reserved.", contact: "Speak with our accommodation desk", disclaimer: "Portfolio visibility is subject to verified partner content and commercial availability." },
  },
  ar: {
    nav: { home: "الرئيسية", hotels: "محفظة الفنادق", approach: "منهجنا", inquiry: "طلب شركات" },
    contact: { call: "اتصال", whatsapp: "واتساب", email: "البريد", whatsappGreeting: "السلام عليكم، أود الاستفسار عن ترتيبات الإقامة للشركات في المدينة المنورة." },
    hero: { eyebrow: "إقامات شركات • المدينة المنورة", title: "إقامات الشركات، بترتيب يجمع", highlight: "الوقار والدقة.", body: "مكتب إقامة راقٍ للشركات والمجموعات ومحترفي السفر لتنسيق الإقامات الهادفة في المدينة المنورة.", primary: "اطلب إقامة للشركات", secondary: "استكشف المحفظة", note: "المدينة مفعّلة الآن · بنية مكة جاهزة" },
    trust: { language: "6 لغات مدعومة", portfolio: "محفظة قابلة للتوسع حسب المدينة", support: "تواصل واتساب مباشر" },
    standards: { eyebrow: "معيار الغانم ترافل", title: "شريك إقامة يفهم برنامج الرحلة وغايتها.", body: "نمنح السفر الديني وضوحاً مؤسسياً: متطلبات منظمة، وتفاصيل مدروسة للمنشآت، ومسار هادئ من الطلب الأول حتى قائمة الغرف النهائية.", items: [{ title: "مصمم لقرارات المجموعات", body: "تجميع واضح للغرف وحجم المجموعة ومدة الإقامة والمتطلبات." }, { title: "القرب في سياقه", body: "خرائط المنشآت تركز على الطريق إلى المسجد النبوي، لا على مؤشرات مدينة عامة." }, { title: "للجهات العالمية", body: "تجربتا RTL وLTR تحافظان على وضوح المعلومات لجميع صناع القرار." }] },
    city: { label: "محفظة الوجهات", title: "ابدأ بالمدينة. وتوسع بثقة.", body: "تُدار المحفظة حسب المدينة والفندق والغرف والمرافق والمعرض والموقع الموثق؛ لتفعيل مكة على نفس الأساس الراقي.", madinah: "المدينة المنورة", makkah: "مكة المكرمة", active: "محفظة مفعّلة", comingSoon: "جاهزة للتفعيل", action: "استعرض فنادق المدينة", madinahDetail: "ملفات فنادق بمصادر رسمية، واستفسارات إقامة، ومعلومات لمسارات المشي.", makkahDetail: "يُفعّل نفس نموذج المدينة والفندق والغرف والمرافق والاستفسارات عند جاهزية المصدر والتفاصيل التجارية." },
    process: { eyebrow: "تنسيق أكثر هدوءاً", title: "من المتطلبات إلى قائمة الغرف عبر ثلاث خطوات مدروسة.", body: "يبدأ كل طلب مؤسسي بموجز مخصص، وليس ببحث عام.", steps: [{ number: "01", title: "شارك موجزك", body: "أخبرنا بحجم المجموعة والتواريخ والقرب المفضل ومتطلبات الغرف." }, { number: "02", title: "راجع الأنسب", body: "اطلع على تفاصيل الفندق المنظمة ومرافق الشركات وسياق المشي عبر الخريطة." }, { number: "03", title: "نسّق بثقة", body: "تابع مباشرة مع الغانم ترافل عبر وسيلة الاتصال التي تفضلها." }] },
    cta: { title: "يبدأ موجز إقامتك في المدينة من هنا.", body: "للحجوزات الجماعية والإقامات الطويلة وبرامج السفر الديني، فريقنا مستعد لتنظيم طلبك.", action: "ابدأ طلباً", auxiliary: "تفضل واتساب؟ راسل فريقنا" },
    footer: { line: "السياحة الإسلامية وخدمات السفر", rights: "© الغانم ترافل. جميع الحقوق محفوظة.", contact: "تواصل مع مكتب الإقامة", disclaimer: "تخضع إتاحة المحفظة للمحتوى الموثق من الشركاء والتوافر التجاري." },
  },
  ms: {
    nav: { home: "Utama", hotels: "Portfolio Hotel", approach: "Pendekatan Kami", inquiry: "Pertanyaan Korporat" }, contact: { call: "Telefon", whatsapp: "WhatsApp", email: "E-mel", whatsappGreeting: "Salam Al Ghanem Travel, saya ingin membincangkan penginapan korporat di Madinah." },
    hero: { eyebrow: "PENGINAPAN B2B • MADINAH", title: "Penginapan korporat dengan", highlight: "ketelitian dan hormat.", body: "Meja penginapan yang tersusun untuk syarikat, kumpulan dan profesional perjalanan yang menyelaras penginapan bermakna di Madinah.", primary: "Minta penginapan korporat", secondary: "Terokai portfolio", note: "Madinah aktif sekarang · Seni bina Makkah sedia" },
    trust: { language: "6 bahasa disokong", portfolio: "Portfolio berskala bandar", support: "Akses WhatsApp terus" }, standards: { eyebrow: "STANDARD AL GHANEM", title: "Rakan penginapan yang memahami jadual perjalanan dan tujuannya.", body: "Kami membawa kejelasan korporat kepada perjalanan ibadah melalui keperluan tersusun dan perincian hartanah yang teliti.", items: [{ title: "Untuk keputusan kumpulan", body: "Pengumpulan bilik, saiz kumpulan dan keperluan yang jelas." }, { title: "Kedekatan bermakna", body: "Peta hartanah memberi fokus kepada laluan ke Al-Masjid an-Nabawi." }, { title: "Untuk pasukan global", body: "Pengalaman RTL dan LTR menyatukan pembuat keputusan antarabangsa." }] },
    city: { label: "PORTFOLIO DESTINASI", title: "Mulakan di Madinah. Berkembang tanpa kompromi.", body: "Portfolio dimodelkan mengikut bandar, hotel, bilik, kemudahan, galeri dan lokasi yang disahkan.", madinah: "Madinah Al Munawwarah", makkah: "Makkah Al Mukarramah", active: "PORTFOLIO AKTIF", comingSoon: "SEDIA DIAKTIFKAN", action: "Lihat hotel Madinah", madinahDetail: "Profil hotel berpandukan sumber rasmi, pertanyaan penginapan dan maklumat laluan berjalan kaki.", makkahDetail: "Model bandar, hotel, bilik, kemudahan dan pertanyaan yang sama akan diaktifkan apabila sumber serta butiran komersial sedia." }, process: { eyebrow: "CARA PENYELARASAN YANG LEBIH TENANG", title: "Daripada keperluan kepada senarai bilik dalam tiga langkah.", body: "Setiap permintaan korporat bermula dengan ringkasan khusus.", steps: [{ number: "01", title: "Kongsi ringkasan", body: "Beritahu saiz kumpulan, tarikh dan keperluan bilik." }, { number: "02", title: "Nilai kesesuaian", body: "Semak butiran hotel dan konteks laluan berjalan kaki." }, { number: "03", title: "Selaras dengan yakin", body: "Teruskan bersama Al Ghanem Travel melalui saluran pilihan anda." }] }, cta: { title: "Ringkasan penginapan Madinah anda bermula di sini.", body: "Untuk tempahan pukal, penginapan panjang dan program perjalanan ibadah.", action: "Mulakan pertanyaan", auxiliary: "Lebih selesa WhatsApp? Hubungi pasukan kami" }, footer: { line: "Pelancongan Islam & Perkhidmatan Perjalanan", rights: "© Al Ghanem Travel. Hak cipta terpelihara.", contact: "Bercakap dengan meja penginapan kami", disclaimer: "Paparan portfolio tertakluk kepada kandungan rakan yang disahkan dan ketersediaan komersial." },
  },
  ur: {
    nav: { home: "ہوم", hotels: "ہوٹل پورٹ فولیو", approach: "ہمارا طریقہ", inquiry: "کارپوریٹ انکوائری" }, contact: { call: "کال", whatsapp: "واٹس ایپ", email: "ای میل", whatsappGreeting: "السلام علیکم، میں Al Ghanem Travel سے مدینہ میں کارپوریٹ رہائش کے بارے میں بات کرنا چاہتا ہوں۔" },
    hero: { eyebrow: "B2B رہائش • مدینہ", title: "کارپوریٹ قیام، جس میں شامل ہے", highlight: "وقار اور درستگی۔", body: "کمپنیوں، گروپس اور ٹریول پروفیشنلز کے لیے مدینہ میں بامقصد قیام کو مربوط کرنے والا نفیس رہائشی ڈیسک۔", primary: "کارپوریٹ رہائش کی درخواست", secondary: "پورٹ فولیو دیکھیں", note: "مدینہ فعال ہے · مکہ کا نظام تیار ہے" },
    trust: { language: "6 زبانوں کی معاونت", portfolio: "شہر کے لحاظ سے قابل توسیع پورٹ فولیو", support: "براہ راست واٹس ایپ" }, standards: { eyebrow: "Al Ghanem Travel معیار", title: "ایسا رہائشی پارٹنر جو سفر اور اس کے مقصد کو سمجھتا ہے۔", body: "ہم مذہبی سفر میں کارپوریٹ وضاحت، منظم تقاضے اور سوچ سمجھ کر دی گئی پراپرٹی کی تفصیل لاتے ہیں۔", items: [{ title: "گروپ فیصلوں کے لیے", body: "کمرے، گروپ سائز اور قیام کی ضروریات کی واضح ترتیب۔" }, { title: "سیاق کے ساتھ قربت", body: "پراپرٹی نقشے مسجد نبوی کے راستے پر مرکوز ہیں۔" }, { title: "عالمی ٹیموں کے لیے", body: "RTL اور LTR تجربہ بین الاقوامی فیصلہ سازوں کو ہم آہنگ رکھتا ہے۔" }] },
    city: { label: "منزل پورٹ فولیو", title: "مدینہ سے شروع کریں۔ بغیر سمجھوتے کے پھیلیں۔", body: "پورٹ فولیو شہر، ہوٹل، کمرے، سہولیات، گیلری اور تصدیق شدہ مقام کے مطابق ترتیب دیا گیا ہے۔", madinah: "مدینہ منورہ", makkah: "مکہ مکرمہ", active: "فعال پورٹ فولیو", comingSoon: "فعال کرنے کے لیے تیار", action: "مدینہ کے ہوٹل دیکھیں", madinahDetail: "سرکاری ذرائع پر مبنی ہوٹل پروفائلز، رہائش انکوائریز اور پیدل راستے کی معلومات۔", makkahDetail: "ذرائع اور تجارتی تفصیلات تیار ہونے پر یہی شہر، ہوٹل، کمرہ، سہولت اور انکوائری ماڈل فعال کیا جائے گا۔" }, process: { eyebrow: "رابطے کا پُرسکون طریقہ", title: "تقاضوں سے رومنگ لسٹ تک تین غور شدہ مراحل۔", body: "ہر کارپوریٹ درخواست ایک مخصوص بریف سے شروع ہوتی ہے۔", steps: [{ number: "01", title: "بریف شیئر کریں", body: "گروپ سائز، تاریخیں اور کمروں کی ضروریات بتائیں۔" }, { number: "02", title: "موزونیت دیکھیں", body: "ہوٹل کی تفصیل اور پیدل راستے کا سیاق دیکھیں۔" }, { number: "03", title: "اعتماد سے رابطہ کریں", body: "اپنے پسندیدہ چینل کے ذریعے Al Ghanem Travel سے براہ راست بات کریں۔" }] }, cta: { title: "آپ کی مدینہ رہائش کی بریف یہیں سے شروع ہوتی ہے۔", body: "بلک بکنگ، طویل قیام اور مذہبی سفر کے پروگراموں کے لیے۔", action: "انکوائری شروع کریں", auxiliary: "واٹس ایپ پسند ہے؟ ہماری ٹیم کو پیغام بھیجیں" }, footer: { line: "اسلامی سیاحت اور سفری خدمات", rights: "© Al Ghanem Travel۔ تمام حقوق محفوظ ہیں۔", contact: "ہمارے رہائشی ڈیسک سے بات کریں", disclaimer: "پورٹ فولیو کی نمائش تصدیق شدہ پارٹنر مواد اور تجارتی دستیابی سے مشروط ہے۔" },
  },
  id: {
    nav: { home: "Beranda", hotels: "Portofolio Hotel", approach: "Pendekatan Kami", inquiry: "Permintaan Korporat" }, contact: { call: "Telepon", whatsapp: "WhatsApp", email: "Email", whatsappGreeting: "Salam Al Ghanem Travel, saya ingin membahas akomodasi korporat di Madinah." },
    hero: { eyebrow: "AKOMODASI B2B • MADINAH", title: "Akomodasi korporat dengan", highlight: "ketelitian dan rasa hormat.", body: "Meja akomodasi terpilih untuk perusahaan, grup, dan profesional perjalanan yang mengoordinasikan masa tinggal bermakna di Madinah.", primary: "Minta akomodasi korporat", secondary: "Jelajahi portofolio", note: "Madinah aktif sekarang · Arsitektur Makkah siap" },
    trust: { language: "6 bahasa didukung", portfolio: "Portofolio yang dapat berkembang per kota", support: "Akses WhatsApp langsung" }, standards: { eyebrow: "STANDAR AL GHANEM", title: "Mitra akomodasi yang memahami perjalanan dan tujuannya.", body: "Kami membawa kejelasan korporat ke perjalanan ibadah melalui kebutuhan terstruktur dan detail properti yang matang.", items: [{ title: "Untuk keputusan grup", body: "Penangkapan data kamar, kelompok, dan kebutuhan yang jelas." }, { title: "Kedekatan yang bermakna", body: "Peta properti berfokus pada rute menuju Al-Masjid an-Nabawi." }, { title: "Untuk tim global", body: "Pengalaman RTL dan LTR menyatukan pengambil keputusan internasional." }] },
    city: { label: "PORTOFOLIO DESTINASI", title: "Mulai di Madinah. Berkembang tanpa kompromi.", body: "Portofolio dimodelkan berdasarkan kota, hotel, kamar, fasilitas, galeri, dan lokasi terverifikasi.", madinah: "Madinah Al Munawwarah", makkah: "Makkah Al Mukarramah", active: "PORTOFOLIO AKTIF", comingSoon: "SIAP DIAKTIFKAN", action: "Lihat hotel Madinah", madinahDetail: "Profil hotel berbasis sumber resmi, pertanyaan akomodasi, dan informasi rute berjalan kaki.", makkahDetail: "Model kota, hotel, kamar, fasilitas, dan permintaan yang sama akan diaktifkan saat sumber serta detail komersial siap." }, process: { eyebrow: "CARA KOORDINASI YANG LEBIH TENANG", title: "Dari kebutuhan ke daftar kamar dalam tiga langkah.", body: "Setiap permintaan korporat dimulai dari ringkasan khusus.", steps: [{ number: "01", title: "Bagikan ringkasan", body: "Sampaikan jumlah grup, tanggal, dan kebutuhan kamar Anda." }, { number: "02", title: "Tinjau kecocokan", body: "Lihat detail hotel dan konteks rute berjalan kaki." }, { number: "03", title: "Koordinasikan dengan yakin", body: "Lanjutkan langsung dengan Al Ghanem Travel melalui kanal pilihan Anda." }] }, cta: { title: "Ringkasan akomodasi Madinah Anda dimulai di sini.", body: "Untuk pemesanan massal, masa tinggal panjang, dan program perjalanan ibadah.", action: "Mulai permintaan", auxiliary: "Lebih suka WhatsApp? Kirim pesan ke tim kami" }, footer: { line: "Pariwisata Islam & Layanan Perjalanan", rights: "© Al Ghanem Travel. Semua hak dilindungi.", contact: "Hubungi meja akomodasi kami", disclaimer: "Ketersediaan portofolio tergantung pada konten mitra terverifikasi dan ketersediaan komersial." },
  },
  hi: {
    nav: { home: "होम", hotels: "होटल पोर्टफोलियो", approach: "हमारा दृष्टिकोण", inquiry: "कॉर्पोरेट अनुरोध" }, contact: { call: "कॉल", whatsapp: "व्हाट्सऐप", email: "ईमेल", whatsappGreeting: "नमस्ते अल घनेम ट्रैवल, मैं मदीना में कॉर्पोरेट आवास के बारे में बात करना चाहता/चाहती हूँ।" },
    hero: { eyebrow: "B2B आवास • मदीना", title: "कॉर्पोरेट ठहराव, जिसमें है", highlight: "सम्मान और सटीकता।", body: "मदीना में सार्थक ठहराव का समन्वय करने वाली कंपनियों, समूहों और यात्रा विशेषज्ञों के लिए एक परिष्कृत आवास डेस्क।", primary: "कॉर्पोरेट आवास का अनुरोध करें", secondary: "पोर्टफोलियो देखें", note: "मदीना अब सक्रिय · मक्का की संरचना तैयार" },
    trust: { language: "6 भाषाओं का समर्थन", portfolio: "शहर-आधारित विस्तार योग्य पोर्टफोलियो", support: "सीधा व्हाट्सऐप संपर्क" }, standards: { eyebrow: "अल घनेम मानक", title: "ऐसा आवास भागीदार जो यात्रा और उसके उद्देश्य को समझता है।", body: "हम धार्मिक यात्रा में कॉर्पोरेट स्पष्टता, संरचित आवश्यकताएं और विचारशील संपत्ति विवरण लाते हैं।", items: [{ title: "समूह निर्णयों के लिए", body: "कमरे, समूह आकार और ठहराव आवश्यकताओं का स्पष्ट विवरण।" }, { title: "संदर्भ के साथ निकटता", body: "प्रॉपर्टी मैप अल-मस्जिद अन-नबवी तक के मार्ग पर केंद्रित हैं।" }, { title: "वैश्विक टीमों के लिए", body: "RTL और LTR अनुभव अंतरराष्ट्रीय निर्णयकर्ताओं को एकजुट रखते हैं।" }] },
    city: { label: "गंतव्य पोर्टफोलियो", title: "मदीना से शुरू करें। बिना समझौते के विस्तार करें।", body: "पोर्टफोलियो शहर, होटल, कमरा, सुविधा, गैलरी और सत्यापित स्थान के आधार पर तैयार है।", madinah: "मदीना अल मुनव्वरा", makkah: "मक्का अल मुकर्रमा", active: "सक्रिय पोर्टफोलियो", comingSoon: "सक्रियण के लिए तैयार", action: "मदीना होटल देखें", madinahDetail: "आधिकारिक स्रोतों पर आधारित होटल प्रोफ़ाइल, आवास अनुरोध और पैदल मार्ग की जानकारी।", makkahDetail: "स्रोत और व्यावसायिक विवरण तैयार होने पर यही शहर, होटल, कक्ष, सुविधा और अनुरोध मॉडल सक्रिय होगा।" }, process: { eyebrow: "समन्वय का अधिक शांत तरीका", title: "आवश्यकता से रूमिंग सूची तक तीन विचारशील चरण।", body: "हर कॉर्पोरेट अनुरोध एक समर्पित ब्रीफ से शुरू होता है।", steps: [{ number: "01", title: "ब्रीफ साझा करें", body: "समूह आकार, तिथि और कमरे की आवश्यकताएं बताएं।" }, { number: "02", title: "अनुकूलता देखें", body: "संरचित होटल विवरण और पैदल मार्ग का संदर्भ देखें।" }, { number: "03", title: "विश्वास से समन्वय करें", body: "अपने पसंदीदा माध्यम से अल घनेम ट्रैवल से सीधे बात करें।" }] }, cta: { title: "आपका मदीना आवास ब्रीफ यहीं से शुरू होती है।", body: "बल्क बुकिंग, लंबे ठहराव और धार्मिक यात्रा कार्यक्रमों के लिए।", action: "अनुरोध शुरू करें", auxiliary: "व्हाट्सऐप पसंद है? हमारी टीम को संदेश भेजें" }, footer: { line: "इस्लामिक टूरिज्म और ट्रैवल सर्विसेज", rights: "© अल घनेम ट्रैवल। सर्वाधिकार सुरक्षित।", contact: "हमारे आवास डेस्क से बात करें", disclaimer: "पोर्टफोलियो दृश्यता सत्यापित भागीदार सामग्री और व्यावसायिक उपलब्धता के अधीन है।" },
  },
};

type PublicCopyRefinement = {
  nav?: Partial<Translation["nav"]>;
  hero?: Partial<Translation["hero"]>;
  trust?: Partial<Translation["trust"]>;
  standards?: Partial<Translation["standards"]>;
  city?: Partial<Translation["city"]>;
  process?: Partial<Translation["process"]>;
  cta?: Partial<Translation["cta"]>;
  footer?: Partial<Translation["footer"]>;
};

const publicCopyRefinements: Record<Locale, PublicCopyRefinement> = {
  en: {
    nav: { hotels: "Hotel Directory", inquiry: "Corporate Accommodation" },
    hero: { title: "Corporate accommodation in Madinah, arranged with", highlight: "care and precision.", body: "We help travel companies, groups, and professionals arrange comfortable, purposeful stays in Madinah—from the first request to your guests’ arrival.", primary: "Start a corporate request", secondary: "Explore the Madinah hotel directory", note: "Accommodation for groups and religious-travel programmes." },
    trust: { portfolio: "Madinah hotel directory", support: "Direct support from our team" },
    standards: { eyebrow: "THE AL GHANEM STANDARD", title: "Accommodation support that keeps your programme clear.", body: "We review your group’s requirements, arrange suitable accommodation options, and stay close to your team through every stage of coordination.", items: [{ title: "Built for group programmes", body: "Share room requirements, group size, dates, and practical preferences from the beginning." }, { title: "Clear accommodation choices", body: "Review location context and stay details with your programme in mind." }, { title: "For international teams", body: "A clear experience in six languages for everyone involved in the decision." }] },
    city: { title: "Madinah accommodation, arranged around your programme.", body: "Browse accommodation options for groups and programmes in Madinah, with support from our team at every step.", active: "MADINAH DIRECTORY", comingSoon: "COMING SOON", madinahDetail: "Accommodation options for group stays, supported by our accommodation team.", makkahDetail: "Makkah accommodation services will be introduced soon." },
    process: { eyebrow: "HOW WE WORK", title: "From your request to a suitable accommodation arrangement.", body: "Start with your group’s needs, and we will organise the next steps with you.", steps: [{ number: "01", title: "Share your requirements", body: "Tell us your group size, dates, and accommodation preferences." }, { number: "02", title: "Review suitable options", body: "We help you assess the options that fit your programme." }, { number: "03", title: "Coordinate with our team", body: "Continue with Al Ghanem Travel through the contact channel you prefer." }] },
    cta: { title: "Your Madinah accommodation request starts here.", body: "For group stays, long accommodation programmes, and religious travel, our team is ready to support your arrangement.", action: "Start a corporate request", auxiliary: "Prefer WhatsApp? Message our team" },
    footer: { contact: "Speak with our accommodation team", disclaimer: "Accommodation arrangements are confirmed with Al Ghanem Travel according to your programme requirements." },
  },
  ar: {
    nav: { hotels: "دليل الفنادق", inquiry: "إقامة الشركات" },
    hero: { title: "إقامة الشركات في المدينة المنورة، حيث تلتقي", highlight: "الدقة بالرقيّ.", body: "نساعد الشركات والمجموعات ومحترفي السفر على تنسيق إقامة هادفة ومريحة في المدينة المنورة، من أول طلب الحجز وحتى وصول ضيوفكم.", primary: "ابدؤوا طلب إقامة الشركات", secondary: "استعرضوا دليل فنادق المدينة", note: "إقامة للمجموعات وبرامج السفر الديني." },
    trust: { portfolio: "دليل فنادق المدينة المنورة", support: "دعم مباشر من فريقنا" },
    standards: { eyebrow: "معيار الغانم ترافل", title: "نرتب لكم الإقامة بما يواكب برنامج رحلتكم.", body: "نراجع معكم احتياجات المجموعة، ونرتب خيارات الإقامة المناسبة، ونبقى قريبين منكم في كل خطوة من خطوات التنسيق.", items: [{ title: "مناسب للمجموعات", body: "شاركوا عدد الغرف وحجم المجموعة والتواريخ والمتطلبات العملية من البداية." }, { title: "خيارات إقامة واضحة", body: "راجعوا الموقع وتفاصيل الإقامة بما يناسب برنامج مجموعتكم." }, { title: "للفرق الدولية", body: "تجربة واضحة بست لغات لكل من يشارك في القرار." }] },
    city: { title: "إقامة المدينة المنورة، مرتبة حول برنامجكم.", body: "استعرضوا خيارات الإقامة للمجموعات والبرامج في المدينة المنورة، مع متابعة فريقنا في كل خطوة.", active: "دليل فنادق المدينة", comingSoon: "قريباً", madinahDetail: "خيارات إقامة للمجموعات، يتابعها معكم فريق إقامة الشركات.", makkahDetail: "خدمات إقامة مكة المكرمة قريباً." },
    process: { eyebrow: "كيف نعمل", title: "من طلبكم إلى ترتيب إقامة مناسب.", body: "ابدؤوا باحتياجات مجموعتكم، وسنرتب معكم الخطوات التالية.", steps: [{ number: "01", title: "شاركوا متطلباتكم", body: "أخبرونا بحجم المجموعة والتواريخ وتفضيلات الإقامة." }, { number: "02", title: "راجعوا الخيارات المناسبة", body: "نساعدكم على تقييم الخيارات التي تناسب برنامجكم." }, { number: "03", title: "نسقوا مع فريقنا", body: "تابعوا مع الغانم ترافل عبر وسيلة التواصل التي تفضلونها." }] },
    cta: { title: "يبدأ طلب إقامتكم في المدينة المنورة من هنا.", body: "لإقامات المجموعات والبرامج الطويلة والسفر الديني، فريقنا جاهز لترتيب ما يناسبكم.", action: "ابدؤوا طلب إقامة الشركات", auxiliary: "تفضلون واتساب؟ راسلوا فريقنا" },
    footer: { contact: "لطلب الحجوزات والاستفسارات", disclaimer: "يؤكد فريق الغانم ترافل ترتيبات الإقامة وفق متطلبات برنامجكم." },
  },
  ms: {
    nav: { hotels: "Direktori Hotel", inquiry: "Penginapan Korporat" },
    hero: { title: "Penginapan korporat di Madinah dengan", highlight: "ketelitian dan keselesaan.", body: "Kami membantu syarikat, kumpulan dan profesional perjalanan menyusun penginapan yang selesa dan bermakna di Madinah, daripada permintaan pertama hingga ketibaan tetamu anda.", primary: "Mulakan permintaan korporat", secondary: "Terokai direktori hotel Madinah", note: "Penginapan untuk kumpulan dan program perjalanan ibadah." },
    city: { title: "Penginapan Madinah yang disusun untuk program anda.", body: "Lihat pilihan penginapan untuk kumpulan dan program di Madinah bersama sokongan pasukan kami.", madinahDetail: "Pilihan penginapan kumpulan bersama sokongan pasukan kami.", makkahDetail: "Perkhidmatan penginapan Makkah akan diperkenalkan tidak lama lagi." },
    footer: { contact: "Hubungi pasukan penginapan kami", disclaimer: "Aturan penginapan disahkan bersama Al Ghanem Travel mengikut keperluan program anda." },
  },
  ur: {
    nav: { hotels: "ہوٹل ڈائریکٹری", inquiry: "کارپوریٹ رہائش" },
    hero: { title: "مدینہ میں کارپوریٹ رہائش، جس میں شامل ہے", highlight: "دقت اور وقار۔", body: "ہم کمپنیوں، گروپس اور ٹریول پروفیشنلز کو مدینہ میں آرام دہ اور بامقصد رہائش ترتیب دینے میں مدد دیتے ہیں، پہلی درخواست سے آپ کے مہمانوں کی آمد تک۔", primary: "کارپوریٹ درخواست شروع کریں", secondary: "مدینہ ہوٹل ڈائریکٹری دیکھیں", note: "گروپس اور مذہبی سفری پروگراموں کے لیے رہائش۔" },
    city: { title: "مدینہ کی رہائش، آپ کے پروگرام کے مطابق ترتیب دی گئی۔", body: "مدینہ میں گروپس اور پروگراموں کے لیے رہائشی اختیارات ہماری ٹیم کی مدد سے دیکھیں۔", madinahDetail: "گروپ قیام کے لیے رہائشی اختیارات، ہماری ٹیم کی معاونت کے ساتھ۔", makkahDetail: "مکہ رہائشی خدمات جلد متعارف ہوں گی۔" },
    footer: { contact: "ہماری رہائش ٹیم سے بات کریں", disclaimer: "رہائش کے انتظامات Al Ghanem Travel کے ساتھ آپ کے پروگرام کی ضروریات کے مطابق طے کیے جاتے ہیں۔" },
  },
  id: {
    nav: { hotels: "Direktori Hotel", inquiry: "Akomodasi Korporat" },
    hero: { title: "Akomodasi korporat di Madinah dengan", highlight: "ketelitian dan kenyamanan.", body: "Kami membantu perusahaan, grup, dan profesional perjalanan mengatur akomodasi yang nyaman dan bermakna di Madinah, dari permintaan pertama hingga kedatangan tamu Anda.", primary: "Mulai permintaan korporat", secondary: "Jelajahi direktori hotel Madinah", note: "Akomodasi untuk grup dan program perjalanan ibadah." },
    city: { title: "Akomodasi Madinah yang disusun untuk program Anda.", body: "Lihat pilihan akomodasi untuk grup dan program di Madinah bersama dukungan tim kami.", madinahDetail: "Pilihan akomodasi grup dengan dukungan tim kami.", makkahDetail: "Layanan akomodasi Makkah akan segera diperkenalkan." },
    footer: { contact: "Hubungi tim akomodasi kami", disclaimer: "Pengaturan akomodasi dikonfirmasi bersama Al Ghanem Travel sesuai kebutuhan program Anda." },
  },
  hi: {
    nav: { hotels: "होटल निर्देशिका", inquiry: "कॉर्पोरेट आवास" },
    hero: { title: "मदीना में कॉर्पोरेट आवास, जिसमें है", highlight: "सटीकता और आराम।", body: "हम कंपनियों, समूहों और यात्रा पेशेवरों को मदीना में आरामदायक और उद्देश्यपूर्ण आवास व्यवस्थित करने में सहायता करते हैं—पहले अनुरोध से आपके अतिथियों के आगमन तक।", primary: "कॉर्पोरेट अनुरोध शुरू करें", secondary: "मदीना होटल निर्देशिका देखें", note: "समूहों और धार्मिक यात्रा कार्यक्रमों के लिए आवास।" },
    city: { title: "आपके कार्यक्रम के अनुरूप मदीना आवास।", body: "हमारी टीम के सहयोग से मदीना में समूहों और कार्यक्रमों के लिए आवास विकल्प देखें।", madinahDetail: "हमारी टीम के सहयोग से समूह आवास विकल्प।", makkahDetail: "मक्का आवास सेवाएं जल्द शुरू होंगी।" },
    footer: { contact: "हमारी आवास टीम से बात करें", disclaimer: "आवास व्यवस्था आपके कार्यक्रम की आवश्यकताओं के अनुसार Al Ghanem Travel के साथ पुष्टि की जाती है।" },
  },
};

for (const locale of locales) {
  const copy = publicCopyRefinements[locale];
  if (copy.nav) Object.assign(translations[locale].nav, copy.nav);
  if (copy.hero) Object.assign(translations[locale].hero, copy.hero);
  if (copy.trust) Object.assign(translations[locale].trust, copy.trust);
  if (copy.standards) Object.assign(translations[locale].standards, copy.standards);
  if (copy.city) Object.assign(translations[locale].city, copy.city);
  if (copy.process) Object.assign(translations[locale].process, copy.process);
  if (copy.cta) Object.assign(translations[locale].cta, copy.cta);
  if (copy.footer) Object.assign(translations[locale].footer, copy.footer);
}
