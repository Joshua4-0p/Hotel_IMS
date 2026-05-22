import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AdminRole } from './AuthContext';
import { rooms as SEED_ROOMS, type Room } from '../data/rooms';
import { reviews as SEED_REVIEWS, type Review } from '../data/reviews';
import { services as SEED_SERVICES, type Service } from '../data/services';
import { blogPosts as SEED_BLOG, type BlogPost } from '../data/blog';
import { galleryImages as SEED_GALLERY, type GalleryImage } from '../data/gallery';
import { team as SEED_TEAM, type TeamMember } from '../data/team';
import { faqItems as SEED_FAQ, type FaqItem } from '../data/faq';

// ── Interfaces ─────────────────────────────────────────────────────────────────
export interface AdminBooking {
  id: string;
  roomId: string;
  roomName: string;
  roomImage: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'confirmed' | 'cancelled' | 'pending' | 'checked_in' | 'checked_out';
  bookedAt: string;
  source: 'online' | 'walk_in' | 'phone';
  notes?: string;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  status: 'active' | 'vip' | 'inactive';
  totalBookings: number;
  totalSpent: number;
  joinedAt: string;
  lastStay?: string;
}

export interface AdminMessage {
  id: string;
  from: string;
  email: string;
  phone?: string;
  subject: string;
  body: string;
  read: boolean;
  date: string;
  replied: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  lastLogin: string;
  active: boolean;
}

export interface HotelSettings {
  hotelName: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  checkInTime: string;
  checkOutTime: string;
  currency: string;
  taxRate: number;
  cleaningFee: number;
  minStayNights: number;
  maxGuests: number;
}

// ── Seed data ──────────────────────────────────────────────────────────────────
const SEED_BOOKINGS: AdminBooking[] = [
  { id: 'ab_01', roomId: 'serenity-suite',       roomName: 'Serenity Suite',       roomImage: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=400', guestName: 'Amara Fotso',      guestEmail: 'amara.fotso@email.com',    guestPhone: '+237 655 001 001', checkIn: '2026-05-25', checkOut: '2026-05-28', guests: 2, totalPrice: 927000,  status: 'confirmed',   bookedAt: '2026-05-18T09:00:00', source: 'online' },
  { id: 'ab_02', roomId: 'terrace-room',          roomName: 'Terrace Room',          roomImage: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=400', guestName: 'Thierry Nkemdirim', guestEmail: 'thierry.nkem@email.com',   guestPhone: '+237 677 002 002', checkIn: '2026-05-24', checkOut: '2026-05-26', guests: 2, totalPrice: 390600,  status: 'confirmed',   bookedAt: '2026-05-17T14:30:00', source: 'online' },
  { id: 'ab_03', roomId: 'lodr-signature',        roomName: 'Lodr Signature',        roomImage: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=400', guestName: 'Ngozi Tagne',       guestEmail: 'ngozi.tagne@email.com',    guestPhone: '+237 699 003 003', checkIn: '2026-05-22', checkOut: '2026-05-25', guests: 1, totalPrice: 1530960, status: 'checked_in',  bookedAt: '2026-05-10T11:00:00', source: 'phone' },
  { id: 'ab_04', roomId: 'deluxe-room',           roomName: 'Deluxe Room',           roomImage: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?q=80&w=400', guestName: 'Brice Ewane',       guestEmail: 'brice.ewane@email.com',    guestPhone: '+237 652 004 004', checkIn: '2026-05-20', checkOut: '2026-05-22', guests: 2, totalPrice: 295440,  status: 'checked_out', bookedAt: '2026-05-12T16:00:00', source: 'walk_in' },
  { id: 'ab_05', roomId: 'sunlight-terrace-villa', roomName: 'Sunlight Terrace Villa', roomImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=400', guestName: 'Christelle Mbeki',  guestEmail: 'christelle@email.com',     guestPhone: '+237 671 005 005', checkIn: '2026-05-28', checkOut: '2026-06-01', guests: 4, totalPrice: 1677120, status: 'confirmed',   bookedAt: '2026-05-19T08:00:00', source: 'online' },
  { id: 'ab_06', roomId: 'tropical-zen-retreat',  roomName: 'Tropical Zen Retreat',  roomImage: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=400', guestName: 'Jean-Pierre Fongo', guestEmail: 'jp.fongo@email.com',       guestPhone: '+237 683 006 006', checkIn: '2026-05-15', checkOut: '2026-05-18', guests: 2, totalPrice: 720720,  status: 'checked_out', bookedAt: '2026-05-08T12:00:00', source: 'online' },
  { id: 'ab_07', roomId: 'serenity-suite',        roomName: 'Serenity Suite',        roomImage: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=400', guestName: 'Patience Ndoumbe',  guestEmail: 'patience.n@email.com',     guestPhone: '+237 654 007 007', checkIn: '2026-06-05', checkOut: '2026-06-07', guests: 2, totalPrice: 695400,  status: 'pending',     bookedAt: '2026-05-20T10:00:00', source: 'online' },
  { id: 'ab_08', roomId: 'deluxe-room',           roomName: 'Deluxe Room',           roomImage: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?q=80&w=400', guestName: 'Marcel Kamdem',     guestEmail: 'marcel.kamdem@email.com',  guestPhone: '+237 696 008 008', checkIn: '2026-05-10', checkOut: '2026-05-12', guests: 1, totalPrice: 295440,  status: 'checked_out', bookedAt: '2026-05-05T09:00:00', source: 'phone' },
  { id: 'ab_09', roomId: 'terrace-room',          roomName: 'Terrace Room',          roomImage: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=400', guestName: 'Solange Atangana',  guestEmail: 'solange.a@email.com',      guestPhone: '+237 677 009 009', checkIn: '2026-05-18', checkOut: '2026-05-20', guests: 2, totalPrice: 414720,  status: 'cancelled',   bookedAt: '2026-05-11T15:00:00', source: 'online' },
  { id: 'ab_10', roomId: 'lodr-signature',        roomName: 'Lodr Signature',        roomImage: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=400', guestName: 'Eric Nguemboue',    guestEmail: 'eric.nguem@email.com',     guestPhone: '+237 655 010 010', checkIn: '2026-06-10', checkOut: '2026-06-13', guests: 2, totalPrice: 1566720, status: 'confirmed',   bookedAt: '2026-05-20T11:30:00', source: 'online' },
];

const SEED_GUESTS: Guest[] = [
  { id: 'g_01', name: 'Amara Fotso',      email: 'amara.fotso@email.com',   phone: '+237 655 001 001', country: 'Cameroon', city: 'Douala',     status: 'vip',      totalBookings: 5,  totalSpent: 4250000, joinedAt: '2024-03-10', lastStay: '2026-05-28' },
  { id: 'g_02', name: 'Thierry Nkemdirim',email: 'thierry.nkem@email.com',  phone: '+237 677 002 002', country: 'Cameroon', city: 'Yaoundé',    status: 'active',   totalBookings: 2,  totalSpent: 781200,  joinedAt: '2025-01-15', lastStay: '2026-05-26' },
  { id: 'g_03', name: 'Ngozi Tagne',      email: 'ngozi.tagne@email.com',   phone: '+237 699 003 003', country: 'Cameroon', city: 'Buea',       status: 'active',   totalBookings: 3,  totalSpent: 2296440, joinedAt: '2024-08-22' },
  { id: 'g_04', name: 'Brice Ewane',      email: 'brice.ewane@email.com',   phone: '+237 652 004 004', country: 'Cameroon', city: 'Bafoussam',  status: 'active',   totalBookings: 1,  totalSpent: 295440,  joinedAt: '2026-05-12' },
  { id: 'g_05', name: 'Christelle Mbeki', email: 'christelle@email.com',    phone: '+237 671 005 005', country: 'Cameroon', city: 'Limbe',      status: 'vip',      totalBookings: 7,  totalSpent: 6800000, joinedAt: '2023-11-01', lastStay: '2026-06-01' },
  { id: 'g_06', name: 'Jean-Pierre Fongo',email: 'jp.fongo@email.com',      phone: '+237 683 006 006', country: 'Cameroon', city: 'Bamenda',    status: 'active',   totalBookings: 2,  totalSpent: 1441440, joinedAt: '2024-12-05', lastStay: '2026-05-18' },
  { id: 'g_07', name: 'Patience Ndoumbe', email: 'patience.n@email.com',    phone: '+237 654 007 007', country: 'Cameroon', city: 'Garoua',     status: 'active',   totalBookings: 1,  totalSpent: 695400,  joinedAt: '2026-05-20' },
  { id: 'g_08', name: 'Marcel Kamdem',    email: 'marcel.kamdem@email.com', phone: '+237 696 008 008', country: 'Cameroon', city: 'Ngaoundéré', status: 'inactive', totalBookings: 1,  totalSpent: 295440,  joinedAt: '2026-05-05', lastStay: '2026-05-12' },
];

const SEED_MESSAGES: AdminMessage[] = [
  { id: 'msg_01', from: 'Solange Atangana',  email: 'solange.a@email.com',  phone: '+237 677 009 009', subject: 'Early check-in request',          body: 'Hello, I have a booking from May 28 and I would like to request an early check-in around 10am if possible. Please let me know if this can be arranged.',     read: false,  date: '2026-05-20', replied: false },
  { id: 'msg_02', from: 'Eric Nguemboue',    email: 'eric.nguem@email.com',  subject: 'Group booking inquiry',            body: 'We are planning a corporate retreat for 12 executives in June. Could you provide information about group rates and available meeting rooms?',                 read: false,  date: '2026-05-19', replied: false },
  { id: 'msg_03', from: 'Fatima Moussa',     email: 'fatima.m@email.com',   phone: '+237 660 333 333', subject: 'Honeymoon suite decoration',       body: 'We are celebrating our honeymoon the first week of July. Would it be possible to arrange rose petals and champagne in the room upon arrival?',               read: false,  date: '2026-05-18', replied: false },
  { id: 'msg_04', from: 'Robert Nganou',     email: 'robert.n@email.com',   phone: '+237 699 444 444', subject: 'Airport transfer availability',    body: 'I am arriving at Douala International Airport on May 25 at 14:30. Do you offer airport pickup services? What is the cost?',                                  read: true,   date: '2026-05-17', replied: true  },
  { id: 'msg_05', from: 'Celine Bikoe',      email: 'celine.b@email.com',   phone: '+237 655 555 555', subject: 'Dietary restrictions for booking', body: 'I have a nut allergy and my partner is vegan. Can you confirm that the restaurant can accommodate these requirements during our stay (May 25-28)?',          read: true,   date: '2026-05-15', replied: true  },
];

const SEED_ADMIN_USERS: AdminUser[] = [
  { id: 'au_01', name: 'Kwame Asante',  email: 'admin@lodr.com',   role: 'super_admin', lastLogin: '2026-05-21T08:00:00', active: true  },
  { id: 'au_02', name: 'Amara Nkosi',   email: 'manager@lodr.com', role: 'manager',     lastLogin: '2026-05-21T07:45:00', active: true  },
  { id: 'au_03', name: 'Brice Tagne',   email: 'desk@lodr.com',    role: 'front_desk',  lastLogin: '2026-05-20T22:00:00', active: true  },
];

const SEED_SETTINGS: HotelSettings = {
  hotelName: 'Lodr Hotel',
  tagline: 'Every stay is a journey into comfort, elegance, and lasting memories.',
  email: 'reservations@lodr.com',
  phone: '+237 222 000 000',
  address: 'Avenue du Général de Gaulle',
  city: 'Douala',
  country: 'Cameroon',
  checkInTime: '14:00',
  checkOutTime: '12:00',
  currency: 'XAF',
  taxRate: 0.12,
  cleaningFee: 27000,
  minStayNights: 1,
  maxGuests: 4,
};

// ── Context type ───────────────────────────────────────────────────────────────
interface AdminDataContextType {
  // Bookings
  allBookings: AdminBooking[];
  addAdminBooking: (b: Omit<AdminBooking, 'id' | 'bookedAt'>) => void;
  updateAdminBooking: (id: string, updates: Partial<AdminBooking>) => void;
  deleteAdminBooking: (id: string) => void;

  // Rooms
  allRooms: Room[];
  updateRoom: (id: string, updates: Partial<Room>) => void;

  // Guests
  guests: Guest[];
  addGuest: (g: Omit<Guest, 'id'>) => void;
  updateGuest: (id: string, updates: Partial<Guest>) => void;

  // Messages
  messages: AdminMessage[];
  markMessageRead: (id: string) => void;
  markMessageReplied: (id: string) => void;

  // Content (passed through from seed for read; mutations in later stages)
  services: Service[];
  blogPosts: BlogPost[];
  galleryImages: GalleryImage[];
  teamMembers: TeamMember[];
  faqItems: FaqItem[];
  reviews: Review[];

  // Admin users
  adminUsers: AdminUser[];
  addAdminUser: (u: Omit<AdminUser, 'id' | 'lastLogin'>) => void;
  updateAdminUser: (id: string, updates: Partial<AdminUser>) => void;
  removeAdminUser: (id: string) => void;

  // Settings
  settings: HotelSettings;
  updateSettings: (updates: Partial<HotelSettings>) => void;
}

const STORAGE_KEY = 'lodr_admin_data_v1';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

const AdminDataContext = createContext<AdminDataContextType | null>(null);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const saved = load<Record<string, unknown>>(STORAGE_KEY, {});

  const [allBookings,   setAllBookings]   = useState<AdminBooking[]>((saved.allBookings   as AdminBooking[]  ) ?? SEED_BOOKINGS);
  const [allRooms,      setAllRooms]      = useState<Room[]>(         (saved.allRooms      as Room[]          ) ?? SEED_ROOMS);
  const [guests,        setGuests]        = useState<Guest[]>(         (saved.guests        as Guest[]         ) ?? SEED_GUESTS);
  const [messages,      setMessages]      = useState<AdminMessage[]>(  (saved.messages      as AdminMessage[]  ) ?? SEED_MESSAGES);
  const [adminUsers,    setAdminUsers]    = useState<AdminUser[]>(     (saved.adminUsers    as AdminUser[]     ) ?? SEED_ADMIN_USERS);
  const [settings,      setSettings]      = useState<HotelSettings>(   (saved.settings      as HotelSettings   ) ?? SEED_SETTINGS);

  // Persist all mutable data to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      allBookings, allRooms, guests, messages, adminUsers, settings,
    }));
  }, [allBookings, allRooms, guests, messages, adminUsers, settings]);

  // ── Bookings ──────────────────────────────────────────────────────────────
  function addAdminBooking(b: Omit<AdminBooking, 'id' | 'bookedAt'>) {
    setAllBookings((prev) => [{ ...b, id: 'ab_' + Math.random().toString(36).slice(2, 9), bookedAt: new Date().toISOString() }, ...prev]);
  }
  function updateAdminBooking(id: string, updates: Partial<AdminBooking>) {
    setAllBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  }
  function deleteAdminBooking(id: string) {
    setAllBookings((prev) => prev.filter((b) => b.id !== id));
  }

  // ── Rooms ─────────────────────────────────────────────────────────────────
  function updateRoom(id: string, updates: Partial<Room>) {
    setAllRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }

  // ── Guests ────────────────────────────────────────────────────────────────
  function addGuest(g: Omit<Guest, 'id'>) {
    setGuests((prev) => [{ ...g, id: 'g_' + Math.random().toString(36).slice(2, 9) }, ...prev]);
  }
  function updateGuest(id: string, updates: Partial<Guest>) {
    setGuests((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  }

  // ── Messages ──────────────────────────────────────────────────────────────
  function markMessageRead(id: string) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
  }
  function markMessageReplied(id: string) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true, replied: true } : m)));
  }

  // ── Admin users ───────────────────────────────────────────────────────────
  function addAdminUser(u: Omit<AdminUser, 'id' | 'lastLogin'>) {
    setAdminUsers((prev) => [...prev, { ...u, id: 'au_' + Math.random().toString(36).slice(2, 9), lastLogin: '' }]);
  }
  function updateAdminUser(id: string, updates: Partial<AdminUser>) {
    setAdminUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
  }
  function removeAdminUser(id: string) {
    setAdminUsers((prev) => prev.filter((u) => u.id !== id));
  }

  // ── Settings ──────────────────────────────────────────────────────────────
  function updateSettings(updates: Partial<HotelSettings>) {
    setSettings((prev) => ({ ...prev, ...updates }));
  }

  return (
    <AdminDataContext.Provider
      value={{
        allBookings, addAdminBooking, updateAdminBooking, deleteAdminBooking,
        allRooms, updateRoom,
        guests, addGuest, updateGuest,
        messages, markMessageRead, markMessageReplied,
        services: SEED_SERVICES,
        blogPosts: SEED_BLOG,
        galleryImages: SEED_GALLERY,
        teamMembers: SEED_TEAM,
        faqItems: SEED_FAQ,
        reviews: SEED_REVIEWS,
        adminUsers, addAdminUser, updateAdminUser, removeAdminUser,
        settings, updateSettings,
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error('useAdminData must be used inside AdminDataProvider');
  return ctx;
}
