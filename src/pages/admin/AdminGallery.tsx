import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Star, ArrowUp, ArrowDown } from 'lucide-react';

import { galleryImages as SEED_GALLERY, type GalleryImage } from '../../data/gallery';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

// ── Types ───────────────────────────────────────────────────────────────────────
interface AdminGalleryImage extends GalleryImage {
  featured: boolean;
  order: number;
}

const GALLERY_KEY  = 'lodr_admin_gallery';
const CAT_OPTIONS  = ['Rooms', 'Dining', 'Facilities', 'Events'] as const;
type Category = typeof CAT_OPTIONS[number] | 'All';

const CATEGORY_COLORS: Record<typeof CAT_OPTIONS[number], string> = {
  Rooms:      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Dining:     'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Facilities: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Events:     'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

// ── Persistence ────────────────────────────────────────────────────────────────
function loadImages(): AdminGalleryImage[] {
  try {
    const raw = localStorage.getItem(GALLERY_KEY);
    if (raw) return JSON.parse(raw) as AdminGalleryImage[];
  } catch { /* fall through */ }
  return SEED_GALLERY.map((img, i) => ({ ...img, featured: i === 0, order: i }));
}
function saveImages(images: AdminGalleryImage[]) {
  localStorage.setItem(GALLERY_KEY, JSON.stringify(images));
}

// ── Form schema ────────────────────────────────────────────────────────────────
const imageSchema = z.object({
  url:      z.string().url('Valid URL required'),
  alt:      z.string().min(2, 'Alt text required'),
  category: z.enum(CAT_OPTIONS),
  featured: z.boolean(),
});
type ImageFormValues = z.infer<typeof imageSchema>;

const BLANK: ImageFormValues = { url: '', alt: '', category: 'Rooms', featured: false };

// ── Add/Edit Dialog ────────────────────────────────────────────────────────────
function ImageDialog({
  open, image, onClose, onSave,
}: {
  open: boolean;
  image: AdminGalleryImage | null;
  onClose: () => void;
  onSave: (values: ImageFormValues) => void;
}) {
  const form = useForm<ImageFormValues>({ resolver: zodResolver(imageSchema), defaultValues: BLANK });

  useEffect(() => {
    form.reset(image ? {
      url: image.url, alt: image.alt,
      category: image.category, featured: image.featured,
    } : BLANK);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, image?.id]);

  const watchedUrl = form.watch('url');

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md bg-white dark:bg-[#1e1e1e] border-[#e5e7eb] dark:border-[#2e2e2e]">
        <DialogHeader>
          <DialogTitle className="text-[#111111] dark:text-white">
            {image ? 'Edit Image' : 'Add Image'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="flex flex-col gap-4">
            <FormField control={form.control} name="url" render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl><Input placeholder="https://images.unsplash.com/…" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Preview */}
            {watchedUrl && (
              <div className="rounded-button overflow-hidden aspect-video bg-[#f3f4f6] dark:bg-[#2a2a2a]">
                <img src={watchedUrl} alt="preview" className="w-full h-full object-cover" />
              </div>
            )}

            <FormField control={form.control} name="alt" render={({ field }) => (
              <FormItem>
                <FormLabel>Alt Text</FormLabel>
                <FormControl><Input placeholder="e.g. Luxury suite bedroom" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {CAT_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="featured" render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">Featured image</FormLabel>
              </FormItem>
            )} />

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit"
                className="bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb]">
                {image ? 'Save Changes' : 'Add Image'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function AdminGallery() {
  const [images,     setImages]     = useState<AdminGalleryImage[]>(loadImages);
  const [catFilter,  setCatFilter]  = useState<Category>('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editImage,  setEditImage]  = useState<AdminGalleryImage | null>(null);
  const [deleteId,   setDeleteId]   = useState<number | null>(null);

  useEffect(() => { saveImages(images); }, [images]);

  const sorted = [...images].sort((a, b) => a.order - b.order);
  const filtered = catFilter === 'All' ? sorted : sorted.filter((img) => img.category === catFilter);
  const featuredCount = images.filter((img) => img.featured).length;

  function toggleFeatured(id: number) {
    setImages((prev) => prev.map((img) => img.id === id ? { ...img, featured: !img.featured } : img));
  }

  function moveUp(id: number) {
    setImages((prev) => {
      const displayed = [...prev].sort((a, b) => a.order - b.order)
        .filter((img) => catFilter === 'All' || img.category === catFilter);
      const idx = displayed.findIndex((img) => img.id === id);
      if (idx <= 0) return prev;
      const updated = prev.map((img) => ({ ...img }));
      const a = updated.find((img) => img.id === displayed[idx].id)!;
      const b = updated.find((img) => img.id === displayed[idx - 1].id)!;
      [a.order, b.order] = [b.order, a.order];
      return updated;
    });
  }

  function moveDown(id: number) {
    setImages((prev) => {
      const displayed = [...prev].sort((a, b) => a.order - b.order)
        .filter((img) => catFilter === 'All' || img.category === catFilter);
      const idx = displayed.findIndex((img) => img.id === id);
      if (idx >= displayed.length - 1) return prev;
      const updated = prev.map((img) => ({ ...img }));
      const a = updated.find((img) => img.id === displayed[idx].id)!;
      const b = updated.find((img) => img.id === displayed[idx + 1].id)!;
      [a.order, b.order] = [b.order, a.order];
      return updated;
    });
  }

  function handleSave(values: ImageFormValues) {
    if (editImage) {
      setImages((prev) => prev.map((img) =>
        img.id === editImage.id ? { ...img, ...values } : img,
      ));
    } else {
      const maxOrder = images.length > 0 ? Math.max(...images.map((img) => img.order)) + 1 : 0;
      const newId    = Date.now();
      setImages((prev) => [...prev, { id: newId, ...values, order: maxOrder }]);
    }
    setDialogOpen(false);
  }

  return (
    <div className="p-6 max-w-350 mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] dark:text-white">Gallery</h1>
          <p className="text-sm text-text-secondary dark:text-[#9ca3af] mt-0.5">
            {images.length} images · {featuredCount} featured
          </p>
        </div>
        <Button
          onClick={() => { setEditImage(null); setDialogOpen(true); }}
          className="bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb] h-9 gap-2"
        >
          <Plus size={15} /> Upload Image
        </Button>
      </div>

      {/* Category filter tabs */}
      <div className="flex items-center gap-1 border-b border-[#e5e7eb] dark:border-[#2e2e2e]">
        {(['All', ...CAT_OPTIONS] as Category[]).map((cat) => {
          const count = cat === 'All' ? images.length : images.filter((img) => img.category === cat).length;
          return (
            <button key={cat} type="button" onClick={() => setCatFilter(cat)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                catFilter === cat
                  ? 'border-[#111111] dark:border-white text-[#111111] dark:text-white'
                  : 'border-transparent text-text-secondary dark:text-[#9ca3af] hover:text-[#111111] dark:hover:text-white'
              }`}
            >
              {cat} <span className="text-xs text-[#9ca3af] ml-1">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Masonry grid */}
      {filtered.length === 0 ? (
        <p className="text-center text-sm text-[#9ca3af] py-16">No images in this category.</p>
      ) : (
        <div className="columns-2 md:columns-3 xl:columns-4 gap-4">
          {filtered.map((img, idx) => (
            <div key={img.id} className="break-inside-avoid mb-4">
              <Card className="overflow-hidden bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e]"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              >
                {/* Image */}
                <div className="relative">
                  <img src={img.url} alt={img.alt} className="w-full h-auto block" loading="lazy" />
                  {img.featured && (
                    <span className="absolute top-2 left-2 bg-amber-400 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                      Featured
                    </span>
                  )}
                </div>

                <CardContent className="p-3 flex flex-col gap-2">
                  <p className="text-xs text-[#111111] dark:text-white font-medium leading-snug line-clamp-2">
                    {img.alt}
                  </p>

                  <Badge className={`text-[10px] w-fit border-0 ${CATEGORY_COLORS[img.category]}`}>
                    {img.category}
                  </Badge>

                  {/* Actions */}
                  <div className="flex items-center gap-1 pt-1 border-t border-[#f3f4f6] dark:border-[#2a2a2a]">
                    <button type="button"
                      onClick={() => moveUp(img.id)}
                      disabled={idx === 0}
                      className="p-1 rounded text-[#9ca3af] hover:text-[#111111] dark:hover:text-white disabled:opacity-20 transition-colors"
                      aria-label="Move up"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button type="button"
                      onClick={() => moveDown(img.id)}
                      disabled={idx === filtered.length - 1}
                      className="p-1 rounded text-[#9ca3af] hover:text-[#111111] dark:hover:text-white disabled:opacity-20 transition-colors"
                      aria-label="Move down"
                    >
                      <ArrowDown size={13} />
                    </button>

                    <button type="button"
                      onClick={() => toggleFeatured(img.id)}
                      className={`p-1 rounded transition-colors ml-auto ${
                        img.featured ? 'text-amber-400 hover:text-amber-500' : 'text-[#9ca3af] hover:text-amber-400'
                      }`}
                      aria-label={img.featured ? 'Unset featured' : 'Set as featured'}
                    >
                      <Star size={13} className={img.featured ? 'fill-current' : ''} />
                    </button>
                    <button type="button"
                      onClick={() => { setEditImage(img); setDialogOpen(true); }}
                      className="p-1 rounded text-[#9ca3af] hover:text-[#111111] dark:hover:text-white transition-colors"
                      aria-label={`Edit ${img.alt}`}
                    >
                      <Pencil size={13} />
                    </button>
                    <button type="button"
                      onClick={() => setDeleteId(img.id)}
                      className="p-1 rounded text-[#9ca3af] hover:text-red-500 transition-colors"
                      aria-label={`Delete ${img.alt}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      <ImageDialog
        open={dialogOpen}
        image={editImage}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />

      <Dialog open={deleteId !== null} onOpenChange={(v) => !v && setDeleteId(null)}>
        <DialogContent className="max-w-sm bg-white dark:bg-[#1e1e1e] border-[#e5e7eb] dark:border-[#2e2e2e]">
          <DialogHeader>
            <DialogTitle className="text-[#111111] dark:text-white">Delete Image?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-text-secondary dark:text-[#9ca3af]">
            This image will be permanently removed from the gallery.
          </p>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive"
              onClick={() => {
                if (deleteId !== null) {
                  setImages((prev) => prev.filter((img) => img.id !== deleteId));
                  setDeleteId(null);
                }
              }}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
