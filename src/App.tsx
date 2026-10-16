import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate, Outlet } from 'react-router-dom';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { Home } from './pages/Home.tsx';
import { Programs } from './pages/Programs.tsx';
import { Circuits } from './pages/Circuits.tsx';
import { Realisations } from './pages/Realisations.tsx';
import { Contact } from './pages/Contact.tsx';
import { NotFound } from './pages/NotFound.tsx';

// Admin imports
import { ADMIN_BASE_PATH } from './admin/config.ts';
import { AuthProvider } from './admin/context/AuthContext.tsx';
import { ToastProvider } from './admin/context/ToastContext.tsx';
import { AdminRouteGuard } from './admin/components/AdminRouteGuard.tsx';
import { AdminLayout } from './admin/layout/AdminLayout.tsx';
import { Login } from './admin/pages/Login.tsx';
import { Dashboard } from './admin/pages/Dashboard.tsx';
import { RealisationsList } from './admin/pages/realisations/RealisationsList.tsx';
import { RealisationEdit } from './admin/pages/realisations/RealisationEdit.tsx';
import { CircuitsList } from './admin/pages/circuits/CircuitsList.tsx';
import { CircuitEdit } from './admin/pages/circuits/CircuitEdit.tsx';
import { ProgramWeeksAdmin } from './admin/pages/program/ProgramWeeksAdmin.tsx';
import { PilarsAdmin } from './admin/pages/pilars/PilarsAdmin.tsx';
import { TestimonialsAdmin } from './admin/pages/testimonials/TestimonialsAdmin.tsx';
import { PartnersAdmin } from './admin/pages/partners/PartnersAdmin.tsx';
import { StatsAdmin } from './admin/pages/stats/StatsAdmin.tsx';
import { InscriptionsAdmin } from './admin/pages/inscriptions/InscriptionsAdmin.tsx';
import { ContactMessagesAdmin } from './admin/pages/contact/ContactMessagesAdmin.tsx';
import { NewsletterAdmin } from './admin/pages/newsletter/NewsletterAdmin.tsx';
import { UsersAdmin } from './admin/pages/users/UsersAdmin.tsx';
import { MediaLibraryAdmin } from './admin/pages/media/MediaLibraryAdmin.tsx';
import { SettingsAdmin } from './admin/pages/settings/SettingsAdmin.tsx';

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
      if (
        hash === '#admin_pdr' ||
        hash === '#admin-pdr' ||
        hash === '#/admin_pdr' ||
        hash === '#admin'
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
        <Outlet />
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

            {/* 2. ROUTE DE CONNEXION ADMIN (Layout autonome sobre) */}
            <Route path={`${ADMIN_BASE_PATH}/login`} element={<Login />} />

            {/* 3. CONSOLE D'ADMINISTRATION PROGÈNE PRIVÉE (Sidebar + Header admin séparés) */}
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
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
