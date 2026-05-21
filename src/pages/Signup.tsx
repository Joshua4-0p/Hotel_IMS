import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Phone, MapPin, Globe, Lock } from 'lucide-react';
import { useAuth, type SignupData } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const PANEL_IMAGE =
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&auto=format&fit=crop&q=80';

const COUNTRIES = [
  'Australia', 'Austria', 'Belgium', 'Brazil', 'Canada', 'Chile', 'China',
  'Colombia', 'Denmark', 'Egypt', 'Finland', 'France', 'Germany', 'Ghana',
  'Greece', 'India', 'Indonesia', 'Italy', 'Japan', 'Kenya', 'Malaysia',
  'Mexico', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Peru',
  'Philippines', 'Poland', 'Portugal', 'Russia', 'Saudi Arabia', 'Singapore',
  'South Africa', 'Spain', 'Sweden', 'Switzerland', 'Thailand', 'Turkey',
  'UAE', 'United Kingdom', 'United States', 'Venezuela',
];

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

// ─── Shared field components ───────────────────────────────────────────────────
interface InputFieldProps {
  label: string;
  required?: boolean;
  icon: React.ReactNode;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  rightSlot?: React.ReactNode;
}

function InputField({
  label, required, icon, type = 'text',
  value, onChange, placeholder, autoComplete, rightSlot,
}: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#111111] mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none">
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full h-13 pl-11 ${rightSlot ? 'pr-11' : 'pr-4'} border border-[#e5e7eb] rounded-[10px] text-sm text-[#111111] placeholder:text-[#9ca3af] bg-white focus:outline-none focus:border-[#111111] transition-colors`}
        />
        {rightSlot && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2">
            {rightSlot}
          </span>
        )}
      </div>
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  required?: boolean;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  options: string[];
}

function SelectField({ label, required, icon, value, onChange, placeholder, options }: SelectFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#111111] mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none z-10">
          {icon}
        </span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className={`w-full h-13 pl-11 pr-4 border border-[#e5e7eb] rounded-[10px] text-sm bg-white appearance-none focus:outline-none focus:border-[#111111] transition-colors ${value ? 'text-[#111111]' : 'text-[#9ca3af]'}`}
        >
          <option value="" disabled>{placeholder ?? 'Select…'}</option>
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        {/* Chevron */}
        <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#9ca3af]">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>
    </div>
  );
}

// ─── Validation ────────────────────────────────────────────────────────────────
function validate(data: SignupData, confirm: string): string {
  if (!data.name.trim())  return 'Full name is required.';
  if (!data.email.trim()) return 'Email address is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return 'Enter a valid email address.';
  if (data.phone && !/^\+?[\d\s\-().]{6,}$/.test(data.phone)) return 'Enter a valid phone number.';
  if (!data.password)     return 'Password is required.';
  if (data.password.length < 6) return 'Password must be at least 6 characters.';
  if (data.password !== confirm) return 'Passwords do not match.';
  return '';
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function Signup() {
  const { signup, signupWithGoogle } = useAuth();
  const { toast }                    = useToast();
  const navigate                     = useNavigate();
  const [params]                     = useSearchParams();
  const redirect                     = params.get('redirect') || '/dashboard';

  const [form, setForm] = useState<SignupData>({
    name: '', email: '', location: '', country: '', phone: '', password: '',
  });
  const [confirm,  setConfirm]  = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [showCon,  setShowCon]  = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  function set(field: keyof SignupData) {
    return (v: string) => setForm((prev) => ({ ...prev, [field]: v }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const msg = validate(form, confirm);
    if (msg) { setError(msg); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    signup(form);
    toast('Account created — welcome to Lodr!');
    navigate(redirect, { replace: true });
  }

  async function handleGoogle() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    signupWithGoogle();
    toast('Account created with Google!');
    navigate(redirect, { replace: true });
  }

  const eyeSlot = (show: boolean, toggle: () => void, label: string) => (
    <button
      type="button"
      onClick={toggle}
      className="text-[#9ca3af] hover:text-[#6b7280] transition-colors"
      aria-label={label}
    >
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );

  return (
    <div className="flex min-h-screen">
      {/* ── Left panel (sticky image) ────────────────────────────── */}
      <div className="hidden md:block md:w-1/2 sticky top-0 h-screen shrink-0 overflow-hidden">
        <img
          src={PANEL_IMAGE}
          alt="Lodr Hotel resort"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/15 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <p className="text-2xl font-bold tracking-[0.22em] uppercase mb-3">LODR</p>
          <p className="text-sm leading-relaxed text-white/90 max-w-75">
            Join thousands of guests who've discovered the art of perfect hospitality.
          </p>
        </div>
      </div>

      {/* ── Right panel (form) ───────────────────────────────────── */}
      <div className="flex-1 md:w-1/2 bg-white overflow-y-auto px-6 py-16 md:px-14 flex items-start justify-center">
        <div className="w-full max-w-120">
          {/* Heading */}
          <h1 className="text-[2rem] font-bold text-[#111111] tracking-tight leading-tight mb-1">
            Create your account
          </h1>
          <p className="text-sm text-[#6b7280] mb-8">Start your journey with Lodr Hotel</p>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full h-13.5 flex items-center justify-center gap-3 border border-[#e5e7eb] rounded-[10px] bg-white text-sm font-medium text-[#111111] hover:bg-gray-50 transition-colors"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <span className="flex-1 h-px bg-[#e5e7eb]" />
            <span className="text-xs text-[#9ca3af]">or sign up with email</span>
            <span className="flex-1 h-px bg-[#e5e7eb]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            {/* Full Name */}
            <InputField
              label="Full Name" required
              icon={<User size={16} />}
              value={form.name} onChange={set('name')}
              placeholder="John Doe" autoComplete="name"
            />

            {/* Email */}
            <InputField
              label="Email Address" required
              icon={<Mail size={16} />}
              type="email" value={form.email} onChange={set('email')}
              placeholder="you@example.com" autoComplete="email"
            />

            {/* Phone */}
            <InputField
              label="Phone Number"
              icon={<Phone size={16} />}
              type="tel" value={form.phone} onChange={set('phone')}
              placeholder="+1 234 567 8900" autoComplete="tel"
            />

            {/* City + Country */}
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="City / Location"
                icon={<MapPin size={16} />}
                value={form.location} onChange={set('location')}
                placeholder="New York" autoComplete="address-level2"
              />
              <SelectField
                label="Country"
                icon={<Globe size={16} />}
                value={form.country} onChange={set('country')}
                placeholder="Select country"
                options={COUNTRIES}
              />
            </div>

            {/* Password */}
            <InputField
              label="Password" required
              icon={<Lock size={16} />}
              type={showPw ? 'text' : 'password'}
              value={form.password} onChange={set('password')}
              placeholder="Min. 6 characters" autoComplete="new-password"
              rightSlot={eyeSlot(showPw, () => setShowPw((v) => !v), showPw ? 'Hide password' : 'Show password')}
            />

            {/* Confirm password */}
            <InputField
              label="Confirm Password" required
              icon={<Lock size={16} />}
              type={showCon ? 'text' : 'password'}
              value={confirm} onChange={setConfirm}
              placeholder="Repeat your password" autoComplete="new-password"
              rightSlot={eyeSlot(showCon, () => setShowCon((v) => !v), showCon ? 'Hide' : 'Show')}
            />

            {error && <p className="text-sm text-red-500 -mt-1">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-13.5 rounded-[10px] text-sm font-semibold transition-colors mt-1 ${
                loading
                  ? 'bg-[#6b7280] text-white cursor-wait'
                  : 'bg-[#111111] text-white hover:bg-[#333333] cursor-pointer'
              }`}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-sm text-[#6b7280] text-center mt-7">
            Already have an account?{' '}
            <Link to="/login" className="text-[#111111] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
