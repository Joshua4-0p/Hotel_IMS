import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Star, MessageSquare } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

import { reviews as SEED_REVIEWS, type Review } from '../../data/reviews';
import { useAuth } from '../../context/AuthContext';
import { DataTable } from '../../components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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

// ── Types ───────────────────────────────────────────────────────────────────────
interface AdminReview extends Review {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  featured: boolean;
  reply?: string;
  date: string;
}

const REVIEWS_KEY = 'lodr_admin_reviews';

// ── Persistence ────────────────────────────────────────────────────────────────
function loadReviews(): AdminReview[] {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY);
    if (raw) return JSON.parse(raw) as AdminReview[];
  } catch { /* fall through */ }
  return SEED_REVIEWS.map((r, i) => ({
    ...r,
    id:       `rev_${i}`,
    status:   'approved' as const,
    featured: i < 3,
    date:     '2026-05-15',
  }));
}
function saveReviews(reviews: AdminReview[]) {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function StarRow({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={12}
          className={i < rating ? 'fill-amber-400 text-amber-400' : 'text-[#d1d5db] dark:text-[#4b5563]'} />
      ))}
    </span>
  );
}

const STATUS_BADGE: Record<AdminReview['status'], string> = {
  pending:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0',
  rejected: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-0',
};

// ── Schemas ───────────────────────────────────────────────────────────────────
const addSchema = z.object({
  name:     z.string().min(2, 'Name required'),
  location: z.string().min(2, 'Location required'),
  rating:   z.enum(['1', '2', '3', '4', '5']),
  quote:    z.string().min(10, 'Review text required'),
});
type AddValues = z.infer<typeof addSchema>;

const replySchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
  reply:  z.string().optional(),
});
type ReplyValues = z.infer<typeof replySchema>;

const BLANK_ADD: AddValues = { name: '', location: '', rating: '5', quote: '' };

// ── Reply Dialog ───────────────────────────────────────────────────────────────
function ReplyDialog({
  open, review, onClose, onSave,
}: {
  open: boolean;
  review: AdminReview | null;
  onClose: () => void;
  onSave: (values: ReplyValues) => void;
}) {
  const form = useForm<ReplyValues>({
    resolver: zodResolver(replySchema),
    defaultValues: { status: 'pending', reply: '' },
  });

  useEffect(() => {
    form.reset(review
      ? { status: review.status, reply: review.reply ?? '' }
      : { status: 'pending', reply: '' },
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, review?.id]);

  if (!review) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg bg-white dark:bg-[#1e1e1e] border-[#e5e7eb] dark:border-[#2e2e2e]">
        <DialogHeader>
          <DialogTitle className="text-[#111111] dark:text-white">Review Details</DialogTitle>
        </DialogHeader>

        {/* Read-only guest info + quote */}
        <div className="p-3 bg-[#f8f9fa] dark:bg-[#2a2a2a] rounded-button flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-[#111111] dark:text-white">{review.name}</p>
              <p className="text-xs text-[#9ca3af]">{review.location}</p>
            </div>
            <StarRow rating={review.rating} />
          </div>
          <p className="text-xs text-text-secondary dark:text-[#9ca3af] italic">"{review.quote}"</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="flex flex-col gap-4">
            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="reply" render={({ field }) => (
              <FormItem>
                <FormLabel>Hotel Reply <span className="text-[#9ca3af] font-normal">(optional)</span></FormLabel>
                <FormControl>
                  <Textarea placeholder="Write a public reply to this review…" rows={3} {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit"
                className="bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb]">
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ── Add Dialog ─────────────────────────────────────────────────────────────────
function AddDialog({
  open, onClose, onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (values: AddValues) => void;
}) {
  const form = useForm<AddValues>({ resolver: zodResolver(addSchema), defaultValues: BLANK_ADD });
  useEffect(() => { if (open) form.reset(BLANK_ADD); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md bg-white dark:bg-[#1e1e1e] border-[#e5e7eb] dark:border-[#2e2e2e]">
        <DialogHeader>
          <DialogTitle className="text-[#111111] dark:text-white">Add Review Manually</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Guest Name</FormLabel>
                  <FormControl><Input placeholder="Full name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl><Input placeholder="City, Country" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="rating" render={({ field }) => (
              <FormItem>
                <FormLabel>Rating</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {(['5', '4', '3', '2', '1'] as const).map((r) => (
                      <SelectItem key={r} value={r}>{'★'.repeat(+r)}{'☆'.repeat(5 - +r)} ({r}/5)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="quote" render={({ field }) => (
              <FormItem>
                <FormLabel>Review</FormLabel>
                <FormControl><Textarea placeholder="Guest's review text…" rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit"
                className="bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb]">
                Add Review
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function AdminReviews() {
  const { adminRole }                             = useAuth();
  const canModerate = adminRole === 'super_admin' || adminRole === 'manager';

  const [reviews,       setReviews]       = useState<AdminReview[]>(loadReviews);
  const [replyReview,   setReplyReview]   = useState<AdminReview | null>(null);
  const [addOpen,       setAddOpen]        = useState(false);
  const [deleteId,      setDeleteId]       = useState<string | null>(null);
  const [statusFilter,  setStatusFilter]   = useState<'all' | AdminReview['status']>('all');
  const [ratingFilter,  setRatingFilter]   = useState<0 | 1 | 2 | 3 | 4 | 5>(0);

  useEffect(() => { saveReviews(reviews); }, [reviews]);

  const approvedCount  = reviews.filter((r) => r.status === 'approved').length;
  const pendingCount   = reviews.filter((r) => r.status === 'pending').length;
  const featuredCount  = reviews.filter((r) => r.featured).length;

  const filtered = useMemo(() => {
    let base = reviews;
    if (statusFilter !== 'all') base = base.filter((r) => r.status === statusFilter);
    if (ratingFilter !== 0)     base = base.filter((r) => r.rating === ratingFilter);
    return base;
  }, [reviews, statusFilter, ratingFilter]);

  function toggleFeatured(id: string) {
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, featured: !r.featured } : r));
  }

  function handleReplySave(values: ReplyValues) {
    if (!replyReview) return;
    setReviews((prev) => prev.map((r) =>
      r.id === replyReview.id ? { ...r, status: values.status, reply: values.reply || undefined } : r,
    ));
    setReplyReview(null);
  }

  function handleAddSave(values: AddValues) {
    const newReview: AdminReview = {
      id:       'rev_' + Math.random().toString(36).slice(2, 9),
      name:     values.name,
      location: values.location,
      rating:   parseInt(values.rating, 10),
      quote:    values.quote,
      status:   'pending',
      featured: false,
      date:     new Date().toISOString().split('T')[0],
    };
    setReviews((prev) => [newReview, ...prev]);
    setAddOpen(false);
  }

  const columns: ColumnDef<AdminReview>[] = [
    {
      accessorKey: 'name',
      header: 'Guest',
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium text-[#111111] dark:text-white">{row.original.name}</p>
          <p className="text-xs text-[#9ca3af] mt-0.5">{row.original.location}</p>
        </div>
      ),
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }) => <StarRow rating={row.original.rating} />,
    },
    {
      accessorKey: 'quote',
      header: 'Review',
      cell: ({ row }) => (
        <p className="text-xs text-text-secondary dark:text-[#9ca3af] max-w-xs truncate">{row.original.quote}</p>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={STATUS_BADGE[row.original.status]}>
          {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
        </Badge>
      ),
    },
    {
      id: 'featured',
      header: 'Featured',
      cell: ({ row }) => (
        <Switch
          checked={row.original.featured}
          onCheckedChange={() => toggleFeatured(row.original.id)}
          aria-label={`Toggle featured for ${row.original.name}`}
        />
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => <span className="text-xs text-[#9ca3af]">{row.original.date}</span>,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          {canModerate && (
            <>
              <Button variant="ghost" size="sm"
                className="h-7 w-7 p-0 text-[#9ca3af] hover:text-[#111111] dark:hover:text-white"
                onClick={() => setReplyReview(row.original)}
                aria-label={`Reply to review by ${row.original.name}`}>
                <MessageSquare size={13} />
              </Button>
              <Button variant="ghost" size="sm"
                className="h-7 w-7 p-0 text-[#9ca3af] hover:text-red-500"
                onClick={() => setDeleteId(row.original.id)}
                aria-label={`Delete review by ${row.original.name}`}>
                <Trash2 size={13} />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-350 mx-auto flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] dark:text-white">Reviews</h1>
          <p className="text-sm text-text-secondary dark:text-[#9ca3af] mt-0.5">
            {reviews.length} total · {approvedCount} approved · {pendingCount} pending · {featuredCount} featured
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}
          className="bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb] h-9 gap-2">
          <Plus size={15} /> Add Review
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
            <button key={s} type="button" onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-button text-xs font-medium capitalize transition-colors ${
                statusFilter === s
                  ? 'bg-brand-black text-white dark:bg-white dark:text-[#111111]'
                  : 'bg-[#f3f4f6] dark:bg-[#2a2a2a] text-text-secondary dark:text-[#9ca3af] hover:bg-[#e5e7eb] dark:hover:bg-[#333333]'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-xs text-[#9ca3af] mr-1">Rating:</span>
          {([0, 5, 4, 3, 2, 1] as const).map((r) => (
            <button key={r} type="button" onClick={() => setRatingFilter(r)}
              className={`px-2 py-1 rounded-button text-xs font-medium transition-colors ${
                ratingFilter === r
                  ? 'bg-brand-black text-white dark:bg-white dark:text-[#111111]'
                  : 'bg-[#f3f4f6] dark:bg-[#2a2a2a] text-[#9ca3af] hover:bg-[#e5e7eb] dark:hover:bg-[#333333]'
              }`}
            >
              {r === 0 ? 'All' : `${'★'.repeat(r)}`}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchKey="name"
        searchPlaceholder="Search by guest name…"
        pageSize={10}
      />

      <ReplyDialog
        open={!!replyReview}
        review={replyReview}
        onClose={() => setReplyReview(null)}
        onSave={handleReplySave}
      />

      <AddDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={handleAddSave}
      />

      <Dialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <DialogContent className="max-w-sm bg-white dark:bg-[#1e1e1e] border-[#e5e7eb] dark:border-[#2e2e2e]">
          <DialogHeader>
            <DialogTitle className="text-[#111111] dark:text-white">Delete Review?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-text-secondary dark:text-[#9ca3af]">
            This review will be permanently deleted.
          </p>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive"
              onClick={() => {
                if (deleteId) { setReviews((prev) => prev.filter((r) => r.id !== deleteId)); setDeleteId(null); }
              }}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
