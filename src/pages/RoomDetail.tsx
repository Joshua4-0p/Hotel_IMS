import { useState, useMemo } from 'react';
const fmtXAF = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 });
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs } from 'swiper/modules';
import type { SwiperClass } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import { Users, BedDouble, Maximize2, Check, ChevronRight, Heart, Star, MessageSquare } from 'lucide-react';
import { rooms } from '../data/rooms';
import { Btn } from '../components/Btn';
import { HoverImage } from '../components/HoverImage';
import { StaggerContainer, StaggerItem, RevealOnScroll } from '../components/RevealOnScroll';
import { BookingPanel } from '../components/BookingPanel';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

// ── Shared review storage key (same as AdminReviews) ──────────────────────────
const REVIEWS_KEY = 'lodr_admin_reviews';

interface StoredReview {
  id: string;
  name: string;
  location: string;
  rating: number;
  quote: string;
  roomId?: string;
  roomName?: string;
  status: string;
  featured: boolean;
  reply?: string;
  date: string;
}

function loadStoredReviews(): StoredReview[] {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY);
    return raw ? (JSON.parse(raw) as StoredReview[]) : [];
  } catch { return []; }
}

// ── Star display (read-only) ──────────────────────────────────────────────────
function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          fill={i <= rating ? 'currentColor' : 'none'}
          className={i <= rating ? 'text-amber-400' : 'text-[#d1d5db]'}
        />
      ))}
    </span>
  );
}

// ── Interactive star input ─────────────────────────────────────────────────────
function StarInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
          aria-label={`Rate ${i} star${i > 1 ? 's' : ''}`}
        >
          <Star
            size={28}
            fill={i <= (hover || value) ? 'currentColor' : 'none'}
            className={i <= (hover || value) ? 'text-amber-400' : 'text-[#d1d5db]'}
          />
        </button>
      ))}
    </div>
  );
}

export function RoomDetail() {
  const { id }                                                 = useParams<{ id: string }>();
  const room                                                   = rooms.find((r) => r.id === id);
  const [thumbsSwiper, setThumbsSwiper]                        = useState<SwiperClass | null>(null);
  const { isAuthenticated, user, favorites, bookings, addToFavorites, removeFromFavorites, markReviewed } = useAuth();
  const { toast }                                              = useToast();
  const navigate                                               = useNavigate();

  // ── Reviews state ────────────────────────────────────────────────────────────
  const [storedReviews, setStoredReviews] = useState<StoredReview[]>(() => loadStoredReviews());
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewRating, setReviewRating]   = useState(0);
  const [reviewText,   setReviewText]     = useState('');
  const [submitting,   setSubmitting]     = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const roomReviews = useMemo(
    () => storedReviews.filter((r) => r.roomId === id && r.status === 'approved'),
    [storedReviews, id],
  );

  const avgRating = roomReviews.length > 0
    ? roomReviews.reduce((sum, r) => sum + r.rating, 0) / roomReviews.length
    : 0;

  const eligibleBooking = isAuthenticated
    ? bookings.find(
        (b) => b.roomId === id && b.status === 'confirmed' && b.checkOut <= today && !b.hasReviewed,
      )
    : undefined;

  function handleReviewSubmit() {
    if (!eligibleBooking || reviewRating === 0 || !room) return;
    setSubmitting(true);

    const newReview: StoredReview = {
      id:       'grev_' + Math.random().toString(36).slice(2, 9),
      name:     user?.name ?? 'Anonymous',
      location: user?.location || 'Guest',
      rating:   reviewRating,
      quote:    reviewText.trim(),
      roomId:   room.id,
      roomName: room.name,
      status:   'approved',
      featured: false,
      date:     today,
    };

    const existing = loadStoredReviews();
    localStorage.setItem(REVIEWS_KEY, JSON.stringify([newReview, ...existing]));
    setStoredReviews([newReview, ...existing]);
    markReviewed(eligibleBooking.id);

    setReviewRating(0);
    setReviewText('');
    setSubmitting(false);
    setReviewDialogOpen(false);
    toast('Thank you for your review!');
  }

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

              {/* Guest Reviews */}
              <RevealOnScroll>
                <div className="flex flex-col gap-5">
                  {/* Header */}
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <h2 className="heading-lg text-text-primary">Guest Reviews</h2>
                      {roomReviews.length > 0 && (
                        <div className="flex items-center gap-2">
                          <StarDisplay rating={Math.round(avgRating)} size={15} />
                          <span className="body-sm text-text-secondary">
                            {avgRating.toFixed(1)} · {roomReviews.length} review{roomReviews.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                    {eligibleBooking && (
                      <button
                        type="button"
                        onClick={() => setReviewDialogOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-[0.5rem] border border-[#E3E3E3] body-sm font-medium text-text-secondary hover:border-brand-black hover:text-brand-black transition-colors"
                      >
                        <MessageSquare size={14} />
                        Leave a Review
                      </button>
                    )}
                  </div>

                  {/* Review cards */}
                  {roomReviews.length === 0 ? (
                    <p className="body-md text-text-secondary py-4">
                      No reviews yet for this room. Be the first to share your experience!
                    </p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {roomReviews.map((review) => (
                        <div
                          key={review.id}
                          className="p-4 rounded-card border border-[#E3E3E3] bg-[#F8F8F8] flex flex-col gap-2"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-brand-black flex items-center justify-center shrink-0">
                                <span className="text-[11px] font-semibold text-white">
                                  {review.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="body-sm font-semibold text-[#111111]">{review.name}</p>
                                <p className="text-[11px] text-[#9ca3af]">{review.location}</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-0.5 shrink-0">
                              <StarDisplay rating={review.rating} size={12} />
                              <span className="text-[11px] text-[#9ca3af]">{review.date}</span>
                            </div>
                          </div>
                          {review.quote && (
                            <p className="body-sm text-text-secondary leading-relaxed">"{review.quote}"</p>
                          )}
                          {review.reply && (
                            <div className="mt-1 pl-3 border-l-2 border-[#E3E3E3]">
                              <p className="text-[11px] font-semibold text-text-secondary mb-0.5">Hotel reply</p>
                              <p className="body-sm text-text-secondary">{review.reply}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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

      {/* Inline review dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={(v) => { if (!v) { setReviewDialogOpen(false); setReviewRating(0); setReviewText(''); } }}>
        <DialogContent className="max-w-md bg-white border-[#E3E3E3]">
          <DialogHeader>
            <DialogTitle className="text-[#111111]">Leave a Review</DialogTitle>
            <p className="text-sm text-text-secondary mt-1">{room?.name}</p>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-1">
            <div>
              <p className="body-sm font-medium text-[#111111] mb-2">Your rating <span className="text-red-500">*</span></p>
              <StarInput value={reviewRating} onChange={setReviewRating} />
            </div>
            <div>
              <p className="body-sm font-medium text-[#111111] mb-2">Your experience <span className="text-text-secondary font-normal">(optional)</span></p>
              <Textarea
                placeholder="Tell other guests about your stay…"
                rows={3}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="text-sm resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => { setReviewDialogOpen(false); setReviewRating(0); setReviewText(''); }}>
              Cancel
            </Button>
            <Button
              onClick={handleReviewSubmit}
              disabled={reviewRating === 0 || submitting}
              className="bg-brand-black hover:bg-[#333333] text-white"
            >
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
