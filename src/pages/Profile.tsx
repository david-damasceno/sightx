import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { User, Mail, Phone, Building, MapPin, Loader2 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { ProfileAvatarEditor } from "@/components/AvatarEditor/AvatarEditor"

export default function Profile() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    avatar_url: "",
    phone: "",
    company: "",
    address: ""
  })

  useEffect(() => {
    getProfile()
  }, [])

  const getProfile = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        })
        return
      }

      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          const currentTime = new Date().toISOString()
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              updated_at: currentTime
            })

          if (insertError) throw insertError

          data = {
            id: user.id,
            email: user.email,
            full_name: "",
            avatar_url: "",
            phone: "",
            company: "",
            address: "",
            updated_at: currentTime
          }
        } else {
          throw error
        }
      }

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          email: data.email || "",
          avatar_url: data.avatar_url || "",
          phone: data.phone || "",
          company: data.company || "",
          address: data.address || ""
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar o perfil.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return ""
    return name
      .split(' ')
      .map((n) => n[0])
      .filter((_, index, array) => index === 0 || index === array.length - 1)
      .join('')
      .toUpperCase()
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return
    
    const file = event.target.files[0]
    const imageUrl = URL.createObjectURL(file)
    setSelectedImage(imageUrl)
    setIsEditorOpen(true)
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

      setProfile({ ...profile, avatar_url: url })
    } catch (error) {
      console.error('Error updating avatar:', error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar a foto de perfil.",
        variant: "destructive"
      })
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

      setProfile({ ...profile, avatar_url: "" })
    } catch (error) {
      console.error('Error deleting avatar:', error)
      throw error
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        })
        return
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profile,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar o perfil.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-2">
        <User className="h-5 w-5" />
        <h1 className="text-2xl font-bold">Meu Perfil</h1>
      </div>

      <Card className="p-6">
        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatar_url} alt="Foto do perfil" />
              <AvatarFallback>
                {profile.full_name ? getInitials(profile.full_name) : ""}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Foto do Perfil</h2>
              <p className="text-sm text-muted-foreground">
                Esta foto será exibida em seu perfil e em outras áreas do sistema.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <label className="cursor-pointer">
                    Alterar foto
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  className="pl-9"
                  placeholder="Seu nome completo"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  className="pl-9"
                  type="email"
                  placeholder="Seu email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  className="pl-9"
                  placeholder="Seu telefone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="company"
                  className="pl-9"
                  placeholder="Nome da empresa"
                  value={profile.company}
                  onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Endereço</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  className="pl-9"
                  placeholder="Seu endereço completo"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </div>
        </div>
      </Card>

      {selectedImage && (
        <ProfileAvatarEditor
          open={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false)
            setSelectedImage(null)
          }}
          imageUrl={selectedImage}
          onSave={handleSaveAvatar}
          onDelete={handleDeleteAvatar}
        />
      )}
    </div>
  )
}