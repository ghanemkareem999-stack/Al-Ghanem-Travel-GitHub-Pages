import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";

type HotelGalleryLightboxProps = {
  hotelName: string;
  images: string[];
  locale: Locale;
  galleryLabel: string;
  getImageAlt: (image: string, index: number) => string;
};

const galleryControls = {
  en: { open: "Open enlarged image", close: "Close gallery", previous: "Previous image", next: "Next image", status: "Image" },
  ar: { open: "فتح الصورة بالحجم الكامل", close: "إغلاق المعرض", previous: "الصورة السابقة", next: "الصورة التالية", status: "الصورة" },
  ms: { open: "Buka imej besar", close: "Tutup galeri", previous: "Imej sebelumnya", next: "Imej seterusnya", status: "Imej" },
  ur: { open: "بڑی تصویر کھولیں", close: "گیلری بند کریں", previous: "پچھلی تصویر", next: "اگلی تصویر", status: "تصویر" },
  id: { open: "Buka gambar ukuran besar", close: "Tutup galeri", previous: "Gambar sebelumnya", next: "Gambar berikutnya", status: "Gambar" },
  hi: { open: "बड़ी छवि खोलें", close: "गैलरी बंद करें", previous: "पिछली छवि", next: "अगली छवि", status: "छवि" },
} as const;

export default function HotelGalleryLightbox({ hotelName, images, locale, galleryLabel, getImageAlt }: HotelGalleryLightboxProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const controls = galleryControls[locale];
  const isOpen = activeIndex !== null;
  const currentIndex = activeIndex ?? 0;
  const currentImage = images[currentIndex];
  const isRtl = locale === "ar" || locale === "ur";

  function moveImage(direction: -1 | 1) {
    setActiveIndex(index => index === null ? null : (index + direction + images.length) % images.length);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveImage(isRtl ? 1 : -1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveImage(isRtl ? -1 : 1);
    }
  }

  const PreviousIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <>
      <section className="mx-auto max-w-[1440px] px-5 py-16 md:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">{galleryLabel}</p>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-[#173e35] sm:text-4xl">{hotelName}</h2>
          </div>
          <p className="rounded-full border border-[#173e35]/10 bg-[#f8f5ed] px-3 py-1.5 text-xs font-bold text-[#58726a]" aria-label={`${images.length} images`}>{images.length}</p>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-[1.35fr_.65fr]">
          <GalleryImageButton image={images[0]} alt={getImageAlt(images[0], 0)} onOpen={() => setActiveIndex(0)} label={controls.open} className="h-[380px]" />
          {images[1] && <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
            <GalleryImageButton image={images[1]} alt={getImageAlt(images[1], 1)} onOpen={() => setActiveIndex(1)} label={controls.open} className={images[2] ? "h-[182px]" : "h-[380px]"} />
            {images[2] && <GalleryImageButton image={images[2]} alt={getImageAlt(images[2], 2)} onOpen={() => setActiveIndex(2)} label={controls.open} className="h-[182px]" />}
          </div>}
        </div>
        {images.length > 3 && <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{images.slice(3).map((image, index) => <GalleryImageButton image={image} alt={getImageAlt(image, index + 3)} onOpen={() => setActiveIndex(index + 3)} label={controls.open} className="h-64" key={image} />)}</div>}
      </section>

      <Dialog open={isOpen} onOpenChange={open => !open && setActiveIndex(null)}>
        <DialogContent
          showCloseButton={false}
          onKeyDown={handleKeyDown}
          className="max-h-[calc(100dvh-1.5rem)] max-w-[calc(100%-1rem)] overflow-hidden border-white/15 bg-[#0d2923] p-0 text-white sm:max-w-5xl"
        >
          <DialogTitle className="sr-only">{hotelName} — {galleryLabel}</DialogTitle>
          <DialogDescription className="sr-only">{controls.status} {currentIndex + 1} {locale === "ar" ? "من" : "of"} {images.length}</DialogDescription>
          {currentImage && <img src={currentImage} alt={getImageAlt(currentImage, currentIndex)} className="max-h-[calc(100dvh-1.5rem)] w-full object-contain" />}
          <DialogClose aria-label={controls.close} className="absolute end-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white transition hover:bg-[#a9853d] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#dfc27f]/70"><X size={20} aria-hidden="true" /><span className="sr-only">{controls.close}</span></DialogClose>
          {images.length > 1 && <>
            <button type="button" onClick={() => moveImage(isRtl ? 1 : -1)} aria-label={controls.previous} className="absolute start-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white transition hover:bg-[#a9853d] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#dfc27f]/70 sm:start-5"><PreviousIcon size={23} aria-hidden="true" /></button>
            <button type="button" onClick={() => moveImage(isRtl ? -1 : 1)} aria-label={controls.next} className="absolute end-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white transition hover:bg-[#a9853d] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#dfc27f]/70 sm:end-5"><NextIcon size={23} aria-hidden="true" /></button>
          </>}
          <p aria-live="polite" className="absolute bottom-4 start-1/2 -translate-x-1/2 rounded-full bg-black/45 px-3 py-1.5 text-xs font-bold">{currentIndex + 1} / {images.length}</p>
        </DialogContent>
      </Dialog>
    </>
  );
}

function GalleryImageButton({ image, alt, onOpen, label, className }: { image: string; alt: string; onOpen: () => void; label: string; className: string }) {
  return (
    <button type="button" onClick={onOpen} className={`group relative block w-full overflow-hidden rounded-[1.5rem] text-start focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#dfc27f]/70 ${className}`} aria-label={`${label}: ${alt}`}>
      <img className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" src={image} alt={alt} />
      <span className="absolute inset-0 bg-[#153a31]/0 transition group-hover:bg-[#153a31]/20" aria-hidden="true" />
      <span className="absolute bottom-4 end-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#153a31] opacity-0 shadow-sm transition group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true"><Expand size={18} /></span>
    </button>
  );
}
