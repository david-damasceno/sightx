import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

export function GeneralSettings() {
  const { toast } = useToast()
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Efeito para verificar e aplicar o tema atual
  useEffect(() => {
    // Verifica se há preferência salva
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    // Define o tema inicial baseado na preferência salva ou do sistema
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark)
    setIsDarkMode(shouldUseDark)
    
    // Aplica o tema inicial
    if (shouldUseDark) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  // Função para alternar o modo escuro
  const toggleDarkMode = (enabled: boolean) => {
    setIsDarkMode(enabled)
    if (enabled) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleSave = () => {
    toast({
      title: "Configurações salvas",
      description: "Suas configurações foram salvas com sucesso.",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Configurações Gerais</h2>
        <p className="text-sm text-muted-foreground">
          Configure as preferências do sistema e aparência
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Idioma do Sistema</Label>
          <Select defaultValue="pt-BR">
            <SelectTrigger>
              <SelectValue placeholder="Selecione o idioma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
              <SelectItem value="en">Inglês</SelectItem>
              <SelectItem value="es">Espanhol</SelectItem>
              <SelectItem value="fr">Francês</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Fuso Horário</Label>
          <Select defaultValue="america-sp">
            <SelectTrigger>
              <SelectValue placeholder="Selecione o fuso horário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="america-sp">América/São Paulo</SelectItem>
              <SelectItem value="america-rj">América/Rio de Janeiro</SelectItem>
              <SelectItem value="america-bsb">América/Brasília</SelectItem>
              <SelectItem value="america-manaus">América/Manaus</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Moeda Padrão</Label>
          <Select defaultValue="brl">
            <SelectTrigger>
              <SelectValue placeholder="Selecione a moeda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="brl">Real (R$)</SelectItem>
              <SelectItem value="usd">Dólar (US$)</SelectItem>
              <SelectItem value="eur">Euro (€)</SelectItem>
              <SelectItem value="gbp">Libra (£)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Modo Escuro</Label>
            <p className="text-sm text-muted-foreground">
              Ative o modo escuro para melhor visibilidade em ambientes com pouca luz
            </p>
          </div>
          <Switch
            checked={isDarkMode}
            onCheckedChange={toggleDarkMode}
          />
        </div>

        <div className="space-y-2">
          <Label>Logo da Empresa</Label>
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded border flex items-center justify-center">
              Prévia do Logo
            </div>
            <Button variant="outline">Enviar Novo Logo</Button>
          </div>
        </div>
      </div>

      <Button onClick={handleSave}>Salvar Alterações</Button>
    </div>
  )
}