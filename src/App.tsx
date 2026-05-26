import { useEffect } from 'react';
import { useLocation, useNavigate, useRoutes, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ProtectedAdminRoute } from './components/ProtectedAdminRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AdminDataProvider } from './context/AdminDataContext';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Team } from './pages/Team';
import { Services } from './pages/Services';
import { ServiceDetail } from './pages/ServiceDetail';
import { Rooms } from './pages/Rooms';
import { RoomDetail } from './pages/RoomDetail';
import { Gallery } from './pages/Gallery';
import { Pricing } from './pages/Pricing';
import { FAQ } from './pages/FAQ';
import { Reviews } from './pages/Reviews';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';
import { Contact } from './pages/Contact';
import { NotFound } from './pages/NotFound';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
// Admin
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminBookings } from './pages/admin/AdminBookings';
import { AdminBookingDetail } from './pages/admin/AdminBookingDetail';
import { AdminRooms } from './pages/admin/AdminRooms';
import { AdminRoomDetail } from './pages/admin/AdminRoomDetail';
import { AdminGuests } from './pages/admin/AdminGuests';
import { AdminGuestDetail } from './pages/admin/AdminGuestDetail';
import { AdminCalendar } from './pages/admin/AdminCalendar';
import { AdminPricing } from './pages/admin/AdminPricing';
import { AdminServices } from './pages/admin/AdminServices';
import { AdminBlog } from './pages/admin/AdminBlog';
import { AdminGallery } from './pages/admin/AdminGallery';
import { AdminTeam } from './pages/admin/AdminTeam';
import { AdminFaq } from './pages/admin/AdminFaq';
import { AdminReviews } from './pages/admin/AdminReviews';
import { AdminMessages } from './pages/admin/AdminMessages';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminWaterSupply } from './pages/admin/AdminWaterSupply';
import { ReviewPromptModal } from './components/ReviewPromptModal';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.4, ease: 'easeIn' as const },
  },
};

function AnimatedPage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.div>
  );
}

// Logout route — clears auth and redirects home
function LogoutRoute() {
  const { logout } = useAuth();
  const navigate   = useNavigate();
  useEffect(() => {
    logout();
    navigate('/', { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

// Routes that hide the footer / main navbar (auth + all admin pages)
const noFooterRoutes = ['/login', '/signup'];
const noNavbarRoutes = ['/login', '/signup'];

// ── Admin route tree (nested layout with Outlet) ───────────────────────────────
function AdminRouteTree() {
  return (
    <ProtectedAdminRoute>
      <AdminDataProvider>
        <AdminLayout />
      </AdminDataProvider>
    </ProtectedAdminRoute>
  );
}

function AppRoutes() {
  const location = useLocation();

  const element = useRoutes([
    // ── Public routes ────────────────────────────────────────────────────────
    { path: '/',                   element: <Home /> },
    { path: '/about-us',           element: <About /> },
    { path: '/our-team',           element: <Team /> },
    { path: '/our-services',       element: <Services /> },
    { path: '/our-services/:slug', element: <ServiceDetail /> },
    { path: '/rooms',              element: <Rooms /> },
    { path: '/rooms/:id',          element: <RoomDetail /> },
    { path: '/gallery',            element: <Gallery /> },
    { path: '/pricing',            element: <Pricing /> },
    { path: '/faq',                element: <FAQ /> },
    { path: '/reviews',            element: <Reviews /> },
    { path: '/blog',               element: <Blog /> },
    { path: '/blog/:slug',         element: <BlogPost /> },
    { path: '/contact-us',         element: <Contact /> },

    // ── Auth routes (no navbar/footer) ───────────────────────────────────────
    { path: '/login',              element: <Login /> },
    { path: '/signup',             element: <Signup /> },
    { path: '/logout',             element: <LogoutRoute /> },

    // ── Guest protected routes ───────────────────────────────────────────────
    {
      path: '/dashboard',
      element: <ProtectedRoute><Navigate to="/dashboard/bookings" replace /></ProtectedRoute>,
    },
    {
      path: '/dashboard/bookings',
      element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
    },
    {
      path: '/dashboard/favorites',
      element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
    },
    {
      path: '/dashboard/notifications',
      element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
    },
    {
      path: '/profile',
      element: <ProtectedRoute><Profile /></ProtectedRoute>,
    },

    // ── Admin routes (own layout shell, no main navbar/footer) ───────────────
    { path: '/admin/login', element: <AdminLogin /> },
    {
      path: '/admin',
      element: <AdminRouteTree />,
      children: [
        { index: true,                    element: <AdminDashboard /> },
        { path: 'bookings',               element: <AdminBookings /> },
        { path: 'bookings/:id',           element: <AdminBookingDetail /> },
        { path: 'calendar',               element: <AdminCalendar /> },
        { path: 'rooms',                  element: <AdminRooms /> },
        { path: 'rooms/:id',              element: <AdminRoomDetail /> },
        { path: 'pricing',                element: <AdminPricing /> },
        { path: 'availability',           element: <AdminCalendar /> },
        { path: 'guests',                 element: <AdminGuests /> },
        { path: 'guests/:id',             element: <AdminGuestDetail /> },
        { path: 'blog',                   element: <AdminBlog /> },
        { path: 'gallery',                element: <AdminGallery /> },
        { path: 'services',               element: <AdminServices /> },
        { path: 'team',                   element: <AdminTeam /> },
        { path: 'faq',                    element: <AdminFaq /> },
        { path: 'reviews',                element: <AdminReviews /> },
        { path: 'messages',               element: <AdminMessages /> },
        { path: 'reports',                element: <AdminReports /> },
        { path: 'water-supply',           element: <AdminWaterSupply /> },
        { path: 'users',    element: <ProtectedAdminRoute roles={['super_admin']}><AdminUsers /></ProtectedAdminRoute> },
        { path: 'settings', element: <ProtectedAdminRoute roles={['super_admin']}><AdminSettings /></ProtectedAdminRoute> },
      ],
    },

    // ── Redirects + fallback ─────────────────────────────────────────────────
    { path: '/accomodation', element: <Navigate to="/rooms" replace /> },
    { path: '*',             element: <NotFound /> },
  ]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <AnimatedPage key={location.pathname}>
        {element}
      </AnimatedPage>
    </AnimatePresence>
  );
}

function AppShell() {
  const location      = useLocation();
  const isAdminRoute  = location.pathname.startsWith('/admin');
  const showFooter    = !isAdminRoute && !noFooterRoutes.includes(location.pathname);
  const showNavbar    = !isAdminRoute && !noNavbarRoutes.includes(location.pathname);

  if (isAdminRoute) {
    // Admin routes render their own layout shell — no outer wrapping
    return <AppRoutes />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {showNavbar && <Navbar />}
      <main className="flex-1">
        <AppRoutes />
      </main>
      {showFooter && <Footer />}
      <ReviewPromptModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </AuthProvider>
  );
}
