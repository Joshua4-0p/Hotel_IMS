import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BedDouble, Users, Ruler, CalendarDays } from 'lucide-react';

import { useAdminData } from '../../context/AdminDataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmtXAF = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 });

const fmtDate = (s: string) =>
  new Date(s + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const CATEGORY_STYLES: Record<string, string> = {
  Standard: 'bg-[#f3f4f6] text-text-secondary border-[#e5e7eb] dark:bg-[#2a2a2a] dark:text-[#9ca3af]',
  Deluxe:   'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
  Suite:    'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400',
};

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

export function AdminRoomDetail() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { allRooms, allBookings } = useAdminData();

  const room = allRooms.find((r) => r.id === id);

  if (!room) {
    return (
      <div className="p-6 flex flex-col items-center justify-center gap-4 min-h-[40vh]">
        <p className="text-text-secondary dark:text-[#9ca3af]">Room not found.</p>
        <Button variant="outline" onClick={() => navigate('/admin/rooms')}>
          ← Back to Rooms
        </Button>
      </div>
    );
  }

  const roomBookings = [...allBookings]
    .filter((b) => b.roomId === room.id)
    .sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());

  const revenue = roomBookings
    .filter((b) => ['confirmed', 'checked_in', 'checked_out'].includes(b.status))
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const today = new Date().toISOString().split('T')[0];
  const currentBooking = roomBookings.find(
    (b) => b.status === 'checked_in' ||
      (b.status === 'confirmed' && b.checkIn <= today && b.checkOut > today),
  );

  return (
    <div className="p-6 max-w-275 mx-auto flex flex-col gap-6">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/admin/rooms')}
        className="gap-1.5 text-text-secondary dark:text-[#9ca3af] -ml-2 self-start"
      >
        <ArrowLeft size={15} /> Rooms
      </Button>

      {/* Room hero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image gallery */}
        <div className="flex flex-col gap-2">
          <img
            src={room.images[0]}
            alt={room.name}
            className="w-full h-56 object-cover rounded-card"
          />
          {room.images.length > 1 && (
            <div className="grid grid-cols-3 gap-2">
              {room.images.slice(1).map((img, i) => (
                <img key={i} src={img} alt="" className="w-full h-20 object-cover rounded-button" />
              ))}
            </div>
          )}
        </div>

        {/* Room info */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-[#111111] dark:text-white">{room.name}</h1>
              <span className={`label px-2 py-0.5 rounded-full border text-[11px] ${CATEGORY_STYLES[room.category]}`}>
                {room.category}
              </span>
            </div>
            <p className="text-sm text-text-secondary dark:text-[#9ca3af] leading-relaxed">
              {room.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <BedDouble size={15} />, label: 'Bed Type',  value: room.bedType },
              { icon: <Ruler size={15} />,     label: 'Room Size', value: room.size },
              { icon: <Users size={15} />,     label: 'Capacity',  value: `${room.capacity} guests` },
              { icon: <CalendarDays size={15} />, label: 'Bookings', value: `${roomBookings.length} total` },
            ].map((item) => (
              <div key={item.label} className="p-3 bg-brand-cream dark:bg-[#2a2a2a] rounded-button flex items-start gap-2.5">
                <span className="text-[#9ca3af] mt-0.5 shrink-0">{item.icon}</span>
                <div>
                  <p className="text-xs text-[#9ca3af] font-medium uppercase tracking-wide">{item.label}</p>
                  <p className="text-sm font-semibold text-[#111111] dark:text-white">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Price + revenue */}
          <Card className="bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e]">
            <CardContent className="px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs text-[#9ca3af] font-medium uppercase tracking-wide mb-0.5">Rate / Night</p>
                <p className="text-xl font-bold text-[#111111] dark:text-white font-mono">{fmtXAF(room.price)}</p>
              </div>
              <Separator orientation="vertical" className="h-10 hidden sm:block" />
              <div>
                <p className="text-xs text-[#9ca3af] font-medium uppercase tracking-wide mb-0.5">Total Revenue</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">{fmtXAF(revenue)}</p>
              </div>
              <div>
                <p className="text-xs text-[#9ca3af] font-medium uppercase tracking-wide mb-0.5">Current Status</p>
                {currentBooking ? (
                  <span className="label px-2 py-0.5 rounded-full border text-[11px] bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400">
                    Occupied — {currentBooking.guestName}
                  </span>
                ) : (
                  <span className="label px-2 py-0.5 rounded-full border text-[11px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400">
                    Available
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <div>
            <p className="text-xs text-[#9ca3af] font-medium uppercase tracking-wide mb-2">Amenities</p>
            <div className="flex flex-wrap gap-1.5">
              {room.amenities.map((a) => (
                <span key={a} className="text-xs px-2.5 py-1 bg-[#f3f4f6] dark:bg-[#2a2a2a] text-text-secondary dark:text-[#9ca3af] rounded-full border border-[#e5e7eb] dark:border-[#3a3a3a]">
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Booking history */}
      <Card className="bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e]"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
      >
        <CardHeader className="px-5 pt-5 pb-4 border-b border-[#e5e7eb] dark:border-[#2e2e2e]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-[#111111] dark:text-white">
              Booking History
            </CardTitle>
            <span className="text-xs text-[#9ca3af]">{roomBookings.length} reservation{roomBookings.length !== 1 ? 's' : ''}</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {roomBookings.length === 0 ? (
            <p className="text-center text-sm text-[#9ca3af] py-8">No bookings for this room yet.</p>
          ) : (
            <div className="divide-y divide-[#f3f4f6] dark:divide-[#2e2e2e]">
              {roomBookings.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-brand-cream dark:hover:bg-[#252525] transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/bookings/${b.id}`)}
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-[#111111] dark:text-white">{b.guestName}</p>
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
    </div>
  );
}
