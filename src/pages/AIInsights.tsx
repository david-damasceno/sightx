import { useState } from "react"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { ChatSidebar } from "@/components/chat/ChatSidebar"

export default function AIInsights() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="fixed inset-0 top-16 bg-gradient-to-br from-green-50/30 via-white to-emerald-50/30 dark:from-gray-900/50 dark:via-gray-800 dark:to-emerald-900/30">
      <div className="h-full p-4">
        <div className="flex gap-4 h-full rounded-xl overflow-hidden border border-green-100/20 dark:border-emerald-900/20 shadow-xl backdrop-blur-sm">
          <aside 
            className={`transition-all duration-300 ease-in-out ${
              isSidebarCollapsed ? 'w-12' : 'w-80'
            }`}
          >
            <ChatSidebar 
              selectedChat={selectedChat}
              onSelectChat={setSelectedChat}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
          </aside>

          <main className="flex-1 relative">
            <ChatInterface 
              selectedChat={selectedChat}
              onSelectChat={setSelectedChat}
            />
          </main>
        </div>
      </div>
    </div>
  )
}