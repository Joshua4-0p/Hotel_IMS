import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, BedDouble, CalendarDays, Users,
  MessageSquare, DollarSign, AlertCircle, Plus,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

import { useAdminData } from '../../context/AdminDataContext';
import { NewBookingDialog } from './AdminBookings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmtXAF = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 });

const fmtDate = (s: string) =>
  new Date(s + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const STATUS_STYLES: Record<string, string> = {
  confirmed:   'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  pending:     'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  checked_in:  'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  checked_out: 'bg-[#f3f4f6] text-[#585858] dark:bg-[#2a2a2a] dark:text-[#9ca3af]',
  cancelled:   'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};
const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmed', pending: 'Pending', checked_in: 'Checked In',
  checked_out: 'Checked Out', cancelled: 'Cancelled',
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label:   string;
  value:   string;
  sub?:    string;
  icon:    React.ReactNode;
  iconBg:  string;
  trend?:  { pct: number };
  accent?: boolean;
}

function StatCard({ label, value, sub, icon, iconBg, trend, accent }: StatCardProps) {
  const positive = (trend?.pct ?? 0) >= 0;
  return (
    <Card className={`border-0 ${accent ? 'bg-[#141414] dark:bg-white' : 'bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e]'}`}
      style={{ boxShadow: accent ? '0 4px 24px rgba(0,0,0,0.12)' : '0 2px 12px rgba(0,0,0,0.04)' }}
    >
      <CardHeader className="pb-2 pt-5 px-5">
        <div className="flex items-start justify-between gap-3">
          <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 ${iconBg}`}>
            {icon}
          </div>
          {trend && (
            <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
              positive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                       : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {Math.abs(trend.pct)}%
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <p className={`text-[1.6rem] font-bold leading-none tracking-tight ${
          accent ? 'text-white dark:text-[#111111]' : 'text-[#111111] dark:text-white'
        }`}>
          {value}
        </p>
        <p className={`text-sm mt-1 ${
          accent ? 'text-white/60 dark:text-[#585858]' : 'text-[#585858] dark:text-[#9ca3af]'
        }`}>
          {label}
        </p>
        {sub && (
          <p className={`text-xs mt-0.5 ${
            accent ? 'text-white/40 dark:text-[#9ca3af]' : 'text-[#9ca3af] dark:text-[#555555]'
          }`}>
            {sub}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ── Occupancy Chart ───────────────────────────────────────────────────────────
function OccupancyChart({ totalRooms }: { totalRooms: number }) {
  const data = useMemo(() => {
    const result = [];
    const today  = new Date();
    for (let i = 29; i >= 0; i--) {
      const d   = new Date(today);
      d.setDate(d.getDate() - i);
      const lbl = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      // Simulate occupancy: seed-based pseudorandom for stable renders
      const seed = d.getDate() + d.getMonth() * 31;
      const occ  = Math.round(30 + ((seed * 37 + 13) % 55));
      result.push({ date: lbl, occupancy: Math.min(occ, 100) });
    }
    return result;
  }, []);

  return (
    <Card className="bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e]"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
    >
      <CardHeader className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-[#111111] dark:text-white">
            Occupancy Rate — Last 30 Days
          </CardTitle>
          <span className="text-xs text-[#9ca3af]">{totalRooms} rooms</span>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="occGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#141414" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#141414" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" className="dark:[&_line]:stroke-[#2a2a2a]" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                interval={6}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                }}
                formatter={(v) => [`${v}%`, 'Occupancy']}
              />
              <Area
                type="monotone"
                dataKey="occupancy"
                stroke="#141414"
                strokeWidth={2}
                fill="url(#occGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Room Status Grid ──────────────────────────────────────────────────────────
function RoomStatusGrid() {
  const { allRooms, allBookings } = useAdminData();
  const today = new Date().toISOString().split('T')[0];

  function getRoomStatus(roomId: string): 'available' | 'occupied' | 'reserved' | 'maintenance' {
    const activeBooking = allBookings.find(
      (b) => b.roomId === roomId && b.status === 'checked_in',
    );
    if (activeBooking) return 'occupied';

    const upcoming = allBookings.find(
      (b) => b.roomId === roomId && b.status === 'confirmed' && b.checkIn >= today,
    );
    if (upcoming) return 'reserved';

    return 'available';
  }

  const statusConfig = {
    available:   { label: 'Available',   variant: 'default' as const,     dot: 'bg-emerald-500' },
    occupied:    { label: 'Occupied',    variant: 'secondary' as const,   dot: 'bg-blue-500'    },
    reserved:    { label: 'Reserved',    variant: 'outline' as const,     dot: 'bg-amber-500'   },
    maintenance: { label: 'Maintenance', variant: 'destructive' as const, dot: 'bg-red-500'     },
  } as const;

  const counts = allRooms.reduce<Record<string, number>>((acc, room) => {
    const s = getRoomStatus(room.id);
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <Card className="bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e]"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
    >
      <CardHeader className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-[#111111] dark:text-white">
            Room Status
          </CardTitle>
          <div className="flex items-center gap-2 text-xs text-[#9ca3af]">
            {Object.entries(counts).map(([s, n]) => (
              <span key={s} className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[s as keyof typeof statusConfig]?.dot ?? 'bg-gray-400'}`} />
                {n} {statusConfig[s as keyof typeof statusConfig]?.label ?? s}
              </span>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="grid grid-cols-2 gap-2">
          {allRooms.map((room) => {
            const status = getRoomStatus(room.id);
            const cfg    = statusConfig[status];
            return (
              <div key={room.id}
                className="flex items-center gap-2.5 p-2.5 rounded-button bg-brand-cream dark:bg-[#2a2a2a]"
              >
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[#111111] dark:text-white truncate">{room.name}</p>
                </div>
                <Badge
                  variant={cfg.variant}
                  className={`text-[10px] px-1.5 py-0 shrink-0 ${
                    status === 'available'   ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400' :
                    status === 'occupied'    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400' :
                    status === 'reserved'    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400' :
                                              'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400'
                  }`}
                >
                  {cfg.label}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Today Panel ───────────────────────────────────────────────────────────────
function TodayPanel() {
  const { allBookings } = useAdminData();
  const today = new Date().toISOString().split('T')[0];

  const arrivals   = allBookings.filter((b) => b.checkIn  === today && b.status !== 'cancelled');
  const departures = allBookings.filter((b) => b.checkOut === today && b.status !== 'cancelled');

  return (
    <Card className="bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e]"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
    >
      <CardHeader className="px-5 pt-5 pb-4">
        <CardTitle className="text-base font-semibold text-[#111111] dark:text-white">Today</CardTitle>
        <p className="text-xs text-[#9ca3af]">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </CardHeader>
      <CardContent className="px-5 pb-5 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-button bg-brand-cream dark:bg-[#2a2a2a]">
            <p className="label text-[#9ca3af] mb-1">Arrivals</p>
            <p className="text-2xl font-bold text-[#111111] dark:text-white">{arrivals.length}</p>
          </div>
          <div className="p-3 rounded-button bg-brand-cream dark:bg-[#2a2a2a]">
            <p className="label text-[#9ca3af] mb-1">Departures</p>
            <p className="text-2xl font-bold text-[#111111] dark:text-white">{departures.length}</p>
          </div>
        </div>

        {arrivals.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wide mb-2">Arriving Today</p>
            <div className="flex flex-col gap-1.5">
              {arrivals.map((b) => (
                <div key={b.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                        {b.guestName.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm text-[#111111] dark:text-white truncate">{b.guestName}</span>
                  </div>
                  <span className="text-xs text-[#9ca3af] shrink-0">{b.roomName}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {departures.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wide mb-2">Departing Today</p>
            <div className="flex flex-col gap-1.5">
              {departures.map((b) => (
                <div key={b.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-400">
                        {b.guestName.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm text-[#111111] dark:text-white truncate">{b.guestName}</span>
                  </div>
                  <span className="text-xs text-[#9ca3af] shrink-0">{b.roomName}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {arrivals.length === 0 && departures.length === 0 && (
          <p className="text-sm text-[#9ca3af] text-center py-2">No arrivals or departures today</p>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export function AdminDashboard() {
  const { allBookings, allRooms, guests, messages } = useAdminData();
  const [newBookingOpen, setNewBookingOpen] = useState(false);

  const confirmed  = allBookings.filter((b) => ['confirmed', 'checked_in', 'checked_out'].includes(b.status));
  const revenue    = confirmed.reduce((sum, b) => sum + b.totalPrice, 0);
  const unreadMsg  = messages.filter((m) => !m.read).length;
  const thisMonth  = new Date().toISOString().slice(0, 7);
  const newThisMonth = allBookings.filter((b) => b.bookedAt.startsWith(thisMonth)).length;
  const checkedIn  = allBookings.filter((b) => b.status === 'checked_in').length;
  const occupancyPct = allRooms.length > 0 ? Math.round((checkedIn / allRooms.length) * 100) : 0;

  const recentBookings = [...allBookings]
    .sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime())
    .slice(0, 6);

  return (
    <div className="p-6 max-w-[1400px] mx-auto flex flex-col gap-6">
      {/* Page heading + quick actions */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] dark:text-white">Dashboard</h1>
          <p className="text-sm text-[#585858] dark:text-[#9ca3af] mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Button
          onClick={() => setNewBookingOpen(true)}
          className="bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb] h-9 gap-2"
        >
          <Plus size={15} />
          New Booking
        </Button>
      </div>

      {/* Alerts — unread messages */}
      {unreadMsg > 0 && (
        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-900/10">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-700 dark:text-amber-400">
            {unreadMsg} unread message{unreadMsg > 1 ? 's' : ''}
          </AlertTitle>
          <AlertDescription className="text-amber-600 dark:text-amber-500">
            You have {unreadMsg} guest message{unreadMsg > 1 ? 's' : ''} awaiting a response.{' '}
            <NavLink to="/admin/messages" className="underline font-medium hover:text-amber-800">
              View messages →
            </NavLink>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={fmtXAF(revenue)}
          sub="from confirmed stays"
          icon={<DollarSign size={18} className="text-white dark:text-[#141414]" />}
          iconBg="bg-[#141414] dark:bg-white"
          trend={{ pct: 8 }}
          accent
        />
        <StatCard
          label="Total Bookings"
          value={String(allBookings.length)}
          sub={`${newThisMonth} new this month`}
          icon={<CalendarDays size={18} className="text-blue-600" />}
          iconBg="bg-blue-50 dark:bg-blue-900/20"
          trend={{ pct: 12 }}
        />
        <StatCard
          label="Registered Guests"
          value={String(guests.length)}
          sub={`${guests.filter((g) => g.status === 'vip').length} VIP guests`}
          icon={<Users size={18} className="text-purple-600" />}
          iconBg="bg-purple-50 dark:bg-purple-900/20"
          trend={{ pct: 5 }}
        />
        <StatCard
          label="Current Occupancy"
          value={`${occupancyPct}%`}
          sub={`${checkedIn} of ${allRooms.length} rooms occupied`}
          icon={<BedDouble size={18} className="text-emerald-600" />}
          iconBg="bg-emerald-50 dark:bg-emerald-900/20"
          trend={{ pct: occupancyPct >= 50 ? 4 : -3 }}
        />
      </div>

      {/* Quick action strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'All Bookings',  path: '/admin/bookings',  icon: <CalendarDays size={16} /> },
          { label: 'Manage Rooms',  path: '/admin/rooms',     icon: <BedDouble    size={16} /> },
          { label: 'View Guests',   path: '/admin/guests',    icon: <Users        size={16} /> },
          { label: 'Messages',      path: '/admin/messages',  icon: <MessageSquare size={16} />, badge: unreadMsg },
        ].map((action) => (
          <NavLink
            key={action.path}
            to={action.path}
            className="relative flex items-center gap-2.5 px-4 py-3 bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-card text-sm font-medium text-text-secondary dark:text-[#9ca3af] hover:text-[#111111] dark:hover:text-white hover:border-[#111111] dark:hover:border-[#555555] transition-colors"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
          >
            {action.icon}
            {action.label}
            {action.badge ? (
              <span className="ml-auto text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
                {action.badge}
              </span>
            ) : null}
          </NavLink>
        ))}
      </div>

      {/* Occupancy chart + Today panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <OccupancyChart totalRooms={allRooms.length} />
        </div>
        <TodayPanel />
      </div>

      {/* Recent bookings table + Room status grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent bookings */}
        <Card className="lg:col-span-2 bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e] overflow-hidden p-0"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
        >
          <CardHeader className="px-5 py-4 border-b border-[#e5e7eb] dark:border-[#2e2e2e]">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-[#111111] dark:text-white">
                Recent Bookings
              </CardTitle>
              <NavLink
                to="/admin/bookings"
                className="text-xs font-medium text-text-secondary dark:text-[#9ca3af] hover:text-[#111111] dark:hover:text-white transition-colors"
              >
                View all →
              </NavLink>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#f3f4f6] dark:border-[#2e2e2e] hover:bg-transparent">
                    <TableHead className="px-5 py-3 text-xs font-semibold text-[#9ca3af] uppercase tracking-wide">Guest</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold text-[#9ca3af] uppercase tracking-wide hidden sm:table-cell">Room</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold text-[#9ca3af] uppercase tracking-wide hidden md:table-cell">Dates</TableHead>
                    <TableHead className="px-4 py-3 text-right text-xs font-semibold text-[#9ca3af] uppercase tracking-wide">Total</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold text-[#9ca3af] uppercase tracking-wide">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBookings.map((b) => (
                    <TableRow key={b.id}
                      className="border-[#f3f4f6] dark:border-[#2e2e2e] hover:bg-brand-cream dark:hover:bg-[#252525] transition-colors"
                    >
                      <TableCell className="px-5 py-3">
                        <p className="font-medium text-sm text-[#111111] dark:text-white">{b.guestName}</p>
                        <p className="text-xs text-[#9ca3af]">{b.guestEmail}</p>
                      </TableCell>
                      <TableCell className="px-4 py-3 hidden sm:table-cell text-sm text-text-secondary dark:text-[#9ca3af]">
                        {b.roomName}
                      </TableCell>
                      <TableCell className="px-4 py-3 hidden md:table-cell text-xs text-text-secondary dark:text-[#9ca3af]">
                        {fmtDate(b.checkIn)} → {fmtDate(b.checkOut)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right font-mono text-xs font-medium text-[#111111] dark:text-white">
                        {fmtXAF(b.totalPrice)}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <span className={`label px-2 py-0.5 rounded-full text-[11px] ${STATUS_STYLES[b.status] ?? ''}`}>
                          {STATUS_LABELS[b.status] ?? b.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Room status grid */}
        <RoomStatusGrid />
      </div>

      <NewBookingDialog open={newBookingOpen} onClose={() => setNewBookingOpen(false)} />
    </div>
  );
}
