import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toKey, generateUnavailableDates } from '../lib/availability';

function sameDay(a: Date, b: Date) {
  return toKey(a) === toKey(b);
}

function isStrictlyBetween(date: Date, start: Date, end: Date) {
  return date.getTime() > start.getTime() && date.getTime() < end.getTime();
}

const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface MonthGridProps {
  year: number;
  month: number;
  today: Date;
  checkIn: Date | null;
  checkOut: Date | null;
  unavailable: Set<string>;
  onDayClick: (d: Date) => void;
}

function MonthGrid({ year, month, today, checkIn, checkOut, unavailable, onDayClick }: MonthGridProps) {
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <p className="heading-md text-center text-[#000000] mb-3">
        {MONTHS[month]} {year}
      </p>
      <div className="grid grid-cols-7">
        {DOW.map((l) => (
          <div key={l} className="label text-center text-[#BDBDBD] py-2">{l}</div>
        ))}
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;

          const key = toKey(date);
          const isPast     = date < today;
          const isBlocked  = unavailable.has(key);
          const isCheckIn  = checkIn  && sameDay(date, checkIn);
          const isCheckOut = checkOut && sameDay(date, checkOut);
          const isInRange  = checkIn && checkOut && isStrictlyBetween(date, checkIn, checkOut);
          const isToday    = sameDay(date, today);
          const disabled   = isPast || isBlocked;

          let base = 'relative flex items-center justify-center h-9 w-full body-sm select-none transition-colors';
          let text = '';

          if (isCheckIn || isCheckOut) {
            base += ' bg-[#141414] text-white rounded-[0.375rem] cursor-pointer';
          } else if (isInRange) {
            base += ' bg-[#F0EFE9] cursor-pointer';
          } else if (isBlocked) {
            base += ' cursor-not-allowed';
            text  = 'text-[#BDBDBD] line-through';
          } else if (isPast) {
            base += ' cursor-not-allowed';
            text  = 'text-[#BDBDBD]';
          } else {
            base += ' cursor-pointer hover:bg-[#F8F8F8] rounded-[0.375rem]';
            text  = isToday ? 'font-semibold text-[#141414]' : 'text-[#000000]';
          }

          return (
            <div key={i} className={base} onClick={() => !disabled && onDayClick(date)}>
              {isBlocked && (
                <span className="absolute inset-x-1 top-1/2 h-px bg-[#BDBDBD]" aria-hidden="true" />
              )}
              <span className={text}>{date.getDate()}</span>
              {isToday && !isCheckIn && !isCheckOut && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#141414]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export interface BookingCalendarProps {
  roomId: string;
  checkIn: Date | null;
  checkOut: Date | null;
  onChange: (checkIn: Date | null, checkOut: Date | null) => void;
}

export function BookingCalendar({ roomId, checkIn, checkOut, onChange }: BookingCalendarProps) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const unavailable = useMemo(() => generateUnavailableDates(roomId), [roomId]);

  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const atMin = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  function prevMonth() {
    if (atMin) return;
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  function hasBlockedBetween(start: Date, end: Date) {
    const cur = new Date(start);
    cur.setDate(cur.getDate() + 1);
    while (cur < end) {
      if (unavailable.has(toKey(cur))) return true;
      cur.setDate(cur.getDate() + 1);
    }
    return false;
  }

  function handleDayClick(date: Date) {
    if (!checkIn || (checkIn && checkOut)) {
      onChange(date, null);
      return;
    }
    if (date <= checkIn) {
      onChange(date, null);
      return;
    }
    if (hasBlockedBetween(checkIn, date)) {
      onChange(date, null);
      return;
    }
    onChange(checkIn, date);
  }

  const fmtDate = (d: Date | null) =>
    d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <div className="flex flex-col gap-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {[
          { swatch: 'w-3 h-3 rounded-sm bg-[#141414]',                                   label: 'Selected' },
          { swatch: 'w-3 h-3 rounded-sm bg-[#F0EFE9] border border-[#E3E3E3]',           label: 'In range' },
          { swatch: 'w-5 h-px bg-[#BDBDBD] self-center',                                 label: 'Unavailable' },
        ].map(({ swatch, label }) => (
          <span key={label} className="flex items-center gap-1.5 body-sm text-[#585858]">
            <span className={`inline-block shrink-0 ${swatch}`} />
            {label}
          </span>
        ))}
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} disabled={atMin} aria-label="Previous month"
          className="p-1.5 rounded-[0.375rem] hover:bg-[#F8F8F8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft size={18} />
        </button>
        <button onClick={nextMonth} aria-label="Next month"
          className="p-1.5 rounded-[0.375rem] hover:bg-[#F8F8F8] transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>

      <MonthGrid
        year={viewYear} month={viewMonth} today={today}
        checkIn={checkIn} checkOut={checkOut}
        unavailable={unavailable} onDayClick={handleDayClick}
      />

      {/* Selection display */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Check-in',  value: fmtDate(checkIn) },
          { label: 'Check-out', value: fmtDate(checkOut) },
        ].map(({ label, value }) => (
          <div key={label} className="p-3 rounded-[0.5rem] border border-[#E3E3E3] text-center">
            <p className="label text-[#585858] mb-1">{label}</p>
            <p className="body-sm font-medium text-[#000000]">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
