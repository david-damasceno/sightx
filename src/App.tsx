import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom"
import { ThemeProvider } from "next-themes"
import { AuthProvider } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { AppNavbar } from "@/components/AppNavbar"
import PWAInstallPrompt from "@/components/PWAInstallPrompt"
import OfflineNotification from "@/components/OfflineNotification"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import { useEffect } from "react"
import Index from "./pages/Index"
import Login from "./pages/Login"
import Onboarding from "./pages/Onboarding"
import Social from "./pages/Social"
import Demographics from "./pages/Demographics"
import AIInsights from "./pages/AIInsights"
import Feedback from "./pages/Feedback"
import Reports from "./pages/Reports"
import Sales from "./pages/Sales"
import Performance from "./pages/Performance"
import Profile from "./pages/Profile"
import Settings from "./pages/Settings"
import DataConnectors from "./pages/DataConnectors"
import PrivacyPolicy from "./pages/PrivacyPolicy"
import TermsOfService from "./pages/TermsOfService"
import Support from "./pages/Support"
import DataUsagePolicy from "./pages/DataUsagePolicy"
import AirbyteIntegration from "./pages/AirbyteIntegration";
import { initializeLocalization, getLocalizationSettings } from "@/utils/localization";

const queryClient = new QueryClient()

const AppContent = () => {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'
  const isOnboardingPage = location.pathname === '/onboarding'
  const isLegalPage = ['/privacy-policy', '/terms-of-service', '/support', '/data-usage-policy'].includes(location.pathname)

  // Inicializar as configurações de localização quando o componente montar
  useEffect(() => {
    // Inicializar localização
    initializeLocalization();
    
    // Configurar título da página baseado no idioma atual
    const settings = getLocalizationSettings();
    const siteName = "SightX";
    let suffix = "";
    
    switch(settings.language.split('-')[0]) {
      case 'pt':
        suffix = "Transforme Dados em Decisões Inteligentes";
        break;
      case 'en':
        suffix = "Transform Data into Smart Decisions";
        break;
      case 'es':
        suffix = "Transforme Datos en Decisiones Inteligentes";
        break;
      default:
        suffix = "Transforme Dados em Decisões Inteligentes";
    }
    
    document.title = `SightX - ${suffix}`;
  }, []);

  return (
    <div className="min-h-screen flex flex-col w-full">
      {!isLoginPage && !isOnboardingPage && !isLegalPage && <AppNavbar />}
      <PWAInstallPrompt />
      <OfflineNotification />
      <main className={`flex-1 ${!isLoginPage && !isOnboardingPage && !isLegalPage ? 'pt-16' : ''} pb-16 md:pb-0`}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/support" element={<Support />} />
          <Route path="/data-usage-policy" element={<DataUsagePolicy />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute checkOnboarding>
                <Index />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales"
            element={
              <ProtectedRoute checkOnboarding>
                <Sales />
              </ProtectedRoute>
            }
          />
          <Route
            path="/performance"
            element={
              <ProtectedRoute checkOnboarding>
                <Performance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/data"
            element={
              <ProtectedRoute checkOnboarding>
                <DataConnectors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/social"
            element={
              <ProtectedRoute checkOnboarding>
                <Social />
              </ProtectedRoute>
            }
          />
          <Route
            path="/demographics"
            element={
              <ProtectedRoute checkOnboarding>
                <Demographics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-insights"
            element={
              <ProtectedRoute checkOnboarding>
                <AIInsights />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedback"
            element={
              <ProtectedRoute checkOnboarding>
                <Feedback />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute checkOnboarding>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute checkOnboarding>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/*"
            element={
              <ProtectedRoute checkOnboarding>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/integrations/airbyte"
            element={
              <ProtectedRoute>
                <AppNavbar />
                <AirbyteIntegration />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Analytics />
      <SpeedInsights />
    </div>
  )
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" attribute="class">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
)

export default App
