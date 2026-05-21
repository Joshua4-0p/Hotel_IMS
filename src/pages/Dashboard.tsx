import { useState } from 'react';
const fmtXAF = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 });
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BedDouble, Heart, Bell, CalendarDays, Users, Ban, ExternalLink, Inbox, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { rooms } from '../data/rooms';

// ─── Tab config ───────────────────────────────────────────────────────────────
type Tab = 'bookings' | 'favorites' | 'notifications';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'bookings',      label: 'My Bookings',   icon: <BedDouble size={15} /> },
  { id: 'favorites',     label: 'Favorites',      icon: <Heart size={15} />     },
  { id: 'notifications', label: 'Notifications',  icon: <Bell size={15} />      },
];

// ─── Cancel modal ─────────────────────────────────────────────────────────────
function CancelModal({
  roomName, onConfirm, onClose,
}: {
  roomName: string;
  onConfirm: () => void; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-[0.75rem] border border-[#E3E3E3] p-6 max-w-[380px] w-full"
        style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.14)' }}
      >
        <h3 className="heading-md text-[#000000] mb-2">Cancel booking?</h3>
        <p className="body-sm text-[#585858] mb-6">
          Are you sure you want to cancel your reservation for{' '}
          <strong className="text-[#000000]">{roomName}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-[0.5rem] border border-[#E3E3E3] body-sm font-medium text-[#585858] hover:border-[#141414] hover:text-[#141414] transition-colors"
          >
            Keep booking
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-[0.5rem] bg-red-500 text-white body-sm font-medium hover:bg-red-600 transition-colors"
          >
            Yes, cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Bookings tab ─────────────────────────────────────────────────────────────
function BookingsTab() {
  const { bookings, cancelBooking } = useAuth();
  const { toast }                   = useToast();
  const [cancelling, setCancelling] = useState<string | null>(null);

  function handleConfirmCancel() {
    if (!cancelling) return;
    cancelBooking(cancelling);
    toast('Booking cancelled.', 'info');
    setCancelling(null);
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <BookOpen size={40} className="text-[#BDBDBD]" />
        <p className="heading-md text-[#000000]">No bookings yet</p>
        <p className="body-sm text-[#585858]">Your reservation history will appear here.</p>
        <Link
          to="/rooms"
          className="mt-2 px-6 py-2.5 bg-[#141414] text-white rounded-[0.5rem] body-sm font-medium hover:bg-[#2a2a2a] transition-colors"
        >
          Browse rooms
        </Link>
      </div>
    );
  }

  const fmtDate = (s: string) =>
    new Date(s + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex flex-col gap-4">
      {bookings.map((b) => (
        <div
          key={b.id}
          className="bg-white border border-[#E3E3E3] rounded-[0.75rem] overflow-hidden flex flex-col sm:flex-row"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        >
          {/* Image */}
          <div className="sm:w-[140px] sm:shrink-0 h-[140px] sm:h-auto overflow-hidden">
            <img
              src={b.roomImage}
              alt={b.roomName}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex-1 p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="heading-md text-[#000000]">{b.roomName}</h3>
                <p className="body-sm text-[#585858] mt-0.5 font-mono text-xs">{b.id.toUpperCase()}</p>
              </div>
              <span
                className={`label px-2.5 py-1 rounded-full shrink-0 ${
                  b.status === 'confirmed'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-[#F8F8F8] text-[#BDBDBD] border border-[#E3E3E3] line-through'
                }`}
              >
                {b.status === 'confirmed' ? '✓ Confirmed' : 'Cancelled'}
              </span>
            </div>

            <div className="flex flex-wrap gap-4 body-sm text-[#585858]">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={13} />
                {fmtDate(b.checkIn)} → {fmtDate(b.checkOut)}
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={13} />
                {b.guests} guest{b.guests > 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E3E3E3]">
              <span className="body-md font-semibold text-[#000000]">
                {fmtXAF(b.totalPrice)}
              </span>
              <div className="flex items-center gap-2">
                <Link
                  to={`/rooms/${b.roomId}`}
                  className="flex items-center gap-1 body-sm text-[#585858] hover:text-[#000000] transition-colors"
                >
                  <ExternalLink size={13} /> View room
                </Link>
                {b.status === 'confirmed' && (
                  <button
                    onClick={() => setCancelling(b.id)}
                    className="flex items-center gap-1 body-sm text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Ban size={13} /> Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      <AnimatePresence>
        {cancelling && (
          <CancelModal
            roomName={bookings.find((b) => b.id === cancelling)?.roomName ?? ''}
            onConfirm={handleConfirmCancel}
            onClose={() => setCancelling(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Favorites tab ────────────────────────────────────────────────────────────
function FavoritesTab() {
  const { favorites, removeFromFavorites } = useAuth();
  const { toast }                          = useToast();

  const favRooms = rooms.filter((r) => favorites.includes(r.id));

  if (favRooms.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <Heart size={40} className="text-[#BDBDBD]" />
        <p className="heading-md text-[#000000]">No favorites yet</p>
        <p className="body-sm text-[#585858]">Save rooms you love and find them here.</p>
        <Link
          to="/rooms"
          className="mt-2 px-6 py-2.5 bg-[#141414] text-white rounded-[0.5rem] body-sm font-medium hover:bg-[#2a2a2a] transition-colors"
        >
          Browse rooms →
        </Link>
      </div>
    );
  }

  function handleRemove(roomId: string, roomName: string) {
    removeFromFavorites(roomId);
    toast(`Removed ${roomName} from favorites.`, 'info');
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {favRooms.map((room) => (
        <div
          key={room.id}
          className="bg-white border border-[#E3E3E3] rounded-[0.75rem] overflow-hidden"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        >
          <div className="relative">
            <img
              src={room.images[0]}
              alt={room.name}
              className="w-full aspect-[4/3] object-cover"
            />
            <button
              onClick={() => handleRemove(room.id, room.name)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-red-500 hover:bg-white shadow transition-colors"
              aria-label="Remove from favorites"
            >
              <Heart size={14} fill="currentColor" />
            </button>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div>
              <span className="label text-[#585858]">{room.category}</span>
              <h3 className="heading-md text-[#000000] mt-0.5">{room.name}</h3>
            </div>
            <div className="flex items-center justify-between">
              <span className="body-md font-semibold text-[#000000]">
                {fmtXAF(room.price)}<span className="body-sm text-text-secondary font-normal">/night</span>
              </span>
              <Link
                to={`/rooms/${room.id}`}
                className="px-4 py-1.5 bg-[#141414] text-white rounded-[0.5rem] body-sm font-medium hover:bg-[#2a2a2a] transition-colors"
              >
                View
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Notifications tab ────────────────────────────────────────────────────────
function NotificationsTab() {
  const { notifications, markNotificationRead, markAllRead } = useAuth();
  const unread = notifications.filter((n) => !n.read).length;

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <Inbox size={40} className="text-[#BDBDBD]" />
        <p className="heading-md text-[#000000]">All caught up</p>
        <p className="body-sm text-[#585858]">No notifications yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {unread > 0 && (
        <div className="flex items-center justify-between">
          <span className="body-sm text-[#585858]">{unread} unread</span>
          <button
            onClick={markAllRead}
            className="body-sm text-[#141414] font-medium hover:underline"
          >
            Mark all as read
          </button>
        </div>
      )}

      {notifications.map((n) => (
        <button
          key={n.id}
          onClick={() => markNotificationRead(n.id)}
          className={`text-left w-full p-4 rounded-[0.75rem] border transition-colors ${
            n.read
              ? 'border-[#E3E3E3] bg-white'
              : 'border-[#141414]/20 bg-[#F8F8F8]'
          }`}
        >
          <div className="flex items-start gap-3">
            <span
              className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                n.read ? 'bg-transparent' : 'bg-[#141414]'
              }`}
            />
            <div className="flex-1">
              <p className={`body-sm ${n.read ? 'text-[#585858]' : 'text-[#000000] font-medium'}`}>
                {n.message}
              </p>
              <p className="label text-[#BDBDBD] mt-1">{fmtDate(n.date)}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Dashboard page ───────────────────────────────────────────────────────────
export function Dashboard() {
  const { user, unreadCount }    = useAuth();
  const location                 = useLocation();
  const navigate                 = useNavigate();

  // Derive active tab from path
  const pathTab = location.pathname.split('/').pop() as Tab | undefined;
  const activeTab: Tab = TABS.some((t) => t.id === pathTab) ? (pathTab as Tab) : 'bookings';

  function goTab(tab: Tab) {
    navigate(`/dashboard/${tab}`, { replace: true });
  }

  const initials = user?.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?';

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <div className="container-wide section-py flex flex-col gap-8">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#141414] text-white flex items-center justify-center heading-md font-semibold shrink-0">
            {initials}
          </div>
          <div>
            <p className="label text-[#585858]">Dashboard</p>
            <h1 className="heading-xl text-[#000000]">
              Welcome back, {user?.name.split(' ')[0]}
            </h1>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1 border-b border-[#E3E3E3]">
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            const badge    = tab.id === 'notifications' && unreadCount > 0;
            return (
              <button
                key={tab.id}
                onClick={() => goTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-3 body-sm font-medium transition-colors ${
                  isActive
                    ? 'text-[#000000] border-b-2 border-[#141414] -mb-px'
                    : 'text-[#585858] hover:text-[#000000]'
                }`}
              >
                {tab.icon}
                {tab.label}
                {badge && (
                  <span className="w-4 h-4 rounded-full bg-[#141414] text-white flex items-center justify-center text-[10px] font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            {activeTab === 'bookings'      && <BookingsTab />}
            {activeTab === 'favorites'     && <FavoritesTab />}
            {activeTab === 'notifications' && <NotificationsTab />}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}
