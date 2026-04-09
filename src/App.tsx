import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Statistiques from "@/pages/Statistiques";
import Enregistrer from "@/pages/Enregistrer";
import Personnel from "@/pages/Personnel";
import MeresEnfants from "@/pages/MeresEnfants";
import Beneficiaires from "@/pages/Beneficiaires";
import Suivi from "@/pages/Suivi";
import Evenements from "@/pages/Evenements";
import CabinetMedical from "@/pages/CabinetMedical";
import Medicaments from "@/pages/Medicaments";
import Parametres from "@/pages/Parametres";
import Notifications from "@/pages/Notifications";
import Alertes from "@/pages/Alertes";
import Exportation from "@/pages/Exportation";
import Rapports from "@/pages/Rapports";
import ListePresence from "@/pages/ListePresence";
import ModeKiosque from "@/pages/ModeKiosque";
import { ROUTE_PATHS } from "@/lib/index";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

const NotFound = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center space-y-6">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <p className="text-2xl text-foreground">Page introuvable</p>
      <p className="text-muted-foreground">La page que vous recherchez n'existe pas.</p>
      <a
        href="#/dashboard"
        className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:scale-105 transition-transform"
      >
        Retour au tableau de bord
      </a>
    </div>
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MotionConfig reducedMotion="user">
          <Toaster />
          <Sonner />
          <HashRouter>
            <Routes>
              <Route path={ROUTE_PATHS.LOGIN} element={<Login />} />
              
              <Route path={ROUTE_PATHS.MODE_KIOSQUE} element={
                <ProtectedRoute>
                  <ModeKiosque />
                </ProtectedRoute>
              } />
              
              <Route path={ROUTE_PATHS.HOME} element={
                <Navigate to={ROUTE_PATHS.DASHBOARD} replace />
              } />
              
              <Route path={ROUTE_PATHS.DASHBOARD} element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path={ROUTE_PATHS.STATISTIQUES} element={
                <ProtectedRoute>
                  <Layout>
                    <Statistiques />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path={ROUTE_PATHS.ENREGISTRER} element={
                <ProtectedRoute>
                  <Layout>
                    <Enregistrer />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path={ROUTE_PATHS.PERSONNEL} element={
                <ProtectedRoute>
                  <Layout>
                    <Personnel />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path={ROUTE_PATHS.MERES_ENFANTS} element={
                <ProtectedRoute>
                  <Layout>
                    <MeresEnfants />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path={ROUTE_PATHS.BENEFICIAIRES} element={
                <ProtectedRoute>
                  <Layout>
                    <Beneficiaires />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path={ROUTE_PATHS.SUIVI} element={
                <ProtectedRoute>
                  <Layout>
                    <Suivi />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path={ROUTE_PATHS.EVENEMENTS} element={
                <ProtectedRoute>
                  <Layout>
                    <Evenements />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path={ROUTE_PATHS.CABINET_MEDICAL} element={
                <ProtectedRoute>
                  <Layout>
                    <CabinetMedical />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path={ROUTE_PATHS.MEDICAMENTS} element={
                <ProtectedRoute>
                  <Layout>
                    <Medicaments />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path={ROUTE_PATHS.PARAMETRES} element={
                <ProtectedRoute>
                  <Layout>
                    <Parametres />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path={ROUTE_PATHS.NOTIFICATIONS} element={
                <ProtectedRoute>
                  <Layout>
                    <Notifications />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path={ROUTE_PATHS.ALERTES} element={
                <ProtectedRoute>
                  <Layout>
                    <Alertes />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path={ROUTE_PATHS.EXPORTATION} element={
                <ProtectedRoute>
                  <Layout>
                    <Exportation />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path={ROUTE_PATHS.RAPPORTS} element={
                <ProtectedRoute>
                  <Layout>
                    <Rapports />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path={ROUTE_PATHS.LISTE_PRESENCE} element={
                <ProtectedRoute>
                  <Layout>
                    <ListePresence />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </HashRouter>
        </MotionConfig>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;