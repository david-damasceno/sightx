import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import { ThemeProvider } from "next-themes"
import { AppNavbar } from "@/components/AppNavbar"
import Index from "./pages/Index"
import Login from "./pages/Login"
import Social from "./pages/Social"
import Demographics from "./pages/Demographics"
import AIInsights from "./pages/AIInsights"
import Feedback from "./pages/Feedback"
import Reports from "./pages/Reports"
import Sales from "./pages/Sales"
import Performance from "./pages/Performance"
import Profile from "./pages/Profile"
import Settings from "./pages/Settings"

const queryClient = new QueryClient()

const AppContent = () => {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'

  return (
    <div className="min-h-screen flex flex-col w-full">
      {!isLoginPage && <AppNavbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Index />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/social" element={<Social />} />
          <Route path="/demographics" element={<Demographics />} />
          <Route path="/ai-insights" element={<AIInsights />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings/*" element={<Settings />} />
        </Routes>
      </main>
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
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
)

export default App