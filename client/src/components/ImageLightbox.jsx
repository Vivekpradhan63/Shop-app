import { useEffect, useState, useCallback } from "react";
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Full-screen image lightbox.
 * Props:
 *   images    : string[]   — array of full-size image URLs
 *   startIndex: number     — which image to open on
 *   onClose   : () => void
 */
export default function ImageLightbox({ images = [], startIndex = 0, onClose }) {
  const [current, setCurrent] = useState(startIndex);
  const [zoomed, setZoomed] = useState(false);

  const prev = useCallback(() => {
    setZoomed(false);
    setCurrent((c) => (c - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => {
    setZoomed(false);
    setCurrent((c) => (c + 1) % images.length);
  }, [images.length]);

  const toggleZoom = () => setZoomed((z) => !z);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, prev, next]);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 animate-in fade-in duration-200"
      onClick={(e) => {
        // Click outside the image closes the lightbox
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/25"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Zoom toggle */}
      <button
        type="button"
        onClick={toggleZoom}
        aria-label={zoomed ? "Zoom out" : "Zoom in"}
        className="absolute left-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/25"
      >
        {zoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
      </button>

      {/* Prev / Next */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous image"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/25"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next image"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/25"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Main image */}
      <div className="relative flex h-full w-full items-center justify-center p-16 sm:p-20">
        <img
          key={current}
          src={images[current]}
          alt={`Image ${current + 1}`}
          onClick={toggleZoom}
          className={cn(
            "max-h-full max-w-full rounded-lg object-contain transition-transform duration-300 select-none",
            zoomed
              ? "scale-[2] cursor-zoom-out"
              : "scale-100 cursor-zoom-in",
            "animate-in zoom-in-95 duration-200",
          )}
          draggable={false}
        />
      </div>

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to image ${i + 1}`}
              onClick={() => { setZoomed(false); setCurrent(i); }}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === current ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
