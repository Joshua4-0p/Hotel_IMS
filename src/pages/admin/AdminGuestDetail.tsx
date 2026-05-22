import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Crown, Mail, Phone, MapPin, CalendarDays,
  DollarSign, FileText, Send,
} from 'lucide-react';

import { useAdminData } from '../../context/AdminDataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmtXAF = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 });

const fmtDate = (s?: string) => s
  ? new Date(s + (s.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  : '—';


const BOOKING_STATUS_STYLES: Record<string, string> = {
  confirmed:   'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400',
  pending:     'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
  checked_in:  'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
  checked_out: 'bg-[#f3f4f6] text-text-secondary border-[#e5e7eb] dark:bg-[#2a2a2a] dark:text-[#9ca3af]',
  cancelled:   'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400',
};
const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmed', pending: 'Pending', checked_in: 'Checked In',
  checked_out: 'Checked Out', cancelled: 'Cancelled',
};

const NOTES_STORAGE_KEY = 'lodr_guest_notes';

function loadNotes(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY) ?? '{}'); }
  catch { return {}; }
}
function saveNotes(notes: Record<string, string>) {
  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
}

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

export function AdminGuestDetail() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { guests, allBookings, updateGuest } = useAdminData();

  const guest = guests.find((g) => g.id === id);

  const [notes,       setNotes]       = useState('');
  const [notesDirty,  setNotesDirty]  = useState(false);
  const [blockDialog, setBlockDialog] = useState(false);

  // Load persisted notes for this guest
  useEffect(() => {
    if (!id) return;
    const all = loadNotes();
    setNotes(all[id] ?? '');
  }, [id]);

  if (!guest) {
    return (
      <div className="p-6 flex flex-col items-center justify-center gap-4 min-h-[40vh]">
        <p className="text-text-secondary dark:text-[#9ca3af]">Guest not found.</p>
        <Button variant="outline" onClick={() => navigate('/admin/guests')}>← Back to Guests</Button>
      </div>
    );
  }

  const guestBookings = [...allBookings]
    .filter((b) => b.guestEmail.toLowerCase() === guest.email.toLowerCase())
    .sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());

  const isVip    = guest.status === 'vip';
  const isActive = guest.status !== 'inactive';
  const revenue  = guestBookings
    .filter((b) => ['confirmed', 'checked_in', 'checked_out'].includes(b.status))
    .reduce((sum, b) => sum + b.totalPrice, 0);

  function toggleVip() {
    updateGuest(guest!.id, { status: isVip ? 'active' : 'vip' });
  }

  function toggleBlock() {
    updateGuest(guest!.id, { status: isActive ? 'inactive' : 'active' });
    setBlockDialog(false);
  }

  function saveNotesFn() {
    const all = loadNotes();
    all[guest!.id] = notes;
    saveNotes(all);
    setNotesDirty(false);
  }

  return (
    <div className="p-6 max-w-275 mx-auto flex flex-col gap-6">
      {/* Back */}
      <Button
        variant="ghost" size="sm"
        onClick={() => navigate('/admin/guests')}
        className="gap-1.5 text-text-secondary dark:text-[#9ca3af] -ml-2 self-start"
      >
        <ArrowLeft size={15} /> Guests
      </Button>

      {/* Header */}
      <div className="flex items-start gap-4 flex-wrap">
        <div className="w-14 h-14 rounded-full bg-[#f3f4f6] dark:bg-[#2a2a2a] flex items-center justify-center shrink-0">
          <span className="text-xl font-bold text-text-secondary dark:text-[#9ca3af]">
            {guest.name.charAt(0)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-[#111111] dark:text-white flex items-center gap-2 flex-wrap">
            {guest.name}
            {isVip && <Crown size={18} className="text-purple-500" />}
          </h1>
          <p className="text-sm text-text-secondary dark:text-[#9ca3af] mt-0.5">
            Guest since {fmtDate(guest.joinedAt)} · {guest.city}, {guest.country}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <a
            href={`mailto:${guest.email}`}
            className="inline-flex items-center gap-1.5 px-3 h-9 rounded-button border border-[#e5e7eb] dark:border-[#2e2e2e] bg-white dark:bg-[#1e1e1e] text-sm font-medium text-text-secondary dark:text-[#9ca3af] hover:text-[#111111] dark:hover:text-white hover:border-[#111111] transition-colors"
          >
            <Send size={14} /> Send Email
          </a>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBlockDialog(true)}
            className={`gap-1.5 ${
              !isActive
                ? 'text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800/50'
                : 'text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800/50'
            }`}
          >
            {isActive ? 'Block Guest' : 'Unblock Guest'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: contact + VIP + notes */}
        <div className="flex flex-col gap-4">
          {/* Contact info */}
          <Card className="bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e]"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
          >
            <CardHeader className="px-5 pt-5 pb-4">
              <CardTitle className="text-base font-semibold text-[#111111] dark:text-white">Contact</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 flex flex-col gap-4">
              <DetailRow icon={<Mail size={15} />}    label="Email"    value={guest.email} />
              <DetailRow icon={<Phone size={15} />}   label="Phone"    value={guest.phone} />
              <DetailRow icon={<MapPin size={15} />}  label="Location" value={`${guest.city}, ${guest.country}`} />
              <DetailRow icon={<CalendarDays size={15} />} label="Joined" value={fmtDate(guest.joinedAt)} />
              {guest.lastStay && (
                <DetailRow icon={<CalendarDays size={15} />} label="Last Stay" value={fmtDate(guest.lastStay)} />
              )}
            </CardContent>
          </Card>

          {/* VIP toggle */}
          <Card className="bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e]"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
          >
            <CardContent className="px-5 py-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#111111] dark:text-white flex items-center gap-1.5">
                  <Crown size={14} className="text-purple-500" /> VIP Status
                </p>
                <p className="text-xs text-[#9ca3af] mt-0.5">
                  VIP guests get priority service
                </p>
              </div>
              <Switch checked={isVip} onCheckedChange={toggleVip} />
            </CardContent>
          </Card>

          {/* Internal notes */}
          <Card className="bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e]"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
          >
            <CardHeader className="px-5 pt-5 pb-4">
              <CardTitle className="text-base font-semibold text-[#111111] dark:text-white flex items-center gap-2">
                <FileText size={15} className="text-[#9ca3af]" /> Internal Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 flex flex-col gap-3">
              <Textarea
                value={notes}
                onChange={(e) => { setNotes(e.target.value); setNotesDirty(true); }}
                placeholder="Add private notes about this guest…"
                rows={4}
              />
              {notesDirty && (
                <div className="flex justify-end">
                  <Button size="sm" onClick={saveNotesFn}
                    className="bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb]"
                  >
                    Save Notes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: stats + booking history */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <CalendarDays size={16} className="text-blue-600" />, bg: 'bg-blue-50 dark:bg-blue-900/20',
                label: 'Total Bookings', value: String(guestBookings.length || guest.totalBookings) },
              { icon: <DollarSign size={16} className="text-emerald-600" />, bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                label: 'Total Spent', value: fmtXAF(revenue || guest.totalSpent) },
              { icon: <Crown size={16} className="text-purple-600" />, bg: 'bg-purple-50 dark:bg-purple-900/20',
                label: 'Account Type', value: isVip ? 'VIP' : 'Standard' },
            ].map((item) => (
              <Card key={item.label} className="bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e]"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
              >
                <CardContent className="px-4 py-4">
                  <div className={`w-8 h-8 rounded-button flex items-center justify-center mb-3 ${item.bg}`}>
                    {item.icon}
                  </div>
                  <p className="text-lg font-bold text-[#111111] dark:text-white font-mono leading-none">{item.value}</p>
                  <p className="text-xs text-[#9ca3af] mt-1">{item.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Booking history */}
          <Card className="bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e] overflow-hidden"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
          >
            <CardHeader className="px-5 py-4 border-b border-[#e5e7eb] dark:border-[#2e2e2e]">
              <CardTitle className="text-base font-semibold text-[#111111] dark:text-white">
                Booking History <span className="text-[#9ca3af] font-normal text-sm ml-1">({guestBookings.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {guestBookings.length === 0 ? (
                <p className="text-center text-sm text-[#9ca3af] py-8">No bookings found for this guest.</p>
              ) : (
                <div className="divide-y divide-[#f3f4f6] dark:divide-[#2e2e2e]">
                  {guestBookings.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-brand-cream dark:hover:bg-[#252525] transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/bookings/${b.id}`)}
                    >
                      <img src={b.roomImage} alt={b.roomName}
                        className="w-12 h-9 object-cover rounded-button shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-[#111111] dark:text-white">{b.roomName}</p>
                        <p className="text-xs text-[#9ca3af]">
                          {fmtDate(b.checkIn)} → {fmtDate(b.checkOut)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-xs font-medium text-[#111111] dark:text-white hidden sm:inline">
                          {fmtXAF(b.totalPrice)}
                        </span>
                        <span className={`label px-2 py-0.5 rounded-full border text-[11px] ${BOOKING_STATUS_STYLES[b.status] ?? ''}`}>
                          {STATUS_LABELS[b.status] ?? b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Spend summary */}
          {guestBookings.length > 0 && (
            <Card className="bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e]"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
            >
              <CardContent className="px-5 py-4 flex flex-col gap-2">
                {[
                  { label: 'Confirmed stays', value: fmtXAF(guestBookings.filter((b) => ['confirmed','checked_in','checked_out'].includes(b.status)).reduce((s,b)=>s+b.totalPrice,0)) },
                  { label: 'Cancelled bookings', value: String(guestBookings.filter((b) => b.status === 'cancelled').length) },
                  { label: 'Avg spend per stay', value: guestBookings.length > 0 ? fmtXAF(Math.round(revenue / Math.max(guestBookings.filter((b)=>b.status!=='cancelled').length, 1))) : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-text-secondary dark:text-[#9ca3af]">{label}</span>
                    <span className="font-medium text-[#111111] dark:text-white font-mono text-xs">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Block/Unblock dialog */}
      <Dialog open={blockDialog} onOpenChange={setBlockDialog}>
        <DialogContent className="max-w-sm bg-white dark:bg-[#1e1e1e] border-[#e5e7eb] dark:border-[#2e2e2e]">
          <DialogHeader>
            <DialogTitle className="text-[#111111] dark:text-white">
              {isActive ? 'Block Guest?' : 'Unblock Guest?'}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-text-secondary dark:text-[#9ca3af]">
            {isActive
              ? `${guest.name} will be marked as inactive and won't appear in active guest lists.`
              : `${guest.name} will be restored to active status.`}
          </p>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setBlockDialog(false)}>Cancel</Button>
            <Button
              onClick={toggleBlock}
              className={isActive
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb]'}
            >
              {isActive ? 'Block Guest' : 'Unblock Guest'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
