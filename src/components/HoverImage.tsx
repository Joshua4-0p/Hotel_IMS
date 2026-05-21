import { motion } from 'framer-motion';

interface HoverImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
}

export function HoverImage({ src, alt, className = '', aspectRatio }: HoverImageProps) {
  return (
    <div
      className={`overflow-hidden rounded-[1rem] ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </div>
  );
}
