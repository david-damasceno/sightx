
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"

export function AISettings() {
  const { toast } = useToast()
  
  const handleSave = () => {
    toast({
      title: "Configurações salvas",
      description: "As configurações de IA foram atualizadas com sucesso.",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Configurações de IA</h2>
        <p className="text-sm text-muted-foreground">
          Configure preferências de análise e previsão de IA
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Frequência de Análise</Label>
          <Select defaultValue="daily" className="w-full">
            <SelectTrigger>
              <SelectValue placeholder="Selecione a frequência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hourly">A cada hora</SelectItem>
              <SelectItem value="daily">Diário</SelectItem>
              <SelectItem value="weekly">Semanal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Label>Insights Automatizados</Label>
            <p className="text-sm text-muted-foreground">
              Gerar insights de negócios com IA
            </p>
          </div>
          <Switch defaultChecked />
        </div>
      </div>

      <Button onClick={handleSave} className="w-full md:w-auto">Salvar Alterações</Button>
    </div>
  )
}
