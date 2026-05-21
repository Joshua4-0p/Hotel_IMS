import { useState } from 'react';
import { motion } from 'framer-motion';
import { PageHero } from '../components/PageHero';
import { Lightbox } from '../components/Lightbox';
import { galleryImages } from '../data/gallery';
import type { GalleryImage } from '../data/gallery';

type Category = 'All' | 'Rooms' | 'Dining' | 'Facilities' | 'Events';
const categories: Category[] = ['All', 'Rooms', 'Dining', 'Facilities', 'Events'];

export function Gallery() {
  const [active, setActive] = useState<Category>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered: GalleryImage[] =
    active === 'All' ? galleryImages : galleryImages.filter((img) => img.category === active);

  const handleOpen = (idx: number) => setLightboxIndex(idx);
  const handleClose = () => setLightboxIndex(null);
  const handleNext = () =>
    setLightboxIndex((i) => (i !== null ? (i + 1) % filtered.length : null));
  const handlePrev = () =>
    setLightboxIndex((i) => (i !== null ? (i - 1 + filtered.length) % filtered.length : null));

  return (
    <>
      <PageHero
        image="https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2070&auto=format&fit=crop"
        title="Gallery"
        subtitle="A glimpse into our world"
        height="60vh"
      />

      <section className="section-py bg-white">
        <div className="container-wide flex flex-col gap-10">
          {/* Filter tabs */}
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`px-6 py-2 rounded-[0.5rem] body-md font-medium transition-colors ${
                  active === cat
                    ? 'bg-[#141414] text-white'
                    : 'bg-transparent border border-[#E3E3E3] text-[#585858] hover:border-[#141414] hover:text-[#141414]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Masonry grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {filtered.map((img, idx) => (
              <motion.div
                key={img.id}
                className="break-inside-avoid overflow-hidden rounded-[1rem] cursor-pointer group relative"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.3 }}
                onClick={() => handleOpen(idx)}
              >
                <img
                  src={img.url}
                  alt={img.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full object-cover transition-transform duration-400 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }}
                >
                  <span className="body-sm text-white">{img.alt}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {lightboxIndex !== null && (
        <Lightbox
          images={filtered.map((img) => img.url)}
          currentIndex={lightboxIndex}
          onClose={handleClose}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}
    </>
  );
}
