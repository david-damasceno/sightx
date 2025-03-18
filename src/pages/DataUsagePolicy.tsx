
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function DataUsagePolicy() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Política de Uso de Dados</h1>
          <p className="text-muted-foreground">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Introdução</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              Esta Política de Uso de Dados descreve como a SightX compartilha dados com terceiros, detalhando quais dados são compartilhados, com quem e para qual finalidade. Esta política complementa nossa Política de Privacidade e deve ser lida em conjunto com ela.
            </p>
            <p>
              Valorizamos sua privacidade e estamos comprometidos com a transparência sobre como usamos seus dados. Embora nossa plataforma seja projetada para fornecer insights valiosos a partir de seus dados, queremos que você entenda exatamente como e por que compartilhamos determinadas informações com parceiros terceirizados.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categorias de Dados Compartilhados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              Podemos compartilhar as seguintes categorias de dados com terceiros:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Dados de identificação:</strong> Nome, endereço de e-mail, telefone comercial, cargo, nome da empresa
              </li>
              <li>
                <strong>Dados de uso da plataforma:</strong> Métricas de engajamento, funcionalidades mais utilizadas, padrões de uso
              </li>
              <li>
                <strong>Dados de dispositivo:</strong> Tipo de dispositivo, sistema operacional, navegador, endereço IP
              </li>
              <li>
                <strong>Dados agregados e anonimizados:</strong> Estatísticas setoriais, benchmarks de desempenho, tendências de mercado
              </li>
            </ul>
            <p>
              <strong>Importante:</strong> Não compartilhamos o conteúdo específico de seus dados de negócios (como relatórios financeiros, dados de clientes, informações proprietárias) com terceiros sem seu consentimento explícito, exceto conforme descrito nesta política.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Com Quem Compartilhamos Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <h3 className="text-base font-medium">Provedores de Serviços</h3>
            <p>
              Compartilhamos dados com provedores de serviços que nos ajudam a operar, melhorar e manter nossa plataforma:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Provedores de hospedagem e infraestrutura:</strong> Amazon Web Services (AWS), Microsoft Azure, Google Cloud Platform
                <p className="text-xs text-muted-foreground ml-5 mt-1">Dados compartilhados: Conteúdo da plataforma, dados do usuário, logs de sistema</p>
                <p className="text-xs text-muted-foreground ml-5">Finalidade: Hospedar nossa plataforma e armazenar dados de forma segura</p>
              </li>
              <li>
                <strong>Serviços de análise:</strong> Google Analytics, Mixpanel, Amplitude
                <p className="text-xs text-muted-foreground ml-5 mt-1">Dados compartilhados: Comportamento do usuário, dados de uso, informações do dispositivo</p>
                <p className="text-xs text-muted-foreground ml-5">Finalidade: Analisar como os usuários interagem com nossa plataforma para melhorar a experiência</p>
              </li>
              <li>
                <strong>Processadores de pagamento:</strong> Stripe, PayPal
                <p className="text-xs text-muted-foreground ml-5 mt-1">Dados compartilhados: Informações de faturamento, detalhes de transação</p>
                <p className="text-xs text-muted-foreground ml-5">Finalidade: Processar pagamentos e gerenciar assinaturas</p>
              </li>
              <li>
                <strong>Comunicação:</strong> Sendgrid, Intercom, Twilio
                <p className="text-xs text-muted-foreground ml-5 mt-1">Dados compartilhados: Endereço de e-mail, nome, preferências de comunicação</p>
                <p className="text-xs text-muted-foreground ml-5">Finalidade: Enviar comunicações relevantes, fornecer suporte ao cliente</p>
              </li>
            </ul>

            <h3 className="text-base font-medium mt-6">Parceiros de Integração</h3>
            <p>
              Para fornecer funcionalidades ampliadas, integramos com diversos serviços terceirizados:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Plataformas de redes sociais:</strong> Facebook, Instagram, LinkedIn, Twitter
                <p className="text-xs text-muted-foreground ml-5 mt-1">Dados compartilhados: Tokens de acesso, métricas agregadas</p>
                <p className="text-xs text-muted-foreground ml-5">Finalidade: Integrar dados de redes sociais para análise</p>
              </li>
              <li>
                <strong>Ferramentas de marketing:</strong> HubSpot, Mailchimp, Salesforce
                <p className="text-xs text-muted-foreground ml-5 mt-1">Dados compartilhados: Informações de contato, dados de interação</p>
                <p className="text-xs text-muted-foreground ml-5">Finalidade: Sincronizar dados entre plataformas para marketing mais eficaz</p>
              </li>
              <li>
                <strong>Ferramentas de análise de localização:</strong> Google Maps, Foursquare
                <p className="text-xs text-muted-foreground ml-5 mt-1">Dados compartilhados: Dados de localização, métricas de visitas</p>
                <p className="text-xs text-muted-foreground ml-5">Finalidade: Fornecer insights baseados em localização</p>
              </li>
            </ul>

            <h3 className="text-base font-medium mt-6">Parceiros de IA e Processamento de Dados</h3>
            <p>
              Para fornecer insights avançados de IA, utilizamos os seguintes parceiros:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Provedores de IA:</strong> OpenAI, Anthropic, HuggingFace
                <p className="text-xs text-muted-foreground ml-5 mt-1">Dados compartilhados: Dados anonimizados para processamento, consultas de texto</p>
                <p className="text-xs text-muted-foreground ml-5">Finalidade: Gerar insights e recomendações personalizadas</p>
              </li>
              <li>
                <strong>Processamento de linguagem natural:</strong> IBM Watson, Microsoft Azure Cognitive Services
                <p className="text-xs text-muted-foreground ml-5 mt-1">Dados compartilhados: Texto para análise de sentimento, categorização</p>
                <p className="text-xs text-muted-foreground ml-5">Finalidade: Analisar feedback e comentários para extrair insights</p>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Finalidades do Compartilhamento de Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              Compartilhamos dados com terceiros para as seguintes finalidades:
            </p>
            <ul className="list-disc pl-5 space-y-4">
              <li>
                <strong>Fornecer e melhorar nossos serviços:</strong> Para manter nossa plataforma funcionando de maneira eficiente e desenvolver novos recursos baseados nas necessidades dos usuários.
              </li>
              <li>
                <strong>Personalização:</strong> Para personalizar sua experiência e oferecer conteúdo e recursos mais relevantes para suas necessidades específicas.
              </li>
              <li>
                <strong>Análise e insights:</strong> Para gerar insights valiosos a partir de dados agregados que podem beneficiar sua empresa e melhorar nossa plataforma.
              </li>
              <li>
                <strong>Integrações:</strong> Para permitir que você conecte nossa plataforma com outros serviços que você utiliza, criando um ecossistema integrado.
              </li>
              <li>
                <strong>Segurança e conformidade:</strong> Para proteger nossa plataforma contra atividades fraudulentas e garantir conformidade com leis e regulamentos.
              </li>
              <li>
                <strong>Suporte ao cliente:</strong> Para fornecer assistência quando você tiver problemas ou dúvidas sobre nossa plataforma.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Base Legal para Compartilhamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              Compartilhamos seus dados com base nas seguintes justificativas legais:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Execução de contrato:</strong> Quando o compartilhamento é necessário para cumprir nossas obrigações contratuais com você.
              </li>
              <li>
                <strong>Consentimento:</strong> Quando você deu permissão explícita para compartilharmos seus dados para finalidades específicas.
              </li>
              <li>
                <strong>Interesses legítimos:</strong> Quando temos um interesse legítimo em compartilhar dados para melhorar nossos serviços, desde que isso não prejudique seus direitos e liberdades.
              </li>
              <li>
                <strong>Obrigação legal:</strong> Quando somos obrigados por lei a compartilhar certos dados com autoridades.
              </li>
            </ul>
            <p>
              Para compartilhamentos baseados em consentimento, você pode retirar seu consentimento a qualquer momento entrando em contato conosco.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transferências Internacionais de Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              Alguns de nossos provedores de serviços e parceiros estão localizados fora do Brasil, o que significa que seus dados podem ser transferidos para países com leis de proteção de dados diferentes. Quando realizamos transferências internacionais de dados, implementamos as seguintes salvaguardas:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Cláusulas contratuais padrão aprovadas pelas autoridades de proteção de dados</li>
              <li>Certificações como Privacy Shield (quando aplicável)</li>
              <li>Avaliações de impacto de transferência de dados</li>
              <li>Acordos de processamento de dados com obrigações rígidas de segurança</li>
            </ul>
            <p>
              Garantimos que qualquer terceiro que processe seus dados ofereça um nível adequado de proteção e segurança.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Segurança no Compartilhamento de Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              Implementamos medidas técnicas e organizacionais para garantir que o compartilhamento de dados seja realizado de forma segura:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Criptografia de ponta a ponta para transferências de dados sensíveis</li>
              <li>Acesso restrito baseado em necessidade de conhecimento</li>
              <li>Autenticação multifator para acessar sistemas de compartilhamento</li>
              <li>Monitoramento e auditoria regular de atividades de compartilhamento</li>
              <li>Avaliação rigorosa de parceiros terceirizados antes do compartilhamento</li>
            </ul>
            <p>
              Revisamos regularmente nossas práticas de compartilhamento de dados para garantir que permaneçam seguras e em conformidade com as leis aplicáveis.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seus Direitos e Escolhas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              Você tem vários direitos em relação ao compartilhamento de seus dados:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Acesso e informação:</strong> Você pode solicitar informações sobre quais dados são compartilhados e com quem.
              </li>
              <li>
                <strong>Objeção:</strong> Em certos casos, você pode se opor ao compartilhamento de seus dados.
              </li>
              <li>
                <strong>Restrição:</strong> Você pode solicitar que restrinjamos o compartilhamento de dados em determinadas circunstâncias.
              </li>
              <li>
                <strong>Retirada de consentimento:</strong> Quando o compartilhamento é baseado em consentimento, você pode retirá-lo a qualquer momento.
              </li>
            </ul>

            <p>
              Para exercer esses direitos ou fazer perguntas sobre nossas práticas de compartilhamento de dados, entre em contato conosco através das informações fornecidas na seção "Como nos Contatar".
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alterações nesta Política</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              Podemos atualizar esta Política de Uso de Dados periodicamente para refletir mudanças em nossas práticas ou parceiros terceirizados. Notificaremos você sobre quaisquer alterações materiais através de aviso em nossa plataforma ou por e-mail antes que as mudanças entrem em vigor.
            </p>
            <p>
              Recomendamos que você revise esta política regularmente para estar informado sobre como seus dados são compartilhados.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Como nos Contatar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              Se você tiver dúvidas, preocupações ou solicitações relacionadas a esta Política de Uso de Dados, entre em contato conosco:
            </p>
            <p className="font-medium">
              E-mail: privacy@sightx.com<br />
              Endereço: Av. Paulista, 1000, São Paulo, SP - Brasil<br />
              Telefone: (11) 3456-7890
            </p>
            <p>
              Faremos o possível para responder prontamente a todas as solicitações dentro do prazo exigido pelas leis de proteção de dados aplicáveis.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
