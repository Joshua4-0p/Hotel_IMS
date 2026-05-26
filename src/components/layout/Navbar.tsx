import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, User, Settings, LogOut, LayoutDashboard, Bell } from 'lucide-react';
import { Btn } from '../Btn';
import { useAuth } from '../../context/AuthContext';

const publicLinks = [
  { label: 'Home',     to: '/'            },
  { label: 'About',    to: '/about-us'    },
  { label: 'Rooms',    to: '/rooms'       },
  { label: 'Services', to: '/our-services'},
  { label: 'Gallery',  to: '/gallery'     },
  { label: 'Blog',     to: '/blog'        },
  { label: 'Contact',  to: '/contact-us'  },
];

const authLinks = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Rooms',     to: '/rooms'     },
  { label: 'Blog',      to: '/blog'      },
  { label: 'Contact',   to: '/contact-us'},
];

// Routes whose hero section has a dark overlay — navbar starts white, turns dark on scroll.
// Prefix-based so parameterised paths (/blog/:slug, /rooms/:id, etc.) are covered.
const DARK_HERO_PREFIXES = [
  '/', '/about-us', '/rooms', '/our-team', '/our-services',
  '/gallery', '/blog', '/contact-us', '/pricing', '/faq', '/reviews',
];

function hasDarkHero(pathname: string) {
  return DARK_HERO_PREFIXES.some((p) =>
    p === '/' ? pathname === '/' : pathname.startsWith(p),
  );
}

// ─── Avatar dropdown ─────────────────────────────────────────────────────────
function AvatarDropdown({ initials, unreadCount }: { initials: string; unreadCount: number }) {
  const [open, setOpen] = useState(false);
  const ref             = useRef<HTMLDivElement>(null);
  const navigate        = useNavigate();
  const { logout }      = useAuth();

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleLogout() {
    setOpen(false);
    logout();
    navigate('/');
  }

  const items: { icon: React.ReactNode; label: string; action: () => void; danger?: boolean }[] = [
    { icon: <User size={14} />,           label: 'View Profile', action: () => navigate('/profile')           },
    { icon: <Settings size={14} />,       label: 'Edit Profile', action: () => navigate('/profile?edit=true') },
    { icon: <LayoutDashboard size={14} />, label: 'Dashboard',   action: () => navigate('/dashboard')         },
    { icon: <LogOut size={14} />,         label: 'Sign out',     action: handleLogout, danger: true           },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full focus:outline-none group"
        aria-label="Account menu"
        aria-expanded={open ? 'true' : 'false'}
      >
        <div className="relative">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#141414] text-white body-sm font-semibold select-none">
            {initials}
          </span>
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          className={`text-current transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: 4,   scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full mt-2 w-[190px] bg-white rounded-[0.5rem] border border-[#E3E3E3] py-1 z-[80] shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
          >
            {items.map(({ icon, label, action, danger }) => (
              <button
                type="button"
                key={label}
                onClick={() => { setOpen(false); action(); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 body-sm transition-colors ${
                  danger
                    ? 'text-red-500 hover:bg-red-50'
                    : 'text-[#141414] hover:bg-[#F8F8F8]'
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
export function Navbar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location                    = useLocation();
  const { isAuthenticated, user, unreadCount } = useAuth();

  const transparent = hasDarkHero(location.pathname) && !scrolled;
  const textColor   = transparent ? 'text-white' : 'text-[#141414]';
  const links       = isAuthenticated ? authLinks : publicLinks;

  const initials = user?.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?';

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white shadow-nav' : 'bg-transparent shadow-none'
        }`}
      >
        <div className="container-wide flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link
            to="/"
            className={`heading-md font-semibold tracking-tight ${textColor} transition-colors`}
          >
            Lodr
          </Link>

          {/* Desktop links */}
          <ul className="hidden lg:flex items-center gap-8">
            {links.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`body-md transition-colors hover:opacity-70 ${textColor} ${
                    location.pathname.startsWith(link.to) && link.to !== '/'
                      ? 'font-medium'
                      : location.pathname === link.to
                      ? 'font-medium'
                      : ''
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Notification bell shortcut */}
                <Link
                  to="/dashboard/notifications"
                  className={`relative p-1.5 rounded-[0.375rem] hover:bg-black/5 transition-colors ${textColor}`}
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center border border-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <AvatarDropdown initials={initials} unreadCount={0} />
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`body-sm font-medium ${textColor} hover:opacity-70 transition-colors`}
                >
                  Log in
                </Link>
                <Btn to="/signup" variant="primary" size="sm" inverted={transparent}>
                  Sign up
                </Btn>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            type="button"
            className={`lg:hidden p-2 ${textColor}`}
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 bottom-0 z-[70] w-[min(320px,90vw)] bg-white flex flex-col p-8"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <div className="flex items-center justify-between mb-10">
                <span className="heading-md font-semibold">Lodr</span>
                <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X size={24} />
                </button>
              </div>

              {/* User info (if authenticated) */}
              {isAuthenticated && (
                <div className="flex items-center gap-3 mb-8 p-3 rounded-[0.5rem] bg-[#F8F8F8]">
                  <div className="w-9 h-9 rounded-full bg-[#141414] text-white flex items-center justify-center body-sm font-semibold shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="body-sm font-medium text-[#000000] truncate">{user?.name}</p>
                    <p className="label text-[#585858] truncate">{user?.email}</p>
                  </div>
                </div>
              )}

              <ul className="flex flex-col gap-6 flex-1">
                {links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="heading-md text-[#141414] hover:opacity-70 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {isAuthenticated ? (
                <div className="flex flex-col gap-3 mt-8">
                  <Link
                    to="/profile"
                    className="w-full py-3 border border-[#E3E3E3] rounded-[0.5rem] body-md text-center text-[#141414] font-medium"
                  >
                    View Profile
                  </Link>
                  <Link
                    to="/logout"
                    className="w-full py-3 bg-[#141414] rounded-[0.5rem] body-md text-center text-white font-medium"
                  >
                    Sign out
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3 mt-8">
                  <Link
                    to="/login"
                    className="w-full py-3 border border-[#E3E3E3] rounded-[0.5rem] body-md text-center text-[#141414] font-medium"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="w-full py-3 bg-[#141414] rounded-[0.5rem] body-md text-center text-white font-medium"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
