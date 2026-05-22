import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Search, Crown, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useAdminData, type Guest } from '../../context/AdminDataContext';
import { DataTable } from '../../components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmtXAF = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 });

const fmtDate = (s?: string) => s
  ? new Date(s + (s.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  : '—';

const STATUS_CONFIG = {
  vip:      { label: 'VIP',      cls: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400' },
  active:   { label: 'Active',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400' },
  inactive: { label: 'Inactive', cls: 'bg-[#f3f4f6] text-text-secondary border-[#e5e7eb] dark:bg-[#2a2a2a] dark:text-[#9ca3af]' },
} as const;

// ── Add Guest schema ───────────────────────────────────────────────────────────
const addGuestSchema = z.object({
  name:    z.string().min(2, 'Name is required'),
  email:   z.string().email('Valid email required'),
  phone:   z.string().min(6, 'Phone required'),
  country: z.string().min(1, 'Country required'),
  city:    z.string().min(1, 'City required'),
});

type AddGuestValues = z.infer<typeof addGuestSchema>;

// ── Add Guest Dialog ───────────────────────────────────────────────────────────
function AddGuestDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addGuest } = useAdminData();
  const form = useForm<AddGuestValues>({
    resolver: zodResolver(addGuestSchema),
    defaultValues: { name: '', email: '', phone: '', country: 'Cameroon', city: '' },
  });

  function onSubmit(values: AddGuestValues) {
    addGuest({
      ...values,
      status: 'active',
      totalBookings: 0,
      totalSpent: 0,
      joinedAt: new Date().toISOString().split('T')[0],
    });
    form.reset();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md bg-white dark:bg-[#1e1e1e] border-[#e5e7eb] dark:border-[#2e2e2e]">
        <DialogHeader>
          <DialogTitle className="text-[#111111] dark:text-white">Add Walk-in Guest</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl><Input placeholder="Guest name" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type="email" placeholder="guest@email.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl><Input placeholder="+237 6XX XXX XXX" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="city" render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl><Input placeholder="Douala" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="country" render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl><Input placeholder="Cameroon" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb]">
                Add Guest
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ── Columns ────────────────────────────────────────────────────────────────────
function useColumns(onView: (id: string) => void): ColumnDef<Guest>[] {
  return useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Guest',
      cell: ({ row }) => (
        <div className="cursor-pointer flex items-center gap-2.5" onClick={() => onView(row.original.id)}>
          <div className="w-8 h-8 rounded-full bg-[#f3f4f6] dark:bg-[#2a2a2a] flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-[#585858] dark:text-[#9ca3af]">
              {row.original.name.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium text-sm text-[#111111] dark:text-white flex items-center gap-1.5">
              {row.original.name}
              {row.original.status === 'vip' && <Crown size={11} className="text-purple-500" />}
            </p>
            <p className="text-xs text-[#9ca3af]">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => (
        <span className="text-sm text-text-secondary dark:text-[#9ca3af]">{row.original.phone}</span>
      ),
    },
    {
      accessorKey: 'country',
      header: 'Location',
      cell: ({ row }) => (
        <span className="text-sm text-text-secondary dark:text-[#9ca3af]">
          {row.original.city}, {row.original.country}
        </span>
      ),
    },
    {
      accessorKey: 'totalBookings',
      header: 'Bookings',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-[#111111] dark:text-white">
          {row.original.totalBookings}
        </span>
      ),
    },
    {
      accessorKey: 'totalSpent',
      header: 'Total Spent',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-medium text-[#111111] dark:text-white">
          {fmtXAF(row.original.totalSpent)}
        </span>
      ),
    },
    {
      accessorKey: 'lastStay',
      header: 'Last Stay',
      cell: ({ row }) => (
        <span className="text-xs text-[#9ca3af]">{fmtDate(row.original.lastStay)}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const cfg = STATUS_CONFIG[row.original.status];
        return (
          <span className={`label px-2 py-0.5 rounded-full border text-[11px] ${cfg.cls}`}>
            {cfg.label}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button variant="ghost" size="sm"
          className="text-xs text-text-secondary dark:text-[#9ca3af] hover:text-[#111111] dark:hover:text-white"
          onClick={() => onView(row.original.id)}
        >
          View →
        </Button>
      ),
    },
  ], [onView]);
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function AdminGuests() {
  const { guests } = useAdminData();
  const navigate   = useNavigate();
  const [dialogOpen,    setDialogOpen]    = useState(false);
  const [search,        setSearch]        = useState('');
  const [statusFilter,  setStatusFilter]  = useState('all');

  const filtered = useMemo(() => {
    let list = guests;
    if (statusFilter !== 'all') list = list.filter((g) => g.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((g) =>
        g.name.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        g.phone.includes(q),
      );
    }
    return list;
  }, [guests, search, statusFilter]);

  const columns = useColumns((id) => navigate(`/admin/guests/${id}`));

  const vipCount    = guests.filter((g) => g.status === 'vip').length;
  const activeCount = guests.filter((g) => g.status === 'active').length;

  return (
    <div className="p-6 max-w-350 mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] dark:text-white">Guests</h1>
          <p className="text-sm text-text-secondary dark:text-[#9ca3af] mt-0.5">
            {guests.length} registered · {vipCount} VIP · {activeCount} active
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb] h-9 gap-2"
        >
          <Plus size={15} /> Add Guest
        </Button>
      </div>

      {/* Search + status filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none" />
          <Input
            placeholder="Search by name, email or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-8 w-64"
          />
        </div>
        {[
          { key: 'all',      label: 'All',      count: guests.length },
          { key: 'vip',      label: 'VIP',      count: vipCount },
          { key: 'active',   label: 'Active',   count: activeCount },
          { key: 'inactive', label: 'Inactive', count: guests.filter((g) => g.status === 'inactive').length },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            type="button"
            onClick={() => setStatusFilter(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === key
                ? 'bg-brand-black text-white dark:bg-white dark:text-[#111111]'
                : 'bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e] text-text-secondary dark:text-[#9ca3af] hover:border-[#111111] dark:hover:border-[#555555]'
            }`}
          >
            {label} <span className="opacity-60 ml-1">{count}</span>
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        pageSize={10}
        toolbar={
          <div className="flex items-center gap-2 text-xs text-[#9ca3af]">
            <Shield size={13} />
            <span>{filtered.length} guest{filtered.length !== 1 ? 's' : ''} shown</span>
          </div>
        }
      />

      <AddGuestDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
