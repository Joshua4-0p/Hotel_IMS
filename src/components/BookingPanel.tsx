import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowLeft } from 'lucide-react';
import { BookingCalendar } from './BookingCalendar';
import type { Room } from '../data/rooms';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { toKey } from '../lib/availability';

// ----- constants -----
const CLEANING_FEE = 27000;
const fmtXAF = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 });
const TAX_RATE     = 0.12;

// ----- helpers -----
function nightsBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

function generateRef() {
  return 'LDR-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

function fmtDate(d: Date | null, opts?: Intl.DateTimeFormatOptions) {
  if (!d) return '—';
  return d.toLocaleDateString('en-US', opts ?? { weekday: 'short', month: 'short', day: 'numeric' });
}

// ----- animation -----
const slide = {
  enter:  (dir: number) => ({ x: dir > 0 ? 32 : -32, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (dir: number) => ({ x: dir > 0 ? -32 : 32,  opacity: 0 }),
};
const transition = { duration: 0.28, ease: 'easeOut' as const };

// ----- types -----
type Step = 'dates' | 'summary' | 'confirmed';
const STEP_ORDER: Step[] = ['dates', 'summary', 'confirmed'];

interface GuestInfo {
  firstName: string;
  lastName:  string;
  email:     string;
  phone:     string;
}

// ----- sub-components -----
function StepIndicator({ step }: { step: Step }) {
  if (step === 'confirmed') return null;
  const active = STEP_ORDER.indexOf(step);
  const labels = ['Select Dates', 'Review & Confirm'];
  return (
    <div className="flex items-center gap-2">
      {labels.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center label shrink-0 transition-colors ${
              i <= active ? 'bg-brand-black text-white' : 'bg-[#E3E3E3] text-text-secondary'
            }`}
          >
            {i < active ? <Check size={10} /> : i + 1}
          </span>
          <span className={`body-sm ${i === active ? 'font-medium text-[#000000]' : 'text-[#585858]'}`}>
            {label}
          </span>
          {i < labels.length - 1 && (
            <span className="w-5 h-px bg-[#E3E3E3] shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}

function PriceLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between body-sm text-[#585858]">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function FieldInput({
  label, type = 'text', value, onChange, placeholder, required,
}: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="label text-[#585858]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="px-3 py-2.5 border border-[#C3C3C3] rounded-[0.5rem] body-sm focus:outline-none focus:border-[#141414] transition-colors"
      />
    </label>
  );
}

function PrimaryBtn({
  children, onClick, disabled,
}: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3.5 rounded-[0.5rem] body-md font-medium transition-all ${
        disabled
          ? 'bg-[#E3E3E3] text-[#BDBDBD] cursor-not-allowed'
          : 'bg-[#141414] text-white hover:bg-[#2a2a2a] cursor-pointer'
      }`}
    >
      {children}
    </button>
  );
}

// ----- main component -----
export function BookingPanel({ room }: { room: Room }) {
  const { addBooking } = useAuth();
  const { toast }      = useToast();
  const navigate       = useNavigate();

  const [step,      setStep]      = useState<Step>('dates');
  const [direction, setDirection] = useState(1);
  const [checkIn,   setCheckIn]   = useState<Date | null>(null);
  const [checkOut,  setCheckOut]  = useState<Date | null>(null);
  const [guests,    setGuests]    = useState(1);
  const [info,      setInfo]      = useState<GuestInfo>({ firstName: '', lastName: '', email: '', phone: '' });
  const bookingRef = useMemo(generateRef, []);

  const nights   = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const subtotal = nights * room.price;
  const taxes    = Math.round(subtotal * TAX_RATE);
  const total    = subtotal + CLEANING_FEE + taxes;

  function goTo(next: Step) {
    setDirection(STEP_ORDER.indexOf(next) > STEP_ORDER.indexOf(step) ? 1 : -1);
    setStep(next);
  }

  function reset() {
    setCheckIn(null);
    setCheckOut(null);
    setGuests(1);
    setInfo({ firstName: '', lastName: '', email: '', phone: '' });
    setDirection(-1);
    setStep('dates');
  }

  function handleConfirm() {
    if (!canConfirm || !checkIn || !checkOut) return;
    addBooking({
      roomId:     room.id,
      roomName:   room.name,
      roomImage:  room.images[0],
      checkIn:    toKey(checkIn),
      checkOut:   toKey(checkOut),
      guests,
      totalPrice: total,
    });
    toast(`Booking confirmed for ${room.name}!`);
    goTo('confirmed');
  }

  function handleViewBookings() {
    navigate('/dashboard/bookings');
  }

  const canContinue  = checkIn !== null && checkOut !== null && nights >= 1;
  const canConfirm   = info.firstName.trim() && info.lastName.trim() && info.email.trim();

  return (
    <div className="flex flex-col gap-5">
      <StepIndicator step={step} />

      <AnimatePresence mode="wait" custom={direction}>
        {/* ── STEP 1: date selection ── */}
        {step === 'dates' && (
          <motion.div
            key="dates"
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            className="flex flex-col gap-5"
          >
            <div>
              <span className="display-md text-[#000000]">{fmtXAF(room.price)}</span>
              <span className="body-md text-[#585858]">/night</span>
            </div>

            <BookingCalendar
              roomId={room.id}
              checkIn={checkIn}
              checkOut={checkOut}
              onChange={(ci, co) => { setCheckIn(ci); setCheckOut(co); }}
            />

            <label className="flex flex-col gap-1.5">
              <span className="label text-[#585858]">Guests</span>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="px-4 py-3 border border-[#C3C3C3] rounded-[0.5rem] body-md focus:outline-none focus:border-[#141414] transition-colors bg-white"
              >
                {Array.from({ length: room.capacity }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </label>

            <PrimaryBtn
              onClick={() => canContinue && goTo('summary')}
              disabled={!canContinue}
            >
              {canContinue
                ? `Continue — ${nights} night${nights > 1 ? 's' : ''}`
                : 'Select dates to continue'}
            </PrimaryBtn>
          </motion.div>
        )}

        {/* ── STEP 2: price summary + guest details ── */}
        {step === 'summary' && (
          <motion.div
            key="summary"
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            className="flex flex-col gap-6"
          >
            <button
              type="button"
              onClick={() => goTo('dates')}
              className="flex items-center gap-1 body-sm text-[#585858] hover:text-[#000000] transition-colors self-start"
            >
              <ArrowLeft size={14} /> Change dates
            </button>

            {/* Selected dates pill */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Check-in',  d: checkIn  },
                { label: 'Check-out', d: checkOut },
              ].map(({ label, d }) => (
                <div key={label} className="p-3 rounded-[0.5rem] bg-[#F8F8F8] border border-[#E3E3E3]">
                  <p className="label text-[#585858] mb-0.5">{label}</p>
                  <p className="body-sm font-medium text-[#000000]">{fmtDate(d)}</p>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="flex flex-col gap-3 rounded-[0.5rem] border border-[#E3E3E3] p-4">
              <p className="heading-md text-[#000000]">Price Summary</p>
              <div className="flex flex-col gap-2.5 border-b border-[#E3E3E3] pb-3">
                <PriceLine
                  label={`${fmtXAF(room.price)} × ${nights} night${nights > 1 ? 's' : ''}`}
                  value={fmtXAF(subtotal)}
                />
                <PriceLine label="Cleaning fee" value={fmtXAF(CLEANING_FEE)} />
                <PriceLine label={`Taxes (${Math.round(TAX_RATE * 100)}%)`} value={fmtXAF(taxes)} />
              </div>
              <div className="flex items-center justify-between body-md font-medium text-[#000000]">
                <span>Total</span>
                <span>{fmtXAF(total)}</span>
              </div>
            </div>

            {/* Guest details */}
            <div className="flex flex-col gap-3">
              <p className="heading-md text-[#000000]">Your Details</p>
              <div className="grid grid-cols-2 gap-3">
                <FieldInput
                  label="First name"
                  value={info.firstName}
                  onChange={(v) => setInfo((p) => ({ ...p, firstName: v }))}
                  placeholder="John"
                  required
                />
                <FieldInput
                  label="Last name"
                  value={info.lastName}
                  onChange={(v) => setInfo((p) => ({ ...p, lastName: v }))}
                  placeholder="Smith"
                  required
                />
              </div>
              <FieldInput
                label="Email"
                type="email"
                value={info.email}
                onChange={(v) => setInfo((p) => ({ ...p, email: v }))}
                placeholder="john@example.com"
                required
              />
              <FieldInput
                label="Phone (optional)"
                type="tel"
                value={info.phone}
                onChange={(v) => setInfo((p) => ({ ...p, phone: v }))}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <PrimaryBtn onClick={handleConfirm} disabled={!canConfirm}>
              Confirm Reservation
            </PrimaryBtn>

            <p className="body-sm text-[#585858] text-center">
              No payment taken now — we'll contact you within 24 hours.
            </p>
          </motion.div>
        )}

        {/* ── STEP 3: confirmed ── */}
        {step === 'confirmed' && (
          <motion.div
            key="confirmed"
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            className="flex flex-col items-center gap-6 py-2 text-center"
          >
            <motion.div
              className="w-14 h-14 rounded-full bg-[#141414] flex items-center justify-center shrink-0"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22, delay: 0.1 }}
            >
              <Check size={24} className="text-white" />
            </motion.div>

            <div>
              <p className="heading-lg text-[#000000]">Reservation Requested!</p>
              <p className="body-md text-[#585858] mt-2 max-w-[280px] mx-auto">
                We'll confirm your booking at <strong className="text-[#000000]">{info.email}</strong> within 24 hours.
              </p>
            </div>

            {/* Booking summary card */}
            <div className="w-full rounded-[0.5rem] border border-[#E3E3E3] p-4 flex flex-col gap-2.5 text-left">
              {[
                { label: 'Reference',  value: bookingRef,                             mono: true },
                { label: 'Room',       value: room.name },
                { label: 'Check-in',   value: fmtDate(checkIn,  { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) },
                { label: 'Check-out',  value: fmtDate(checkOut, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) },
                { label: 'Guests',     value: `${guests} guest${guests > 1 ? 's' : ''}` },
              ].map(({ label, value, mono }) => (
                <div key={label} className="flex items-center justify-between gap-3 body-sm">
                  <span className="text-[#585858] shrink-0">{label}</span>
                  <span className={`text-[#000000] text-right ${mono ? 'font-mono font-semibold tracking-wide' : ''}`}>
                    {value}
                  </span>
                </div>
              ))}
              <div className="h-px bg-[#E3E3E3] my-0.5" />
              <div className="flex items-center justify-between body-md font-medium">
                <span className="text-[#585858]">Total</span>
                <span className="text-[#000000]">{fmtXAF(total)}</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleViewBookings}
                className="w-full py-2.5 bg-brand-black text-white rounded-[0.5rem] body-sm font-medium hover:bg-[#2a2a2a] transition-colors"
              >
                View my bookings
              </button>
              <button
                type="button"
                onClick={reset}
                className="body-sm text-text-secondary hover:text-text-primary hover:underline transition-colors"
              >
                Make another booking
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
