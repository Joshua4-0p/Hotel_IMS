import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Filter } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useAdminData, type AdminBooking } from '../../context/AdminDataContext';
import { DataTable } from '../../components/admin/DataTable';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmtXAF = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 });

const fmtDate = (s: string) =>
  new Date(s + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const STATUS_STYLES: Record<string, string> = {
  confirmed:   'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400',
  pending:     'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
  checked_in:  'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
  checked_out: 'bg-[#f3f4f6] text-[#585858] border-[#e5e7eb] dark:bg-[#2a2a2a] dark:text-[#9ca3af]',
  cancelled:   'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400',
};
const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmed', pending: 'Pending', checked_in: 'Checked In',
  checked_out: 'Checked Out', cancelled: 'Cancelled',
};

const SOURCE_LABELS: Record<string, string> = {
  online: 'Online', walk_in: 'Walk-in', phone: 'Phone',
};

// ── New booking schema ─────────────────────────────────────────────────────────
const bookingSchema = z.object({
  guestName:  z.string().min(2, 'Guest name is required'),
  guestEmail: z.string().email('Valid email required'),
  guestPhone: z.string().min(6, 'Phone number required'),
  roomId:     z.string().min(1, 'Select a room'),
  checkIn:    z.string().min(1, 'Check-in date required'),
  checkOut:   z.string().min(1, 'Check-out date required'),
  guests:     z.coerce.number().min(1).max(10),
  source:     z.enum(['online', 'walk_in', 'phone']),
  notes:      z.string().optional(),
}).refine((d) => d.checkOut > d.checkIn, {
  message: 'Check-out must be after check-in',
  path: ['checkOut'],
});

// Use input type for TFieldValues so coerce fields are accepted as strings from the DOM
type BookingFormInput  = z.input<typeof bookingSchema>;
type BookingFormValues = z.output<typeof bookingSchema>;

// ── New Booking Dialog ─────────────────────────────────────────────────────────
function NewBookingDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { allRooms, addAdminBooking } = useAdminData();
  const [submitting, setSubmitting]   = useState(false);

  const form = useForm<BookingFormInput, unknown, BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      guestName: '', guestEmail: '', guestPhone: '',
      roomId: '', checkIn: '', checkOut: '',
      guests: 1, source: 'online', notes: '',
    },
  });

  function calcTotal(roomId: string, checkIn: string, checkOut: string): number {
    const room = allRooms.find((r) => r.id === roomId);
    if (!room || !checkIn || !checkOut) return 0;
    const nights = Math.max(0,
      Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000),
    );
    const sub = room.price * nights;
    return Math.round(sub * 1.12 + 27000);
  }

  async function onSubmit(values: BookingFormValues) {
    setSubmitting(true);
    const room = allRooms.find((r) => r.id === values.roomId)!;
    const totalPrice = calcTotal(values.roomId, values.checkIn, values.checkOut);
    addAdminBooking({
      roomId:     values.roomId,
      roomName:   room.name,
      roomImage:  room.images[0],
      guestName:  values.guestName,
      guestEmail: values.guestEmail,
      guestPhone: values.guestPhone,
      checkIn:    values.checkIn,
      checkOut:   values.checkOut,
      guests:     values.guests,
      totalPrice,
      status:     'confirmed',
      source:     values.source,
      notes:      values.notes,
    });
    form.reset();
    setSubmitting(false);
    onClose();
  }

  const [watchedRoomId, watchedCheckIn, watchedCheckOut] = useWatch({
    control: form.control,
    name: ['roomId', 'checkIn', 'checkOut'],
  });
  const preview = calcTotal(watchedRoomId ?? '', watchedCheckIn ?? '', watchedCheckOut ?? '');

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg bg-white dark:bg-[#1e1e1e] border-[#e5e7eb] dark:border-[#2e2e2e]">
        <DialogHeader>
          <DialogTitle className="text-[#111111] dark:text-white">New Booking</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Guest info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="guestName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Guest Name</FormLabel>
                  <FormControl><Input placeholder="Full name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="guestPhone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl><Input placeholder="+237 6XX XXX XXX" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="guestEmail" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type="email" placeholder="guest@email.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Room */}
            <FormField control={form.control} name="roomId" render={({ field }) => (
              <FormItem>
                <FormLabel>Room</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select a room" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {allRooms.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name} — {fmtXAF(r.price)}/night
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            {/* Dates + guests */}
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="checkIn" render={({ field }) => (
                <FormItem>
                  <FormLabel>Check-in</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="checkOut" render={({ field }) => (
                <FormItem>
                  <FormLabel>Check-out</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="guests" render={({ field }) => (
                <FormItem>
                  <FormLabel>Guests</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={10} {...field} value={field.value as number} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="source" render={({ field }) => (
                <FormItem>
                  <FormLabel>Source</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="walk_in">Walk-in</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Special requests, notes…" rows={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Price preview */}
            {preview > 0 && (
              <div className="flex items-center justify-between px-4 py-3 bg-[#f8f8f8] dark:bg-[#2a2a2a] rounded-button text-sm">
                <span className="text-[#585858] dark:text-[#9ca3af]">Estimated total (incl. tax + cleaning)</span>
                <span className="font-semibold text-[#111111] dark:text-white font-mono">{fmtXAF(preview)}</span>
              </div>
            )}

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#141414] hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb]"
              >
                {submitting ? 'Creating…' : 'Create Booking'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ── Table columns ──────────────────────────────────────────────────────────────
function useColumns(onRowClick: (id: string) => void): ColumnDef<AdminBooking>[] {
  return useMemo(() => [
    {
      accessorKey: 'guestName',
      header: 'Guest',
      cell: ({ row }) => (
        <div className="cursor-pointer" onClick={() => onRowClick(row.original.id)}>
          <p className="font-medium text-sm text-[#111111] dark:text-white">{row.original.guestName}</p>
          <p className="text-xs text-[#9ca3af]">{row.original.guestEmail}</p>
        </div>
      ),
    },
    {
      accessorKey: 'roomName',
      header: 'Room',
      cell: ({ row }) => (
        <span className="text-sm text-[#585858] dark:text-[#9ca3af]">{row.original.roomName}</span>
      ),
    },
    {
      accessorKey: 'checkIn',
      header: 'Check-in',
      cell: ({ row }) => (
        <span className="text-sm text-[#585858] dark:text-[#9ca3af]">{fmtDate(row.original.checkIn)}</span>
      ),
    },
    {
      accessorKey: 'checkOut',
      header: 'Check-out',
      cell: ({ row }) => (
        <span className="text-sm text-[#585858] dark:text-[#9ca3af]">{fmtDate(row.original.checkOut)}</span>
      ),
    },
    {
      accessorKey: 'source',
      header: 'Source',
      cell: ({ row }) => (
        <span className="text-xs text-[#9ca3af]">{SOURCE_LABELS[row.original.source]}</span>
      ),
    },
    {
      accessorKey: 'totalPrice',
      header: 'Total',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-medium text-[#111111] dark:text-white">
          {fmtXAF(row.original.totalPrice)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`label px-2 py-0.5 rounded-full text-[11px] border ${STATUS_STYLES[row.original.status] ?? ''}`}>
          {STATUS_LABELS[row.original.status] ?? row.original.status}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-[#585858] dark:text-[#9ca3af] hover:text-[#111111]"
          onClick={() => onRowClick(row.original.id)}
        >
          View →
        </Button>
      ),
    },
  ], [onRowClick]);
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function AdminBookings() {
  const { allBookings } = useAdminData();
  const navigate        = useNavigate();
  const [dialogOpen,  setDialogOpen]  = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = useMemo(() =>
    statusFilter === 'all'
      ? allBookings
      : allBookings.filter((b) => b.status === statusFilter),
    [allBookings, statusFilter],
  );

  const columns = useColumns((id) => navigate(`/admin/bookings/${id}`));

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allBookings.length };
    allBookings.forEach((b) => { counts[b.status] = (counts[b.status] ?? 0) + 1; });
    return counts;
  }, [allBookings]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] dark:text-white">Bookings</h1>
          <p className="text-sm text-[#585858] dark:text-[#9ca3af] mt-0.5">
            {allBookings.length} total reservations
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-[#141414] hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb] h-9 gap-2"
        >
          <Plus size={15} />
          New Booking
        </Button>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-[#9ca3af] shrink-0" />
        {[
          { key: 'all',         label: 'All' },
          { key: 'confirmed',   label: 'Confirmed' },
          { key: 'pending',     label: 'Pending' },
          { key: 'checked_in',  label: 'Checked In' },
          { key: 'checked_out', label: 'Checked Out' },
          { key: 'cancelled',   label: 'Cancelled' },
        ].map(({ key, label }) => (
          <button
            type="button"
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === key
                ? 'bg-[#141414] text-white dark:bg-white dark:text-[#111111]'
                : 'bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e] text-[#585858] dark:text-[#9ca3af] hover:border-[#111111] dark:hover:border-[#555555]'
            }`}
          >
            {label}
            {statusCounts[key] != null && (
              <span className="ml-1.5 opacity-60">{statusCounts[key]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filtered}
        searchKey="guestName"
        searchPlaceholder="Search by guest name…"
        pageSize={10}
      />

      <NewBookingDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
