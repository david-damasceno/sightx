import { useState, useRef } from 'react'
import AvatarEditor from 'react-avatar-editor'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { RotateCcw, RotateCw, ZoomIn, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

interface ProfileAvatarEditorProps {
  open: boolean
  onClose: () => void
  imageUrl: string
  onSave: (url: string) => void
  onDelete: () => void
}

export function ProfileAvatarEditor({ open, onClose, imageUrl, onSave, onDelete }: ProfileAvatarEditorProps) {
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const [loading, setLoading] = useState(false)
  const editorRef = useRef<AvatarEditor>(null)
  const { addToast } = useToast()

  const handleSave = async () => {
    if (!editorRef.current) return

    try {
      setLoading(true)
      const canvas = editorRef.current.getImageScaledToCanvas()
      const blob = await new Promise<Blob>((resolve) => canvas.toBlob(resolve as BlobCallback))
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const fileExt = 'png'
      const filePath = `${user.id}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          contentType: 'image/png',
          upsert: true
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      onSave(publicUrl)
      addToast({
        title: "Sucesso",
        description: "Foto de perfil atualizada com sucesso",
      })
      onClose()
    } catch (error) {
      console.error('Error uploading avatar:', error)
      addToast({
        title: "Erro",
        description: "Não foi possível salvar a imagem. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setLoading(true)
      await onDelete()
      addToast({
        title: "Sucesso",
        description: "Foto de perfil removida com sucesso",
      })
      onClose()
    } catch (error) {
      console.error('Error deleting avatar:', error)
      addToast({
        title: "Erro",
        description: "Não foi possível remover a imagem. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar foto de perfil</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex justify-center">
            <AvatarEditor
              ref={editorRef}
              image={imageUrl}
              width={250}
              height={250}
              border={50}
              borderRadius={125}
              color={[0, 0, 0, 0.6]}
              scale={scale}
              rotate={rotate}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Zoom</span>
                <ZoomIn className="h-4 w-4" />
              </div>
              <Slider
                value={[scale]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={([value]) => setScale(value)}
              />
            </div>

            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setRotate((r) => r - 90)}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setRotate((r) => r + 90)}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={handleDelete}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
