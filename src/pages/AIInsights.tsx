
import { useState, useEffect } from "react"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { ChatSidebar } from "@/components/chat/ChatSidebar"
import { useMobile } from "@/hooks/use-mobile"
import { PlusCircle, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function AIInsights() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const isMobile = useMobile()
  
  useEffect(() => {
    // Em dispositivos móveis, colapsar o sidebar automaticamente
    if (isMobile) {
      setIsSidebarCollapsed(true)
    }
  }, [isMobile])

  const handleNewChat = () => {
    setSelectedChat(null)
    setIsMobileSidebarOpen(false)
  }

  const handleMobileMenuToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  return (
    <div className="fixed inset-0 top-16 bg-gradient-to-br from-background via-accent/5 to-background">
      <div className="h-full p-0 md:p-4">
        <div className="flex gap-0 md:gap-4 h-full rounded-none md:rounded-2xl border-0 md:border bg-white/40 dark:bg-gray-900/40 backdrop-blur-md md:shadow-lg">
          {/* Mobile Menu Button and New Chat Button */}
          {isMobile && (
            <div className="fixed top-4 left-4 z-40 flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleMobileMenuToggle}
                className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-md shadow-md border border-purple-100/30 dark:border-purple-900/30"
              >
                {isMobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleNewChat}
                className="flex items-center gap-2 rounded-full bg-background/80 backdrop-blur-md shadow-md border border-purple-100/30 dark:border-purple-900/30"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Novo Chat</span>
              </Button>
            </div>
          )}

          {/* Sidebar for desktop and mobile */}
          <aside 
            className={cn(
              "transition-all duration-300 ease-in-out",
              isMobile 
                ? cn(
                    "fixed inset-y-0 top-16 left-0 z-30 w-full max-w-[280px] bg-background/95 backdrop-blur-md border-r border-border shadow-xl",
                    isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
                  )
                : cn(
                    isSidebarCollapsed ? 'w-0 md:w-12 overflow-hidden' : 'w-full md:w-80'
                  )
            )}
          >
            <ChatSidebar 
              selectedChat={selectedChat}
              onSelectChat={(chatId) => {
                setSelectedChat(chatId)
                if (isMobile) {
                  setIsMobileSidebarOpen(false)
                }
              }}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => !isMobile && setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
          </aside>

          {/* Main chat area */}
          <main className={cn(
            "flex-1 relative rounded-none md:rounded-2xl overflow-hidden",
            isSidebarCollapsed || isMobile ? 'border-l-0 md:border-l' : 'border-l-0 md:border-l',
            "bg-white/20 dark:bg-gray-900/20 backdrop-blur-md"
          )}>
            <ChatInterface 
              selectedChat={selectedChat}
              onSelectChat={setSelectedChat}
              onOpenSidebar={() => isMobile ? setIsMobileSidebarOpen(true) : setIsSidebarCollapsed(false)}
              isSidebarCollapsed={isSidebarCollapsed}
            />
          </main>
        </div>
      </div>
    </div>
  )
}
