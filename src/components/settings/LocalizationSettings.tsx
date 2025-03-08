
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

export function LocalizationSettings() {
  const { toast } = useToast()
  
  const handleSave = () => {
    toast({
      title: "Configurações salvas",
      description: "As configurações de localização foram atualizadas com sucesso.",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Localização</h2>
        <p className="text-sm text-muted-foreground">
          Configure idioma e configurações regionais
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Idioma Padrão</Label>
          <Select defaultValue="pt" className="w-full">
            <SelectTrigger>
              <SelectValue placeholder="Selecione o idioma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">Inglês</SelectItem>
              <SelectItem value="es">Espanhol</SelectItem>
              <SelectItem value="pt">Português</SelectItem>
              <SelectItem value="fr">Francês</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Formato de Data</Label>
          <Select defaultValue="dmy" className="w-full">
            <SelectTrigger>
              <SelectValue placeholder="Selecione o formato de data" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mdy">MM/DD/AAAA</SelectItem>
              <SelectItem value="dmy">DD/MM/AAAA</SelectItem>
              <SelectItem value="ymd">AAAA/MM/DD</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Formato de Número</Label>
          <Select defaultValue="eu" className="w-full">
            <SelectTrigger>
              <SelectValue placeholder="Selecione o formato de número" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="us">1,234.56</SelectItem>
              <SelectItem value="eu">1.234,56</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={handleSave} className="w-full md:w-auto">Salvar Alterações</Button>
    </div>
  )
}
