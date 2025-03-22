
import { AirbyteCredentials } from "@/components/AirbyteCredentials";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ExternalLinkIcon } from "lucide-react";

export default function AirbyteIntegration() {
  return (
    <div className="container py-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integração com Airbyte</h1>
        <p className="text-muted-foreground mt-2">
          Configure a integração entre SightX e Airbyte para importar dados do Instagram
        </p>
      </div>
      
      <Separator />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AirbyteCredentials />
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Instruções</CardTitle>
              <CardDescription>Como conectar ao Airbyte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal pl-4 space-y-2 text-sm">
                <li>Gere suas credenciais clicando no botão <strong>"Gerar Credenciais de Acesso"</strong>.</li>
                <li>Copie os dados de conexão (host, porta, etc.).</li>
                <li>Acesse sua instância do Airbyte e adicione um novo destino Postgres.</li>
                <li>Cole as informações de conexão nos campos correspondentes.</li>
                <li>Para o <strong>SSL Mode</strong>, use o valor <strong>"require"</strong>.</li>
                <li>No Método de Túnel SSH, selecione <strong>"No Tunnel"</strong>.</li>
                <li>Teste a conexão e salve as configurações.</li>
              </ol>
              
              <Separator />
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Links úteis:</p>
                <div className="space-y-1">
                  <Button variant="link" className="h-auto p-0 text-sm" asChild>
                    <a href="https://docs.airbyte.com/integrations/destinations/postgres" target="_blank" rel="noopener noreferrer">
                      Documentação Airbyte para Postgres <ExternalLinkIcon className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
