import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, ChevronDown, ChevronRight } from 'lucide-react';

import { faqItems as SEED_FAQ, type FaqItem } from '../../data/faq';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// ── Types ───────────────────────────────────────────────────────────────────────
interface AdminFaqItem extends FaqItem {
  id: string;
  order: number;
}

const FAQ_KEY = 'lodr_admin_faq';

// ── Persistence ────────────────────────────────────────────────────────────────
function loadItems(): AdminFaqItem[] {
  try {
    const raw = localStorage.getItem(FAQ_KEY);
    if (raw) return JSON.parse(raw) as AdminFaqItem[];
  } catch { /* fall through */ }
  return SEED_FAQ.map((item, i) => ({ ...item, id: `faq_${i}`, order: i }));
}
function saveItems(items: AdminFaqItem[]) {
  localStorage.setItem(FAQ_KEY, JSON.stringify(items));
}

// ── Form schema ────────────────────────────────────────────────────────────────
const faqSchema = z.object({
  question: z.string().min(10, 'Question must be at least 10 characters'),
  answer:   z.string().min(20, 'Answer must be at least 20 characters'),
  category: z.string().min(1, 'Category required'),
});
type FaqFormValues = z.infer<typeof faqSchema>;

const BLANK: FaqFormValues = { question: '', answer: '', category: '' };

// ── Add/Edit Dialog ────────────────────────────────────────────────────────────
function FaqDialog({
  open, item, categories, onClose, onSave,
}: {
  open: boolean;
  item: AdminFaqItem | null;
  categories: string[];
  onClose: () => void;
  onSave: (values: FaqFormValues) => void;
}) {
  const form = useForm<FaqFormValues>({ resolver: zodResolver(faqSchema), defaultValues: BLANK });

  useEffect(() => {
    form.reset(item ? { question: item.question, answer: item.answer, category: item.category } : BLANK);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item?.id]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg bg-white dark:bg-[#1e1e1e] border-[#e5e7eb] dark:border-[#2e2e2e]">
        <DialogHeader>
          <DialogTitle className="text-[#111111] dark:text-white">
            {item ? 'Edit FAQ Item' : 'Add FAQ Item'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="flex flex-col gap-4">
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Category{' '}
                  <span className="text-[#9ca3af] font-normal">(select existing or type a new one)</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} list="faq-cats-list" placeholder="Booking, Amenities, Payment…" />
                </FormControl>
                <datalist id="faq-cats-list">
                  {categories.map((cat) => <option key={cat} value={cat} />)}
                </datalist>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="question" render={({ field }) => (
              <FormItem>
                <FormLabel>Question</FormLabel>
                <FormControl><Input placeholder="What is…?" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="answer" render={({ field }) => (
              <FormItem>
                <FormLabel>Answer</FormLabel>
                <FormControl><Textarea placeholder="Full answer…" rows={4} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit"
                className="bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb]">
                {item ? 'Save Changes' : 'Add Item'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function AdminFaq() {
  const [items,      setItems]      = useState<AdminFaqItem[]>(loadItems);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem,   setEditItem]   = useState<AdminFaqItem | null>(null);
  const [deleteId,   setDeleteId]   = useState<string | null>(null);
  const [openCats,   setOpenCats]   = useState<Set<string>>(
    () => new Set(loadItems().map((x) => x.category)),
  );

  useEffect(() => { saveItems(items); }, [items]);

  const grouped = useMemo(() => {
    const map: Record<string, AdminFaqItem[]> = {};
    items.forEach((item) => {
      if (!map[item.category]) map[item.category] = [];
      map[item.category].push(item);
    });
    Object.keys(map).forEach((cat) => { map[cat].sort((a, b) => a.order - b.order); });
    return map;
  }, [items]);

  const categories = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  function toggleCat(cat: string) {
    setOpenCats((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }

  function moveUp(id: string) {
    setItems((prev) => {
      const item     = prev.find((x) => x.id === id)!;
      const catItems = [...prev].filter((x) => x.category === item.category).sort((a, b) => a.order - b.order);
      const idx      = catItems.findIndex((x) => x.id === id);
      if (idx <= 0) return prev;
      const updated = prev.map((x) => ({ ...x }));
      const a = updated.find((x) => x.id === catItems[idx].id)!;
      const b = updated.find((x) => x.id === catItems[idx - 1].id)!;
      [a.order, b.order] = [b.order, a.order];
      return updated;
    });
  }

  function moveDown(id: string) {
    setItems((prev) => {
      const item     = prev.find((x) => x.id === id)!;
      const catItems = [...prev].filter((x) => x.category === item.category).sort((a, b) => a.order - b.order);
      const idx      = catItems.findIndex((x) => x.id === id);
      if (idx >= catItems.length - 1) return prev;
      const updated = prev.map((x) => ({ ...x }));
      const a = updated.find((x) => x.id === catItems[idx].id)!;
      const b = updated.find((x) => x.id === catItems[idx + 1].id)!;
      [a.order, b.order] = [b.order, a.order];
      return updated;
    });
  }

  function handleSave(values: FaqFormValues) {
    if (editItem) {
      setItems((prev) => prev.map((x) => x.id === editItem.id ? { ...x, ...values } : x));
    } else {
      const catItems = items.filter((x) => x.category === values.category);
      const maxOrder = catItems.length > 0 ? Math.max(...catItems.map((x) => x.order)) + 1 : 0;
      setItems((prev) => [...prev, {
        id:    'faq_' + Math.random().toString(36).slice(2, 9),
        order: maxOrder,
        ...values,
      }]);
      setOpenCats((prev) => new Set([...prev, values.category]));
    }
    setDialogOpen(false);
  }

  return (
    <div className="p-6 max-w-350 mx-auto flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] dark:text-white">FAQ</h1>
          <p className="text-sm text-text-secondary dark:text-[#9ca3af] mt-0.5">
            {items.length} items · {categories.length} categories
          </p>
        </div>
        <Button onClick={() => { setEditItem(null); setDialogOpen(true); }}
          className="bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb] h-9 gap-2">
          <Plus size={15} /> Add Item
        </Button>
      </div>

      {categories.length === 0 ? (
        <Card className="bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e]">
          <CardContent className="py-12 text-center text-sm text-[#9ca3af]">
            No FAQ items yet. Click "Add Item" to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {categories.map((cat) => {
            const catItems = grouped[cat];
            const isOpen   = openCats.has(cat);
            return (
              <Card key={cat}
                className="bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e] overflow-hidden"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
              >
                <CardHeader
                  className="px-5 py-3.5 border-b border-[#e5e7eb] dark:border-[#2e2e2e] cursor-pointer select-none"
                  onClick={() => toggleCat(cat)}
                >
                  <div className="flex items-center gap-2">
                    {isOpen
                      ? <ChevronDown  size={15} className="text-[#9ca3af] shrink-0" />
                      : <ChevronRight size={15} className="text-[#9ca3af] shrink-0" />
                    }
                    <span className="font-semibold text-sm text-[#111111] dark:text-white">{cat}</span>
                    <span className="text-xs text-[#9ca3af]">({catItems.length})</span>
                  </div>
                </CardHeader>

                {isOpen && (
                  <CardContent className="p-0">
                    <div className="divide-y divide-[#f3f4f6] dark:divide-[#2a2a2a]">
                      {catItems.map((item, idx) => (
                        <div key={item.id}
                          className="flex items-start gap-3 px-5 py-4 hover:bg-brand-cream dark:hover:bg-[#252525] transition-colors">
                          {/* Reorder */}
                          <div className="flex flex-col gap-0.5 shrink-0 mt-0.5">
                            <button type="button" onClick={() => moveUp(item.id)} disabled={idx === 0}
                              className="p-0.5 rounded text-[#9ca3af] hover:text-[#111111] dark:hover:text-white disabled:opacity-20 transition-colors"
                              aria-label="Move up">
                              <ArrowUp size={13} />
                            </button>
                            <button type="button" onClick={() => moveDown(item.id)} disabled={idx === catItems.length - 1}
                              className="p-0.5 rounded text-[#9ca3af] hover:text-[#111111] dark:hover:text-white disabled:opacity-20 transition-colors"
                              aria-label="Move down">
                              <ArrowDown size={13} />
                            </button>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#111111] dark:text-white">{item.question}</p>
                            <p className="text-xs text-text-secondary dark:text-[#9ca3af] mt-1 line-clamp-2">{item.answer}</p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            <Button variant="ghost" size="sm"
                              className="h-7 w-7 p-0 text-[#9ca3af] hover:text-[#111111] dark:hover:text-white"
                              onClick={() => { setEditItem(item); setDialogOpen(true); }}
                              aria-label={`Edit: ${item.question}`}>
                              <Pencil size={13} />
                            </Button>
                            <Button variant="ghost" size="sm"
                              className="h-7 w-7 p-0 text-[#9ca3af] hover:text-red-500"
                              onClick={() => setDeleteId(item.id)}
                              aria-label={`Delete: ${item.question}`}>
                              <Trash2 size={13} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <FaqDialog
        open={dialogOpen}
        item={editItem}
        categories={categories}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />

      <Dialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <DialogContent className="max-w-sm bg-white dark:bg-[#1e1e1e] border-[#e5e7eb] dark:border-[#2e2e2e]">
          <DialogHeader>
            <DialogTitle className="text-[#111111] dark:text-white">Delete FAQ Item?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-text-secondary dark:text-[#9ca3af]">
            This item will be permanently removed from the FAQ.
          </p>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive"
              onClick={() => {
                if (deleteId) { setItems((prev) => prev.filter((x) => x.id !== deleteId)); setDeleteId(null); }
              }}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
