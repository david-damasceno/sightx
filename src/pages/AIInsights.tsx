import { useState } from "react"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { ChatSidebar } from "@/components/chat/ChatSidebar"

export default function AIInsights() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="fixed inset-0 top-16 bg-gradient-to-br from-background to-accent/20">
      <div className="h-full p-4">
        <div className="flex gap-4 h-full rounded-xl border bg-background/50 backdrop-blur-sm shadow-lg">
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

          <main className="flex-1 relative rounded-xl overflow-hidden border-l bg-background/30 backdrop-blur-md">
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