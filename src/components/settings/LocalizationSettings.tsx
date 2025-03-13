
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Check, Info } from "lucide-react"

// Definir os tipos de configurações de localização
interface LocalizationConfig {
  language: string
  dateFormat: string
  numberFormat: string
  timezone: string
  useAutoTimezone: boolean
  currency: string
  firstDayOfWeek: string
  measurementUnit: string
}

// Definir o esquema de validação com Zod
const localizationSchema = z.object({
  language: z.string().min(2),
  dateFormat: z.string().min(3),
  numberFormat: z.string().min(2),
  timezone: z.string(),
  useAutoTimezone: z.boolean().default(true),
  currency: z.string().min(3),
  firstDayOfWeek: z.string(),
  measurementUnit: z.string()
})

// Opções disponíveis para seleção
const languageOptions = [
  { value: "pt-BR", label: "Português (Brasil)" },
  { value: "en-US", label: "Inglês (EUA)" },
  { value: "es-ES", label: "Espanhol (Espanha)" },
  { value: "fr-FR", label: "Francês (França)" },
  { value: "de-DE", label: "Alemão (Alemanha)" },
  { value: "it-IT", label: "Italiano (Itália)" },
  { value: "ja-JP", label: "Japonês (Japão)" },
  { value: "zh-CN", label: "Chinês (China)" },
  { value: "ru-RU", label: "Russo (Rússia)" },
  { value: "ar-SA", label: "Árabe (Arábia Saudita)" },
  { value: "hi-IN", label: "Hindi (Índia)" },
]

const dateFormatOptions = [
  { value: "DD/MM/YYYY", label: "DD/MM/AAAA (31/12/2023)" },
  { value: "MM/DD/YYYY", label: "MM/DD/AAAA (12/31/2023)" },
  { value: "YYYY-MM-DD", label: "AAAA-MM-DD (2023-12-31)" },
  { value: "DD.MM.YYYY", label: "DD.MM.AAAA (31.12.2023)" },
  { value: "DD-MMM-YYYY", label: "DD-MMM-AAAA (31-Dez-2023)" },
]

const numberFormatOptions = [
  { value: "pt-BR", label: "1.234,56 (Brasileiro/Europeu)" },
  { value: "en-US", label: "1,234.56 (Americano/Britânico)" },
  { value: "de-DE", label: "1.234,56 (Alemão)" },
  { value: "fr-FR", label: "1 234,56 (Francês)" },
  { value: "en-IN", label: "1,23,456.78 (Indiano)" },
]

const timezoneOptions = [
  { value: "America/Sao_Paulo", label: "América/São Paulo (GMT-3)" },
  { value: "America/New_York", label: "América/Nova York (GMT-5/GMT-4)" },
  { value: "Europe/London", label: "Europa/Londres (GMT+0/GMT+1)" },
  { value: "Europe/Paris", label: "Europa/Paris (GMT+1/GMT+2)" },
  { value: "Asia/Tokyo", label: "Ásia/Tóquio (GMT+9)" },
  { value: "Australia/Sydney", label: "Austrália/Sydney (GMT+10/GMT+11)" },
  { value: "Pacific/Auckland", label: "Pacífico/Auckland (GMT+12/GMT+13)" },
]

const currencyOptions = [
  { value: "BRL", label: "Real Brasileiro (R$)" },
  { value: "USD", label: "Dólar Americano ($)" },
  { value: "EUR", label: "Euro (€)" },
  { value: "GBP", label: "Libra Esterlina (£)" },
  { value: "JPY", label: "Iene Japonês (¥)" },
  { value: "CNY", label: "Yuan Chinês (¥)" },
  { value: "INR", label: "Rupia Indiana (₹)" },
]

const weekdayOptions = [
  { value: "sunday", label: "Domingo" },
  { value: "monday", label: "Segunda-feira" },
]

const measurementOptions = [
  { value: "metric", label: "Métrico (km, kg, °C)" },
  { value: "imperial", label: "Imperial (milhas, libras, °F)" },
]

export function LocalizationSettings() {
  const { toast } = useToast()
  
  // Estado para armazenar as configurações atuais
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  
  // Configurações padrão
  const defaultValues: LocalizationConfig = {
    language: "pt-BR",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "pt-BR",
    timezone: "America/Sao_Paulo",
    useAutoTimezone: true,
    currency: "BRL",
    firstDayOfWeek: "monday",
    measurementUnit: "metric"
  }
  
  // Configurar o formulário com react-hook-form e zod
  const form = useForm<LocalizationConfig>({
    resolver: zodResolver(localizationSchema),
    defaultValues
  })
  
  // Buscar configurações salvas quando o componente montar
  useEffect(() => {
    const loadSavedSettings = () => {
      try {
        const savedSettings = localStorage.getItem("localizationSettings")
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings)
          form.reset(parsedSettings)
        }
      } catch (error) {
        console.error("Erro ao carregar configurações de localização:", error)
      }
    }
    
    loadSavedSettings()
  }, [form])
  
  // Função para salvar as configurações
  const handleSave = (values: LocalizationConfig) => {
    setIsLoading(true)
    
    // Simular tempo de processamento
    setTimeout(() => {
      try {
        // Salvar no localStorage
        localStorage.setItem("localizationSettings", JSON.stringify(values))
        
        // Atualizar o idioma do documento como exemplo
        document.documentElement.lang = values.language.split("-")[0]
        
        // Aplicar o tema no data attribute para ser usado no CSS
        document.documentElement.setAttribute("data-locale", values.language)
        document.documentElement.setAttribute("data-number-format", values.numberFormat)
        document.documentElement.setAttribute("data-date-format", values.dateFormat)
        
        // Mostrar confirmação
        toast({
          title: "Configurações salvas",
          description: "As configurações de localização foram atualizadas com sucesso.",
          variant: "success"
        })
        
        // Indicar que foi salvo
        setIsSaved(true)
        setTimeout(() => setIsSaved(false), 3000)
      } catch (error) {
        toast({
          title: "Erro ao salvar",
          description: "Ocorreu um erro ao salvar as configurações. Tente novamente.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }, 800)
  }
  
  return (
    <div className="space-y-6">
      <div className="space-y-0.5">
        <h2 className="text-lg md:text-xl font-medium">Localização</h2>
        <p className="text-sm text-muted-foreground">
          Configure idioma, formato de data, número e outras configurações regionais
        </p>
      </div>
      
      <Separator className="my-6" />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="general">Geral</TabsTrigger>
              <TabsTrigger value="advanced">Avançado</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Idioma</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o idioma" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {languageOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Define o idioma principal usado no sistema
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="dateFormat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Formato de Data</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o formato de data" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {dateFormatOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Determina como as datas são exibidas
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="numberFormat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Formato de Número</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o formato de número" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {numberFormatOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Determina separadores decimais e de milhar
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Moeda</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a moeda" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {currencyOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Define a moeda padrão para valores monetários
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="timezone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fuso Horário</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={form.watch("useAutoTimezone")}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o fuso horário" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {timezoneOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Define o fuso horário para datas e horas
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="useAutoTimezone"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 border rounded-lg">
                          <div className="space-y-0.5">
                            <FormLabel>Fuso horário automático</FormLabel>
                            <FormDescription>
                              Usar fuso horário do navegador
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="firstDayOfWeek"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primeiro dia da semana</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o primeiro dia" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {weekdayOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Define o primeiro dia da semana em calendários
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="measurementUnit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sistema de medidas</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o sistema" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {measurementOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Define o sistema de unidades de medida
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              <Info className="inline-block w-4 h-4 mr-1" /> 
              Estas configurações afetam toda a plataforma
            </div>
            <Button 
              type="submit" 
              disabled={isLoading || !form.formState.isDirty}
              className="gap-2"
            >
              {isSaved ? <Check className="w-4 h-4" /> : null}
              {isLoading ? "Salvando..." : isSaved ? "Salvo!" : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
