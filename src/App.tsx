import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Index from "./pages/Index"
import Login from "./pages/Login"

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
          {/* Add placeholder routes for other pages */}
          <Route path="/social" element={<div>Social Media Analytics (Coming Soon)</div>} />
          <Route path="/location" element={<div>Location Data (Coming Soon)</div>} />
          <Route path="/demographics" element={<div>Demographics (Coming Soon)</div>} />
          <Route path="/ai-insights" element={<div>AI Insights (Coming Soon)</div>} />
          <Route path="/feedback" element={<div>Feedback (Coming Soon)</div>} />
          <Route path="/reports" element={<div>Reports (Coming Soon)</div>} />
          <Route path="/settings" element={<div>Settings (Coming Soon)</div>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App