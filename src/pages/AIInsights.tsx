import { useState } from "react"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { ChatSidebar } from "@/components/chat/ChatSidebar"
import { InsightsPanel } from "@/components/InsightsPanel"

export default function AIInsights() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-background">
      <div className="container grid grid-cols-12 gap-4 py-4 h-[calc(100vh-4rem)]">
        <div className="col-span-3">
          <ChatSidebar 
            selectedChat={selectedChat}
            onSelectChat={setSelectedChat}
          />
        </div>
        <div className="col-span-6">
          <ChatInterface 
            selectedChat={selectedChat}
            onSelectChat={setSelectedChat}
          />
        </div>
        <div className="col-span-3">
          <InsightsPanel />
        </div>
      </div>
    </div>
  )
}