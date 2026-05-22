import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Printer, Filter } from 'lucide-react';

import { useAdminData } from '../../context/AdminDataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

// ── Helpers ────────────────────────────────────────────────────────────────────
function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function toYMD(d: Date): string {
  return d.toISOString().split('T')[0];
}
function fmtMonDay(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function fmtWeekday(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  confirmed:   { bg: 'bg-blue-500',    text: 'text-white', border: 'border-blue-600'  },
  pending:     { bg: 'bg-amber-400',   text: 'text-white', border: 'border-amber-500' },
  checked_in:  { bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-600' },
  checked_out: { bg: 'bg-[#aaaaaa]',   text: 'text-white', border: 'border-[#999999]' },
  cancelled:   { bg: 'bg-[#cccccc]',   text: 'text-[#555555]', border: 'border-[#bbbbbb]' },
};

const VIEW_DAYS: Record<string, number> = { week: 7, '2week': 14, month: 30 };

// ── Quick booking dialog (pre-filled room + date) ─────────────────────────────
function QuickBookDialog({
  room, date, open, onClose,
}: {
  room: { id: string; name: string } | null;
  date: string;
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  if (!room) return null;
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xs bg-white dark:bg-[#1e1e1e] border-[#e5e7eb] dark:border-[#2e2e2e]">
        <DialogHeader>
          <DialogTitle className="text-[#111111] dark:text-white text-base">Quick Booking</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-text-secondary dark:text-[#9ca3af]">
          Create a new booking for <strong className="text-[#111111] dark:text-white">{room.name}</strong> starting <strong className="text-[#111111] dark:text-white">{date}</strong>?
        </p>
        <DialogFooter className="gap-2 mt-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm"
            className="bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111]"
            onClick={() => { onClose(); navigate('/admin/bookings'); }}
          >
            Open Bookings Form
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Calendar ─────────────────────────────────────────────────────────────
export function AdminCalendar() {
  const navigate              = useNavigate();
  const { allRooms, allBookings } = useAdminData();
  const scrollRef             = useRef<HTMLDivElement>(null);

  const [view,        setView]        = useState<'week' | '2week' | 'month'>('2week');
  const [startDate,   setStartDate]   = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 3); // start a few days before today
    return d;
  });
  const [catFilter,   setCatFilter]   = useState('all');
  const [tooltip,     setTooltip]     = useState<{ bookingId: string; x: number; y: number } | null>(null);
  const [quickBook,   setQuickBook]   = useState<{ room: { id: string; name: string }; date: string } | null>(null);

  const numDays = VIEW_DAYS[view];

  const days = useMemo(() =>
    Array.from({ length: numDays }, (_, i) => addDays(startDate, i)),
    [startDate, numDays],
  );

  const today = toYMD(new Date());

  const rooms = useMemo(() =>
    catFilter === 'all'
      ? allRooms
      : allRooms.filter((r) => r.category === catFilter),
    [allRooms, catFilter],
  );

  const tooltipBooking = tooltip
    ? allBookings.find((b) => b.id === tooltip.bookingId)
    : null;

  function prevPeriod() { setStartDate((d) => addDays(d, -numDays)); }
  function nextPeriod() { setStartDate((d) => addDays(d,  numDays)); }
  function goToday()   { setStartDate(addDays(new Date(), -3)); }

  // For each booking, compute its position within the visible day range
  function getBookingBar(booking: (typeof allBookings)[0]) {
    const rangeStart = toYMD(days[0]);
    const rangeEnd   = toYMD(addDays(days[days.length - 1], 1));
    if (booking.checkOut <= rangeStart || booking.checkIn >= rangeEnd) return null;

    const clampedStart = booking.checkIn  > rangeStart ? booking.checkIn  : rangeStart;
    const clampedEnd   = booking.checkOut < rangeEnd   ? booking.checkOut : rangeEnd;

    const startIdx = days.findIndex((d) => toYMD(d) === clampedStart);
    const endIdx   = days.findIndex((d) => toYMD(d) === clampedEnd);
    const finalEnd = endIdx === -1 ? days.length : endIdx;

    if (startIdx === -1) return null;

    return {
      startIdx,
      span: Math.max(1, finalEnd - startIdx),
      clipped: booking.checkIn < rangeStart || booking.checkOut > rangeEnd,
    };
  }

  return (
    <div className="p-6 max-w-350 mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] dark:text-white">Availability Calendar</h1>
          <p className="text-sm text-text-secondary dark:text-[#9ca3af] mt-0.5">
            {fmtMonDay(days[0])} — {fmtMonDay(days[days.length - 1])}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={goToday}
            className="text-xs text-text-secondary dark:text-[#9ca3af]"
          >
            Today
          </Button>
          <div className="flex border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-button overflow-hidden">
            {(['week', '2week', 'month'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  view === v
                    ? 'bg-brand-black text-white dark:bg-white dark:text-[#111111]'
                    : 'bg-white dark:bg-[#1e1e1e] text-text-secondary dark:text-[#9ca3af] hover:bg-[#f3f4f6] dark:hover:bg-[#252525]'
                }`}
              >
                {v === 'week' ? 'Week' : v === '2week' ? '2 Weeks' : 'Month'}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => window.print()}
            className="gap-1.5 text-text-secondary dark:text-[#9ca3af]"
          >
            <Printer size={14} /> Export
          </Button>
        </div>
      </div>

      {/* Filters + Nav */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="outline" size="sm" onClick={prevPeriod} className="h-8 w-8 p-0">
          <ChevronLeft size={14} />
        </Button>
        <Button variant="outline" size="sm" onClick={nextPeriod} className="h-8 w-8 p-0">
          <ChevronRight size={14} />
        </Button>

        <div className="flex items-center gap-2 ml-2">
          <Filter size={13} className="text-[#9ca3af]" />
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Standard">Standard</SelectItem>
              <SelectItem value="Deluxe">Deluxe</SelectItem>
              <SelectItem value="Suite">Suite</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 ml-auto flex-wrap">
          {[
            { label: 'Confirmed',   cls: 'bg-blue-500' },
            { label: 'Checked In',  cls: 'bg-emerald-500' },
            { label: 'Pending',     cls: 'bg-amber-400' },
            { label: 'Checked Out', cls: 'bg-[#aaaaaa]' },
          ].map(({ label, cls }) => (
            <span key={label} className="flex items-center gap-1.5 text-xs text-text-secondary dark:text-[#9ca3af]">
              <span className={`w-2.5 h-2.5 rounded-sm ${cls}`} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Calendar grid */}
      <Card className="bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e] overflow-hidden"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
      >
        <CardContent className="p-0">
          <div ref={scrollRef} className="overflow-x-auto">
            <div style={{ minWidth: `${180 + numDays * 44}px` }}>

              {/* Header row: dates */}
              <div className="flex border-b border-[#e5e7eb] dark:border-[#2e2e2e] sticky top-0 bg-white dark:bg-[#1e1e1e] z-10">
                {/* Room label column */}
                <div className="w-44 shrink-0 px-4 py-2.5 text-xs font-semibold text-[#9ca3af] uppercase tracking-wide border-r border-[#e5e7eb] dark:border-[#2e2e2e]">
                  Room
                </div>
                {/* Day columns */}
                {days.map((day) => {
                  const ymd      = toYMD(day);
                  const isToday  = ymd === today;
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  return (
                    <div
                      key={ymd}
                      className={`flex-1 min-w-[44px] text-center py-2.5 border-r border-[#e5e7eb] dark:border-[#2e2e2e] last:border-r-0 ${
                        isToday ? 'bg-blue-50 dark:bg-blue-900/20' : isWeekend ? 'bg-[#fafafa] dark:bg-[#1a1a1a]' : ''
                      }`}
                    >
                      <p className={`text-[10px] font-medium uppercase tracking-wide ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-[#9ca3af]'}`}>
                        {fmtWeekday(day)}
                      </p>
                      <p className={`text-xs font-semibold ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-[#111111] dark:text-white'}`}>
                        {day.getDate()}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Room rows */}
              {rooms.map((room) => {
                const roomBookings = allBookings.filter(
                  (b) => b.roomId === room.id && b.status !== 'cancelled',
                );

                return (
                  <div key={room.id} className="flex border-b border-[#f3f4f6] dark:border-[#2a2a2a] last:border-b-0 hover:bg-[#fafafa] dark:hover:bg-[#191919] transition-colors group">
                    {/* Room label */}
                    <div className="w-44 shrink-0 px-4 py-3 border-r border-[#e5e7eb] dark:border-[#2e2e2e] flex items-start gap-2">
                      <div>
                        <p className="text-xs font-semibold text-[#111111] dark:text-white leading-tight">{room.name}</p>
                        <p className="text-[10px] text-[#9ca3af] mt-0.5">{room.category}</p>
                      </div>
                    </div>

                    {/* Day cells — relative container for booking bars */}
                    <div className="flex flex-1 relative h-13">
                      {/* Grid lines */}
                      {days.map((day) => {
                        const ymd     = toYMD(day);
                        const isToday = ymd === today;
                        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                        return (
                          <div
                            key={ymd}
                            className={`flex-1 min-w-11 border-r border-[#f3f4f6] dark:border-[#2a2a2a] last:border-r-0 cursor-pointer relative ${
                              isToday ? 'bg-blue-50/40 dark:bg-blue-900/10' : isWeekend ? 'bg-[#fafafa] dark:bg-[#1a1a1a]' : ''
                            }`}
                            onClick={() => setQuickBook({ room: { id: room.id, name: room.name }, date: ymd })}
                          />
                        );
                      })}

                      {/* Booking bars */}
                      {roomBookings.map((booking) => {
                        const bar = getBookingBar(booking);
                        if (!bar) return null;
                        const cfg = STATUS_COLORS[booking.status] ?? STATUS_COLORS.confirmed;
                        const cellPct = 100 / numDays;
                        const left = `calc(${bar.startIdx * cellPct}% + 2px)`;
                        const width = `calc(${bar.span * cellPct}% - 4px)`;

                        return (
                          <div
                            key={booking.id}
                            style={{ left, width }}
                            className={`absolute top-2 h-9 rounded-button border ${cfg.bg} ${cfg.border} ${cfg.text} cursor-pointer flex items-center px-2 overflow-hidden z-10 hover:brightness-95 transition-all`}
                            onClick={(e) => { e.stopPropagation(); navigate(`/admin/bookings/${booking.id}`); }}
                            onMouseEnter={(e) => setTooltip({ bookingId: booking.id, x: e.clientX, y: e.clientY })}
                            onMouseLeave={() => setTooltip(null)}
                          >
                            <span className="text-[10px] font-semibold truncate">
                              {bar.clipped ? '…' : ''}{booking.guestName}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {rooms.length === 0 && (
                <div className="py-12 text-center text-sm text-[#9ca3af]">No rooms match the selected filter.</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tooltip */}
      {tooltip && tooltipBooking && (
        <div
          className="fixed z-50 pointer-events-none bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-card shadow-card px-3 py-2.5 text-xs"
          style={{ top: tooltip.y - 90, left: tooltip.x + 12 }}
        >
          <p className="font-semibold text-[#111111] dark:text-white mb-1">{tooltipBooking.guestName}</p>
          <p className="text-[#9ca3af]">{tooltipBooking.roomName}</p>
          <p className="text-[#9ca3af]">{tooltipBooking.checkIn} → {tooltipBooking.checkOut}</p>
          <p className="text-[#9ca3af] capitalize mt-0.5">{tooltipBooking.status.replace('_', ' ')}</p>
        </div>
      )}

      {/* Quick booking dialog */}
      <QuickBookDialog
        room={quickBook?.room ?? null}
        date={quickBook?.date ?? ''}
        open={!!quickBook}
        onClose={() => setQuickBook(null)}
      />
    </div>
  );
}
