
import { AirbyteIntegration } from "@/components/integrations/AirbyteIntegration"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AirbyteIntegrationPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Integração com Airbyte</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <AirbyteIntegration />
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Instruções</CardTitle>
              <CardDescription>Como configurar o Airbyte com seu banco de dados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h3 className="font-medium">1. Configure o acesso</h3>
                <p>Preencha o nome de usuário e senha para criar um usuário dedicado ao Airbyte.</p>
              </div>
              
              <div>
                <h3 className="font-medium">2. Copie os dados de conexão</h3>
                <p>Após criar o usuário, anote os dados de conexão que aparecerão na tela.</p>
              </div>
              
              <div>
                <h3 className="font-medium">3. No Airbyte, configure um novo destino</h3>
                <p>Use os dados fornecidos para configurar um destino Postgres no Airbyte.</p>
                <ul className="list-disc list-inside mt-2">
                  <li>Selecione o tipo de destino "Postgres"</li>
                  <li>Preencha os campos com os dados fornecidos</li>
                  <li>Teste a conexão antes de salvar</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium">4. Configure a fonte do Instagram</h3>
                <p>Siga as instruções do Airbyte para configurar a origem dos dados do Instagram.</p>
              </div>
              
              <div>
                <h3 className="font-medium">5. Crie a conexão</h3>
                <p>Conecte a fonte do Instagram ao destino Postgres e configure a sincronização.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
