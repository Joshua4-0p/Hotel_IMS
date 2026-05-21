import { motion } from 'framer-motion';

interface PageHeroProps {
  image: string;
  title: string;
  subtitle?: string;
  height?: string;
  overlayOpacity?: number;
}

export function PageHero({
  image,
  title,
  subtitle,
  height = '60vh',
  overlayOpacity = 0.4,
}: PageHeroProps) {
  return (
    <section
      className="relative flex items-center justify-center overflow-hidden"
      style={{ minHeight: height }}
    >
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
        decoding="async"
      />
      <div
        className="absolute inset-0"
        style={{ background: `rgba(0,0,0,${overlayOpacity})` }}
      />
      <div className="relative z-10 text-center px-6">
        <motion.h1
          className="heading-xl text-white mb-3"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            className="body-lg"
            style={{ color: 'rgba(255,255,255,0.7)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  );
}
