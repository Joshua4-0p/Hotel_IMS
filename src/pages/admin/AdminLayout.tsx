import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, CalendarDays, Calendar, BedDouble, Tag,
  Users, BookOpen, Image, Wrench, HelpCircle, Star,
  MessageSquare, BarChart2, Shield, Settings, LogOut,
  Bell, Moon, Sun, Menu, X, ChevronRight, UserCircle, Droplets,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAdminData } from '../../context/AdminDataContext';

// ── Nav config ────────────────────────────────────────────────────────────────
interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  exact?: boolean;
  badge?: () => number;
}
interface NavGroup { label: string; items: NavItem[] }

function useNavGroups() {
  const { messages } = useAdminData();
  const { adminRole } = useAuth();
  const unreadMsgs = messages.filter((m) => !m.read).length;

  const groups: NavGroup[] = [
    {
      label: 'Operations',
      items: [
        { label: 'Dashboard',    path: '/admin',                icon: <LayoutDashboard size={16} />, exact: true },
        { label: 'Bookings',    path: '/admin/bookings',      icon: <CalendarDays    size={16} /> },
        { label: 'Calendar',    path: '/admin/calendar',      icon: <Calendar        size={16} /> },
        { label: 'Water Supply', path: '/admin/water-supply', icon: <Droplets        size={16} /> },
      ],
    },
    {
      label: 'Property',
      items: [
        { label: 'Rooms',            path: '/admin/rooms',    icon: <BedDouble size={16} /> },
        { label: 'Rates & Discount', path: '/admin/pricing',  icon: <Tag       size={16} /> },
      ],
    },
    {
      label: 'Guests',
      items: [
        { label: 'Guest CRM', path: '/admin/guests', icon: <Users size={16} /> },
      ],
    },
    {
      label: 'Content',
      items: [
        { label: 'Blog',     path: '/admin/blog',     icon: <BookOpen   size={16} /> },
        { label: 'Gallery',  path: '/admin/gallery',  icon: <Image      size={16} /> },
        { label: 'Services', path: '/admin/services', icon: <Wrench     size={16} /> },
        { label: 'Team',     path: '/admin/team',     icon: <UserCircle size={16} /> },
        { label: 'FAQ',      path: '/admin/faq',      icon: <HelpCircle size={16} /> },
        { label: 'Reviews',  path: '/admin/reviews',  icon: <Star       size={16} /> },
      ],
    },
    {
      label: 'Communications',
      items: [
        { label: 'Chats', path: '/admin/messages', icon: <MessageSquare size={16} />, badge: () => unreadMsgs },
      ],
    },
    {
      label: 'Reports',
      items: [
        { label: 'Reports', path: '/admin/reports', icon: <BarChart2 size={16} /> },
      ],
    },
    ...(adminRole === 'super_admin' ? [{
      label: 'System',
      items: [
        { label: 'Users',    path: '/admin/users',    icon: <Shield   size={16} /> },
        { label: 'Settings', path: '/admin/settings', icon: <Settings size={16} /> },
      ],
    }] : []),
  ];
  return groups;
}

// ── Breadcrumb ────────────────────────────────────────────────────────────────
function AdminBreadcrumb() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  const labels: Record<string, string> = {
    admin: 'Dashboard', bookings: 'Bookings', calendar: 'Calendar',
    rooms: 'Rooms', pricing: 'Rates & Discount',
    guests: 'Guest CRM', blog: 'Blog', gallery: 'Gallery',
    services: 'Services', team: 'Team', faq: 'FAQ', reviews: 'Reviews',
    messages: 'Chats', reports: 'Reports', users: 'Users', settings: 'Settings',
    'water-supply': 'Water Supply',
  };

  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-sm min-w-0">
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1;
        const path   = '/' + segments.slice(0, i + 1).join('/');
        return (
          <span key={path} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && <ChevronRight size={13} className="text-[#bdbdbd] dark:text-[#555555] shrink-0" />}
            {isLast ? (
              <span className="font-medium text-[#111111] dark:text-white truncate">
                {labels[seg] ?? seg}
              </span>
            ) : (
              <NavLink
                to={path}
                className="text-[#6b7280] dark:text-[#9ca3af] hover:text-[#111111] dark:hover:text-white transition-colors truncate"
              >
                {labels[seg] ?? seg}
              </NavLink>
            )}
          </span>
        );
      })}
    </nav>
  );
}

// ── User dropdown ─────────────────────────────────────────────────────────────
function UserMenu({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref             = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const initials = user?.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) ?? '?';

  const ROLE_CHIP: Record<string, string> = {
    super_admin: 'Super Admin',
    manager:     'Manager',
    front_desk:  'Front Desk',
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[#f3f4f6] dark:hover:bg-[#2a2a2a] transition-colors"
        aria-label="Open user menu"
      >
        <div className="w-7 h-7 rounded-full bg-[#141414] dark:bg-[#e5e7eb] text-white dark:text-[#111111] flex items-center justify-center text-xs font-semibold shrink-0">
          {initials}
        </div>
        <span className="hidden sm:block text-sm font-medium text-[#111111] dark:text-white max-w-28 truncate">
          {user?.name.split(' ')[0]}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#1e1e1e] border border-[#e5e7eb] dark:border-[#333333] rounded-xl shadow-lg overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-[#e5e7eb] dark:border-[#333333]">
              <p className="text-sm font-semibold text-[#111111] dark:text-white">{user?.name}</p>
              <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mt-0.5">{user?.email}</p>
              {user?.role && (
                <span className={`mt-1.5 inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                  user.role === 'super_admin' ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                  user.role === 'manager'     ? 'bg-blue-50   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400'   :
                                               'bg-green-50  text-green-700  dark:bg-green-900/30  dark:text-green-400'
                }`}>
                  {ROLE_CHIP[user.role]}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => { setOpen(false); onLogout(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut size={14} /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sidebar content ───────────────────────────────────────────────────────────
function SidebarContent({ onClose }: { onClose?: () => void }) {
  const groups = useNavGroups();

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center justify-between px-5 h-14 shrink-0 border-b border-[#e5e7eb] dark:border-[#2a2a2a]">
        <NavLink to="/admin" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#141414] dark:bg-white rounded-md flex items-center justify-center">
            <Shield size={14} className="text-white dark:text-[#141414]" />
          </div>
          <span className="text-sm font-bold tracking-widest uppercase text-[#111111] dark:text-white">
            LODR Admin
          </span>
        </NavLink>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Close sidebar" className="text-[#6b7280] dark:text-[#9ca3af] hover:text-[#111111] dark:hover:text-white lg:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {groups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="px-3 mb-1.5 text-[10px] font-bold tracking-[0.15em] uppercase text-[#9ca3af] dark:text-[#555555]">
              {group.label}
            </p>
            {group.items.map((item) => {
              const badgeCount = item.badge?.() ?? 0;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-[8px] text-sm font-medium transition-colors mb-0.5 ${
                      isActive
                        ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                        : 'text-[#585858] dark:text-[#9ca3af] hover:bg-[#f3f4f6] dark:hover:bg-[#2a2a2a] hover:text-[#111111] dark:hover:text-white'
                    }`
                  }
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                  {badgeCount > 0 && (
                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold shrink-0">
                      {badgeCount > 9 ? '9+' : badgeCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer — view site link */}
      <div className="px-3 py-3 border-t border-[#e5e7eb] dark:border-[#2a2a2a]">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-[8px] text-sm text-[#585858] dark:text-[#9ca3af] hover:bg-[#f3f4f6] dark:hover:bg-[#2a2a2a] hover:text-[#111111] dark:hover:text-white transition-colors"
        >
          <Shield size={16} />
          View public site ↗
        </a>
      </div>
    </div>
  );
}

// ── Main layout ───────────────────────────────────────────────────────────────
export function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate          = useNavigate();
  const { messages }      = useAdminData();
  const unreadMsgs        = messages.filter((m) => !m.read).length;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode,    setDarkMode]    = useState(() => localStorage.getItem('lodr_admin_dark') === 'true');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('lodr_admin_dark', String(darkMode));
    return () => { document.documentElement.classList.remove('dark'); };
  }, [darkMode]);

  function handleLogout() {
    logout();
    navigate('/admin/login', { replace: true });
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f8f8] dark:bg-[#111111]">
      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden lg:flex lg:flex-col w-60 shrink-0 h-screen overflow-hidden bg-white dark:bg-[#161616] border-r border-[#e5e7eb] dark:border-[#2a2a2a]">
        <SidebarContent />
      </aside>

      {/* ── Mobile sidebar overlay + drawer ────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed left-0 top-0 bottom-0 w-60 z-50 lg:hidden flex flex-col bg-white dark:bg-[#161616] border-r border-[#e5e7eb] dark:border-[#2a2a2a] overflow-hidden"
            >
              <SidebarContent onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main area ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top header */}
        <header className="h-14 shrink-0 bg-white dark:bg-[#161616] border-b border-[#e5e7eb] dark:border-[#2a2a2a] flex items-center px-4 gap-3">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg text-[#585858] dark:text-[#9ca3af] hover:bg-[#f3f4f6] dark:hover:bg-[#2a2a2a] transition-colors"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}
          <div className="flex-1 min-w-0">
            <AdminBreadcrumb />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Notifications bell */}
            <NavLink
              to="/admin/messages"
              className="relative p-1.5 rounded-lg text-[#585858] dark:text-[#9ca3af] hover:bg-[#f3f4f6] dark:hover:bg-[#2a2a2a] transition-colors"
              aria-label="Messages"
            >
              <Bell size={18} />
              {unreadMsgs > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold">
                  {unreadMsgs > 9 ? '9+' : unreadMsgs}
                </span>
              )}
            </NavLink>

            {/* Dark mode toggle */}
            <button
              type="button"
              onClick={() => setDarkMode((v) => !v)}
              className="p-1.5 rounded-lg text-[#585858] dark:text-[#9ca3af] hover:bg-[#f3f4f6] dark:hover:bg-[#2a2a2a] transition-colors"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* User menu */}
            <UserMenu onLogout={handleLogout} />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
