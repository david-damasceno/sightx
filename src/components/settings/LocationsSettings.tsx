
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export function LocationsSettings() {
  const { addToast } = useToast()
  
  const handleSave = () => {
    addToast({
      title: "Configurações salvas",
      description: "As configurações de localização foram atualizadas com sucesso.",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Localizações</h2>
        <p className="text-sm text-muted-foreground">
          Gerencie as localizações do seu negócio e configurações geográficas
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Localização Padrão</Label>
          <Input placeholder="Digite a localização padrão" className="w-full" />
        </div>

        <div className="space-y-2">
          <Label>Raio (km)</Label>
          <Input type="number" placeholder="Digite o raio" defaultValue={10} className="w-full" />
        </div>

        <div className="space-y-2">
          <Label>Chave API do Google Maps</Label>
          <Input type="password" placeholder="Digite a chave API" className="w-full" />
        </div>
      </div>

      <Button onClick={handleSave} className="w-full md:w-auto">Salvar Alterações</Button>
    </div>
  )
}
