import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  location: string;
  country: string;
  phone: string;
}

export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  roomImage: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'confirmed' | 'cancelled';
  bookedAt: string;
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  date: string;
}

export interface SignupData {
  name: string;
  email: string;
  location: string;
  country: string;
  phone: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  favorites: string[];
  bookings: Booking[];
  notifications: Notification[];
  isAuthenticated: boolean;
  unreadCount: number;
  login: (email: string, password: string) => void;
  loginWithGoogle: () => void;
  signup: (data: SignupData) => void;
  signupWithGoogle: () => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  addToFavorites: (roomId: string) => void;
  removeFromFavorites: (roomId: string) => void;
  addBooking: (booking: Omit<Booking, 'id' | 'bookedAt' | 'status'>) => void;
  cancelBooking: (bookingId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
}

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    message: 'Welcome to Lodr Hotel! We look forward to hosting you.',
    read: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'n2',
    message: 'Spa promotion: 20% off all treatments this weekend.',
    read: false,
    date: new Date(Date.now() - 86_400_000).toISOString().split('T')[0],
  },
  {
    id: 'n3',
    message: 'Complete your profile to unlock exclusive member rates.',
    read: true,
    date: new Date(Date.now() - 172_800_000).toISOString().split('T')[0],
  },
];

const STORAGE_KEY = 'lodr_auth_v1';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function makeUser(overrides: Partial<User> & { email: string; name: string }): User {
  return {
    id: 'u_' + Math.random().toString(36).slice(2, 10),
    location: '',
    country: '',
    phone: '',
    ...overrides,
  };
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const saved = loadFromStorage();

  const [user, setUser]                   = useState<User | null>(saved?.user ?? null);
  const [favorites, setFavorites]         = useState<string[]>(saved?.favorites ?? []);
  const [bookings, setBookings]           = useState<Booking[]>(saved?.bookings ?? []);
  const [notifications, setNotifications] = useState<Notification[]>(saved?.notifications ?? []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, favorites, bookings, notifications }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user, favorites, bookings, notifications]);

  const isAuthenticated = user !== null;
  const unreadCount     = notifications.filter((n) => !n.read).length;

  function initSession(u: User, fresh: boolean) {
    setUser(u);
    if (fresh) setNotifications(DEFAULT_NOTIFICATIONS);
  }

  function login(email: string, _password: string) {
    const u = makeUser({
      email,
      name: email
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()),
    });
    initSession(u, !saved?.notifications?.length);
  }

  function loginWithGoogle() {
    const u = makeUser({ email: 'guest@gmail.com', name: 'Google Guest' });
    initSession(u, !saved?.notifications?.length);
  }

  function signup(data: SignupData) {
    const u = makeUser({ email: data.email, name: data.name, location: data.location, country: data.country, phone: data.phone });
    initSession(u, true);
  }

  function signupWithGoogle() {
    const u = makeUser({ email: 'guest@gmail.com', name: 'Google Guest' });
    initSession(u, true);
  }

  function logout() {
    setUser(null);
    setFavorites([]);
    setBookings([]);
    setNotifications([]);
  }

  function updateProfile(data: Partial<User>) {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  }

  function addToFavorites(roomId: string) {
    setFavorites((prev) => (prev.includes(roomId) ? prev : [...prev, roomId]));
  }

  function removeFromFavorites(roomId: string) {
    setFavorites((prev) => prev.filter((id) => id !== roomId));
  }

  function addBooking(booking: Omit<Booking, 'id' | 'bookedAt' | 'status'>) {
    const newBooking: Booking = {
      ...booking,
      id: 'b_' + Math.random().toString(36).slice(2, 10),
      status: 'confirmed',
      bookedAt: new Date().toISOString(),
    };
    setBookings((prev) => [newBooking, ...prev]);
    setNotifications((prev) => [
      {
        id: 'n_' + Math.random().toString(36).slice(2, 10),
        message: `Your booking for ${booking.roomName} has been confirmed!`,
        read: false,
        date: new Date().toISOString().split('T')[0],
      },
      ...prev,
    ]);
  }

  function cancelBooking(bookingId: string) {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b)),
    );
  }

  function markNotificationRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <AuthContext.Provider
      value={{
        user, favorites, bookings, notifications,
        isAuthenticated, unreadCount,
        login, loginWithGoogle, signup, signupWithGoogle,
        logout, updateProfile,
        addToFavorites, removeFromFavorites,
        addBooking, cancelBooking,
        markNotificationRead, markAllRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
