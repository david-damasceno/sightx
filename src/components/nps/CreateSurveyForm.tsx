import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const surveyFormSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  type: z.enum(["simple", "detailed", "advanced"]),
  welcomeMessage: z.string().optional(),
  thankYouMessage: z.string().optional(),
})

type SurveyFormValues = z.infer<typeof surveyFormSchema>

const defaultValues: Partial<SurveyFormValues> = {
  type: "simple",
  welcomeMessage: "Olá! Gostaríamos de saber sua opinião sobre nossos serviços.",
  thankYouMessage: "Obrigado por seu feedback! Sua opinião é muito importante para nós.",
}

export function CreateSurveyForm() {
  const { toast } = useToast()
  const [previewMode, setPreviewMode] = useState(false)

  const form = useForm<SurveyFormValues>({
    resolver: zodResolver(surveyFormSchema),
    defaultValues,
  })

  function onSubmit(data: SurveyFormValues) {
    toast({
      title: "Pesquisa criada com sucesso!",
      description: "Sua pesquisa foi criada e está pronta para ser compartilhada.",
    })
    console.log(data)
  }

  return (
    <div className="container max-w-3xl py-6 space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Nova Pesquisa NPS</h1>
          <p className="text-muted-foreground">Crie uma nova pesquisa de satisfação</p>
        </div>
        <Button onClick={() => setPreviewMode(!previewMode)}>
          {previewMode ? "Editar" : "Visualizar"}
        </Button>
      </div>

      <Tabs defaultValue="simple" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="simple">Simples</TabsTrigger>
          <TabsTrigger value="detailed">Detalhada</TabsTrigger>
          <TabsTrigger value="advanced">Avançada</TabsTrigger>
        </TabsList>

        <TabsContent value="simple">
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
                        <Input placeholder="Ex: Satisfação com Atendimento 2024" {...field} />
                      </FormControl>
                      <FormDescription>
                        Este título será exibido para seus clientes
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
                        Uma breve descrição ajuda os respondentes a entenderem o contexto
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="welcomeMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensagem de Boas-vindas</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Mensagem que será exibida no início da pesquisa..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="thankYouMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensagem de Agradecimento</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Mensagem que será exibida após o envio da pesquisa..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit">Criar Pesquisa</Button>
              </form>
            </Form>
          </Card>
        </TabsContent>

        <TabsContent value="detailed">
          <Card className="p-6">
            <div className="text-center p-4">
              <h3 className="text-lg font-medium">Pesquisa Detalhada</h3>
              <p className="text-muted-foreground">
                Inclui perguntas adicionais sobre aspectos específicos do serviço
              </p>
              <Button variant="outline" className="mt-4">
                Criar Pesquisa Detalhada
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card className="p-6">
            <div className="text-center p-4">
              <h3 className="text-lg font-medium">Pesquisa Avançada</h3>
              <p className="text-muted-foreground">
                Personalização completa com lógica condicional e múltiplas seções
              </p>
              <Button variant="outline" className="mt-4">
                Criar Pesquisa Avançada
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {previewMode && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Prévia da Pesquisa</h2>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{form.watch("title") || "Título da Pesquisa"}</h3>
            <p className="text-muted-foreground">{form.watch("description") || "Descrição da pesquisa"}</p>
            <div className="border rounded-lg p-4">
              <p className="mb-4">{form.watch("welcomeMessage")}</p>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Em uma escala de 0 a 10, qual a probabilidade de você recomendar nossa empresa para um amigo ou familiar?</h4>
                  <div className="flex gap-2 flex-wrap">
                    {Array.from({ length: 11 }, (_, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        className="w-10 h-10"
                        disabled={previewMode}
                      >
                        {i}
                      </Button>
                    ))}
                  </div>
                </div>
                <Textarea
                  placeholder="Por favor, nos conte o motivo da sua avaliação..."
                  disabled={previewMode}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}