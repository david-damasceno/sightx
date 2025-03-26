
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  PlusCircle, 
  Trash2, 
  MessageSquare, 
  Settings, 
  History, 
  Edit, 
  MoreVertical
} from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Chat } from "@/types/chat"
import { toast } from "sonner"

export interface ChatSidebarProps {
  chats: Chat[]
  selectedChat: string | null
  onSelectChat: (chatId: string | null) => void
  onDeleteChat: (chatId: string) => void
  isLoading: boolean
  showSettings: boolean
  onCreateChat: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  onChatsUpdated?: () => void
}

export function ChatSidebar({
  chats,
  selectedChat,
  onSelectChat,
  onDeleteChat,
  isLoading,
  showSettings,
  onCreateChat,
  isCollapsed = false,
  onToggleCollapse = () => {},
  onChatsUpdated = () => {}
}: ChatSidebarProps) {
  const [search, setSearch] = useState("")
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false)
  const [chatToDelete, setChatToDelete] = useState<string | null>(null)
  const isMobile = useMobile()
  
  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(search.toLowerCase())
  )

  const handleEditChat = (chat: Chat, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setEditingChatId(chat.id)
    setEditingTitle(chat.title)
  }

  const handleSaveTitle = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (editingChatId && editingTitle.trim()) {
      try {
        // Chamar alguma função para atualizar o título no banco de dados
        // await updateChatTitle(editingChatId, editingTitle.trim())
        setEditingChatId(null)
        onChatsUpdated()
        toast.success("Título atualizado com sucesso")
      } catch (error) {
        console.error("Erro ao atualizar título:", error)
        toast.error("Erro ao atualizar título")
      }
    }
  }

  const handleDeleteChat = async () => {
    if (chatToDelete) {
      try {
        onDeleteChat(chatToDelete)
        setIsDeleteDialogOpen(false)
        setChatToDelete(null)
        toast.success("Conversa excluída com sucesso")
      } catch (error) {
        console.error("Erro ao excluir conversa:", error)
        toast.error("Erro ao excluir conversa")
      }
    }
  }

  const handleDeleteAllChats = async () => {
    try {
      // Implementar lógica para excluir todas as conversas
      // await deleteAllChats()
      setIsDeleteAllDialogOpen(false)
      onChatsUpdated()
      toast.success("Todas as conversas foram excluídas")
    } catch (error) {
      console.error("Erro ao excluir todas as conversas:", error)
      toast.error("Erro ao excluir todas as conversas")
    }
  }

  const openDeleteDialog = (chatId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setChatToDelete(chatId)
    setIsDeleteDialogOpen(true)
  }

  useEffect(() => {
    // Fechar modo de edição se o chat selecionado mudar
    setEditingChatId(null)
  }, [selectedChat])

  // Agrupar chats por data (hoje, esta semana, este mês, mais antigos)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const oneWeekAgo = new Date(today)
  oneWeekAgo.setDate(today.getDate() - 7)
  
  const oneMonthAgo = new Date(today)
  oneMonthAgo.setMonth(today.getMonth() - 1)

  const chatGroups = [
    { 
      id: "today", 
      title: "Hoje", 
      chats: filteredChats.filter(chat => chat.updatedAt >= today) 
    },
    { 
      id: "week", 
      title: "Esta semana", 
      chats: filteredChats.filter(chat => chat.updatedAt >= oneWeekAgo && chat.updatedAt < today) 
    },
    { 
      id: "month", 
      title: "Este mês", 
      chats: filteredChats.filter(chat => chat.updatedAt >= oneMonthAgo && chat.updatedAt < oneWeekAgo) 
    },
    { 
      id: "older", 
      title: "Mais antigos", 
      chats: filteredChats.filter(chat => chat.updatedAt < oneMonthAgo) 
    }
  ].filter(group => group.chats.length > 0)

  if (isCollapsed && !isMobile) {
    return (
      <div className="h-full flex flex-col py-4 bg-background/50 backdrop-blur-sm">
        <div className="px-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="mb-2 h-6 w-6 rounded-md"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Expandir barra lateral</span>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background/50 backdrop-blur-sm">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-medium">Conversas</h2>
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-6 w-6 rounded-md"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Colapsar barra lateral</span>
          </Button>
        )}
      </div>

      <div className="p-3">
        <Button 
          onClick={onCreateChat} 
          className="w-full gap-2 rounded-lg"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Nova conversa</span>
        </Button>
      </div>

      <div className="px-3 mb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar conversas..."
            className="pl-8 h-9 rounded-lg bg-background/70"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-6 p-2">
          {chatGroups.map((group) => (
            <div key={group.id} className="space-y-2">
              <h3 className="text-xs font-medium text-muted-foreground px-2">
                {group.title}
              </h3>
              
              {group.chats.length > 0 ? (
                <div className="space-y-1">
                  {group.chats.map((chat) => (
                    <div 
                      key={chat.id}
                      className={cn(
                        "relative group",
                        selectedChat === chat.id && "bg-accent rounded-lg"
                      )}
                    >
                      {editingChatId === chat.id ? (
                        <form 
                          onSubmit={handleSaveTitle}
                          className="flex items-center gap-2 p-1"
                        >
                          <Input
                            autoFocus
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onBlur={handleSaveTitle}
                            className="h-8 text-sm"
                          />
                        </form>
                      ) : (
                        <Button
                          variant={selectedChat === chat.id ? "secondary" : "ghost"}
                          onClick={() => onSelectChat(chat.id)}
                          className={cn(
                            "w-full justify-start gap-2 h-auto py-3 px-3 rounded-lg",
                            selectedChat === chat.id && "bg-accent"
                          )}
                        >
                          <MessageSquare className="h-4 w-4 flex-shrink-0" />
                          <div className="flex-1 truncate text-left">
                            <div className="font-medium truncate">{chat.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {chat.updatedAt.toLocaleDateString()} às {chat.updatedAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          </div>
                        </Button>
                      )}

                      {selectedChat === chat.id && editingChatId !== chat.id && (
                        <TooltipProvider>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 h-7 w-7"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => handleEditChat(chat, e)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Renomear</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => openDeleteDialog(chat.id, e)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Excluir</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TooltipProvider>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground px-2 py-1">
                  Nenhuma conversa encontrada
                </p>
              )}
            </div>
          ))}

          {filteredChats.length === 0 && (
            <div className="text-center py-6">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted mb-2">
                <History className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Nenhuma conversa encontrada</p>
              <p className="text-xs text-muted-foreground mt-1">
                {search ? "Tente usar termos diferentes na busca" : "Inicie uma nova conversa clicando no botão acima"}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t mt-auto">
        <div className="flex flex-col gap-2">
          {showSettings && (
            <Button 
              variant="outline" 
              size="sm"
              className="w-full justify-start gap-2 h-9 rounded-lg"
              onClick={() => onSelectChat('settings')}
            >
              <Settings className="h-4 w-4" />
              <span>Configurações</span>
            </Button>
          )}
          
          {filteredChats.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              className="w-full justify-start gap-2 h-9 rounded-lg text-destructive hover:text-destructive"
              onClick={() => setIsDeleteAllDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              <span>Limpar histórico</span>
            </Button>
          )}
        </div>
      </div>

      {/* Diálogo de confirmação para excluir uma conversa */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir conversa</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta conversa? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteChat}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmação para excluir todas as conversas */}
      <Dialog open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Limpar histórico</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir todas as suas conversas? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteAllDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteAllChats}>Excluir tudo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
