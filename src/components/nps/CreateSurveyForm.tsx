import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { supabase } from "@/integrations/supabase/client"
import type { Database } from "@/integrations/supabase/types"

type NPSSurvey = Database['public']['Tables']['nps_surveys']['Insert']

const surveyFormSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  type: z.enum(["simple", "detailed", "advanced"]),
  settings: z.object({
    customMessage: z.string().optional(),
    followUpQuestion: z.string().optional(),
    theme: z.enum(["light", "dark"]).default("light"),
    showBranding: z.boolean().default(true),
  }).default({}),
})

type SurveyFormValues = z.infer<typeof surveyFormSchema>

export function CreateSurveyForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { currentOrganization } = useAuth()
  const { toast } = useToast()

  const form = useForm<SurveyFormValues>({
    resolver: zodResolver(surveyFormSchema),
    defaultValues: {
      type: "simple",
      settings: {
        theme: "light",
        showBranding: true,
      },
    },
  })

  async function onSubmit(data: SurveyFormValues) {
    if (!currentOrganization) {
      toast({
        title: "Erro",
        description: "Nenhuma organização selecionada",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const surveyData: NPSSurvey = {
        title: data.title,
        description: data.description,
        type: data.type,
        organization_id: currentOrganization.id,
        status: "draft",
        settings: data.settings
      }

      const { error } = await supabase
        .from('nps_surveys')
        .insert(surveyData)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Pesquisa criada com sucesso!",
      })

      form.reset()
    } catch (error) {
      console.error("Error creating survey:", error)
      toast({
        title: "Erro",
        description: "Não foi possível criar a pesquisa",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título da Pesquisa</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Satisfação com o Atendimento" {...field} />
                </FormControl>
                <FormDescription>
                  Um título claro e objetivo para sua pesquisa NPS
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva o objetivo desta pesquisa..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Uma breve descrição do propósito da pesquisa (opcional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Pesquisa</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de pesquisa" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="simple">Simples</SelectItem>
                    <SelectItem value="detailed">Detalhada</SelectItem>
                    <SelectItem value="advanced">Avançada</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Escolha o nível de complexidade da sua pesquisa
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="settings.customMessage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mensagem Personalizada</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Mensagem personalizada para seus respondentes..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Uma mensagem personalizada que aparecerá no topo da pesquisa
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Pesquisa"}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  )
}