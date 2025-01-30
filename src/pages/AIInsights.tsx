import { useState } from "react"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { ChatSidebar } from "@/components/chat/ChatSidebar"

export default function AIInsights() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30 dark:from-gray-900/50 dark:via-gray-800 dark:to-purple-900/30">
      <div className="h-full p-4">
        <div className="flex gap-4 h-full relative animate-fade-in">
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
            <div className="h-full overflow-hidden rounded-xl border border-white/20 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl shadow-xl">
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