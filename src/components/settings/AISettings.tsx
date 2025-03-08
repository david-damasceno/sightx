
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Card } from "@/components/ui/card"
import { Brain, Sparkles, Settings, AlertCircle } from "lucide-react"

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
        <h2 className="text-lg font-medium flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Configurações de IA
        </h2>
        <p className="text-sm text-muted-foreground">
          Configure preferências de análise e previsão de IA
        </p>
      </div>

      <div className="space-y-4">
        <Card className="p-4 space-y-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-medium">Análise & Insights</h3>
          </div>
          
          <div className="space-y-2">
            <Label>Frequência de Análise</Label>
            <Select defaultValue="daily">
              <SelectTrigger className="w-full">
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
              <p className="text-xs text-muted-foreground">
                Gerar insights de negócios com IA
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </Card>
        
        <Card className="p-4 space-y-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Settings className="h-4 w-4 text-primary" />
            <h3 className="font-medium">Personalização</h3>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label>Aprendizado de Preferências</Label>
              <p className="text-xs text-muted-foreground">
                Permitir que a IA aprenda com suas interações
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label>Sugestões Personalizadas</Label>
              <p className="text-xs text-muted-foreground">
                Receber sugestões baseadas no seu perfil
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </Card>
        
        <Card className="p-4 space-y-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 pb-2 border-b">
            <AlertCircle className="h-4 w-4 text-primary" />
            <h3 className="font-medium">Notificações & Alertas</h3>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label>Alertas de Anomalias</Label>
              <p className="text-xs text-muted-foreground">
                Notificar quando detectar dados incomuns
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label>Previsões de Tendências</Label>
              <p className="text-xs text-muted-foreground">
                Alertar sobre tendências emergentes
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </Card>
      </div>

      <Button onClick={handleSave} className="w-full md:w-auto">Salvar Alterações</Button>
    </div>
  )
}
