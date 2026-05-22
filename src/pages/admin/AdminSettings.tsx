import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldOff, Check } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useAdminData } from '../../context/AdminDataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// ── Extended settings (localStorage only, beyond HotelSettings) ───────────────
const EXT_KEY = 'lodr_admin_settings_ext';

interface ExtSettings {
  // Booking
  minAdvanceHours: number;
  maxBookingDays: number;
  requirePaymentUpfront: boolean;
  allowCancellation: boolean;
  cancellationHours: number;
  // Payment
  acceptedMethods: string[];
  paymentGateway: string;
  bankName: string;
  bankAccount: string;
  // SEO
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  googleAnalyticsId: string;
  // Social
  facebook: string;
  instagram: string;
  twitter: string;
  whatsapp: string;
  tiktok: string;
  // Maintenance
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

const EXT_DEFAULTS: ExtSettings = {
  minAdvanceHours: 2,
  maxBookingDays: 365,
  requirePaymentUpfront: false,
  allowCancellation: true,
  cancellationHours: 24,
  acceptedMethods: ['card', 'mobile_money', 'cash'],
  paymentGateway: 'stripe',
  bankName: '',
  bankAccount: '',
  metaTitle: 'Lodr Hotel – Luxury Stays in Douala',
  metaDescription: 'Experience elegant comfort at Lodr Hotel, Douala\'s premier boutique destination.',
  metaKeywords: 'hotel, douala, luxury, boutique, cameroon',
  googleAnalyticsId: '',
  facebook: '',
  instagram: '',
  twitter: '',
  whatsapp: '',
  tiktok: '',
  maintenanceMode: false,
  maintenanceMessage: 'We are currently performing scheduled maintenance. We will be back shortly.',
};

function loadExt(): ExtSettings {
  try {
    const raw = localStorage.getItem(EXT_KEY);
    return raw ? { ...EXT_DEFAULTS, ...JSON.parse(raw) } : EXT_DEFAULTS;
  } catch { return EXT_DEFAULTS; }
}
function saveExt(s: ExtSettings) {
  localStorage.setItem(EXT_KEY, JSON.stringify(s));
}

// ── Shared ─────────────────────────────────────────────────────────────────────
function SavedBanner({ show }: { show: boolean }) {
  return (
    <span className={`flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}>
      <Check size={13} /> Saved
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-[#111111] dark:text-white border-b border-[#e5e7eb] dark:border-[#2e2e2e] pb-2 mb-4">
      {children}
    </h3>
  );
}

function AccessDenied() {
  return (
    <div className="p-6 flex items-center justify-center min-h-96">
      <div className="text-center">
        <ShieldOff size={48} className="mx-auto text-[#9ca3af] mb-4" />
        <h2 className="text-lg font-semibold text-[#111111] dark:text-white">Access Restricted</h2>
        <p className="text-sm text-text-secondary dark:text-[#9ca3af] mt-1">
          Only super admins can manage settings.
        </p>
      </div>
    </div>
  );
}

// ── Tab: Hotel Info ────────────────────────────────────────────────────────────
const hotelInfoSchema = z.object({
  hotelName:    z.string().min(2, 'Required'),
  tagline:      z.string().min(5, 'Required'),
  email:        z.string().email('Valid email required'),
  phone:        z.string().min(5, 'Required'),
  address:      z.string().min(3, 'Required'),
  city:         z.string().min(2, 'Required'),
  country:      z.string().min(2, 'Required'),
  checkInTime:  z.string().min(1, 'Required'),
  checkOutTime: z.string().min(1, 'Required'),
  currency:     z.string().min(1, 'Required'),
});
type HotelInfoValues = z.infer<typeof hotelInfoSchema>;

function HotelInfoTab() {
  const { settings, updateSettings } = useAdminData();
  const [saved, setSaved] = useState(false);

  const form = useForm<HotelInfoValues>({
    resolver: zodResolver(hotelInfoSchema),
    defaultValues: {
      hotelName:    settings.hotelName,
      tagline:      settings.tagline,
      email:        settings.email,
      phone:        settings.phone,
      address:      settings.address,
      city:         settings.city,
      country:      settings.country,
      checkInTime:  settings.checkInTime,
      checkOutTime: settings.checkOutTime,
      currency:     settings.currency,
    },
  });

  function onSubmit(values: HotelInfoValues) {
    updateSettings(values);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-xl">
        <SectionTitle>Hotel Identity</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="hotelName" render={({ field }) => (
            <FormItem><FormLabel>Hotel Name</FormLabel>
              <FormControl><Input {...field} /></FormControl><FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="currency" render={({ field }) => (
            <FormItem><FormLabel>Currency</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="XAF">XAF – Central African Franc</SelectItem>
                  <SelectItem value="USD">USD – US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR – Euro</SelectItem>
                  <SelectItem value="GBP">GBP – British Pound</SelectItem>
                  <SelectItem value="NGN">NGN – Nigerian Naira</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="tagline" render={({ field }) => (
          <FormItem><FormLabel>Tagline</FormLabel>
            <FormControl><Textarea rows={2} className="resize-none" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <SectionTitle>Contact & Location</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem><FormLabel>Email</FormLabel>
              <FormControl><Input type="email" {...field} /></FormControl><FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem><FormLabel>Phone</FormLabel>
              <FormControl><Input {...field} /></FormControl><FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="city" render={({ field }) => (
            <FormItem><FormLabel>City</FormLabel>
              <FormControl><Input {...field} /></FormControl><FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="country" render={({ field }) => (
            <FormItem><FormLabel>Country</FormLabel>
              <FormControl><Input {...field} /></FormControl><FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="address" render={({ field }) => (
          <FormItem><FormLabel>Street Address</FormLabel>
            <FormControl><Input {...field} /></FormControl><FormMessage />
          </FormItem>
        )} />

        <SectionTitle>Operations</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="checkInTime" render={({ field }) => (
            <FormItem><FormLabel>Check-in Time</FormLabel>
              <FormControl><Input type="time" {...field} /></FormControl><FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="checkOutTime" render={({ field }) => (
            <FormItem><FormLabel>Check-out Time</FormLabel>
              <FormControl><Input type="time" {...field} /></FormControl><FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="flex items-center gap-3 pt-1">
          <Button type="submit"
            className="bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb]">
            Save Changes
          </Button>
          <SavedBanner show={saved} />
        </div>
      </form>
    </Form>
  );
}

// ── Tab: Booking ───────────────────────────────────────────────────────────────
const bookingInputSchema = z.object({
  taxRate:              z.coerce.number().min(0).max(1),
  cleaningFee:          z.coerce.number().min(0),
  minStayNights:        z.coerce.number().int().min(1),
  maxGuests:            z.coerce.number().int().min(1),
  minAdvanceHours:      z.coerce.number().int().min(0),
  maxBookingDays:       z.coerce.number().int().min(1),
  requirePaymentUpfront: z.boolean(),
  allowCancellation:    z.boolean(),
  cancellationHours:    z.coerce.number().int().min(0),
});
type BookingRawValues    = z.input<typeof bookingInputSchema>;
type BookingInputValues  = z.output<typeof bookingInputSchema>;

function BookingTab() {
  const { settings, updateSettings } = useAdminData();
  const [ext, setExt] = useState<ExtSettings>(loadExt);
  const [saved, setSaved] = useState(false);

  const form = useForm<BookingRawValues, unknown, BookingInputValues>({
    resolver: zodResolver(bookingInputSchema),
    defaultValues: {
      taxRate:               settings.taxRate,
      cleaningFee:           settings.cleaningFee,
      minStayNights:         settings.minStayNights,
      maxGuests:             settings.maxGuests,
      minAdvanceHours:       ext.minAdvanceHours,
      maxBookingDays:        ext.maxBookingDays,
      requirePaymentUpfront: ext.requirePaymentUpfront,
      allowCancellation:     ext.allowCancellation,
      cancellationHours:     ext.cancellationHours,
    },
  });

  function onSubmit(values: BookingInputValues) {
    updateSettings({
      taxRate: values.taxRate,
      cleaningFee: values.cleaningFee,
      minStayNights: values.minStayNights,
      maxGuests: values.maxGuests,
    });
    const newExt = {
      ...ext,
      minAdvanceHours:       values.minAdvanceHours,
      maxBookingDays:        values.maxBookingDays,
      requirePaymentUpfront: values.requirePaymentUpfront,
      allowCancellation:     values.allowCancellation,
      cancellationHours:     values.cancellationHours,
    };
    setExt(newExt);
    saveExt(newExt);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-xl">
        <SectionTitle>Pricing Rules</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="taxRate" render={({ field }) => (
            <FormItem><FormLabel>Tax Rate (0–1)</FormLabel>
              <FormControl><Input type="number" step="0.01" min={0} max={1} {...field} value={field.value as number} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="cleaningFee" render={({ field }) => (
            <FormItem><FormLabel>Cleaning Fee (XAF)</FormLabel>
              <FormControl><Input type="number" min={0} {...field} value={field.value as number} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <SectionTitle>Stay Constraints</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="minStayNights" render={({ field }) => (
            <FormItem><FormLabel>Min Stay (nights)</FormLabel>
              <FormControl><Input type="number" min={1} {...field} value={field.value as number} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="maxGuests" render={({ field }) => (
            <FormItem><FormLabel>Max Guests / Room</FormLabel>
              <FormControl><Input type="number" min={1} {...field} value={field.value as number} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="minAdvanceHours" render={({ field }) => (
            <FormItem><FormLabel>Min Advance (hours)</FormLabel>
              <FormControl><Input type="number" min={0} {...field} value={field.value as number} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="maxBookingDays" render={({ field }) => (
            <FormItem><FormLabel>Book Ahead Max (days)</FormLabel>
              <FormControl><Input type="number" min={1} {...field} value={field.value as number} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <SectionTitle>Policies</SectionTitle>
        <FormField control={form.control} name="requirePaymentUpfront" render={({ field }) => (
          <FormItem className="flex items-center gap-3">
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormLabel className="!mt-0 cursor-pointer">Require full payment at booking</FormLabel>
          </FormItem>
        )} />
        <FormField control={form.control} name="allowCancellation" render={({ field }) => (
          <FormItem className="flex items-center gap-3">
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormLabel className="!mt-0 cursor-pointer">Allow guest cancellations</FormLabel>
          </FormItem>
        )} />
        <FormField control={form.control} name="cancellationHours" render={({ field }) => (
          <FormItem className="max-w-xs">
            <FormLabel>Free Cancellation Window (hours before check-in)</FormLabel>
            <FormControl><Input type="number" min={0} {...field} value={field.value as number} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="flex items-center gap-3 pt-1">
          <Button type="submit"
            className="bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb]">
            Save Changes
          </Button>
          <SavedBanner show={saved} />
        </div>
      </form>
    </Form>
  );
}

// ── Tab: Payment ───────────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id: 'card',         label: 'Credit / Debit Card' },
  { id: 'mobile_money', label: 'Mobile Money (MTN / Orange)' },
  { id: 'cash',         label: 'Cash on Arrival' },
  { id: 'bank',         label: 'Bank Transfer' },
  { id: 'paypal',       label: 'PayPal' },
];

const paymentSchema = z.object({
  acceptedMethods: z.array(z.string()).min(1, 'At least one method required'),
  paymentGateway:  z.string().min(1),
  bankName:        z.string(),
  bankAccount:     z.string(),
});
type PaymentValues = z.infer<typeof paymentSchema>;

function PaymentTab() {
  const [ext, setExt] = useState<ExtSettings>(loadExt);
  const [saved, setSaved] = useState(false);

  const form = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      acceptedMethods: ext.acceptedMethods,
      paymentGateway:  ext.paymentGateway,
      bankName:        ext.bankName,
      bankAccount:     ext.bankAccount,
    },
  });

  function onSubmit(values: PaymentValues) {
    const newExt = { ...ext, ...values };
    setExt(newExt);
    saveExt(newExt);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-xl">
        <SectionTitle>Accepted Payment Methods</SectionTitle>
        <FormField control={form.control} name="acceptedMethods" render={({ field }) => (
          <FormItem>
            <div className="flex flex-col gap-2.5">
              {PAYMENT_METHODS.map((method) => (
                <label key={method.id} className="flex items-center gap-2.5 cursor-pointer">
                  <Checkbox
                    checked={field.value.includes(method.id)}
                    onCheckedChange={(checked) => {
                      const next = checked
                        ? [...field.value, method.id]
                        : field.value.filter((v) => v !== method.id);
                      field.onChange(next);
                    }}
                  />
                  <span className="text-sm text-[#374151] dark:text-[#d1d5db]">{method.label}</span>
                </label>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )} />

        <SectionTitle>Online Gateway</SectionTitle>
        <FormField control={form.control} name="paymentGateway" render={({ field }) => (
          <FormItem><FormLabel>Gateway Provider</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl><SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="paystack">Paystack</SelectItem>
                <SelectItem value="flutterwave">Flutterwave</SelectItem>
                <SelectItem value="none">None (Manual)</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        <SectionTitle>Bank Transfer Details</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="bankName" render={({ field }) => (
            <FormItem><FormLabel>Bank Name</FormLabel>
              <FormControl><Input placeholder="e.g. Afriland First Bank" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="bankAccount" render={({ field }) => (
            <FormItem><FormLabel>Account Number</FormLabel>
              <FormControl><Input placeholder="…" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="flex items-center gap-3 pt-1">
          <Button type="submit"
            className="bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb]">
            Save Changes
          </Button>
          <SavedBanner show={saved} />
        </div>
      </form>
    </Form>
  );
}

// ── Tab: SEO ───────────────────────────────────────────────────────────────────
const seoSchema = z.object({
  metaTitle:          z.string().min(5, 'Required'),
  metaDescription:    z.string().min(10, 'Required'),
  metaKeywords:       z.string(),
  googleAnalyticsId:  z.string(),
});
type SeoValues = z.infer<typeof seoSchema>;

function SeoTab() {
  const [ext, setExt] = useState<ExtSettings>(loadExt);
  const [saved, setSaved] = useState(false);

  const form = useForm<SeoValues>({
    resolver: zodResolver(seoSchema),
    defaultValues: {
      metaTitle:         ext.metaTitle,
      metaDescription:   ext.metaDescription,
      metaKeywords:      ext.metaKeywords,
      googleAnalyticsId: ext.googleAnalyticsId,
    },
  });

  function onSubmit(values: SeoValues) {
    const newExt = { ...ext, ...values };
    setExt(newExt);
    saveExt(newExt);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-xl">
        <SectionTitle>Search Engine Optimization</SectionTitle>
        <FormField control={form.control} name="metaTitle" render={({ field }) => (
          <FormItem><FormLabel>Meta Title</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <p className="text-[10px] text-[#9ca3af]">{field.value?.length ?? 0} / 60 characters recommended</p>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="metaDescription" render={({ field }) => (
          <FormItem><FormLabel>Meta Description</FormLabel>
            <FormControl><Textarea rows={3} className="resize-none" {...field} /></FormControl>
            <p className="text-[10px] text-[#9ca3af]">{field.value?.length ?? 0} / 160 characters recommended</p>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="metaKeywords" render={({ field }) => (
          <FormItem><FormLabel>Keywords</FormLabel>
            <FormControl><Input placeholder="comma-separated: hotel, douala, luxury" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <SectionTitle>Analytics</SectionTitle>
        <FormField control={form.control} name="googleAnalyticsId" render={({ field }) => (
          <FormItem><FormLabel>Google Analytics ID</FormLabel>
            <FormControl><Input placeholder="G-XXXXXXXXXX" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="flex items-center gap-3 pt-1">
          <Button type="submit"
            className="bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb]">
            Save Changes
          </Button>
          <SavedBanner show={saved} />
        </div>
      </form>
    </Form>
  );
}

// ── Tab: Social ────────────────────────────────────────────────────────────────
const socialSchema = z.object({
  facebook:  z.string(),
  instagram: z.string(),
  twitter:   z.string(),
  whatsapp:  z.string(),
  tiktok:    z.string(),
});
type SocialValues = z.infer<typeof socialSchema>;

function SocialTab() {
  const [ext, setExt] = useState<ExtSettings>(loadExt);
  const [saved, setSaved] = useState(false);

  const form = useForm<SocialValues>({
    resolver: zodResolver(socialSchema),
    defaultValues: {
      facebook:  ext.facebook,
      instagram: ext.instagram,
      twitter:   ext.twitter,
      whatsapp:  ext.whatsapp,
      tiktok:    ext.tiktok,
    },
  });

  function onSubmit(values: SocialValues) {
    const newExt = { ...ext, ...values };
    setExt(newExt);
    saveExt(newExt);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  const SOCIALS: { name: keyof SocialValues; label: string; placeholder: string }[] = [
    { name: 'facebook',  label: 'Facebook',  placeholder: 'https://facebook.com/lodrhotel' },
    { name: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/lodrhotel' },
    { name: 'twitter',   label: 'X / Twitter', placeholder: 'https://x.com/lodrhotel' },
    { name: 'whatsapp',  label: 'WhatsApp',  placeholder: '+237 6XX XXX XXX' },
    { name: 'tiktok',    label: 'TikTok',    placeholder: 'https://tiktok.com/@lodrhotel' },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-xl">
        <SectionTitle>Social Media Links</SectionTitle>
        {SOCIALS.map(({ name, label, placeholder }) => (
          <FormField key={name} control={form.control} name={name} render={({ field }) => (
            <FormItem>
              <FormLabel>{label}</FormLabel>
              <FormControl><Input placeholder={placeholder} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        ))}

        <div className="flex items-center gap-3 pt-1">
          <Button type="submit"
            className="bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb]">
            Save Changes
          </Button>
          <SavedBanner show={saved} />
        </div>
      </form>
    </Form>
  );
}

// ── Tab: Maintenance ───────────────────────────────────────────────────────────
const maintenanceSchema = z.object({
  maintenanceMode:    z.boolean(),
  maintenanceMessage: z.string().min(5, 'Required'),
});
type MaintenanceValues = z.infer<typeof maintenanceSchema>;

function MaintenanceTab() {
  const [ext, setExt] = useState<ExtSettings>(loadExt);
  const [saved, setSaved] = useState(false);

  const form = useForm<MaintenanceValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      maintenanceMode:    ext.maintenanceMode,
      maintenanceMessage: ext.maintenanceMessage,
    },
  });

  const mode = form.watch('maintenanceMode');

  function onSubmit(values: MaintenanceValues) {
    const newExt = { ...ext, ...values };
    setExt(newExt);
    saveExt(newExt);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-xl">
        <SectionTitle>Site Maintenance</SectionTitle>

        <FormField control={form.control} name="maintenanceMode" render={({ field }) => (
          <FormItem className="flex items-start gap-3 p-4 rounded-card border border-[#e5e7eb] dark:border-[#2e2e2e] bg-[#fafafa] dark:bg-[#1a1a1a]">
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div>
              <FormLabel className="!mt-0 cursor-pointer text-sm font-medium">
                Enable Maintenance Mode
              </FormLabel>
              <p className="text-xs text-text-secondary dark:text-[#9ca3af] mt-0.5">
                Guests will see the maintenance message instead of the booking site.
              </p>
            </div>
          </FormItem>
        )} />

        {mode && (
          <div className="p-3 rounded-button bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-400">
              Maintenance mode is ON — the public site is unavailable to guests.
            </p>
          </div>
        )}

        <FormField control={form.control} name="maintenanceMessage" render={({ field }) => (
          <FormItem>
            <FormLabel>Maintenance Message</FormLabel>
            <FormControl>
              <Textarea rows={4} className="resize-none" placeholder="We'll be back soon…" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="flex items-center gap-3 pt-1">
          <Button type="submit"
            className="bg-brand-black hover:bg-[#333333] text-white dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e7eb]">
            Save Changes
          </Button>
          <SavedBanner show={saved} />
        </div>
      </form>
    </Form>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function AdminSettings() {
  const { adminRole } = useAuth();

  if (adminRole !== 'super_admin') return <AccessDenied />;

  return (
    <div className="p-6 max-w-275 mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#111111] dark:text-white">Settings</h1>
        <p className="text-sm text-text-secondary dark:text-[#9ca3af] mt-0.5">
          Configure hotel, booking, payment, SEO, and maintenance settings.
        </p>
      </div>

      <Tabs defaultValue="hotel" className="w-full">
        <TabsList className="flex-wrap h-auto gap-1 bg-[#f3f4f6] dark:bg-[#2a2a2a] p-1 rounded-button mb-2">
          <TabsTrigger value="hotel">Hotel Info</TabsTrigger>
          <TabsTrigger value="booking">Booking</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="hotel">       <HotelInfoTab />    </TabsContent>
          <TabsContent value="booking">     <BookingTab />      </TabsContent>
          <TabsContent value="payment">     <PaymentTab />      </TabsContent>
          <TabsContent value="seo">         <SeoTab />          </TabsContent>
          <TabsContent value="social">      <SocialTab />       </TabsContent>
          <TabsContent value="maintenance"> <MaintenanceTab />  </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
