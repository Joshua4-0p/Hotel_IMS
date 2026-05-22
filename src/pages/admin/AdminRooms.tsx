import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { type ColumnDef } from '@tanstack/react-table';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil } from 'lucide-react';

import { useAdminData } from '../../context/AdminDataContext';
import type { Room } from '../../data/rooms';
import { DataTable } from '../../components/admin/DataTable';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmtXAF = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 });

const CATEGORY_STYLES: Record<string, string> = {
  Standard: 'bg-[#f3f4f6] text-text-secondary border-[#e5e7eb] dark:bg-[#2a2a2a] dark:text-[#9ca3af]',
  Deluxe:   'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
  Suite:    'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400',
};

// ── Edit room schema ───────────────────────────────────────────────────────────
const roomSchema = z.object({
  name:        z.string().min(2, 'Name is required'),
  category:    z.enum(['Standard', 'Deluxe', 'Suite']),
  price:       z.number().min(1, 'Price is required'),
  capacity:    z.number().min(1).max(20),
  bedType:     z.string().min(1, 'Bed type is required'),
  size:        z.string().min(1, 'Size is required'),
  description: z.string().min(10, 'Description is required'),
  amenities:   z.string().min(1, 'Add at least one amenity'),
});

type RoomFormValues = z.infer<typeof roomSchema>;

// ── Edit Room Dialog ───────────────────────────────────────────────────────────
function EditRoomDialog({
  room, onClose,
}: { room: Room | null; onClose: () => void }) {
  const { updateRoom } = useAdminData();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: room ? {
      name:        room.name,
      category:    room.category,
      price:       room.price,
      capacity:    room.capacity,
      bedType:     room.bedType,
      size:        room.size,
      description: room.description,
      amenities:   room.amenities.join(', '),
    } : {
      name: '', category: 'Standard', price: 0,
      capacity: 2, bedType: '', size: '', description: '', amenities: '',
    },
  });

  // Reset form when room changes
  useMemo(() => {
    if (room) {
      form.reset({
        name:        room.name,
        category:    room.category,
        price:       room.price,
        capacity:    room.capacity,
        bedType:     room.bedType,
        size:        room.size,
        description: room.description,
        amenities:   room.amenities.join(', '),
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.id]);

  async function onSubmit(values: RoomFormValues) {
    if (!room) return;
    setSubmitting(true);
    updateRoom(room.id, {
      name:        values.name,
      category:    values.category,
      price:       values.price,
      capacity:    values.capacity,
      bedType:     values.bedType,
      size:        values.size,
      description: values.description,
      amenities:   values.amenities.split(',').map((s) => s.trim()).filter(Boolean),
    });
    setSubmitting(false);
    onClose();
  }

  return (
    <Dialog open={!!room} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg bg-white dark:bg-[#1e1e1e] border-[#e5e7eb] dark:border-[#2e2e2e]">
        <DialogHeader>
          <DialogTitle className="text-[#111111] dark:text-white">Edit Room</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Room Name</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Deluxe">Deluxe</SelectItem>
                      <SelectItem value="Suite">Suite</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Price / night (XAF)</FormLabel>
                  <FormControl><Input type="number" min={0} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="capacity" render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl><Input type="number" min={1} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="bedType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Bed Type</FormLabel>
                  <FormControl><Input placeholder="King" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="size" render={({ field }) => (
                <FormItem>
                  <FormLabel>Size</FormLabel>
                  <FormControl><Input placeholder="40 m²" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="amenities" render={({ field }) => (
              <FormItem>
                <FormLabel>Amenities (comma-separated)</FormLabel>
                <FormControl>
                  <Input placeholder="Wi-Fi, Mini Bar, Air Conditioning" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb]"
              >
                {submitting ? 'Saving…' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ── Columns ────────────────────────────────────────────────────────────────────
function useColumns(
  onEdit: (room: Room) => void,
  onView: (id: string) => void,
): ColumnDef<Room>[] {
  return useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Room',
      cell: ({ row }) => (
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onView(row.original.id)}>
          <img
            src={row.original.images[0]}
            alt={row.original.name}
            className="w-12 h-9 object-cover rounded-button shrink-0"
          />
          <div>
            <p className="font-medium text-sm text-[#111111] dark:text-white">{row.original.name}</p>
            <p className="text-xs text-[#9ca3af]">{row.original.size} · {row.original.bedType}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <span className={`label px-2 py-0.5 rounded-full border text-[11px] ${CATEGORY_STYLES[row.original.category]}`}>
          {row.original.category}
        </span>
      ),
    },
    {
      accessorKey: 'price',
      header: 'Price / Night',
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium text-[#111111] dark:text-white">
          {fmtXAF(row.original.price)}
        </span>
      ),
    },
    {
      accessorKey: 'capacity',
      header: 'Capacity',
      cell: ({ row }) => (
        <span className="text-sm text-text-secondary dark:text-[#9ca3af]">
          {row.original.capacity} guest{row.original.capacity !== 1 ? 's' : ''}
        </span>
      ),
    },
    {
      accessorKey: 'amenities',
      header: 'Amenities',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 max-w-55">
          {row.original.amenities.slice(0, 3).map((a) => (
            <span key={a} className="text-[10px] px-1.5 py-0.5 bg-[#f3f4f6] dark:bg-[#2a2a2a] text-text-secondary dark:text-[#9ca3af] rounded-full">
              {a}
            </span>
          ))}
          {row.original.amenities.length > 3 && (
            <span className="text-[10px] px-1.5 py-0.5 text-[#9ca3af]">
              +{row.original.amenities.length - 3}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-[#9ca3af] hover:text-[#111111] dark:hover:text-white"
            onClick={() => onEdit(row.original)}
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-text-secondary dark:text-[#9ca3af] hover:text-[#111111] dark:hover:text-white"
            onClick={() => onView(row.original.id)}
          >
            View →
          </Button>
        </div>
      ),
    },
  ], [onEdit, onView]);
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function AdminRooms() {
  const { allRooms, allBookings } = useAdminData();
  const navigate                  = useNavigate();
  const [editRoom, setEditRoom]   = useState<Room | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const roomsWithStatus = useMemo(() => {
    return allRooms.map((room) => {
      const active = allBookings.find(
        (b) => b.roomId === room.id &&
          (b.status === 'checked_in' || (b.status === 'confirmed' && b.checkIn <= today && b.checkOut > today)),
      );
      return { ...room, _occupiedBy: active?.guestName ?? null };
    });
  }, [allRooms, allBookings, today]);

  const columns = useColumns(
    (room) => setEditRoom(room),
    (id)   => navigate(`/admin/rooms/${id}`),
  );

  const occupied  = roomsWithStatus.filter((r) => r._occupiedBy).length;
  const available = roomsWithStatus.length - occupied;

  return (
    <div className="p-6 max-w-350 mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] dark:text-white">Rooms</h1>
          <p className="text-sm text-text-secondary dark:text-[#9ca3af] mt-0.5">
            {allRooms.length} rooms · {occupied} occupied · {available} available
          </p>
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex items-center gap-3 flex-wrap">
        {[
          { label: 'Total Rooms', value: allRooms.length,     cls: 'bg-[#f3f4f6] text-text-secondary dark:bg-[#2a2a2a] dark:text-[#9ca3af]' },
          { label: 'Occupied',    value: occupied,            cls: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
          { label: 'Available',   value: available,           cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
          { label: 'Suites',      value: allRooms.filter((r) => r.category === 'Suite').length,   cls: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
          { label: 'Deluxe',      value: allRooms.filter((r) => r.category === 'Deluxe').length,  cls: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
        ].map((item) => (
          <div key={item.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${item.cls} border-current/20`}>
            <span className="font-bold">{item.value}</span>
            <span className="opacity-70">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={allRooms}
        searchKey="name"
        searchPlaceholder="Search by room name…"
        pageSize={10}
      />

      <EditRoomDialog room={editRoom} onClose={() => setEditRoom(null)} />
    </div>
  );
}
