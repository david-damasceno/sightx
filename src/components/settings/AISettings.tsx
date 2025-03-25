
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Brain, Sparkles, Settings, AlertCircle, ArrowLeft, Save, Loader2 } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { ChatSettings } from "@/types/chat"
import { loadChatSettings, saveChatSettings } from "@/services/chatService"

interface AISettingsProps {
  onSaved?: () => void
}

export function AISettings({ onSaved }: AISettingsProps) {
  const [settings, setSettings] = useState<ChatSettings>({
    model: "gpt-4",
    temperature: 0.7,
    saveHistory: true,
    autoAnalysis: true
  })
  const [isLoading, setIsLoading] = useState(false)
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const userSettings = await loadChatSettings()
        setSettings(userSettings)
      } catch (error) {
        console.error("Erro ao carregar configurações:", error)
        toast.error("Erro ao carregar configurações")
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchSettings()
  }, [])
  
  const handleSave = async () => {
    setIsLoading(true)
    try {
      await saveChatSettings(settings)
      toast.success("Configurações salvas com sucesso")
      onSaved?.()
    } catch (error) {
      toast.error("Erro ao salvar configurações")
      console.error("Erro ao salvar configurações:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onSaved}
            className="mr-2 h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-medium flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Configurações de IA
          </h2>
        </div>
        
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Salvar
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Configure preferências de análise e previsão de IA
      </p>

      <div className="space-y-4">
        <Card className="p-4 space-y-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-medium">Modelo e Personalização</h3>
          </div>
          
          <div className="space-y-2">
            <Label>Modelo de IA</Label>
            <Select 
              value={settings.model} 
              onValueChange={(value) => setSettings({...settings, model: value as any})}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o modelo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4">GPT-4 (Mais preciso, mais lento)</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Mais rápido)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Temperatura</Label>
              <span className="text-sm text-muted-foreground">{settings.temperature.toFixed(1)}</span>
            </div>
            <Slider
              value={[settings.temperature]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={(values) => setSettings({...settings, temperature: values[0]})}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Mais focado</span>
              <span>Mais criativo</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 space-y-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Settings className="h-4 w-4 text-primary" />
            <h3 className="font-medium">Privacidade e Histórico</h3>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label>Salvar histórico de conversas</Label>
              <p className="text-xs text-muted-foreground">
                Armazenar conversas para referência futura
              </p>
            </div>
            <Switch 
              checked={settings.saveHistory}
              onCheckedChange={(checked) => setSettings({...settings, saveHistory: checked})}
            />
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label>Análise automática de dados</Label>
              <p className="text-xs text-muted-foreground">
                Permitir que a IA analise seus dados para insights personalizados
              </p>
            </div>
            <Switch
              checked={settings.autoAnalysis}
              onCheckedChange={(checked) => setSettings({...settings, autoAnalysis: checked})}
            />
          </div>
        </Card>
        
        <Card className="p-4 space-y-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 pb-2 border-b">
            <AlertCircle className="h-4 w-4 text-primary" />
            <h3 className="font-medium">Sobre</h3>
          </div>
          
          <div className="text-sm space-y-2">
            <p>O SightX utiliza inteligência artificial avançada para transformar seus dados em insights acionáveis.</p>
            <p>Nossa IA processa informações contextuais e históricas para gerar respostas mais precisas e relevantes para o seu negócio.</p>
            <p className="text-xs text-muted-foreground mt-2">Versão: 1.0.0</p>
          </div>
        </Card>
      </div>
    </div>
  )
