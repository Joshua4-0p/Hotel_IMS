import { motion } from 'framer-motion';
import { ChevronDown, Wifi, Waves, UtensilsCrossed, Dumbbell, Car, Sparkles, Camera } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { Link } from 'react-router-dom';

import { Btn } from '../components/Btn';
import { SectionHeader } from '../components/SectionHeader';
import { HoverImage } from '../components/HoverImage';
import { StatItem } from '../components/StatItem';
import { RevealOnScroll, StaggerContainer, StaggerItem } from '../components/RevealOnScroll';
import { rooms } from '../data/rooms';
import { reviews } from '../data/reviews';
import { galleryImages } from '../data/gallery';

const amenities = [
  { icon: <Sparkles size={28} />, title: 'Spa & Wellness', desc: 'Rejuvenate with our signature treatments.' },
  { icon: <Wifi size={28} />, title: 'Free Wi-Fi', desc: 'Stay connected throughout the hotel.' },
  { icon: <Waves size={28} />, title: 'Infinity Pool', desc: 'Relax with stunning views.' },
  { icon: <UtensilsCrossed size={28} />, title: 'Gourmet Restaurant', desc: 'Farm-to-table dining.' },
  { icon: <Dumbbell size={28} />, title: 'Fitness Center', desc: 'State-of-the-art equipment.' },
  { icon: <Car size={28} />, title: 'Secure Parking', desc: 'Complimentary valet service.' },
];

const previewGallery = galleryImages.slice(0, 6);

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < count ? '#f59e0b' : '#e3e3e3' }}>★</span>
      ))}
    </div>
  );
}

export function Home() {
  const featuredRooms = rooms.slice(0, 3);
  const featuredReviews = reviews.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section
        className="relative flex items-center justify-center overflow-hidden"
        style={{ minHeight: 'max(100vh, 700px)' }}
      >
        <img
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop"
          alt="Lodr Hotel lobby"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.3)' }} />

        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto flex flex-col items-center gap-6">
          <motion.span
            className="label"
            style={{ color: 'rgba(255,255,255,0.7)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            Welcome to Lodr
          </motion.span>
          <motion.h1
            className="display-xl text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            Find Your Perfect Stay
          </motion.h1>
          <motion.p
            className="body-lg max-w-xl"
            style={{ color: 'rgba(255,255,255,0.7)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            Experience the perfect blend of comfort and elegance at Lodr Hotel, where every stay becomes a cherished memory.
          </motion.p>
          <motion.div
            className="flex flex-wrap gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Btn to="/rooms" variant="primary" size="lg" inverted>
              Explore Rooms
            </Btn>
            <Btn to="/about-us" variant="outline" size="lg" inverted>
              Learn More
            </Btn>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          <ChevronDown size={28} />
        </motion.div>
      </section>

      {/* About Snippet */}
      <section className="section-py bg-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <RevealOnScroll direction="left" className="flex flex-col gap-6">
              <span className="label text-[#585858]">About Lodr Hotel</span>
              <h2 className="display-lg text-[#000000]" style={{ textWrap: 'balance' }}>
                We're redefining what it means to feel at home
              </h2>
              <p className="body-lg text-[#585858]">
                At Lodr, we believe that a hotel should be more than just a place to sleep. It should be a sanctuary where comfort, style, and genuine hospitality come together to create an unforgettable experience.
              </p>
              <Btn to="/about-us" variant="ghost">
                Discover Our Story →
              </Btn>
              <div className="grid grid-cols-3 gap-6 pt-4 border-t border-[#E3E3E3]">
                <StatItem value={98} suffix="%" label="Guest Satisfaction" />
                <StatItem value={150} suffix="+" label="Rooms & Suites" />
                <StatItem value={25} suffix="+" label="Years of Experience" />
              </div>
            </RevealOnScroll>

            <RevealOnScroll direction="right">
              <HoverImage
                src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070&auto=format&fit=crop"
                alt="Modern hotel room interior"
                aspectRatio="4/5"
                className="shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
              />
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Rooms Preview */}
      <section className="section-py" style={{ background: '#F8F8F8' }}>
        <div className="container-wide flex flex-col gap-12">
          <SectionHeader
            overline="Our Rooms"
            title="Discover comfort in every corner"
            description="From elegant suites to cozy standard rooms, find the perfect space for your stay."
          />
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredRooms.map((room) => (
              <StaggerItem key={room.id}>
                <motion.div
                  className="bg-white rounded-[0.75rem] overflow-hidden border border-[#E3E3E3]"
                  style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
                  whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
                  transition={{ duration: 0.3 }}
                >
                  <HoverImage
                    src={room.images[0]}
                    alt={room.name}
                    aspectRatio="4/3"
                    className="rounded-none"
                  />
                  <div className="p-6 flex flex-col gap-3">
                    <span className="label text-[#585858]">{room.category}</span>
                    <h3 className="heading-md text-[#000000]">{room.name}</h3>
                    <p className="body-sm text-[#585858] line-clamp-2">{room.description}</p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="body-md font-medium text-[#000000]">
                        ${room.price}<span className="body-sm text-[#585858]">/night</span>
                      </span>
                      <Btn to={`/rooms/${room.id}`} variant="outline" size="sm">
                        View Details
                      </Btn>
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
          <div className="flex justify-center">
            <Btn to="/rooms" variant="primary" size="lg">
              View All Rooms →
            </Btn>
          </div>
        </div>
      </section>

      {/* Dining Highlight */}
      <section className="section-py bg-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <RevealOnScroll direction="left">
              <HoverImage
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop"
                alt="Elegant restaurant"
                aspectRatio="4/3"
                className="shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
              />
            </RevealOnScroll>
            <RevealOnScroll direction="right" className="flex flex-col gap-6">
              <span className="label text-[#585858]">Our Restaurant</span>
              <h2 className="display-lg text-[#000000]" style={{ textWrap: 'balance' }}>
                Dining is more than a meal, it's a moment to savor
              </h2>
              <p className="body-lg text-[#585858]">
                Indulge in world-class cuisine crafted by our award-winning chefs. From gourmet dining to casual bites, every dish tells a story of passion and freshness.
              </p>
              <Btn to="/our-services" variant="outline" size="md">
                Explore Dining
              </Btn>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="section-py bg-white">
        <div className="container-wide flex flex-col gap-12">
          <SectionHeader
            overline="Hotel Amenities"
            title="Everything you need for a relaxing stay"
          />
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {amenities.map((a) => (
              <StaggerItem key={a.title}>
                <div className="flex flex-col gap-3 p-6 rounded-[0.75rem] border border-[#E3E3E3]">
                  <span className="text-[#141414]">{a.icon}</span>
                  <h3 className="heading-md text-[#000000]">{a.title}</h3>
                  <p className="body-sm text-[#585858]">{a.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-py" style={{ background: '#E9EBE1' }}>
        <div className="container-wide flex flex-col gap-12">
          <SectionHeader
            overline="Guest Reviews"
            title="What our guests say"
          />
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={32}
            slidesPerView={1}
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000, pauseOnMouseEnter: true, disableOnInteraction: false }}
            className="w-full pb-10"
          >
            {featuredReviews.map((review, i) => (
              <SwiperSlide key={i}>
                <div className="max-w-2xl mx-auto text-center flex flex-col gap-6 px-4">
                  <p className="heading-lg italic text-[#000000]">
                    "{review.quote}"
                  </p>
                  <div className="flex flex-col items-center gap-2">
                    <StarRating count={review.rating} />
                    <span className="heading-md text-[#000000]">{review.name}</span>
                    <span className="body-sm text-[#585858]">{review.location}</span>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="section-py bg-white">
        <div className="container-wide flex flex-col gap-10">
          <SectionHeader
            overline="@lodrhotel"
            title="Follow us on Instagram"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {previewGallery.map((img) => (
              <Link
                key={img.id}
                to="/gallery"
                className="relative group overflow-hidden rounded-[1rem] aspect-square"
              >
                <img
                  src={img.url}
                  alt={img.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'rgba(0,0,0,0.4)' }}>
                  <Camera size={32} className="text-white" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="section-py" style={{ background: '#141414' }}>
        <div className="container-wide text-center flex flex-col items-center gap-6">
          <RevealOnScroll>
            <h2 className="heading-xl text-white">Ready for an unforgettable stay?</h2>
          </RevealOnScroll>
          <RevealOnScroll delay={0.1}>
            <p className="body-lg" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Book your room today and experience the best of Lodr.
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={0.2}>
            <Btn to="/rooms" variant="primary" size="lg" inverted>
              Book Now →
            </Btn>
          </RevealOnScroll>
        </div>
      </section>
    </>
  );
}
