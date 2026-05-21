import { useEffect } from 'react';
import { useLocation, useNavigate, useRoutes, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
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

// Routes that hide the footer
const noFooterRoutes = ['/login', '/signup'];
// Routes that hide the main site navbar (auth pages render their own minimal header)
const noNavbarRoutes = ['/login', '/signup'];

function AppRoutes() {
  const location = useLocation();

  const element = useRoutes([
    // Public routes
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

    // Auth routes (no navbar/footer)
    { path: '/login',              element: <Login /> },
    { path: '/signup',             element: <Signup /> },
    { path: '/logout',             element: <LogoutRoute /> },

    // Protected routes
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

    // Redirects + fallback
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
  const location   = useLocation();
  const showFooter = !noFooterRoutes.includes(location.pathname);
  const showNavbar = !noNavbarRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      {showNavbar && <Navbar />}
      <main className="flex-1">
        <AppRoutes />
      </main>
      {showFooter && <Footer />}
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
