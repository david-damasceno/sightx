import { useState, useRef } from "react"
import ReactAvatarEditor from "react-avatar-editor"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { RotateCcw, RotateCw, ZoomIn } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface ProfileAvatarEditorProps {
  isOpen: boolean
  onClose: () => void
  onSave: (url: string) => void
  imageUrl?: string
}

export function ProfileAvatarEditor({ isOpen, onClose, onSave, imageUrl }: ProfileAvatarEditorProps) {
  const { toast } = useToast()
  const editorRef = useRef<ReactAvatarEditor>(null)
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    try {
      setLoading(true)
      if (editorRef.current) {
        const canvas = editorRef.current.getImageScaledToCanvas()
        const blob = await new Promise<Blob>((resolve) => 
          canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.95)
        )

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Usuário não autenticado')

        const fileName = `${user.id}-${Date.now()}.jpg`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, blob, {
            contentType: 'image/jpeg',
            upsert: true
          })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName)

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', user.id)

        if (updateError) throw updateError

        onSave(publicUrl)
        toast({
          title: "Sucesso",
          description: "Foto de perfil atualizada com sucesso!",
        })
        onClose()
      }
    } catch (error) {
      console.error('Erro ao salvar avatar:', error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar a foto de perfil.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar foto de perfil</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex justify-center">
            <ReactAvatarEditor
              ref={editorRef}
              image={imageUrl || "/placeholder.svg"}
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
              <div className="flex items-center gap-2">
                <ZoomIn className="h-4 w-4" />
                <span className="text-sm font-medium">Zoom</span>
              </div>
              <Slider
                value={[scale]}
                onValueChange={(value) => setScale(value[0])}
                min={1}
                max={3}
                step={0.1}
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
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}