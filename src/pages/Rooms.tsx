import { useState, useMemo, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, BedDouble, Maximize2, CalendarDays, X, Search, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHero } from '../components/PageHero';
import { HoverImage } from '../components/HoverImage';
import { StaggerContainer, StaggerItem } from '../components/RevealOnScroll';
import { Btn } from '../components/Btn';
import { rooms } from '../data/rooms';
import type { Room } from '../data/rooms';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  isRoomAvailableForRange,
  nightsBetween,
  parseLocalDate,
  todayPlusDays,
} from '../lib/availability';

// ─── types ───────────────────────────────────────────────────────────────────
type Category = 'All' | 'Standard' | 'Deluxe' | 'Suite';
const CATEGORIES: Category[] = ['All', 'Standard', 'Deluxe', 'Suite'];

// ─── helpers ─────────────────────────────────────────────────────────────────
const todayStr    = todayPlusDays(0);
const tomorrowStr = todayPlusDays(1);

function fmtCurrency(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

// ─── SearchBar ───────────────────────────────────────────────────────────────
interface SearchBarProps {
  checkIn: string;
  checkOut: string;
  guests: number;
  onCheckIn: (v: string) => void;
  onCheckOut: (v: string) => void;
  onGuests: (v: number) => void;
  onClear: () => void;
  hasFilter: boolean;
}

function SearchBar({
  checkIn, checkOut, guests,
  onCheckIn, onCheckOut, onGuests,
  onClear, hasFilter,
}: SearchBarProps) {
  const ciId = useId();
  const coId = useId();
  const gId  = useId();

  return (
    <div className="rounded-[0.75rem] border border-[#E3E3E3] bg-white p-5"
      style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Check-in */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor={ciId} className="label text-[#585858] flex items-center gap-1.5">
            <CalendarDays size={12} /> Check-in
          </label>
          <input
            id={ciId}
            type="date"
            value={checkIn}
            min={todayStr}
            max={checkOut || undefined}
            onChange={(e) => {
              onCheckIn(e.target.value);
              // reset check-out if it's now ≤ new check-in
              if (checkOut && e.target.value >= checkOut) onCheckOut('');
            }}
            className="px-3 py-2.5 border border-[#C3C3C3] rounded-[0.5rem] body-sm focus:outline-none focus:border-[#141414] transition-colors bg-white"
          />
        </div>

        {/* Check-out */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor={coId} className="label text-[#585858] flex items-center gap-1.5">
            <CalendarDays size={12} /> Check-out
          </label>
          <input
            id={coId}
            type="date"
            value={checkOut}
            min={checkIn ? todayPlusDays(
              checkIn
                ? nightsBetween(parseLocalDate(checkIn), parseLocalDate(tomorrowStr)) +
                  nightsBetween(parseLocalDate(tomorrowStr), parseLocalDate(checkIn)) + 1
                : 1
            ) : tomorrowStr}
            onChange={(e) => onCheckOut(e.target.value)}
            className="px-3 py-2.5 border border-[#C3C3C3] rounded-[0.5rem] body-sm focus:outline-none focus:border-[#141414] transition-colors bg-white"
          />
        </div>

        {/* Guests */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor={gId} className="label text-[#585858] flex items-center gap-1.5">
            <Users size={12} /> Guests
          </label>
          <select
            id={gId}
            value={guests}
            onChange={(e) => onGuests(Number(e.target.value))}
            className="px-3 py-2.5 border border-[#C3C3C3] rounded-[0.5rem] body-sm focus:outline-none focus:border-[#141414] transition-colors bg-white"
          >
            <option value={0}>Any capacity</option>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>
      </div>

      {hasFilter && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 flex items-center gap-1.5 body-sm text-[#585858] hover:text-[#000000] transition-colors"
        >
          <X size={13} /> Clear filters
        </button>
      )}
    </div>
  );
}

// ─── AvailabilityBadge ────────────────────────────────────────────────────────
function AvailabilityBadge({ available }: { available: boolean }) {
  return (
    <span
      className={`absolute top-3 left-3 label px-2.5 py-1 rounded-full z-10 ${
        available
          ? 'bg-white/90 text-[#141414]'
          : 'bg-black/50 text-white'
      }`}
    >
      {available ? '✓ Available' : 'Unavailable'}
    </span>
  );
}

// ─── RoomCard ─────────────────────────────────────────────────────────────────
interface RoomCardProps {
  room: Room;
  /** null = no date filter active */
  available: boolean | null;
  nights: number;
}

function HeartBtn({ room }: { room: Room }) {
  const { isAuthenticated, favorites, addToFavorites, removeFromFavorites } = useAuth();
  const { toast }  = useToast();
  const navigate   = useNavigate();
  const isFav      = favorites.includes(room.id);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login?redirect=/rooms');
      return;
    }
    if (isFav) {
      removeFromFavorites(room.id);
      toast(`Removed from favorites.`, 'info');
    } else {
      addToFavorites(room.id);
      toast(`${room.name} added to favorites!`);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
      className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow transition-colors ${
        isFav
          ? 'bg-white text-red-500 hover:bg-red-50'
          : 'bg-white/80 text-text-secondary hover:bg-white hover:text-red-400'
      }`}
    >
      <Heart size={14} fill={isFav ? 'currentColor' : 'none'} />
    </button>
  );
}

function RoomCard({ room, available, nights }: RoomCardProps) {
  const dimmed = available === false;

  return (
    <motion.div
      className={`bg-white rounded-[0.75rem] overflow-hidden border flex flex-col transition-opacity ${
        dimmed ? 'border-[#E3E3E3] opacity-45 pointer-events-none' : 'border-[#E3E3E3]'
      }`}
      style={{ boxShadow: dimmed ? 'none' : '0 2px 16px rgba(0,0,0,0.06)' }}
      whileHover={dimmed ? {} : { y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
      transition={{ duration: 0.3 }}
    >
      {/* Image */}
      <div className="relative">
        {available !== null && <AvailabilityBadge available={available} />}
        {!dimmed && <HeartBtn room={room} />}
        <HoverImage
          src={room.images[0]}
          alt={room.name}
          aspectRatio="4/3"
          className="rounded-none"
        />
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col gap-4 flex-1">
        <div>
          <span className="label text-[#585858]">{room.category}</span>
          <h3 className="heading-md text-[#000000] mt-1">{room.name}</h3>
          <p className="body-sm text-[#585858] mt-2 line-clamp-2">{room.description}</p>
        </div>

        {/* Specs */}
        <div className="flex flex-wrap gap-4 text-[#585858]">
          <span className="flex items-center gap-1.5 body-sm"><Users size={14} /> {room.capacity} guests</span>
          <span className="flex items-center gap-1.5 body-sm"><BedDouble size={14} /> {room.bedType}</span>
          <span className="flex items-center gap-1.5 body-sm"><Maximize2 size={14} /> {room.size}</span>
        </div>

        {/* Amenity chips */}
        <div className="flex flex-wrap gap-2">
          {room.amenities.slice(0, 3).map((a) => (
            <span key={a} className="label px-2 py-1 rounded-[0.25rem] text-[#585858] bg-[#F8F8F8] border border-[#E3E3E3]">
              {a}
            </span>
          ))}
          {room.amenities.length > 3 && (
            <span className="label px-2 py-1 text-[#585858]">+{room.amenities.length - 3}</span>
          )}
        </div>

        {/* Price row */}
        <div className="flex items-end justify-between pt-2 mt-auto border-t border-[#E3E3E3]">
          <div>
            <span className="body-md font-medium text-[#000000]">
              {fmtCurrency(room.price)}
            </span>
            <span className="body-sm text-[#585858]">/night</span>
            {nights > 1 && available !== false && (
              <p className="body-sm text-[#585858] mt-0.5">
                {fmtCurrency(room.price * nights)} total · {nights} nights
              </p>
            )}
          </div>
          <Btn to={`/rooms/${room.id}`} variant="primary" size="sm">
            View Details →
          </Btn>
        </div>
      </div>
    </motion.div>
  );
}

// ─── ResultsHeader ────────────────────────────────────────────────────────────
function ResultsHeader({
  total, available, datesActive, nights,
  checkIn, checkOut,
}: {
  total: number; available: number; datesActive: boolean; nights: number;
  checkIn: string; checkOut: string;
}) {
  if (!datesActive) {
    return (
      <p className="body-sm text-[#585858]">
        {total} room{total !== 1 ? 's' : ''} found
      </p>
    );
  }
  const fmtD = (s: string) =>
    parseLocalDate(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="body-sm text-[#585858]">
        <strong className="text-[#000000]">{available}</strong> of {total} rooms available
        {' '}for <strong className="text-[#000000]">{fmtD(checkIn)} – {fmtD(checkOut)}</strong>
        {' '}({nights} night{nights !== 1 ? 's' : ''})
      </span>
      {available === 0 && (
        <span className="label px-2.5 py-1 rounded-full bg-[#F8F8F8] border border-[#E3E3E3] text-[#585858]">
          Try different dates
        </span>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function Rooms() {
  const [category, setCategory] = useState<Category>('All');
  const [checkIn,  setCheckIn]  = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests,   setGuests]   = useState(0);

  const checkInDate  = checkIn  ? parseLocalDate(checkIn)  : null;
  const checkOutDate = checkOut ? parseLocalDate(checkOut) : null;
  const datesActive  = checkInDate !== null && checkOutDate !== null && checkOutDate > checkInDate;
  const nights       = datesActive ? nightsBetween(checkInDate!, checkOutDate!) : 0;
  const hasFilter    = !!(checkIn || checkOut || guests > 0 || category !== 'All');

  function clearFilters() {
    setCategory('All');
    setCheckIn('');
    setCheckOut('');
    setGuests(0);
  }

  // All rooms passing category + guest filters
  const baseFiltered = useMemo(
    () =>
      rooms.filter((r) => {
        if (category !== 'All' && r.category !== category) return false;
        if (guests > 0 && r.capacity < guests) return false;
        return true;
      }),
    [category, guests],
  );

  // Availability map when dates are selected
  const availabilityMap = useMemo<Map<string, boolean>>(() => {
    if (!datesActive) return new Map();
    return new Map(
      baseFiltered.map((r) => [
        r.id,
        isRoomAvailableForRange(r.id, checkInDate!, checkOutDate!),
      ]),
    );
  }, [datesActive, checkInDate, checkOutDate, baseFiltered]);

  // Sort: available first, then unavailable (only when dates active)
  const sorted = useMemo(() => {
    if (!datesActive) return baseFiltered;
    return [...baseFiltered].sort((a, b) => {
      const aOk = availabilityMap.get(a.id) ? 1 : 0;
      const bOk = availabilityMap.get(b.id) ? 1 : 0;
      return bOk - aOk;
    });
  }, [baseFiltered, datesActive, availabilityMap]);

  const availableCount = datesActive
    ? [...availabilityMap.values()].filter(Boolean).length
    : sorted.length;

  return (
    <>
      <PageHero
        image="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070&auto=format&fit=crop"
        title="Our Rooms"
        subtitle="Find the perfect space for your stay"
        height="60vh"
      />

      <section className="section-py bg-white">
        <div className="container-wide flex flex-col gap-8">

          {/* Search bar */}
          <SearchBar
            checkIn={checkIn}
            checkOut={checkOut}
            guests={guests}
            onCheckIn={setCheckIn}
            onCheckOut={setCheckOut}
            onGuests={setGuests}
            onClear={clearFilters}
            hasFilter={hasFilter}
          />

          {/* Category filter */}
          <div className="flex flex-wrap items-center gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-5 py-2 rounded-[0.5rem] body-sm font-medium transition-colors ${
                  category === cat
                    ? 'bg-[#141414] text-white'
                    : 'border border-[#E3E3E3] text-[#585858] hover:border-[#141414] hover:text-[#141414]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results header */}
          <ResultsHeader
            total={sorted.length}
            available={availableCount}
            datesActive={datesActive}
            nights={nights}
            checkIn={checkIn}
            checkOut={checkOut}
          />

          {/* Grid */}
          <AnimatePresence mode="wait">
            {sorted.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="py-20 flex flex-col items-center gap-4 text-center"
              >
                <Search size={36} className="text-[#BDBDBD]" />
                <p className="heading-md text-[#000000]">No rooms found</p>
                <p className="body-md text-[#585858]">
                  Try adjusting your filters or clearing your search.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="body-sm font-medium text-[#141414] hover:underline"
                >
                  Clear all filters
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {sorted.map((room) => (
                    <StaggerItem key={room.id}>
                      <RoomCard
                        room={room}
                        available={datesActive ? (availabilityMap.get(room.id) ?? false) : null}
                        nights={nights}
                      />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>
    </>
  );
}
