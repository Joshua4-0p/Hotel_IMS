import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Droplets, TrendingUp, Users, Gauge } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '../../components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useAdminData } from '../../context/AdminDataContext';
import type { WaterSale } from '../../context/AdminDataContext';

// ── Form schema ───────────────────────────────────────────────────────────────
const schema = z.object({
  date:             z.string().min(1, 'Date is required'),
  clientName:       z.string().min(1, 'Client name is required').max(100),
  quantityPerUnit:  z.coerce.number().int().min(1, 'Min 1 liter').max(10000),
  pricePerUnit:     z.coerce.number().min(1, 'Min 1 XAF'),
  count:            z.coerce.number().int().min(1, 'Min 1 unit').max(10000),
});
type FormInput  = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString('fr-FR');
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function filterByPeriod(sales: WaterSale[], period: 'today' | 'week' | 'month') {
  const now      = new Date();
  const todayStr = now.toISOString().split('T')[0];
  if (period === 'today') return sales.filter((s) => s.date === todayStr);
  if (period === 'week') {
    const from = new Date(now);
    from.setDate(from.getDate() - 6);
    const fromStr = from.toISOString().split('T')[0];
    return sales.filter((s) => s.date >= fromStr && s.date <= todayStr);
  }
  const monthStr = now.toISOString().slice(0, 7);
  return sales.filter((s) => s.date.startsWith(monthStr));
}

// ── Add / Edit dialog ─────────────────────────────────────────────────────────
function SaleDialog({
  open,
  onClose,
  target,
}: {
  open: boolean;
  onClose: () => void;
  target: WaterSale | null;
}) {
  const { addWaterSale, updateWaterSale, waterSales } = useAdminData();

  const [mergeCandidate, setMergeCandidate] = useState<{
    existing: WaterSale;
    incoming: Omit<WaterSale, 'id'>;
  } | null>(null);

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    values: target
      ? {
          date:            target.date,
          clientName:      target.clientName,
          quantityPerUnit: String(target.quantityPerUnit) as unknown as number,
          pricePerUnit:    String(target.pricePerUnit)    as unknown as number,
          count:           String(target.count)           as unknown as number,
        }
      : {
          date:            todayISO(),
          clientName:      '',
          quantityPerUnit: '20' as unknown as number,
          pricePerUnit:    '' as unknown as number,
          count:           '1' as unknown as number,
        },
  });

  const qty   = Number(form.watch('quantityPerUnit')) || 0;
  const price = Number(form.watch('pricePerUnit'))    || 0;
  const count = Number(form.watch('count'))           || 0;

  const totalLiters = qty * count;
  const totalAmount = price * count;

  function onSubmit(data: FormOutput) {
    const name        = data.clientName.trim();
    const tLiters     = data.quantityPerUnit * data.count;
    const tAmount     = data.pricePerUnit * data.count;
    const saleData    = { ...data, clientName: name, totalLiters: tLiters, totalAmount: tAmount };

    if (!target) {
      const existing = waterSales.find(
        (s) => s.date === data.date && s.clientName.trim().toLowerCase() === name.toLowerCase(),
      );
      if (existing) {
        setMergeCandidate({ existing, incoming: saleData });
        return;
      }
      addWaterSale(saleData);
    } else {
      updateWaterSale(target.id, saleData);
    }
    form.reset();
    onClose();
  }

  function handleMerge() {
    if (!mergeCandidate) return;
    const { existing, incoming } = mergeCandidate;
    const newCount    = existing.count + incoming.count;
    const newLiters   = existing.quantityPerUnit * newCount;
    const newAmount   = existing.pricePerUnit * newCount;
    updateWaterSale(existing.id, { count: newCount, totalLiters: newLiters, totalAmount: newAmount });
    setMergeCandidate(null);
    form.reset();
    onClose();
  }

  function handleClose() {
    setMergeCandidate(null);
    form.reset();
    onClose();
  }

  return (
    <>
      <Dialog open={open && !mergeCandidate} onOpenChange={(v) => !v && handleClose()}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>{target ? 'Edit Sale' : 'Record Water Sale'}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Supermarché Akwa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="quantityPerUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Liters / Unit</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} placeholder="20" {...field} value={field.value as string} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pricePerUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price / Unit (XAF)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} placeholder="750" {...field} value={field.value as string} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Count</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} placeholder="1" {...field} value={field.value as string} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Auto-calculated summary */}
              <div className="rounded-lg bg-[#f8f8f8] dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#333333] px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                <span className="text-[#6b7280] dark:text-[#9ca3af]">Total Liters</span>
                <span className="font-semibold text-[#111111] dark:text-white text-right">
                  {totalLiters > 0 ? `${fmt(totalLiters)} L` : '—'}
                </span>
                <span className="text-[#6b7280] dark:text-[#9ca3af]">Total Amount</span>
                <span className="font-semibold text-[#111111] dark:text-white text-right">
                  {totalAmount > 0 ? `XAF ${fmt(totalAmount)}` : '—'}
                </span>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-brand-black text-white hover:bg-brand-black/90">
                  {target ? 'Save Changes' : 'Record Sale'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Merge confirmation */}
      <Dialog open={!!mergeCandidate} onOpenChange={(v) => !v && setMergeCandidate(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Duplicate Entry Detected</DialogTitle>
            <DialogDescription>
              A sale for <span className="font-semibold text-[#111111] dark:text-white">{mergeCandidate?.existing.clientName}</span> on{' '}
              <span className="font-semibold text-[#111111] dark:text-white">{mergeCandidate?.existing.date}</span> already exists
              ({mergeCandidate?.existing.count} unit{mergeCandidate?.existing.count !== 1 ? 's' : ''},{' '}
              {mergeCandidate?.existing.totalLiters} L). Would you like to merge the quantities?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setMergeCandidate(null)}>
              Cancel
            </Button>
            <Button onClick={handleMerge} className="bg-brand-black text-white hover:bg-brand-black/90">
              Merge (+{mergeCandidate?.incoming.count} units)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Delete confirmation dialog ─────────────────────────────────────────────────
function DeleteDialog({
  target,
  onClose,
}: {
  target: WaterSale | null;
  onClose: () => void;
}) {
  const { deleteWaterSale } = useAdminData();

  function handleDelete() {
    if (target) deleteWaterSale(target.id);
    onClose();
  }

  return (
    <Dialog open={!!target} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>Delete Sale Record</DialogTitle>
          <DialogDescription>
            Delete the sale for <span className="font-semibold text-[#111111] dark:text-white">{target?.clientName}</span> on{' '}
            {target?.date}? This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Summary card ──────────────────────────────────────────────────────────────
function SummaryCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-white dark:bg-[#161616] border border-[#e5e7eb] dark:border-[#2a2a2a] rounded-xl p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg bg-[#f3f4f6] dark:bg-[#2a2a2a] flex items-center justify-center shrink-0 text-[#585858] dark:text-[#9ca3af]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-[#6b7280] dark:text-[#9ca3af] uppercase tracking-wide mb-1">{label}</p>
        <p className="text-xl font-bold text-[#111111] dark:text-white leading-none">{value}</p>
        {sub && <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function AdminWaterSupply() {
  const { waterSales } = useAdminData();

  const [period,       setPeriod]       = useState<'today' | 'week' | 'month'>('month');
  const [addOpen,      setAddOpen]      = useState(false);
  const [editTarget,   setEditTarget]   = useState<WaterSale | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WaterSale | null>(null);

  const filtered = useMemo(() => filterByPeriod(waterSales, period), [waterSales, period]);

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => b.date.localeCompare(a.date)),
    [filtered],
  );

  const totalRevenue    = filtered.reduce((s, r) => s + r.totalAmount, 0);
  const totalLiters     = filtered.reduce((s, r) => s + r.totalLiters, 0);
  const clientsServed   = new Set(filtered.map((r) => r.clientName.trim().toLowerCase())).size;
  const avgPricePerLtr  = totalLiters > 0 ? totalRevenue / totalLiters : 0;

  const PERIOD_LABELS: Record<string, string> = {
    today: 'Today',
    week:  'Last 7 days',
    month: 'This month',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-[#111111] dark:text-white">Water Supply</h1>
          <p className="text-sm text-[#6b7280] dark:text-[#9ca3af] mt-0.5">
            Daily water sales to external clients
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Period selector */}
          <div className="flex items-center bg-[#f3f4f6] dark:bg-[#2a2a2a] rounded-lg p-1 gap-0.5">
            {(['today', 'week', 'month'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  period === p
                    ? 'bg-white dark:bg-[#111111] text-[#111111] dark:text-white shadow-sm'
                    : 'text-[#6b7280] dark:text-[#9ca3af] hover:text-[#111111] dark:hover:text-white'
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
          <Button
            onClick={() => setAddOpen(true)}
            className="bg-brand-black text-white hover:bg-brand-black/90 gap-1.5"
          >
            <Plus size={15} /> Record Sale
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={<TrendingUp size={18} />}
          label="Total Revenue"
          value={`XAF ${fmt(totalRevenue)}`}
          sub={PERIOD_LABELS[period]}
        />
        <SummaryCard
          icon={<Users size={18} />}
          label="Clients Served"
          value={String(clientsServed)}
          sub={`${filtered.length} transaction${filtered.length !== 1 ? 's' : ''}`}
        />
        <SummaryCard
          icon={<Droplets size={18} />}
          label="Total Liters"
          value={`${fmt(totalLiters)} L`}
          sub={PERIOD_LABELS[period]}
        />
        <SummaryCard
          icon={<Gauge size={18} />}
          label="Avg Price / Liter"
          value={avgPricePerLtr > 0 ? `XAF ${fmt(Math.round(avgPricePerLtr))}` : '—'}
          sub="Across all units"
        />
      </div>

      {/* Data table */}
      <div className="bg-white dark:bg-[#161616] border border-[#e5e7eb] dark:border-[#2a2a2a] rounded-xl overflow-hidden">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Droplets size={36} className="text-[#d1d5db] dark:text-[#444444] mb-3" />
            <p className="text-sm font-medium text-[#6b7280] dark:text-[#9ca3af]">
              No sales recorded for {PERIOD_LABELS[period].toLowerCase()}
            </p>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="mt-3 text-sm font-medium text-[#111111] dark:text-white underline underline-offset-2"
            >
              Record a sale
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e7eb] dark:border-[#2a2a2a] bg-[#f8f8f8] dark:bg-[#111111]">
                  {['Date', 'Client Name', 'L / Unit', 'Unit Price', 'Count', 'Total Liters', 'Total Amount', ''].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-[#6b7280] dark:text-[#9ca3af] uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {sorted.map((sale, i) => (
                  <tr
                    key={sale.id}
                    className={`border-b border-[#f3f4f6] dark:border-[#2a2a2a] hover:bg-[#fafafa] dark:hover:bg-[#1a1a1a] transition-colors ${
                      i === sorted.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-[#111111] dark:text-white whitespace-nowrap">
                      {sale.date}
                    </td>
                    <td className="px-4 py-3 text-[#374151] dark:text-[#d1d5db]">
                      {sale.clientName}
                    </td>
                    <td className="px-4 py-3 text-[#374151] dark:text-[#d1d5db] whitespace-nowrap">
                      {sale.quantityPerUnit} L
                    </td>
                    <td className="px-4 py-3 text-[#374151] dark:text-[#d1d5db] whitespace-nowrap">
                      XAF {fmt(sale.pricePerUnit)}
                    </td>
                    <td className="px-4 py-3 text-[#374151] dark:text-[#d1d5db]">
                      {sale.count}
                    </td>
                    <td className="px-4 py-3 text-[#374151] dark:text-[#d1d5db] whitespace-nowrap">
                      {fmt(sale.totalLiters)} L
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#111111] dark:text-white whitespace-nowrap">
                      XAF {fmt(sale.totalAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          type="button"
                          onClick={() => setEditTarget(sale)}
                          className="p-1.5 rounded-lg text-[#6b7280] dark:text-[#9ca3af] hover:bg-[#f3f4f6] dark:hover:bg-[#2a2a2a] hover:text-[#111111] dark:hover:text-white transition-colors"
                          aria-label="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(sale)}
                          className="p-1.5 rounded-lg text-[#6b7280] dark:text-[#9ca3af] hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          aria-label="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <SaleDialog
        open={addOpen || !!editTarget}
        onClose={() => { setAddOpen(false); setEditTarget(null); }}
        target={editTarget}
      />
      <DeleteDialog
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
