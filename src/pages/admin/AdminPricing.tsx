import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useAdminData } from '../../context/AdminDataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ── Types ──────────────────────────────────────────────────────────────────────
interface SeasonalRate {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  adjustmentType: 'fixed' | 'percentage';
  adjustmentValue: number;
  appliesTo: 'all' | 'Standard' | 'Deluxe' | 'Suite';
  active: boolean;
}

interface DiscountCode {
  id: string;
  code: string;
  discountType: 'fixed' | 'percentage';
  value: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  active: boolean;
}

const PRICING_STORAGE_KEY = 'lodr_pricing_data';

function loadPricingData(): { rates: SeasonalRate[]; codes: DiscountCode[] } {
  try {
    const raw = localStorage.getItem(PRICING_STORAGE_KEY);
    return raw ? JSON.parse(raw) : { rates: [], codes: [] };
  } catch { return { rates: [], codes: [] }; }
}
function savePricingData(data: { rates: SeasonalRate[]; codes: DiscountCode[] }) {
  localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(data));
}

const fmtXAF = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 });

// ── Seasonal rate schema ───────────────────────────────────────────────────────
const rateSchema = z.object({
  name:            z.string().min(1, 'Name required'),
  startDate:       z.string().min(1, 'Start date required'),
  endDate:         z.string().min(1, 'End date required'),
  adjustmentType:  z.enum(['fixed', 'percentage']),
  adjustmentValue: z.coerce.number().min(0),
  appliesTo:       z.enum(['all', 'Standard', 'Deluxe', 'Suite']),
});
type RateInput  = z.input<typeof rateSchema>;
type RateValues = z.output<typeof rateSchema>;

// ── Discount code schema ───────────────────────────────────────────────────────
const codeSchema = z.object({
  code:         z.string().min(2, 'Code required').toUpperCase(),
  discountType: z.enum(['fixed', 'percentage']),
  value:        z.coerce.number().min(1),
  expiryDate:   z.string().min(1, 'Expiry date required'),
  usageLimit:   z.coerce.number().min(1),
});
type CodeInput  = z.input<typeof codeSchema>;
type CodeValues = z.output<typeof codeSchema>;

// ── Room price editor ──────────────────────────────────────────────────────────
function RoomPriceEditor() {
  const { allRooms, updateRoom } = useAdminData();
  const [editing, setEditing]   = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState('');

  function startEdit(roomId: string, currentPrice: number) {
    setEditing(roomId);
    setTempPrice(String(currentPrice));
  }

  function savePrice(roomId: string) {
    const n = parseInt(tempPrice, 10);
    if (!isNaN(n) && n > 0) updateRoom(roomId, { price: n });
    setEditing(null);
  }

  return (
    <div className="flex flex-col gap-2">
      {allRooms.map((room) => (
        <div key={room.id}
          className="flex items-center justify-between gap-4 px-4 py-3 bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e] rounded-button"
        >
          <div className="flex items-center gap-3 min-w-0">
            <img src={room.images[0]} alt={room.name}
              className="w-10 h-8 object-cover rounded shrink-0" />
            <div>
              <p className="text-sm font-medium text-[#111111] dark:text-white">{room.name}</p>
              <p className="text-xs text-[#9ca3af]">{room.category} · {room.size}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {editing === room.id ? (
              <>
                <Input
                  type="number"
                  value={tempPrice}
                  onChange={(e) => setTempPrice(e.target.value)}
                  className="h-8 w-36 text-xs font-mono"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && savePrice(room.id)}
                />
                <Button size="sm" className="h-8 text-xs bg-brand-black text-white hover:bg-[#333333] dark:bg-white dark:text-[#111111]"
                  onClick={() => savePrice(room.id)}
                >
                  Save
                </Button>
                <Button size="sm" variant="ghost" className="h-8 text-xs"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <span className="font-mono text-sm font-semibold text-[#111111] dark:text-white">
                  {fmtXAF(room.price)}<span className="text-xs text-[#9ca3af] font-normal">/night</span>
                </span>
                <Button size="sm" variant="ghost"
                  className="h-8 w-8 p-0 text-[#9ca3af] hover:text-[#111111] dark:hover:text-white"
                  onClick={() => startEdit(room.id, room.price)}
                >
                  <Pencil size={13} />
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Seasonal Rates tab ─────────────────────────────────────────────────────────
function SeasonalRatesTab({ rates, setRates }: {
  rates: SeasonalRate[];
  setRates: React.Dispatch<React.SetStateAction<SeasonalRate[]>>;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId,     setEditId]     = useState<string | null>(null);

  const form = useForm<RateInput, unknown, RateValues>({
    resolver: zodResolver(rateSchema),
    defaultValues: { name: '', startDate: '', endDate: '', adjustmentType: 'percentage', adjustmentValue: 0, appliesTo: 'all' },
  });

  function openNew() { form.reset({ name: '', startDate: '', endDate: '', adjustmentType: 'percentage', adjustmentValue: 0, appliesTo: 'all' }); setEditId(null); setDialogOpen(true); }
  function openEdit(rate: SeasonalRate) {
    form.reset({ name: rate.name, startDate: rate.startDate, endDate: rate.endDate, adjustmentType: rate.adjustmentType, adjustmentValue: rate.adjustmentValue, appliesTo: rate.appliesTo });
    setEditId(rate.id);
    setDialogOpen(true);
  }

  function onSubmit(values: RateValues) {
    if (editId) {
      setRates((prev) => prev.map((r) => r.id === editId ? { ...r, ...values } : r));
    } else {
      setRates((prev) => [...prev, { ...values, id: 'rate_' + Math.random().toString(36).slice(2, 9), active: true }]);
    }
    setDialogOpen(false);
  }

  function toggleActive(id: string) {
    setRates((prev) => prev.map((r) => r.id === id ? { ...r, active: !r.active } : r));
  }
  function remove(id: string) { setRates((prev) => prev.filter((r) => r.id !== id)); }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={openNew}
          className="gap-1.5 bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb]"
        >
          <Plus size={14} /> Add Rule
        </Button>
      </div>

      {rates.length === 0 ? (
        <p className="text-center text-sm text-[#9ca3af] py-8">No seasonal rate rules yet. Add one to override base prices.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {rates.map((rate) => (
            <div key={rate.id}
              className={`flex items-center justify-between gap-4 px-4 py-3 bg-white dark:bg-[#1e1e1e] border rounded-button transition-opacity ${rate.active ? 'border-[#e5e7eb] dark:border-[#2e2e2e]' : 'border-[#f3f4f6] dark:border-[#2a2a2a] opacity-60'}`}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#111111] dark:text-white">{rate.name}</p>
                <p className="text-xs text-[#9ca3af] mt-0.5">
                  {rate.startDate} → {rate.endDate} · {rate.appliesTo === 'all' ? 'All rooms' : rate.appliesTo} ·{' '}
                  {rate.adjustmentType === 'percentage'
                    ? `${rate.adjustmentValue >= 0 ? '+' : ''}${rate.adjustmentValue}%`
                    : `${rate.adjustmentValue >= 0 ? '+' : ''}${fmtXAF(rate.adjustmentValue)}`}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch checked={rate.active} onCheckedChange={() => toggleActive(rate.id)} />
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-[#9ca3af] hover:text-[#111111] dark:hover:text-white" onClick={() => openEdit(rate)}>
                  <Pencil size={12} />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-[#9ca3af] hover:text-red-500" onClick={() => remove(rate.id)}>
                  <Trash2 size={12} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(v) => !v && setDialogOpen(false)}>
        <DialogContent className="max-w-md bg-white dark:bg-[#1e1e1e] border-[#e5e7eb] dark:border-[#2e2e2e]">
          <DialogHeader>
            <DialogTitle className="text-[#111111] dark:text-white">
              {editId ? 'Edit Rate Rule' : 'New Seasonal Rate Rule'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Rule Name</FormLabel>
                  <FormControl><Input placeholder="e.g. High Season, Christmas" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="startDate" render={({ field }) => (
                  <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="endDate" render={({ field }) => (
                  <FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="adjustmentType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed (XAF)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="adjustmentValue" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g. 20" {...field} value={field.value as number} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="appliesTo" render={({ field }) => (
                <FormItem>
                  <FormLabel>Applies To</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="all">All Rooms</SelectItem>
                      <SelectItem value="Standard">Standard Only</SelectItem>
                      <SelectItem value="Deluxe">Deluxe Only</SelectItem>
                      <SelectItem value="Suite">Suites Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter className="gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb]">
                  {editId ? 'Save Changes' : 'Create Rule'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Discount Codes tab ─────────────────────────────────────────────────────────
function DiscountCodesTab({ codes, setCodes }: {
  codes: DiscountCode[];
  setCodes: React.Dispatch<React.SetStateAction<DiscountCode[]>>;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId,     setEditId]     = useState<string | null>(null);

  const form = useForm<CodeInput, unknown, CodeValues>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: '', discountType: 'percentage', value: 0, expiryDate: '', usageLimit: 100 },
  });

  function openNew() { form.reset({ code: '', discountType: 'percentage', value: 0, expiryDate: '', usageLimit: 100 }); setEditId(null); setDialogOpen(true); }
  function openEdit(c: DiscountCode) {
    form.reset({ code: c.code, discountType: c.discountType, value: c.value, expiryDate: c.expiryDate, usageLimit: c.usageLimit });
    setEditId(c.id);
    setDialogOpen(true);
  }

  function onSubmit(values: CodeValues) {
    if (editId) {
      setCodes((prev) => prev.map((c) => c.id === editId ? { ...c, ...values } : c));
    } else {
      setCodes((prev) => [...prev, {
        ...values,
        id: 'dc_' + Math.random().toString(36).slice(2, 9),
        usedCount: 0,
        active: true,
      }]);
    }
    setDialogOpen(false);
  }

  function toggleActive(id: string) { setCodes((prev) => prev.map((c) => c.id === id ? { ...c, active: !c.active } : c)); }
  function remove(id: string) { setCodes((prev) => prev.filter((c) => c.id !== id)); }

  const isExpired = (c: DiscountCode) => c.expiryDate && c.expiryDate < new Date().toISOString().split('T')[0];
  const isFull    = (c: DiscountCode) => c.usedCount >= c.usageLimit;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={openNew}
          className="gap-1.5 bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb]"
        >
          <Tag size={14} /> Add Code
        </Button>
      </div>

      {codes.length === 0 ? (
        <p className="text-center text-sm text-[#9ca3af] py-8">No discount codes yet.</p>
      ) : (
        <div className="rounded-card border border-[#e5e7eb] dark:border-[#2e2e2e] overflow-hidden bg-white dark:bg-[#1e1e1e]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e7eb] dark:border-[#2e2e2e]">
                {['Code', 'Discount', 'Expiry', 'Usage', 'Status', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#9ca3af] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6] dark:divide-[#2e2e2e]">
              {codes.map((c) => (
                <tr key={c.id} className="hover:bg-brand-cream dark:hover:bg-[#252525] transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-[#111111] dark:text-white bg-[#f3f4f6] dark:bg-[#2a2a2a] px-2 py-0.5 rounded">
                      {c.code}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#111111] dark:text-white font-medium">
                    {c.discountType === 'percentage' ? `${c.value}%` : fmtXAF(c.value)} off
                  </td>
                  <td className="px-4 py-3 text-xs text-[#9ca3af]">{c.expiryDate || '—'}</td>
                  <td className="px-4 py-3 text-xs text-[#9ca3af]">
                    {c.usedCount} / {c.usageLimit}
                  </td>
                  <td className="px-4 py-3">
                    {isExpired(c) ? (
                      <span className="label px-2 py-0.5 rounded-full border text-[11px] bg-[#f3f4f6] text-text-secondary border-[#e5e7eb]">Expired</span>
                    ) : isFull(c) ? (
                      <span className="label px-2 py-0.5 rounded-full border text-[11px] bg-red-50 text-red-600 border-red-200">Used up</span>
                    ) : c.active ? (
                      <span className="label px-2 py-0.5 rounded-full border text-[11px] bg-emerald-50 text-emerald-700 border-emerald-200">Active</span>
                    ) : (
                      <span className="label px-2 py-0.5 rounded-full border text-[11px] bg-[#f3f4f6] text-text-secondary border-[#e5e7eb]">Disabled</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Switch checked={c.active && !isExpired(c) && !isFull(c)} onCheckedChange={() => toggleActive(c.id)} />
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-[#9ca3af] hover:text-[#111111] dark:hover:text-white" onClick={() => openEdit(c)}>
                        <Pencil size={12} />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-[#9ca3af] hover:text-red-500" onClick={() => remove(c.id)}>
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(v) => !v && setDialogOpen(false)}>
        <DialogContent className="max-w-sm bg-white dark:bg-[#1e1e1e] border-[#e5e7eb] dark:border-[#2e2e2e]">
          <DialogHeader>
            <DialogTitle className="text-[#111111] dark:text-white">
              {editId ? 'Edit Discount Code' : 'New Discount Code'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl><Input placeholder="SUMMER20" className="font-mono uppercase" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="discountType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed (XAF)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="value" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl><Input type="number" min={1} {...field} value={field.value as number} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="expiryDate" render={({ field }) => (
                  <FormItem><FormLabel>Expiry Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="usageLimit" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usage Limit</FormLabel>
                    <FormControl><Input type="number" min={1} {...field} value={field.value as number} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <DialogFooter className="gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111]">
                  {editId ? 'Save' : 'Create Code'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function AdminPricing() {
  const [rates, setRates] = useState<SeasonalRate[]>(() => loadPricingData().rates);
  const [codes, setCodes] = useState<DiscountCode[]>(() => loadPricingData().codes);

  useEffect(() => {
    savePricingData({ rates, codes });
  }, [rates, codes]);

  return (
    <div className="p-6 max-w-350 mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#111111] dark:text-white">Pricing & Rates</h1>
        <p className="text-sm text-text-secondary dark:text-[#9ca3af] mt-0.5">
          Manage base room prices, seasonal adjustments, and promo codes
        </p>
      </div>

      <Tabs defaultValue="base" className="w-full">
        <TabsList className="bg-[#f3f4f6] dark:bg-[#2a2a2a] h-9">
          <TabsTrigger value="base"     className="text-xs">Base Prices</TabsTrigger>
          <TabsTrigger value="seasonal" className="text-xs">Seasonal Rates</TabsTrigger>
          <TabsTrigger value="codes"    className="text-xs">Discount Codes</TabsTrigger>
        </TabsList>

        <TabsContent value="base" className="mt-6">
          <Card className="bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e]"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
          >
            <CardHeader className="px-5 pt-5 pb-4">
              <CardTitle className="text-base font-semibold text-[#111111] dark:text-white">
                Room Base Prices
              </CardTitle>
              <p className="text-xs text-[#9ca3af] mt-0.5">Click the pencil icon to edit any room's nightly rate</p>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <RoomPriceEditor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seasonal" className="mt-6">
          <Card className="bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e]"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
          >
            <CardHeader className="px-5 pt-5 pb-4">
              <CardTitle className="text-base font-semibold text-[#111111] dark:text-white">
                Seasonal Rate Rules
              </CardTitle>
              <p className="text-xs text-[#9ca3af] mt-0.5">Apply price adjustments for specific date ranges</p>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <SeasonalRatesTab rates={rates} setRates={setRates} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="codes" className="mt-6">
          <Card className="bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#2e2e2e]"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
          >
            <CardHeader className="px-5 pt-5 pb-4">
              <CardTitle className="text-base font-semibold text-[#111111] dark:text-white">
                Discount Codes
              </CardTitle>
              <p className="text-xs text-[#9ca3af] mt-0.5">Create and manage promotional discount codes</p>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <DiscountCodesTab codes={codes} setCodes={setCodes} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
