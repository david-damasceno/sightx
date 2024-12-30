import { useState } from "react"
import { DashboardHeader } from "@/components/DashboardHeader"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { ChatSidebar } from "@/components/chat/ChatSidebar"

export default function AIInsights() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="container flex h-[calc(100vh-4rem)] gap-4 py-4">
        <ChatSidebar 
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
        />
        <ChatInterface 
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
        />
      </div>
    </div>
  )
}