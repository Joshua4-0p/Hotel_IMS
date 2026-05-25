import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, BedDouble, CalendarDays, Phone, Mail, FileText, Trash2 } from 'lucide-react';

import { useAdminData } from '../../context/AdminDataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmtXAF = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 });

const fmtDate = (s: string) =>
  new Date(s + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });

const fmtDateTime = (s: string) =>
  new Date(s).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  confirmed:   { label: 'Confirmed',   className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400' },
  pending:     { label: 'Pending',     className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400' },
  checked_in:  { label: 'Checked In',  className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400' },
  checked_out: { label: 'Checked Out', className: 'bg-[#f3f4f6] text-text-secondary border-[#e5e7eb] dark:bg-[#2a2a2a] dark:text-[#9ca3af]' },
  cancelled:   { label: 'Cancelled',   className: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400' },
};

// ── Detail row ─────────────────────────────────────────────────────────────────
function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-[#9ca3af] shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-[#9ca3af] font-medium uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm text-[#111111] dark:text-white">{value}</p>
      </div>
    </div>
  );
}

// ── Status transition map ──────────────────────────────────────────────────────
const TRANSITIONS: Record<string, { label: string; next: string; variant: 'default' | 'destructive' }[]> = {
  pending:    [
    { label: 'Confirm',    next: 'confirmed', variant: 'default'      },
    { label: 'Cancel',     next: 'cancelled', variant: 'destructive'  },
  ],
  confirmed:  [
    { label: 'Check In',   next: 'checked_in',  variant: 'default'   },
    { label: 'Cancel',     next: 'cancelled',   variant: 'destructive' },
  ],
  checked_in: [
    { label: 'Check Out',  next: 'checked_out', variant: 'default'   },
  ],
  checked_out: [],
  cancelled:  [],
};

export function AdminBookingDetail() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { allBookings, updateAdminBooking, deleteAdminBooking } = useAdminData();

  const booking = allBookings.find((b) => b.id === id);

  const [notes,           setNotes]          = useState(booking?.notes ?? '');
  const [notesDirty,      setNotesDirty]     = useState(false);
  const [deleteDialog,    setDeleteDialog]   = useState(false);
  const [confirmTransition, setConfirmTransition] = useState<{ label: string; next: string; variant: 'default' | 'destructive' } | null>(null);

  if (!booking) {
    return (
      <div className="p-6 flex flex-col items-center justify-center gap-4 min-h-[40vh]">
        <p className="text-text-secondary dark:text-[#9ca3af]">Booking not found.</p>
        <Button variant="outline" onClick={() => navigate('/admin/bookings')}>
          ← Back to Bookings
        </Button>
      </div>
    );
  }

  const nights = Math.max(0,
    Math.round((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / 86400000),
  );

  const cfg = STATUS_CONFIG[booking.status];
  const transitions = TRANSITIONS[booking.status] ?? [];

  function confirmAndChange() {
    if (!confirmTransition) return;
    updateAdminBooking(booking!.id, { status: confirmTransition.next as AdminBooking['status'] });
    setConfirmTransition(null);
  }

  function handleSaveNotes() {
    updateAdminBooking(booking!.id, { notes });
    setNotesDirty(false);
  }

  function handleDelete() {
    deleteAdminBooking(booking!.id);
    navigate('/admin/bookings', { replace: true });
  }

  return (
    <div className="p-6 max-w-275 mx-auto flex flex-col gap-6">
      {/* Back + header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/bookings')}
            className="gap-1.5 text-text-secondary dark:text-[#9ca3af] -ml-2"
          >
            <ArrowLeft size={15} /> Bookings
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800/50 dark:hover:bg-red-900/10"
          onClick={() => setDeleteDialog(true)}
        >
          <Trash2 size={14} /> Delete
        </Button>
      </div>

      <div className="flex items-start gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] dark:text-white">
            Booking #{booking.id.toUpperCase()}
          </h1>
          <p className="text-sm text-text-secondary dark:text-[#9ca3af] mt-0.5">
            Created {fmtDateTime(booking.bookedAt)}
          </p>
        </div>
        <span className={`ml-auto label px-3 py-1 rounded-full border text-xs ${cfg.className}`}>
          {cfg.label}
        </span>
      </div>

      {/* Status actions */}
      {transitions.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap p-4 bg-brand-cream dark:bg-[#2a2a2a] rounded-button">
          <span className="text-sm text-text-secondary dark:text-[#9ca3af] mr-1">Status actions:</span>
          {transitions.map((t) => (
            <Button
              key={t.next}
              variant={t.variant}
              size="sm"
              onClick={() => setConfirmTransition(t)}
              className={t.variant === 'default'
                ? 'bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb]'
                : ''}
            >
              {t.label}
            </Button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: details */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Room info */}
          <Card className="bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e]"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
          >
            <CardHeader className="px-5 pt-5 pb-4">
              <CardTitle className="text-base font-semibold text-[#111111] dark:text-white flex items-center gap-2">
                <BedDouble size={16} className="text-[#9ca3af]" />
                Room Details
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="flex items-start gap-4">
                <img
                  src={booking.roomImage}
                  alt={booking.roomName}
                  className="w-24 h-16 object-cover rounded-button shrink-0"
                />
                <div className="flex flex-col gap-2 flex-1">
                  <p className="font-semibold text-[#111111] dark:text-white">{booking.roomName}</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <span className="text-[#9ca3af]">Check-in</span>
                    <span className="text-[#111111] dark:text-white font-medium">{fmtDate(booking.checkIn)}</span>
                    <span className="text-[#9ca3af]">Check-out</span>
                    <span className="text-[#111111] dark:text-white font-medium">{fmtDate(booking.checkOut)}</span>
                    <span className="text-[#9ca3af]">Duration</span>
                    <span className="text-[#111111] dark:text-white font-medium">{nights} night{nights !== 1 ? 's' : ''}</span>
                    <span className="text-[#9ca3af]">Guests</span>
                    <span className="text-[#111111] dark:text-white font-medium">{booking.guests}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guest info */}
          <Card className="bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e]"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
          >
            <CardHeader className="px-5 pt-5 pb-4">
              <CardTitle className="text-base font-semibold text-[#111111] dark:text-white flex items-center gap-2">
                <User size={16} className="text-[#9ca3af]" />
                Guest Information
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 flex flex-col gap-4">
              <DetailRow icon={<User size={15} />}  label="Name"  value={booking.guestName} />
              <DetailRow icon={<Mail size={15} />}  label="Email" value={booking.guestEmail} />
              <DetailRow icon={<Phone size={15} />} label="Phone" value={booking.guestPhone} />
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e]"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
          >
            <CardHeader className="px-5 pt-5 pb-4">
              <CardTitle className="text-base font-semibold text-[#111111] dark:text-white flex items-center gap-2">
                <FileText size={16} className="text-[#9ca3af]" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 flex flex-col gap-3">
              <Textarea
                value={notes}
                onChange={(e) => { setNotes(e.target.value); setNotesDirty(true); }}
                placeholder="Add internal notes about this booking…"
                rows={4}
              />
              {notesDirty && (
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleSaveNotes}
                    className="bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb]"
                  >
                    Save Notes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: pricing */}
        <div>
          <Card className="bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e] sticky top-6"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
          >
            <CardHeader className="px-5 pt-5 pb-4">
              <CardTitle className="text-base font-semibold text-[#111111] dark:text-white flex items-center gap-2">
                <CalendarDays size={16} className="text-[#9ca3af]" />
                Price Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary dark:text-[#9ca3af]">Room rate</span>
                <span className="text-[#111111] dark:text-white font-mono">
                  {fmtXAF(Math.round(booking.totalPrice / 1.12 - 27000 / 1.12))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary dark:text-[#9ca3af]">Cleaning fee</span>
                <span className="text-[#111111] dark:text-white font-mono">XAF 27,000</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary dark:text-[#9ca3af]">Taxes (12%)</span>
                <span className="text-[#111111] dark:text-white font-mono">
                  {fmtXAF(Math.round(booking.totalPrice - (booking.totalPrice / 1.12)))}
                </span>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between">
                <span className="font-semibold text-[#111111] dark:text-white">Total</span>
                <span className="font-bold text-[#111111] dark:text-white font-mono text-base">
                  {fmtXAF(booking.totalPrice)}
                </span>
              </div>

              <div className="mt-2 p-3 bg-brand-cream dark:bg-[#2a2a2a] rounded-button text-xs text-[#9ca3af] flex flex-col gap-1">
                <div className="flex justify-between">
                  <span>Duration</span>
                  <span>{nights} night{nights !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span>Source</span>
                  <span>{booking.source === 'walk_in' ? 'Walk-in (front desk)' : 'Online (by guest)'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Booking ID</span>
                  <span className="uppercase">{booking.id}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status transition confirmation */}
      <Dialog open={!!confirmTransition} onOpenChange={(v) => !v && setConfirmTransition(null)}>
        <DialogContent className="max-w-sm bg-white dark:bg-[#1e1e1e] border-[#e5e7eb] dark:border-[#2e2e2e]">
          <DialogHeader>
            <DialogTitle className="text-[#111111] dark:text-white">
              Confirm: {confirmTransition?.label}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-text-secondary dark:text-[#9ca3af]">
            {confirmTransition?.next === 'checked_in' && (
              <>Check in <strong className="text-[#111111] dark:text-white">{booking.guestName}</strong> for <strong className="text-[#111111] dark:text-white">{booking.roomName}</strong>? The room will be marked as occupied.</>
            )}
            {confirmTransition?.next === 'checked_out' && (
              <>Check out <strong className="text-[#111111] dark:text-white">{booking.guestName}</strong>? The room will be released and the guest may be prompted to leave a review.</>
            )}
            {confirmTransition?.next === 'cancelled' && (
              <>Cancel booking <strong className="text-[#111111] dark:text-white">{booking.id.toUpperCase()}</strong> for <strong className="text-[#111111] dark:text-white">{booking.guestName}</strong>? This action cannot be undone.</>
            )}
            {confirmTransition?.next === 'confirmed' && (
              <>Confirm booking <strong className="text-[#111111] dark:text-white">{booking.id.toUpperCase()}</strong> for <strong className="text-[#111111] dark:text-white">{booking.guestName}</strong>?</>
            )}
          </p>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setConfirmTransition(null)}>Cancel</Button>
            <Button
              variant={confirmTransition?.variant === 'destructive' ? 'destructive' : 'default'}
              className={confirmTransition?.variant !== 'destructive'
                ? 'bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb]'
                : ''}
              onClick={confirmAndChange}
            >
              {confirmTransition?.label}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="max-w-sm bg-white dark:bg-[#1e1e1e] border-[#e5e7eb] dark:border-[#2e2e2e]">
          <DialogHeader>
            <DialogTitle className="text-[#111111] dark:text-white">Delete Booking?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-text-secondary dark:text-[#9ca3af]">
            This will permanently remove booking <strong className="text-[#111111] dark:text-white">{booking.id.toUpperCase()}</strong> for <strong className="text-[#111111] dark:text-white">{booking.guestName}</strong>. This action cannot be undone.
          </p>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Type needed inside the component — re-exported from context
type AdminBooking = import('../../context/AdminDataContext').AdminBooking;
