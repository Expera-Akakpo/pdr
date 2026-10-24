import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate, Outlet } from 'react-router-dom';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { Home } from './pages/Home.tsx';

// Public pages loaded lazily to minimize initial landing bundle
const Programs = lazy(() => import('./pages/Programs.tsx').then(m => ({ default: m.Programs })));
const Circuits = lazy(() => import('./pages/Circuits.tsx').then(m => ({ default: m.Circuits })));
const Realisations = lazy(() => import('./pages/Realisations.tsx').then(m => ({ default: m.Realisations })));
const Contact = lazy(() => import('./pages/Contact.tsx').then(m => ({ default: m.Contact })));
const NotFound = lazy(() => import('./pages/NotFound.tsx').then(m => ({ default: m.NotFound })));

// Admin imports
import { ADMIN_BASE_PATH, ADMIN_SEGMENT } from './admin/config.ts';
import { AuthProvider } from './admin/context/AuthContext.tsx';
import { ToastProvider } from './admin/context/ToastContext.tsx';
import { AdminRouteGuard } from './admin/components/AdminRouteGuard.tsx';
import { AdminLayout } from './admin/layout/AdminLayout.tsx';

// Admin pages loaded on-demand (only downloaded when visiting the admin console)
const Login = lazy(() => import('./admin/pages/Login.tsx').then(m => ({ default: m.Login })));
const Dashboard = lazy(() => import('./admin/pages/Dashboard.tsx').then(m => ({ default: m.Dashboard })));
const RealisationsList = lazy(() => import('./admin/pages/realisations/RealisationsList.tsx').then(m => ({ default: m.RealisationsList })));
const RealisationEdit = lazy(() => import('./admin/pages/realisations/RealisationEdit.tsx').then(m => ({ default: m.RealisationEdit })));
const CircuitsList = lazy(() => import('./admin/pages/circuits/CircuitsList.tsx').then(m => ({ default: m.CircuitsList })));
const CircuitEdit = lazy(() => import('./admin/pages/circuits/CircuitEdit.tsx').then(m => ({ default: m.CircuitEdit })));
const ProgramWeeksAdmin = lazy(() => import('./admin/pages/program/ProgramWeeksAdmin.tsx').then(m => ({ default: m.ProgramWeeksAdmin })));
const PilarsAdmin = lazy(() => import('./admin/pages/pilars/PilarsAdmin.tsx').then(m => ({ default: m.PilarsAdmin })));
const TestimonialsAdmin = lazy(() => import('./admin/pages/testimonials/TestimonialsAdmin.tsx').then(m => ({ default: m.TestimonialsAdmin })));
const PartnersAdmin = lazy(() => import('./admin/pages/partners/PartnersAdmin.tsx').then(m => ({ default: m.PartnersAdmin })));
const StatsAdmin = lazy(() => import('./admin/pages/stats/StatsAdmin.tsx').then(m => ({ default: m.StatsAdmin })));
const InscriptionsAdmin = lazy(() => import('./admin/pages/inscriptions/InscriptionsAdmin.tsx').then(m => ({ default: m.InscriptionsAdmin })));
const ContactMessagesAdmin = lazy(() => import('./admin/pages/contact/ContactMessagesAdmin.tsx').then(m => ({ default: m.ContactMessagesAdmin })));
const NewsletterAdmin = lazy(() => import('./admin/pages/newsletter/NewsletterAdmin.tsx').then(m => ({ default: m.NewsletterAdmin })));
const UsersAdmin = lazy(() => import('./admin/pages/users/UsersAdmin.tsx').then(m => ({ default: m.UsersAdmin })));
const MediaLibraryAdmin = lazy(() => import('./admin/pages/media/MediaLibraryAdmin.tsx').then(m => ({ default: m.MediaLibraryAdmin })));
const SettingsAdmin = lazy(() => import('./admin/pages/settings/SettingsAdmin.tsx').then(m => ({ default: m.SettingsAdmin })));

// Loading spinner fallback
function PageLoading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center py-20">
      <div className="w-9 h-9 border-3 border-[#1B2A5E]/20 border-t-[#E6B325] rounded-full animate-spin" />
      <span className="mt-3 text-xs text-gray-500 font-medium tracking-wider uppercase">Chargement...</span>
    </div>
  );
}

// Helper de défilement vers le haut lors de la navigation
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash || hash === '#admin_pdr') {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}

// Détecteur du hash #admin_pdr pour ouvrir directement la console admin sans clé ni env var
function AdminHashRedirect() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleHashCheck = () => {
      const hash = (window.location.hash || '').toLowerCase().trim();
      const customHash = `#${ADMIN_SEGMENT.toLowerCase()}`;
      if (
        hash === '#admin_pdr' ||
        hash === '#admin-pdr' ||
        hash === '#/admin_pdr' ||
        hash === '#admin' ||
        hash === customHash ||
        hash === `#/${ADMIN_SEGMENT.toLowerCase()}`
      ) {
        // Redirige immédiatement vers la console d'administration
        navigate(ADMIN_BASE_PATH);
      }
    };

    handleHashCheck();
    window.addEventListener('hashchange', handleHashCheck);
    return () => window.removeEventListener('hashchange', handleHashCheck);
  }, [location, navigate]);

  return null;
}

// Layout public avec Header et Footer officiels
function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1A1A1A] selection:bg-[#E6B325]/30 selection:text-[#1B2A5E]">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<PageLoading />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AdminHashRedirect />
      <ToastProvider>
        <AuthProvider>
          <Suspense fallback={<PageLoading />}>
            <Routes>
              {/* 1. ROUTES PUBLIQUES DU SITE (Avec Header & Footer publics) */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/programmes" element={<Programs />} />
                <Route path="/circuits" element={<Circuits />} />
                <Route path="/realisations" element={<Realisations />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/inscription" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              {/* Redirection rétro-compatibilité ancienne URL console */}
              <Route path="/console-6f3a9b2c/*" element={<Navigate to={ADMIN_BASE_PATH} replace />} />
              <Route path="/admin" element={<Navigate to={ADMIN_BASE_PATH} replace />} />

              {/* 2. ROUTE DE CONNEXION ADMIN (Layout sobre) */}
              <Route path={`${ADMIN_BASE_PATH}/login`} element={<Login />} />

              {/* 3. CONSOLE D'ADMINISTRATION PRIVÉE (Sidebar + Header admin séparés) */}
              <Route
                path={ADMIN_BASE_PATH}
                element={
                  <AdminRouteGuard>
                    <AdminLayout />
                  </AdminRouteGuard>
                }
              >
                <Route index element={<Dashboard />} />
                {/* Réalisations */}
                <Route path="realisations" element={<RealisationsList />} />
                <Route path="realisations/new" element={<RealisationEdit />} />
                <Route path="realisations/:id/edit" element={<RealisationEdit />} />
                {/* Circuits */}
                <Route path="circuits" element={<CircuitsList />} />
                <Route path="circuits/new" element={<CircuitEdit />} />
                <Route path="circuits/:id/edit" element={<CircuitEdit />} />
                {/* Modules de contenu */}
                <Route path="programme" element={<ProgramWeeksAdmin />} />
                <Route path="piliers" element={<PilarsAdmin />} />
                <Route path="temoignages" element={<TestimonialsAdmin />} />
                <Route path="partenaires" element={<PartnersAdmin />} />
                <Route path="statistiques" element={<StatsAdmin />} />
                {/* Relations & Interactions */}
                <Route path="inscriptions" element={<InscriptionsAdmin />} />
                <Route path="messages" element={<ContactMessagesAdmin />} />
                <Route path="newsletter" element={<NewsletterAdmin />} />
                <Route path="medias" element={<MediaLibraryAdmin />} />
                {/* Administration système */}
                <Route path="utilisateurs" element={<UsersAdmin />} />
                <Route path="parametres" element={<SettingsAdmin />} />
              </Route>
            </Routes>
          </Suspense>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
