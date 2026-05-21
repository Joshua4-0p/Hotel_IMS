import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Lightbox({ images, currentIndex, onClose, onNext, onPrev }: LightboxProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose, onNext, onPrev]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.9)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      >
        <motion.div
          className="relative max-w-5xl w-full mx-4"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={images[currentIndex]}
            alt={`Gallery image ${currentIndex + 1}`}
            className="w-full max-h-[80vh] object-contain rounded-[1rem]"
          />
          <span className="absolute top-4 right-4 text-white/60 body-sm">
            {currentIndex + 1} / {images.length}
          </span>
        </motion.div>

        {/* Close */}
        <button
          className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
          onClick={onClose}
        >
          <X size={24} />
        </button>

        {/* Prev */}
        <button
          className="absolute left-6 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
        >
          <ChevronLeft size={28} />
        </button>

        {/* Next */}
        <button
          className="absolute right-6 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
        >
          <ChevronRight size={28} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
