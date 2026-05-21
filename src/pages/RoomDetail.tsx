import { useState } from 'react';
const fmtXAF = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 });
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs } from 'swiper/modules';
import type { SwiperClass } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import { Users, BedDouble, Maximize2, Check, ChevronRight, Heart } from 'lucide-react';
import { rooms } from '../data/rooms';
import { Btn } from '../components/Btn';
import { HoverImage } from '../components/HoverImage';
import { StaggerContainer, StaggerItem, RevealOnScroll } from '../components/RevealOnScroll';
import { BookingPanel } from '../components/BookingPanel';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function RoomDetail() {
  const { id }                                                 = useParams<{ id: string }>();
  const room                                                   = rooms.find((r) => r.id === id);
  const [thumbsSwiper, setThumbsSwiper]                        = useState<SwiperClass | null>(null);
  const { isAuthenticated, favorites, addToFavorites, removeFromFavorites } = useAuth();
  const { toast }                                              = useToast();
  const navigate                                               = useNavigate();

  if (!room) {
    return (
      <div className="section-py container-wide text-center">
        <p className="body-lg text-[#585858]">Room not found.</p>
        <Btn to="/rooms" variant="primary" size="md" className="mt-4">Back to Rooms</Btn>
      </div>
    );
  }

  const related  = rooms.filter((r) => r.id !== room.id).slice(0, 3);
  const isFav    = favorites.includes(room.id);

  // room is guaranteed non-null after the guard above; closures need explicit assertion
  function handleFavorite() {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/rooms/${room!.id}`);
      return;
    }
    if (isFav) {
      removeFromFavorites(room!.id);
      toast('Removed from favorites.', 'info');
    } else {
      addToFavorites(room!.id);
      toast(`${room!.name} added to favorites!`);
    }
  }

  return (
    <>
      {/* Image gallery */}
      <div className="pt-[72px]">
        <Swiper
          modules={[Navigation, Thumbs]}
          navigation
          thumbs={{ swiper: thumbsSwiper }}
          className="w-full"
          style={{ aspectRatio: '16/7' }}
        >
          {room.images.map((img, i) => (
            <SwiperSlide key={i}>
              <img
                src={img}
                alt={`${room.name} ${i + 1}`}
                className="w-full h-full object-cover"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Thumbnails */}
        {room.images.length > 1 && (
          <Swiper
            modules={[Thumbs]}
            onSwiper={setThumbsSwiper}
            slidesPerView={4}
            spaceBetween={8}
            className="container-wide mt-2"
            style={{ height: '80px' }}
            watchSlidesProgress
          >
            {room.images.map((img, i) => (
              <SwiperSlide key={i} className="cursor-pointer opacity-60 hover:opacity-100">
                <img src={img} alt="" className="w-full h-full object-cover rounded" />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      <section className="section-py bg-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Info */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 body-sm text-[#585858]">
                <Link to="/rooms" className="hover:text-[#000000] transition-colors">Rooms</Link>
                <ChevronRight size={14} />
                <span>{room.name}</span>
              </div>

              <div className="flex flex-col gap-3">
                <span className="label text-[#585858]">{room.category}</span>
                <div className="flex items-start justify-between gap-4">
                  <h1 className="heading-xl text-text-primary">{room.name}</h1>
                  <button
                    type="button"
                    onClick={handleFavorite}
                    aria-label={isFav ? 'Remove from favorites' : 'Save to favorites'}
                    className={`shrink-0 mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-[0.5rem] border body-sm font-medium transition-colors ${
                      isFav
                        ? 'border-red-200 bg-red-50 text-red-500 hover:bg-red-100'
                        : 'border-[#E3E3E3] text-text-secondary hover:border-brand-black hover:text-brand-black'
                    }`}
                  >
                    <Heart size={13} fill={isFav ? 'currentColor' : 'none'} />
                    {isFav ? 'Saved' : 'Save'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-6 text-[#585858]">
                  <span className="flex items-center gap-2 body-md">
                    <Users size={16} /> {room.capacity} guests
                  </span>
                  <span className="flex items-center gap-2 body-md">
                    <BedDouble size={16} /> {room.bedType}
                  </span>
                  <span className="flex items-center gap-2 body-md">
                    <Maximize2 size={16} /> {room.size}
                  </span>
                </div>
              </div>

              <RevealOnScroll>
                <p className="body-lg text-[#585858]">{room.description}</p>
              </RevealOnScroll>

              {/* Amenities */}
              <RevealOnScroll>
                <h2 className="heading-lg text-[#000000] mb-4">Amenities</h2>
                <div className="grid grid-cols-2 gap-3">
                  {room.amenities.map((a) => (
                    <div key={a} className="flex items-center gap-2 body-md text-[#585858]">
                      <Check size={16} className="text-[#141414] shrink-0" />
                      {a}
                    </div>
                  ))}
                </div>
              </RevealOnScroll>
            </div>

            {/* Booking panel */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <RevealOnScroll direction="right">
                <div className="p-6 rounded-[0.75rem] border border-[#E3E3E3] shadow-card">
                  {isAuthenticated ? (
                    <BookingPanel room={room} />
                  ) : (
                    <div className="flex flex-col gap-5">
                      <div>
                        <span className="display-md text-text-primary">{fmtXAF(room.price)}</span>
                        <span className="body-md text-text-secondary">/night</span>
                      </div>
                      <div className="rounded-[0.5rem] border border-[#E3E3E3] bg-[#F8F8F8] p-5 flex flex-col gap-3 text-center">
                        <p className="body-md font-medium text-text-primary">
                          Log in to book this room
                        </p>
                        <p className="body-sm text-text-secondary">
                          Create a free account or sign in to select dates and confirm your reservation.
                        </p>
                        <div className="flex flex-col gap-2 mt-1">
                          <Link
                            to={`/login?redirect=/rooms/${room.id}`}
                            className="w-full py-3 bg-brand-black text-white rounded-[0.5rem] body-md font-medium hover:bg-[#2a2a2a] transition-colors text-center"
                          >
                            Log in to book
                          </Link>
                          <Link
                            to={`/signup?redirect=/rooms/${room.id}`}
                            className="w-full py-3 border border-[#E3E3E3] text-brand-black rounded-[0.5rem] body-md font-medium hover:border-brand-black transition-colors text-center"
                          >
                            Create account
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* Related rooms */}
      <section className="section-py" style={{ background: '#F8F8F8' }}>
        <div className="container-wide flex flex-col gap-10">
          <h2 className="heading-xl text-[#000000]">You may also like</h2>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {related.map((r) => (
              <StaggerItem key={r.id}>
                <motion.div
                  className="bg-white rounded-[0.75rem] overflow-hidden border border-[#E3E3E3]"
                  style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
                  whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
                  transition={{ duration: 0.3 }}
                >
                  <HoverImage src={r.images[0]} alt={r.name} aspectRatio="4/3" className="rounded-none" />
                  <div className="p-5 flex flex-col gap-2">
                    <span className="label text-[#585858]">{r.category}</span>
                    <h3 className="heading-md text-[#000000]">{r.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="body-md font-medium">{fmtXAF(r.price)}<span className="body-sm text-text-secondary">/night</span></span>
                      <Btn to={`/rooms/${r.id}`} variant="outline" size="sm">View</Btn>
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </>
  );
}
