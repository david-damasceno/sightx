import { useState } from "react"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { ChatSidebar } from "@/components/chat/ChatSidebar"

export default function AIInsights() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="container mx-auto px-4 pt-20 min-h-screen">
      <div className="h-[calc(100vh-6rem)] rounded-xl overflow-hidden bg-gradient-to-br from-green-50/30 via-white to-emerald-50/30 dark:from-gray-900/50 dark:via-gray-800 dark:to-emerald-900/30 border border-green-100/20 dark:border-emerald-900/20 shadow-xl">
        <div className="flex gap-4 h-full p-4">
          <div 
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
          </div>

          <div className="flex-1 h-full">
            <div className="h-full overflow-hidden rounded-xl border border-green-100/20 dark:border-emerald-900/20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl shadow-lg">
              <ChatInterface 
                selectedChat={selectedChat}
                onSelectChat={setSelectedChat}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}