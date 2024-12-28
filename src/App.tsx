import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Index from "./pages/Index"
import Login from "./pages/Login"
import Social from "./pages/Social"
import Location from "./pages/Location"
import Demographics from "./pages/Demographics"
import AIInsights from "./pages/AIInsights"
import Feedback from "./pages/Feedback"
import Reports from "./pages/Reports"
import Settings from "./pages/Settings"

const queryClient = new QueryClient()

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Index />} />
          <Route path="/social" element={<Social />} />
          <Route path="/location" element={<Location />} />
          <Route path="/demographics" element={<Demographics />} />
          <Route path="/ai-insights" element={<AIInsights />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App