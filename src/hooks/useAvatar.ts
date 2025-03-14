import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export function useAvatar() {
  const [loading, setLoading] = useState(false)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const { toast } = useToast()

  const handleAvatarClick = (currentAvatarUrl: string | null) => {
    if (currentAvatarUrl) {
      setSelectedImage(currentAvatarUrl)
      setIsEditorOpen(true)
    } else {
      const fileInput = document.createElement('input')
      fileInput.type = 'file'
      fileInput.accept = 'image/*'
      fileInput.onchange = (event: Event) => {
        const target = event.target as HTMLInputElement
        if (!target.files || target.files.length === 0) return
        
        const file = target.files[0]
        const imageUrl = URL.createObjectURL(file)
        setSelectedImage(imageUrl)
        setIsEditorOpen(true)
      }
      fileInput.click()
    }
  }

  const handleSaveAvatar = async (url: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: url,
          updated_at: new Date().toISOString(),
        })

      if (updateError) throw updateError

      toast({
        title: "Sucesso",
        description: "Foto de perfil atualizada com sucesso",
      })
      return url
    } catch (error) {
      console.error('Error updating avatar:', error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar a foto de perfil.",
        variant: "destructive"
      })
      throw error
    }
  }

  const handleDeleteAvatar = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: "",
          updated_at: new Date().toISOString(),
        })

      if (updateError) throw updateError

      toast({
        title: "Sucesso",
        description: "Foto de perfil removida com sucesso",
      })
    } catch (error) {
      console.error('Error deleting avatar:', error)
      throw error
    }
  }

  return {
    loading,
    isEditorOpen,
    selectedImage,
    setIsEditorOpen,
    setSelectedImage,
    handleAvatarClick,
    handleSaveAvatar,
    handleDeleteAvatar
  }
}