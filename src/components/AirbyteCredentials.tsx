
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { CopyIcon, CheckIcon, DatabaseIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

export function AirbyteCredentials() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState<any>(null);
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  // Função para gerar credenciais de usuário Airbyte
  const generateCredentials = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-airbyte-user");
      
      if (error) throw error;
      
      setCredentials(data);
      toast({
        title: "Credenciais criadas com sucesso!",
        description: "Use estas credenciais para configurar o Airbyte.",
        variant: "default",
      });
    } catch (error) {
      console.error("Erro ao gerar credenciais:", error);
      toast({
        title: "Erro ao gerar credenciais",
        description: "Ocorreu um erro ao criar o usuário. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para copiar para a área de transferência
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [field]: true });
    
    setTimeout(() => {
      setCopied({ ...copied, [field]: false });
    }, 2000);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DatabaseIcon className="h-5 w-5" />
          Credenciais para Airbyte
        </CardTitle>
        <CardDescription>
          Gere credenciais temporárias para conectar o Airbyte ao banco de dados do SightX.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!credentials ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Clique no botão abaixo para gerar credenciais seguras para o Airbyte.
            </p>
            <Button 
              onClick={generateCredentials} 
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? "Gerando..." : "Gerar Credenciais de Acesso"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="host">Host</Label>
                <div className="flex">
                  <Input id="host" value={credentials.host} readOnly className="flex-1" />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="ml-2"
                    onClick={() => copyToClipboard(credentials.host, 'host')}
                  >
                    {copied.host ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="port">Porta</Label>
                <div className="flex">
                  <Input id="port" value={credentials.port} readOnly className="flex-1" />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="ml-2"
                    onClick={() => copyToClipboard(credentials.port.toString(), 'port')}
                  >
                    {copied.port ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="database">Banco de Dados</Label>
              <div className="flex">
                <Input id="database" value={credentials.database} readOnly className="flex-1" />
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="ml-2"
                  onClick={() => copyToClipboard(credentials.database, 'database')}
                >
                  {copied.database ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="schema">Esquema</Label>
              <div className="flex">
                <Input id="schema" value={credentials.schema} readOnly className="flex-1" />
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="ml-2"
                  onClick={() => copyToClipboard(credentials.schema, 'schema')}
                >
                  {copied.schema ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="username">Nome de usuário</Label>
              <div className="flex">
                <Input id="username" value={credentials.username} readOnly className="flex-1" />
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="ml-2"
                  onClick={() => copyToClipboard(credentials.username, 'username')}
                >
                  {copied.username ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="flex">
                <Input 
                  id="password" 
                  value={credentials.password} 
                  readOnly 
                  className="flex-1"
                  type="password"
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="ml-2"
                  onClick={() => copyToClipboard(credentials.password, 'password')}
                >
                  {copied.password ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sslMode">Modo SSL</Label>
              <div className="flex">
                <Input id="sslMode" value={credentials.sslMode} readOnly className="flex-1" />
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="ml-2"
                  onClick={() => copyToClipboard(credentials.sslMode, 'sslMode')}
                >
                  {copied.sslMode ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      {credentials && (
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            <strong>Importante:</strong> Por segurança, estas credenciais não serão exibidas novamente. 
            Copie e salve em um local seguro.
          </p>
        </CardFooter>
      )}
    </Card>
  );
}
