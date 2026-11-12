import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, ChevronLeft, ChevronRight, X } from "lucide-react";

export default function GalleryLightbox({
  items,
  activeIndex,
  onClose,
  onSelect,
  lang,
  t,
}) {
  const [imageError, setImageError] = useState(false);

  const isOpen = activeIndex !== null && activeIndex >= 0 && activeIndex < items.length;
  const activeItem = isOpen ? items[activeIndex] : null;

  useEffect(() => {
    setImageError(false);
  }, [activeIndex]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") {
        onSelect((activeIndex - 1 + items.length) % items.length);
      }
      if (e.key === "ArrowRight") {
        onSelect((activeIndex + 1) % items.length);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, activeIndex, items.length, onClose, onSelect]);

  return (
    <AnimatePresence>
      {isOpen && activeItem && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.title[lang]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[95] bg-ink/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl bg-ivory rounded-3xl overflow-hidden border border-champagne/60 shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-champagne/30">
              <div>
                <p className="text-[10px] tracking-[.2em] uppercase text-ink/50">
                  {activeIndex + 1} / {items.length}
                </p>
                <h3 className="font-hindi text-lg sm:text-xl text-ink">
                  {activeItem.title[lang]}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="icon-button"
                aria-label="Close lightbox"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative bg-[#eee5d8] h-[360px] sm:h-[480px] flex items-center justify-center">
              {!imageError ? (
                <img
                  src={activeItem.src}
                  alt={activeItem.title[lang]}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-contain bg-ink/5"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 text-ink/65">
                  <Camera size={42} strokeWidth={1.2} />
                  <p className="font-hindi text-base mt-4">
                    {activeItem.caption[lang]} {t.addPhotoSuffix}
                  </p>
                  <p className="text-xs text-ink/50 mt-2">
                    {t.lightboxHint}
                    <strong>{activeItem.filename}</strong>{" "}
                    {t.lightboxHintSuffix}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  onSelect((activeIndex - 1 + items.length) % items.length)
                }
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-ivory/90 border border-champagne/70 flex items-center justify-center text-ink hover:bg-white transition"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => onSelect((activeIndex + 1) % items.length)}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-ivory/90 border border-champagne/70 flex items-center justify-center text-ink hover:bg-white transition"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="px-5 py-3 flex items-center justify-center gap-2 bg-ivory">
              {items.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(idx)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition ${
                    idx === activeIndex
                      ? "bg-ink text-ivory border-ink"
                      : "border-champagne/70 text-ink/70 hover:text-ink"
                  }`}
                >
                  {item.caption[lang]}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
