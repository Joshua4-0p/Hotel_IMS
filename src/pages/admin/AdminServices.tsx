import { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { services as SEED_SERVICES, type Service } from '../../data/services';
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// ── Extended service with admin metadata ───────────────────────────────────────
interface AdminService extends Service {
  published: boolean;
  order: number;
  price?: string;
  hours?: string;
  category: string;
}

const SERVICES_STORAGE_KEY = 'lodr_admin_services';
const ICON_OPTIONS = [
  'Waves', 'Gamepad2', 'Dumbbell', 'Car', 'ParkingSquare', 'Baby',
  'Utensils', 'Wifi', 'Coffee', 'Star', 'Shield', 'Sparkles',
  'HeartPulse', 'Camera', 'Music', 'Wind',
];

const CATEGORY_OPTIONS = ['Leisure', 'Wellness', 'Transport', 'Food & Drink', 'Business', 'Family', 'Other'];

function loadServices(): AdminService[] {
  try {
    const raw = localStorage.getItem(SERVICES_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AdminService[];
  } catch { /* fall through */ }
  return SEED_SERVICES.map((s, i) => ({
    ...s,
    published: true,
    order: i,
    price: '',
    hours: '',
    category: 'Leisure',
  }));
}

function saveServices(services: AdminService[]) {
  localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
}

// ── Service form schema ────────────────────────────────────────────────────────
const serviceSchema = z.object({
  title:       z.string().min(2, 'Title required'),
  description: z.string().min(10, 'Description required'),
  image:       z.string().url('Must be a valid URL'),
  icon:        z.string().min(1, 'Select an icon'),
  price:       z.string().optional(),
  hours:       z.string().optional(),
  category:    z.string().min(1, 'Category required'),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

// ── Add/Edit Dialog ────────────────────────────────────────────────────────────
function ServiceDialog({
  open,
  service,
  onClose,
  onSave,
}: {
  open: boolean;
  service: AdminService | null;
  onClose: () => void;
  onSave: (values: ServiceFormValues) => void;
}) {
  const isNew = !service;

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: service ? {
      title:       service.title,
      description: service.description,
      image:       service.image,
      icon:        service.icon,
      price:       service.price ?? '',
      hours:       service.hours ?? '',
      category:    service.category,
    } : {
      title: '', description: '', image: '', icon: 'Star',
      price: '', hours: '', category: 'Leisure',
    },
  });

  // Reset when service changes
  useEffect(() => {
    if (service) {
      form.reset({
        title:       service.title,
        description: service.description,
        image:       service.image,
        icon:        service.icon,
        price:       service.price ?? '',
        hours:       service.hours ?? '',
        category:    service.category,
      });
    } else {
      form.reset({ title: '', description: '', image: '', icon: 'Star', price: '', hours: '', category: 'Leisure' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service?.id]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg bg-white dark:bg-[#1e1e1e] border-[#e5e7eb] dark:border-[#2e2e2e] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#111111] dark:text-white">
            {isNew ? 'Add Service' : 'Edit Service'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="flex flex-col gap-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl><Input placeholder="e.g. Rooftop Bar" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea placeholder="Describe this service…" rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="image" render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl><Input placeholder="https://images.unsplash.com/…" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="icon" render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {ICON_OPTIONS.map((icon) => (
                        <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (optional)</FormLabel>
                  <FormControl><Input placeholder="e.g. Free, XAF 5,000" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="hours" render={({ field }) => (
                <FormItem>
                  <FormLabel>Hours (optional)</FormLabel>
                  <FormControl><Input placeholder="e.g. 06:00 – 22:00" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb]">
                {isNew ? 'Add Service' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function AdminServices() {
  const [services, setServices] = useState<AdminService[]>(loadServices);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editService, setEditService] = useState<AdminService | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { saveServices(services); }, [services]);

  const sorted = [...services].sort((a, b) => a.order - b.order);

  function moveUp(id: string) {
    setServices((prev) => {
      const arr = [...prev].sort((a, b) => a.order - b.order);
      const idx = arr.findIndex((s) => s.id === id);
      if (idx <= 0) return prev;
      const updated = arr.map((s) => ({ ...s }));
      [updated[idx].order, updated[idx - 1].order] = [updated[idx - 1].order, updated[idx].order];
      return updated;
    });
  }

  function moveDown(id: string) {
    setServices((prev) => {
      const arr = [...prev].sort((a, b) => a.order - b.order);
      const idx = arr.findIndex((s) => s.id === id);
      if (idx >= arr.length - 1) return prev;
      const updated = arr.map((s) => ({ ...s }));
      [updated[idx].order, updated[idx + 1].order] = [updated[idx + 1].order, updated[idx].order];
      return updated;
    });
  }

  function togglePublished(id: string) {
    setServices((prev) => prev.map((s) => s.id === id ? { ...s, published: !s.published } : s));
  }

  function openAdd() { setEditService(null); setDialogOpen(true); }
  function openEdit(service: AdminService) { setEditService(service); setDialogOpen(true); }

  function handleSave(values: ServiceFormValues) {
    if (editService) {
      setServices((prev) => prev.map((s) => s.id === editService.id ? { ...s, ...values } : s));
    } else {
      const maxOrder = services.length > 0 ? Math.max(...services.map((s) => s.order)) + 1 : 0;
      setServices((prev) => [...prev, {
        ...values,
        id: 'svc_' + Math.random().toString(36).slice(2, 9),
        published: true,
        order: maxOrder,
      }]);
    }
    setDialogOpen(false);
  }

  function handleDelete(id: string) {
    setServices((prev) => prev.filter((s) => s.id !== id));
    setDeleteId(null);
  }

  const publishedCount = services.filter((s) => s.published).length;

  return (
    <div className="p-6 max-w-350 mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] dark:text-white">Services</h1>
          <p className="text-sm text-text-secondary dark:text-[#9ca3af] mt-0.5">
            {services.length} services · {publishedCount} published · {services.length - publishedCount} hidden
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb] h-9 gap-2"
        >
          <Plus size={15} /> Add Service
        </Button>
      </div>

      {/* Services list */}
      <Card className="bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e] overflow-hidden"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
      >
        <CardHeader className="px-5 py-4 border-b border-[#e5e7eb] dark:border-[#2e2e2e]">
          <p className="text-xs text-[#9ca3af]">
            Drag-reorder via ↑↓ arrows. Toggle the eye icon to publish/unpublish on the guest-facing site.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {sorted.length === 0 ? (
            <p className="text-center text-sm text-[#9ca3af] py-12">No services yet.</p>
          ) : (
            <div className="divide-y divide-[#f3f4f6] dark:divide-[#2e2e2e]">
              {sorted.map((service, idx) => (
                <div
                  key={service.id}
                  className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${
                    !service.published ? 'opacity-50' : 'hover:bg-brand-cream dark:hover:bg-[#252525]'
                  }`}
                >
                  {/* Reorder arrows */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveUp(service.id)}
                      disabled={idx === 0}
                      className="p-0.5 rounded text-[#9ca3af] hover:text-[#111111] dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDown(service.id)}
                      disabled={idx === sorted.length - 1}
                      className="p-0.5 rounded text-[#9ca3af] hover:text-[#111111] dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowDown size={13} />
                    </button>
                  </div>

                  {/* Image */}
                  <img src={service.image} alt={service.title}
                    className="w-14 h-10 object-cover rounded-button shrink-0" />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-[#111111] dark:text-white">{service.title}</p>
                      <span className="text-[10px] px-1.5 py-0.5 bg-[#f3f4f6] dark:bg-[#2a2a2a] text-[#9ca3af] rounded-full">
                        {service.category}
                      </span>
                      {service.price && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400">{service.price}</span>
                      )}
                    </div>
                    <p className="text-xs text-[#9ca3af] mt-0.5 truncate max-w-md">{service.description}</p>
                    {service.hours && (
                      <p className="text-[10px] text-[#9ca3af] mt-0.5">⏰ {service.hours}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => togglePublished(service.id)}
                      className={`p-1.5 rounded transition-colors ${
                        service.published
                          ? 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400'
                          : 'text-[#9ca3af] hover:text-[#585858]'
                      }`}
                      title={service.published ? 'Published — click to unpublish' : 'Hidden — click to publish'}
                    >
                      {service.published ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                    <Button variant="ghost" size="sm"
                      className="h-7 w-7 p-0 text-[#9ca3af] hover:text-[#111111] dark:hover:text-white"
                      onClick={() => openEdit(service)}
                      aria-label={`Edit ${service.title}`}
                    >
                      <Pencil size={13} />
                    </Button>
                    <Button variant="ghost" size="sm"
                      className="h-7 w-7 p-0 text-[#9ca3af] hover:text-red-500"
                      onClick={() => setDeleteId(service.id)}
                      aria-label={`Delete ${service.title}`}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service dialog */}
      <ServiceDialog
        open={dialogOpen}
        service={editService}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <DialogContent className="max-w-sm bg-white dark:bg-[#1e1e1e] border-[#e5e7eb] dark:border-[#2e2e2e]">
          <DialogHeader>
            <DialogTitle className="text-[#111111] dark:text-white">Delete Service?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-text-secondary dark:text-[#9ca3af]">
            This will remove the service from the list permanently. The guest-facing page will no longer show it.
          </p>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
