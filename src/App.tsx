import { BrowserRouter as Router } from "react-router-dom"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Toaster } from "@/components/ui/sonner"
import { Routes, Route } from "react-router-dom"
import Index from "@/pages/Index"

function App() {
  return (
    <Router>
      <SidebarProvider defaultOpen>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<Index />} />
            </Routes>
          </main>
        </div>
        <Toaster />
      </SidebarProvider>
    </Router>
  )
}

export default App