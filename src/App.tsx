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
import AcceptInvite from "./pages/AcceptInvite"

const queryClient = new QueryClient()

const AppContent = () => {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'
  const isOnboardingPage = location.pathname === '/onboarding'

  return (
    <div className="min-h-screen flex flex-col w-full">
      {!isLoginPage && !isOnboardingPage && <AppNavbar />}
      <PWAInstallPrompt />
      <OfflineNotification />
      <main className={`flex-1 ${!isLoginPage && !isOnboardingPage ? 'pt-16' : ''} pb-16 md:pb-0`}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/accept-invite" element={<AcceptInvite />} />
          <Route
            path="/sales"
            element={
              <ProtectedRoute>
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
