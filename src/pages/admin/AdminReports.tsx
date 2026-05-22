import { useState, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Download } from 'lucide-react';

import { useAdminData, type AdminBooking } from '../../context/AdminDataContext';
import type { Guest } from '../../context/AdminDataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmtXAF = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 });

function dateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const cur = new Date(start + 'T00:00:00');
  const fin = new Date(end   + 'T00:00:00');
  while (cur <= fin) {
    dates.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function downloadCSV(rows: (string | number)[][], filename: string) {
  const csv  = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const PIE_COLORS = ['#141414', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e]"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
      <CardHeader className="pb-1 pt-4 px-5">
        <p className="text-xs font-medium text-[#9ca3af] uppercase tracking-wide">{label}</p>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        <p className="text-2xl font-bold text-[#111111] dark:text-white">{value}</p>
        {sub && <p className="text-xs text-text-secondary dark:text-[#9ca3af] mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ── View Toggle ───────────────────────────────────────────────────────────────
function ViewToggle({ view, onChange }: { view: 'chart' | 'table'; onChange: (v: 'chart' | 'table') => void }) {
  return (
    <div className="flex border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-button overflow-hidden">
      {(['chart', 'table'] as const).map((v) => (
        <button key={v} type="button" onClick={() => onChange(v)}
          className={`px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
            view === v
              ? 'bg-brand-black text-white dark:bg-white dark:text-[#111111]'
              : 'bg-white dark:bg-[#1e1e1e] text-text-secondary dark:text-[#9ca3af]'
          }`}>
          {v}
        </button>
      ))}
    </div>
  );
}

// ── Revenue Tab ────────────────────────────────────────────────────────────────
function RevenueTab({ bookings, startDate, endDate }: { bookings: AdminBooking[]; startDate: string; endDate: string }) {
  const [view, setView] = useState<'chart' | 'table'>('chart');

  const data = useMemo(() => {
    const map: Record<string, { count: number; revenue: number }> = {};
    dateRange(startDate, endDate).forEach((d) => { map[d] = { count: 0, revenue: 0 }; });
    bookings.forEach((b) => {
      if (b.checkIn >= startDate && b.checkIn <= endDate && b.status !== 'cancelled') {
        if (map[b.checkIn]) { map[b.checkIn].count++; map[b.checkIn].revenue += b.totalPrice; }
      }
    });
    return Object.entries(map).map(([date, v]) => ({ date, ...v }));
  }, [bookings, startDate, endDate]);

  const total    = data.reduce((s, r) => s + r.revenue, 0);
  const csvRows  = [['Date', 'Bookings', 'Revenue'], ...data.map((r) => [r.date, r.count, r.revenue])];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-text-secondary dark:text-[#9ca3af]">
          Total in range: <strong className="text-[#111111] dark:text-white">{fmtXAF(total)}</strong>
        </p>
        <div className="flex items-center gap-2">
          <ViewToggle view={view} onChange={setView} />
          <Button variant="outline" size="sm" className="gap-1.5 text-xs"
            onClick={() => downloadCSV(csvRows, 'revenue-report.csv')}>
            <Download size={13} /> CSV
          </Button>
        </div>
      </div>

      {view === 'chart' ? (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 10, right: 10, top: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }}
                tickFormatter={(v) => (v as string).slice(5)} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => fmtXAF(v as number).replace('XAF ', '')} width={80} />
              <Tooltip formatter={(v) => fmtXAF(v as number)} labelFormatter={(l) => `Date: ${l}`} />
              <Bar dataKey="revenue" fill="#141414" radius={[3, 3, 0, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="rounded-card border border-[#e5e7eb] dark:border-[#2e2e2e] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-[#e5e7eb] dark:border-[#2e2e2e]">
                <TableHead>Date</TableHead><TableHead>Bookings</TableHead><TableHead>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.filter((r) => r.count > 0).map((r) => (
                <TableRow key={r.date} className="border-[#f3f4f6] dark:border-[#2e2e2e]">
                  <TableCell className="text-sm">{r.date}</TableCell>
                  <TableCell className="text-sm">{r.count}</TableCell>
                  <TableCell className="text-sm font-medium">{fmtXAF(r.revenue)}</TableCell>
                </TableRow>
              ))}
              {data.every((r) => r.count === 0) && (
                <TableRow><TableCell colSpan={3} className="text-center text-sm text-[#9ca3af] h-20">No revenue in this period.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ── Occupancy Tab ─────────────────────────────────────────────────────────────
function OccupancyTab({ bookings, roomCount, startDate, endDate }: {
  bookings: AdminBooking[]; roomCount: number; startDate: string; endDate: string;
}) {
  const [view, setView] = useState<'chart' | 'table'>('chart');

  const data = useMemo(() => {
    return dateRange(startDate, endDate).map((date) => {
      const active = bookings.filter((b) =>
        b.status !== 'cancelled' && b.checkIn <= date && b.checkOut > date,
      ).length;
      const occupancy = roomCount > 0 ? Math.round((active / roomCount) * 100) : 0;
      return { date, active, occupancy };
    });
  }, [bookings, roomCount, startDate, endDate]);

  const avgOcc   = data.length > 0 ? Math.round(data.reduce((s, r) => s + r.occupancy, 0) / data.length) : 0;
  const csvRows  = [['Date', 'Active Bookings', 'Occupancy %'], ...data.map((r) => [r.date, r.active, r.occupancy])];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-text-secondary dark:text-[#9ca3af]">
          Avg occupancy: <strong className="text-[#111111] dark:text-white">{avgOcc}%</strong>
          <span className="ml-2 text-[#9ca3af]">({roomCount} rooms total)</span>
        </p>
        <div className="flex items-center gap-2">
          <ViewToggle view={view} onChange={setView} />
          <Button variant="outline" size="sm" className="gap-1.5 text-xs"
            onClick={() => downloadCSV(csvRows, 'occupancy-report.csv')}>
            <Download size={13} /> CSV
          </Button>
        </div>
      </div>

      {view === 'chart' ? (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 10, right: 10, top: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }}
                tickFormatter={(v) => (v as string).slice(5)} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} width={45} />
              <Tooltip formatter={(v) => `${v}%`} labelFormatter={(l) => `Date: ${l}`} />
              <Line type="monotone" dataKey="occupancy" stroke="#141414" strokeWidth={2} dot={false} name="Occupancy %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="rounded-card border border-[#e5e7eb] dark:border-[#2e2e2e] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-[#e5e7eb] dark:border-[#2e2e2e]">
                <TableHead>Date</TableHead><TableHead>Active Bookings</TableHead><TableHead>Occupancy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((r) => (
                <TableRow key={r.date} className="border-[#f3f4f6] dark:border-[#2e2e2e]">
                  <TableCell className="text-sm">{r.date}</TableCell>
                  <TableCell className="text-sm">{r.active}</TableCell>
                  <TableCell className="text-sm font-medium">{r.occupancy}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ── Sources Tab ────────────────────────────────────────────────────────────────
function SourcesTab({ bookings, startDate, endDate }: { bookings: AdminBooking[]; startDate: string; endDate: string }) {
  const [view, setView] = useState<'chart' | 'table'>('chart');

  const data = useMemo(() => {
    const inRange = bookings.filter((b) => b.checkIn >= startDate && b.checkIn <= endDate);
    const total   = inRange.length || 1;
    const map: Record<string, { count: number; revenue: number }> = {};
    inRange.forEach((b) => {
      if (!map[b.source]) map[b.source] = { count: 0, revenue: 0 };
      map[b.source].count++;
      map[b.source].revenue += b.totalPrice;
    });
    const LABELS: Record<string, string> = { online: 'Online', walk_in: 'Walk-in', phone: 'Phone' };
    return Object.entries(map).map(([src, v]) => ({
      source:  LABELS[src] ?? src,
      count:   v.count,
      revenue: v.revenue,
      pct:     Math.round((v.count / total) * 100),
    }));
  }, [bookings, startDate, endDate]);

  const csvRows = [['Source', 'Bookings', 'Revenue', 'Share %'], ...data.map((r) => [r.source, r.count, r.revenue, r.pct])];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-2">
        <ViewToggle view={view} onChange={setView} />
        <Button variant="outline" size="sm" className="gap-1.5 text-xs"
          onClick={() => downloadCSV(csvRows, 'sources-report.csv')}>
          <Download size={13} /> CSV
        </Button>
      </div>

      {view === 'chart' ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="source" type="category" tick={{ fontSize: 11 }} width={70} />
              <Tooltip formatter={(v, n) => [v, n === 'count' ? 'Bookings' : String(n)]} />
              <Bar dataKey="count" fill="#141414" radius={[0, 3, 3, 0]} name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="rounded-card border border-[#e5e7eb] dark:border-[#2e2e2e] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-[#e5e7eb] dark:border-[#2e2e2e]">
                <TableHead>Source</TableHead><TableHead>Bookings</TableHead><TableHead>Revenue</TableHead><TableHead>Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((r) => (
                <TableRow key={r.source} className="border-[#f3f4f6] dark:border-[#2e2e2e]">
                  <TableCell className="text-sm font-medium">{r.source}</TableCell>
                  <TableCell className="text-sm">{r.count}</TableCell>
                  <TableCell className="text-sm">{fmtXAF(r.revenue)}</TableCell>
                  <TableCell className="text-sm">{r.pct}%</TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-sm text-[#9ca3af] h-20">No data in this period.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ── Demographics Tab ──────────────────────────────────────────────────────────
function DemographicsTab({ guests }: { guests: Guest[] }) {
  const [view, setView] = useState<'chart' | 'table'>('chart');

  const countryData = useMemo(() => {
    const map: Record<string, number> = {};
    guests.forEach((g) => { map[g.country] = (map[g.country] ?? 0) + 1; });
    const total = guests.length || 1;
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([country, count]) => ({ country, count, pct: Math.round((count / total) * 100) }));
  }, [guests]);

  const repeatGuests = guests.filter((g) => g.totalBookings > 1).length;
  const newGuests    = guests.length - repeatGuests;

  const typeData = [
    { name: 'Repeat Guests', value: repeatGuests },
    { name: 'New Guests',    value: newGuests    },
  ];

  const csvRows = [['Country', 'Guests', 'Share %'], ...countryData.map((r) => [r.country, r.count, r.pct])];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end gap-2">
        <ViewToggle view={view} onChange={setView} />
        <Button variant="outline" size="sm" className="gap-1.5 text-xs"
          onClick={() => downloadCSV(csvRows, 'demographics-report.csv')}>
          <Download size={13} /> CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Countries */}
        <div>
          <p className="text-sm font-semibold text-[#111111] dark:text-white mb-3">Guest Countries</p>
          {view === 'chart' ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={countryData} dataKey="count" nameKey="country" cx="50%" cy="50%" outerRadius={80}>
                    {countryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                  <Legend formatter={(v) => <span className="text-xs">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="rounded-card border border-[#e5e7eb] dark:border-[#2e2e2e] overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#e5e7eb] dark:border-[#2e2e2e]">
                    <TableHead>Country</TableHead><TableHead>Guests</TableHead><TableHead>Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {countryData.map((r) => (
                    <TableRow key={r.country} className="border-[#f3f4f6] dark:border-[#2e2e2e]">
                      <TableCell className="text-sm">{r.country}</TableCell>
                      <TableCell className="text-sm">{r.count}</TableCell>
                      <TableCell className="text-sm">{r.pct}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Repeat vs New */}
        <div>
          <p className="text-sm font-semibold text-[#111111] dark:text-white mb-3">Repeat vs New Guests</p>
          {view === 'chart' ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}`}>
                    <Cell fill="#141414" /><Cell fill="#6366f1" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mt-2">
              {typeData.map((r) => (
                <div key={r.name} className="flex justify-between items-center p-3 bg-[#f8f9fa] dark:bg-[#2a2a2a] rounded-button">
                  <span className="text-sm font-medium text-[#111111] dark:text-white">{r.name}</span>
                  <span className="text-sm text-text-secondary dark:text-[#9ca3af]">{r.value} guests</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Popular Rooms Tab ─────────────────────────────────────────────────────────
function PopularRoomsTab({ bookings, startDate, endDate }: { bookings: AdminBooking[]; startDate: string; endDate: string }) {
  const data = useMemo(() => {
    const map: Record<string, { roomName: string; count: number; revenue: number; nights: number }> = {};
    bookings.filter((b) => b.status !== 'cancelled' && b.checkIn >= startDate && b.checkIn <= endDate)
      .forEach((b) => {
        if (!map[b.roomId]) map[b.roomId] = { roomName: b.roomName, count: 0, revenue: 0, nights: 0 };
        map[b.roomId].count++;
        map[b.roomId].revenue += b.totalPrice;
        const nights = Math.max(1, Math.round(
          (new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / 86400000,
        ));
        map[b.roomId].nights += nights;
      });
    return Object.entries(map)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .map(([, v], i) => ({
        rank: i + 1,
        roomName: v.roomName,
        count:    v.count,
        revenue:  v.revenue,
        avgStay:  v.count > 0 ? (v.nights / v.count).toFixed(1) : '–',
      }));
  }, [bookings, startDate, endDate]);

  const csvRows = [['Rank', 'Room', 'Bookings', 'Revenue', 'Avg Stay (nights)'],
    ...data.map((r) => [r.rank, r.roomName, r.count, r.revenue, r.avgStay])];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="gap-1.5 text-xs"
          onClick={() => downloadCSV(csvRows, 'popular-rooms-report.csv')}>
          <Download size={13} /> CSV
        </Button>
      </div>
      <div className="rounded-card border border-[#e5e7eb] dark:border-[#2e2e2e] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-[#e5e7eb] dark:border-[#2e2e2e]">
              <TableHead className="w-12">#</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Avg Stay</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((r) => (
              <TableRow key={r.roomName} className="border-[#f3f4f6] dark:border-[#2e2e2e]">
                <TableCell className="text-sm font-bold text-[#9ca3af]">{r.rank}</TableCell>
                <TableCell className="text-sm font-medium text-[#111111] dark:text-white">{r.roomName}</TableCell>
                <TableCell className="text-sm">{r.count}</TableCell>
                <TableCell className="text-sm font-medium">{fmtXAF(r.revenue)}</TableCell>
                <TableCell className="text-sm">{r.avgStay} nights</TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-sm text-[#9ca3af] h-20">No bookings in this period.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function AdminReports() {
  const { allBookings, allRooms, guests } = useAdminData();

  const defaultEnd   = new Date().toISOString().split('T')[0];
  const defaultStart = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate,   setEndDate]   = useState(defaultEnd);

  const filteredBookings = useMemo(
    () => allBookings.filter((b) => b.checkIn >= startDate && b.checkIn <= endDate),
    [allBookings, startDate, endDate],
  );

  // KPI metrics
  const totalRevenue   = filteredBookings.filter((b) => b.status !== 'cancelled').reduce((s, b) => s + b.totalPrice, 0);
  const totalBookings  = filteredBookings.length;
  const cancelledCount = filteredBookings.filter((b) => b.status === 'cancelled').length;
  const cancelRate     = totalBookings > 0 ? Math.round((cancelledCount / totalBookings) * 100) : 0;
  const avgStayNights  = useMemo(() => {
    const stays = filteredBookings.filter((b) => b.status !== 'cancelled').map((b) =>
      Math.max(1, Math.round((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / 86400000)),
    );
    return stays.length > 0 ? (stays.reduce((s, n) => s + n, 0) / stays.length).toFixed(1) : '–';
  }, [filteredBookings]);

  return (
    <div className="p-6 max-w-350 mx-auto flex flex-col gap-6">
      {/* Header + date range */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] dark:text-white">Reports & Analytics</h1>
          <p className="text-sm text-text-secondary dark:text-[#9ca3af] mt-0.5">
            Data from the last {Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000)} days
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#9ca3af]">From</span>
            <Input type="date" value={startDate} max={endDate}
              onChange={(e) => setStartDate(e.target.value)} className="h-8 text-xs w-36" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#9ca3af]">To</span>
            <Input type="date" value={endDate} min={startDate}
              onChange={(e) => setEndDate(e.target.value)} className="h-8 text-xs w-36" />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Revenue"       value={fmtXAF(totalRevenue)}                   sub={`${filteredBookings.filter((b) => b.status !== 'cancelled').length} bookings`} />
        <KpiCard label="Avg Stay"            value={`${avgStayNights} nights`}              sub="per booking" />
        <KpiCard label="Cancellation Rate"   value={`${cancelRate}%`}                        sub={`${cancelledCount} of ${totalBookings} bookings`} />
        <KpiCard label="Active Rooms"        value={String(allRooms.length)}                 sub="total inventory" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="bg-[#f3f4f6] dark:bg-[#2a2a2a] h-auto flex-wrap">
          <TabsTrigger value="revenue"      className="text-xs">Revenue</TabsTrigger>
          <TabsTrigger value="occupancy"    className="text-xs">Occupancy</TabsTrigger>
          <TabsTrigger value="sources"      className="text-xs">Sources</TabsTrigger>
          <TabsTrigger value="demographics" className="text-xs">Demographics</TabsTrigger>
          <TabsTrigger value="rooms"        className="text-xs">Popular Rooms</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="mt-4">
          <Card className="bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e] p-5"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <RevenueTab bookings={allBookings} startDate={startDate} endDate={endDate} />
          </Card>
        </TabsContent>

        <TabsContent value="occupancy" className="mt-4">
          <Card className="bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e] p-5"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <OccupancyTab bookings={allBookings} roomCount={allRooms.length} startDate={startDate} endDate={endDate} />
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="mt-4">
          <Card className="bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e] p-5"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <SourcesTab bookings={allBookings} startDate={startDate} endDate={endDate} />
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="mt-4">
          <Card className="bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e] p-5"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <DemographicsTab guests={guests} />
          </Card>
        </TabsContent>

        <TabsContent value="rooms" className="mt-4">
          <Card className="bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e] p-5"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <PopularRoomsTab bookings={allBookings} startDate={startDate} endDate={endDate} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
