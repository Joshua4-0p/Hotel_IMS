import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const REVIEWS_KEY       = 'lodr_admin_reviews';
const NOTIFIED_LS_KEY   = 'lodr_review_notified_ids';
const SESSION_SHOWN_KEY = 'lodr_review_prompt_shown';

interface PendingEntry {
  bookingId: string;
  roomId: string;
  roomName: string;
  roomImage: string;
  rating: number;
  quote: string;
}

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
            size={26}
            fill={i <= (hover || value) ? 'currentColor' : 'none'}
            className={i <= (hover || value) ? 'text-amber-400' : 'text-[#d1d5db] dark:text-[#4b5563]'}
          />
        </button>
      ))}
    </div>
  );
}

export function ReviewPromptModal() {
  const { isAuthenticated, user, bookings, markReviewed, addReviewNotification } = useAuth();
  const [open,    setOpen]    = useState(false);
  const [entries, setEntries] = useState<PendingEntry[]>([]);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!isAuthenticated) return;
    if (sessionStorage.getItem(SESSION_SHOWN_KEY)) return;

    const eligible = bookings.filter(
      (b) => b.status === 'confirmed' && b.checkOut <= today && !b.hasReviewed,
    );
    if (eligible.length === 0) return;

    sessionStorage.setItem(SESSION_SHOWN_KEY, '1');

    // Add a review notification once per booking (persisted across sessions)
    const notifiedIds: string[] = JSON.parse(
      localStorage.getItem(NOTIFIED_LS_KEY) ?? '[]',
    );
    const toNotify = eligible.filter((b) => !notifiedIds.includes(b.id));
    toNotify.forEach((b) => addReviewNotification(b.roomName));
    if (toNotify.length > 0) {
      localStorage.setItem(
        NOTIFIED_LS_KEY,
        JSON.stringify([...notifiedIds, ...toNotify.map((b) => b.id)]),
      );
    }

    setEntries(
      eligible.map((b) => ({
        bookingId: b.id,
        roomId:    b.roomId,
        roomName:  b.roomName,
        roomImage: b.roomImage,
        rating:    0,
        quote:     '',
      })),
    );
    setOpen(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  function updateEntry(bookingId: string, patch: Partial<PendingEntry>) {
    setEntries((prev) => prev.map((e) => e.bookingId === bookingId ? { ...e, ...patch } : e));
  }

  function handleSubmit() {
    const toReview = entries.filter((e) => e.rating > 0);

    if (toReview.length > 0) {
      const existing: object[] = JSON.parse(localStorage.getItem(REVIEWS_KEY) ?? '[]');
      const newReviews = toReview.map((e) => ({
        id:       'grev_' + Math.random().toString(36).slice(2, 9),
        name:     user?.name ?? 'Anonymous',
        location: user?.location || 'Guest',
        rating:   e.rating,
        quote:    e.quote.trim(),
        roomId:   e.roomId,
        roomName: e.roomName,
        status:   'approved',
        featured: false,
        date:     today,
      }));
      localStorage.setItem(REVIEWS_KEY, JSON.stringify([...newReviews, ...existing]));
      toReview.forEach((e) => markReviewed(e.bookingId));
    }

    setOpen(false);
  }

  if (!open || entries.length === 0) return null;

  const plural = entries.length > 1;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setOpen(false); }}>
      <DialogContent className="max-w-lg bg-white dark:bg-[#1e1e1e] border-[#e5e7eb] dark:border-[#2e2e2e] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#111111] dark:text-white text-lg">
            We'd love your feedback!
          </DialogTitle>
          <p className="text-sm text-text-secondary dark:text-[#9ca3af] mt-1">
            Rate your recent {plural ? 'stays' : 'stay'} to help other guests discover Lodr Hotel.
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-1">
          {entries.map((entry, idx) => (
            <div key={entry.bookingId} className="flex flex-col gap-3">
              {idx > 0 && <div className="border-t border-[#e5e7eb] dark:border-[#2e2e2e]" />}
              <div className="flex items-center gap-3">
                <img
                  src={entry.roomImage}
                  alt={entry.roomName}
                  className="w-14 h-10 object-cover rounded-button shrink-0"
                />
                <div>
                  <p className="text-sm font-semibold text-[#111111] dark:text-white">{entry.roomName}</p>
                  <p className="text-xs text-[#9ca3af]">How was your stay?</p>
                </div>
              </div>
              <StarInput
                value={entry.rating}
                onChange={(r) => updateEntry(entry.bookingId, { rating: r })}
              />
              <Textarea
                placeholder="Tell us about your experience (optional)…"
                rows={2}
                value={entry.quote}
                onChange={(e) => updateEntry(entry.bookingId, { quote: e.target.value })}
                className="text-sm resize-none"
              />
            </div>
          ))}
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={entries.every((e) => e.rating === 0)}
            className="bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb]"
          >
            Submit {plural ? 'Reviews' : 'Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
