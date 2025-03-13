
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
import { initializeLocalization, getLocalizationSettings } from "@/utils/localization";

// Configuração segura do cliente de consulta
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      gcTime: 1000 * 60 * 5, // 5 minutos (substituindo cacheTime que foi deprecado)
    },
    mutations: {
      retry: 1,
    },
  },
})

const AppContent = () => {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'
  const isOnboardingPage = location.pathname === '/onboarding'

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
    
    // Configurar Content Security Policy
    const metaCSP = document.createElement('meta');
    metaCSP.httpEquiv = 'Content-Security-Policy';
    metaCSP.content = "default-src 'self'; script-src 'self' https://storage.googleapis.com; connect-src 'self' https://*.supabase.co; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; frame-src 'self'";
    document.head.appendChild(metaCSP);
    
    // Configurar X-XSS-Protection header
    const metaXSS = document.createElement('meta');
    metaXSS.httpEquiv = 'X-XSS-Protection';
    metaXSS.content = '1; mode=block';
    document.head.appendChild(metaXSS);
    
    // Configurar X-Content-Type-Options
    const metaContentType = document.createElement('meta');
    metaContentType.httpEquiv = 'X-Content-Type-Options';
    metaContentType.content = 'nosniff';
    document.head.appendChild(metaContentType);
    
    // Configurar Referrer-Policy
    const metaReferrer = document.createElement('meta');
    metaReferrer.name = 'referrer';
    metaReferrer.content = 'strict-origin-when-cross-origin';
    document.head.appendChild(metaReferrer);
    
    return () => {
      // Remover meta tags ao desmontar
      document.head.removeChild(metaCSP);
      document.head.removeChild(metaXSS);
      document.head.removeChild(metaContentType);
      document.head.removeChild(metaReferrer);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col w-full">
      {!isLoginPage && !isOnboardingPage && <AppNavbar />}
      <PWAInstallPrompt />
      <OfflineNotification />
      <main className={`flex-1 ${!isLoginPage && !isOnboardingPage ? 'pt-16' : ''} pb-16 md:pb-0`}>
        <Routes>
          <Route path="/login" element={<Login />} />
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
