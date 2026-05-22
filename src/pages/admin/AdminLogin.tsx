import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth, MOCK_ADMINS } from '../../context/AuthContext';

const PANEL_IMAGE =
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1200&auto=format&fit=crop&q=80';

export function AdminLogin() {
  const { adminLogin, isAdmin } = useAuth();
  const navigate                = useNavigate();
  const location                = useLocation();
  const from                    = (location.state as { from?: string })?.from ?? '/admin';

  // All hooks must come before any early return
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [hint,     setHint]     = useState(false);

  // Declarative redirect — no navigate() call during render
  if (isAdmin) return <Navigate to={from} replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.trim())    { setError('Email is required.'); return; }
    if (!password.trim()) { setError('Password is required.'); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const ok = adminLogin(email.trim(), password);
    setLoading(false);
    if (!ok) {
      setError('Invalid credentials. Please check your email and password.');
      return;
    }
    navigate(from, { replace: true });
  }

  const ROLE_LABELS: Record<string, string> = {
    super_admin: 'Super Admin',
    manager:     'Manager',
    front_desk:  'Front Desk',
  };

  return (
    <div className="flex min-h-screen">
      {/* ── Left panel ─────────────────────────────────────────────────── */}
      <div className="hidden md:block md:w-1/2 sticky top-0 h-screen shrink-0 overflow-hidden">
        <img
          src={PANEL_IMAGE}
          alt="Lodr Hotel"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={20} className="text-white/70" />
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-white/70">Admin Portal</span>
          </div>
          <p className="text-2xl font-bold tracking-[0.22em] uppercase mb-3">LODR</p>
          <p className="text-sm leading-relaxed text-white/80 max-w-xs">
            Manage reservations, guests, content, and operations from one unified dashboard.
          </p>
        </div>
      </div>

      {/* ── Right panel ────────────────────────────────────────────────── */}
      <div className="flex-1 bg-white flex items-center justify-center px-6 py-16 md:px-14">
        <div className="w-full max-w-md">
          {/* Logo (mobile only) */}
          <div className="md:hidden mb-8 flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#585858]" />
            <span className="text-xs font-semibold tracking-[0.18em] uppercase text-[#585858]">Lodr Admin Portal</span>
          </div>

          <h1 className="text-[2rem] font-bold text-[#111111] tracking-tight leading-tight mb-1">
            Admin sign in
          </h1>
          <p className="text-sm text-[#6b7280] mb-8">Restricted access — authorised staff only</p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@lodr.com"
                  autoComplete="username"
                  className="w-full h-13 pl-11 pr-4 border border-[#e5e7eb] rounded-[10px] text-sm text-[#111111] placeholder:text-[#9ca3af] bg-white focus:outline-none focus:border-[#111111] transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none">
                  <Lock size={16} />
                </span>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  autoComplete="current-password"
                  className="w-full h-13 pl-11 pr-11 border border-[#e5e7eb] rounded-[10px] text-sm text-[#111111] placeholder:text-[#9ca3af] bg-white focus:outline-none focus:border-[#111111] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280] transition-colors"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 -mt-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-13 rounded-[10px] text-sm font-semibold transition-colors mt-1 ${
                loading
                  ? 'bg-[#6b7280] text-white cursor-wait'
                  : 'bg-[#111111] text-white hover:bg-[#333333] cursor-pointer'
              }`}
            >
              {loading ? 'Signing in…' : 'Sign In to Admin'}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-8 border border-[#e5e7eb] rounded-[10px] overflow-hidden">
            <button
              type="button"
              onClick={() => setHint((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm text-[#6b7280] hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium">Demo credentials</span>
              <span className="text-xs">{hint ? '▲' : '▼'}</span>
            </button>
            {hint && (
              <div className="border-t border-[#e5e7eb] divide-y divide-[#f3f4f6]">
                {MOCK_ADMINS.map((a) => (
                  <button
                    key={a.email}
                    type="button"
                    onClick={() => { setEmail(a.email); setPassword(a.password); setError(''); }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="text-xs font-semibold text-[#111111]">{a.name}</p>
                      <p className="text-xs text-[#9ca3af]">{a.email}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      a.role === 'super_admin' ? 'bg-purple-50 text-purple-700' :
                      a.role === 'manager'     ? 'bg-blue-50   text-blue-700'   :
                                                 'bg-green-50  text-green-700'
                    }`}>
                      {ROLE_LABELS[a.role]}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-[#9ca3af] text-center mt-6">
            Guest portal?{' '}
            <a href="/login" className="underline hover:text-[#6b7280] transition-colors">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
