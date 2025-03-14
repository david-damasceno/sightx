
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"

export function AlertsSettings() {
  const { toast } = useToast()
  
  const handleSave = () => {
    toast({
      title: "Configurações salvas",
      description: "As configurações de alerta foram atualizadas com sucesso.",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Alertas & Notificações</h2>
        <p className="text-sm text-muted-foreground">
          Configure suas preferências de notificação
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Label>Notificações por E-mail</Label>
            <p className="text-sm text-muted-foreground">
              Receba atualizações importantes por e-mail
            </p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Label>Notificações Push</Label>
            <p className="text-sm text-muted-foreground">
              Receba alertas em tempo real no seu dispositivo
            </p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Label>Alertas SMS</Label>
            <p className="text-sm text-muted-foreground">
              Receba alertas críticos via SMS
            </p>
          </div>
          <Switch />
        </div>
      </div>

      <Button onClick={handleSave} className="w-full md:w-auto">Salvar Alterações</Button>
    </div>
  )
}
