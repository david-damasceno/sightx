
import { useState, useEffect } from "react"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { ChatSidebar } from "@/components/chat/ChatSidebar"
import { useMobile } from "@/hooks/use-mobile"

export default function AIInsights() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const isMobile = useMobile()
  
  useEffect(() => {
    // Em dispositivos móveis, colapsar o sidebar automaticamente
    if (isMobile) {
      setIsSidebarCollapsed(true)
    }
  }, [isMobile])

  return (
    <div className="fixed inset-0 top-16 bg-gradient-to-br from-background via-accent/5 to-background">
      <div className="h-full p-0 md:p-4">
        <div className="flex gap-0 md:gap-4 h-full rounded-none md:rounded-2xl border-0 md:border bg-white/40 dark:bg-gray-900/40 backdrop-blur-md md:shadow-lg">
          <aside 
            className={`transition-all duration-300 ease-in-out ${
              isSidebarCollapsed ? 'w-0 md:w-12 overflow-hidden' : 'w-full md:w-80'
            }`}
          >
            <ChatSidebar 
              selectedChat={selectedChat}
              onSelectChat={(chatId) => {
                setSelectedChat(chatId)
                if (isMobile) {
                  setIsSidebarCollapsed(true)
                }
              }}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
          </aside>

          <main className={`flex-1 relative rounded-none md:rounded-2xl overflow-hidden ${
            isSidebarCollapsed ? 'border-l-0 md:border-l' : 'border-l-0 md:border-l'
          } bg-white/20 dark:bg-gray-900/20 backdrop-blur-md`}>
            <ChatInterface 
              selectedChat={selectedChat}
              onSelectChat={setSelectedChat}
              onOpenSidebar={() => setIsSidebarCollapsed(false)}
              isSidebarCollapsed={isSidebarCollapsed}
            />
          </main>
        </div>
      </div>
    </div>
  )
}
