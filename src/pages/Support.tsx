
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CircleCheck, Mail, MessageSquare, Phone } from "lucide-react";

export default function Support() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!name || !email || !subject || !message || !category) {
      toast({
        title: "Erro no formulário",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Aqui seria feita a lógica para enviar o formulário para um serviço de backend
      // Por enquanto, vamos apenas simular um envio bem-sucedido após um delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSubmitted(true);
      toast({
        title: "Mensagem enviada",
        description: "Recebemos sua mensagem e responderemos em breve!",
        variant: "success"
      });
      
      // Limpar o formulário
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setCategory("");
    } catch (error) {
      toast({
        title: "Erro ao enviar",
        description: "Ocorreu um erro ao enviar sua mensagem. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Suporte</h1>
          <p className="text-muted-foreground">
            Estamos aqui para ajudar. Entre em contato conosco se tiver alguma dúvida ou precisar de assistência.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Envie uma mensagem</CardTitle>
              <CardDescription>
                Preencha o formulário abaixo e nossa equipe responderá o mais breve possível.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <CircleCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Mensagem Enviada!</h3>
                  <p className="text-muted-foreground max-w-md">
                    Agradecemos por entrar em contato. Nossa equipe analisará sua mensagem e responderá em até 24 horas úteis.
                  </p>
                  <Button onClick={() => setIsSubmitted(false)} className="mt-4">
                    Enviar outra mensagem
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Nome completo <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Seu nome"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu.email@exemplo.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="category" className="text-sm font-medium">
                        Categoria <span className="text-red-500">*</span>
                      </label>
                      <Select value={category} onValueChange={setCategory} required>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical">Suporte Técnico</SelectItem>
                          <SelectItem value="billing">Faturamento</SelectItem>
                          <SelectItem value="account">Minha Conta</SelectItem>
                          <SelectItem value="feature">Sugestão de Recurso</SelectItem>
                          <SelectItem value="bug">Reportar Problema</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium">
                        Assunto <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Assunto da sua mensagem"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Mensagem <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Descreva sua dúvida ou problema em detalhes..."
                      rows={6}
                      required
                    />
                  </div>
                  
                  <div className="pt-2">
                    <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                      {isSubmitting ? "Enviando..." : "Enviar mensagem"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações de contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium">Email</h4>
                    <p className="text-sm text-muted-foreground">suporte@sightx.com</p>
                    <p className="text-sm text-muted-foreground">comercial@sightx.com</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium">Telefone</h4>
                    <p className="text-sm text-muted-foreground">+55 (11) 3456-7890</p>
                    <p className="text-sm text-muted-foreground">+55 (11) 98765-4321</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium">Chat ao vivo</h4>
                    <p className="text-sm text-muted-foreground">Disponível de segunda a sexta</p>
                    <p className="text-sm text-muted-foreground">das 9h às 18h (horário de Brasília)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Perguntas frequentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">Como posso alterar meu plano?</h4>
                  <p className="text-sm text-muted-foreground">Acesse "Configurações {'>'} Faturamento" e selecione a opção "Alterar plano".</p>
                </div>
                
                <div>
                  <h4 className="font-medium">Como integrar com outras ferramentas?</h4>
                  <p className="text-sm text-muted-foreground">Vá para "Configurações {'>'} Integrações" e siga as instruções para cada ferramenta.</p>
                </div>
                
                <div>
                  <h4 className="font-medium">Como adicionar novos usuários?</h4>
                  <p className="text-sm text-muted-foreground">Acesse "Configurações {'>'} Usuários" e clique em "Convidar usuário".</p>
                </div>

                <Button variant="outline" className="w-full mt-2">Ver todas as perguntas</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
