
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Política de Privacidade</h1>
          <p className="text-muted-foreground">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              A SightX está comprometida em proteger sua privacidade e seus dados. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e compartilhamos suas informações quando você utiliza nossa plataforma.
            </p>

            <p>
              Ao utilizar a SightX, você concorda com a coleta e uso de informações de acordo com esta política. Recomendamos que você leia este documento com atenção para entender nossas práticas.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações que Coletamos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <h3 className="text-base font-medium">Informações fornecidas por você</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Informações de cadastro (nome, e-mail, telefone, etc.)</li>
              <li>Informações da empresa (nome, localização, setor, tamanho, etc.)</li>
              <li>Dados de faturamento para processamento de pagamentos</li>
              <li>Conteúdo que você envia para análise em nossa plataforma</li>
              <li>Comunicações com nossa equipe de suporte</li>
            </ul>

            <h3 className="text-base font-medium">Informações coletadas automaticamente</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Dados de uso e interação com a plataforma</li>
              <li>Informações do dispositivo (tipo, sistema operacional, navegador)</li>
              <li>Endereço IP e dados de geolocalização aproximados</li>
              <li>Cookies e tecnologias semelhantes (conforme descrito abaixo)</li>
            </ul>

            <h3 className="text-base font-medium">Informações de terceiros</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Dados de redes sociais quando você se conecta ou integra essas plataformas</li>
              <li>Informações públicas de negócios para enriquecer análises</li>
              <li>Dados de parceiros comerciais conforme autorizado por você</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Como Usamos Suas Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>Utilizamos suas informações para:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Fornecer, manter e melhorar nossos serviços</li>
              <li>Processar suas transações e gerenciar sua conta</li>
              <li>Personalizar sua experiência e oferecer conteúdo relevante</li>
              <li>Desenvolver novos produtos e recursos baseados em padrões de uso</li>
              <li>Enviar informações importantes sobre o serviço, alterações nos termos ou políticas</li>
              <li>Enviar comunicações de marketing (com sua permissão)</li>
              <li>Detectar, investigar e prevenir atividades fraudulentas e abusos</li>
              <li>Cumprir obrigações legais</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cookies e Tecnologias Semelhantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              A SightX utiliza cookies e tecnologias semelhantes para coletar informações sobre como você interage com nossos serviços e nos permitir melhorar sua experiência.
            </p>

            <h3 className="text-base font-medium">Tipos de cookies que utilizamos:</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Cookies essenciais:</strong> necessários para o funcionamento da plataforma</li>
              <li><strong>Cookies de preferências:</strong> permitem lembrar suas escolhas e personalizar sua experiência</li>
              <li><strong>Cookies analíticos:</strong> nos ajudam a entender como os usuários interagem com a plataforma</li>
              <li><strong>Cookies de marketing:</strong> utilizados para mostrar anúncios relevantes e medir a eficácia de campanhas</li>
            </ul>

            <p>
              Você pode controlar ou excluir cookies nas configurações do seu navegador a qualquer momento. No entanto, a desativação de certos cookies pode afetar a funcionalidade da plataforma.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compartilhamento de Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>Podemos compartilhar suas informações com:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Provedores de serviços:</strong> empresas que nos ajudam a operar nossos serviços (processamento de pagamentos, armazenamento de dados, análises, etc.)</li>
              <li><strong>Parceiros de negócios:</strong> quando oferecemos serviços em conjunto ou quando aprovado por você</li>
              <li><strong>Autoridades legais:</strong> quando exigido por lei, processo legal ou para proteger nossos direitos</li>
              <li><strong>Novos proprietários:</strong> em caso de fusão, venda ou transferência de propriedade da empresa</li>
            </ul>

            <p>
              Não vendemos suas informações pessoais a terceiros. Quando compartilhamos dados com terceiros, exigimos que eles mantenham a confidencialidade e segurança dessas informações.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Segurança de Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              Implementamos medidas técnicas e organizacionais apropriadas para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição. Essas medidas incluem:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Criptografia de dados em trânsito e em repouso</li>
              <li>Controles de acesso rigorosos e autenticação multifatorial</li>
              <li>Monitoramento regular de sistemas para detectar vulnerabilidades</li>
              <li>Treinamento de segurança para nossa equipe</li>
              <li>Avaliações periódicas de risco e auditorias de segurança</li>
            </ul>

            <p>
              Apesar de nossos esforços, nenhum método de transmissão pela internet ou armazenamento eletrônico é 100% seguro. Portanto, não podemos garantir segurança absoluta.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seus Direitos e Escolhas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>Dependendo da sua localização, você pode ter direitos sobre seus dados pessoais, incluindo:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Acessar os dados pessoais que temos sobre você</li>
              <li>Corrigir dados imprecisos ou incompletos</li>
              <li>Solicitar a exclusão de seus dados em determinadas circunstâncias</li>
              <li>Restringir ou opor-se ao processamento de seus dados</li>
              <li>Solicitar a transferência de seus dados para outro serviço (portabilidade)</li>
              <li>Retirar consentimento para processamento de dados (quando aplicável)</li>
            </ul>

            <p>
              Para exercer esses direitos, entre em contato conosco através das informações fornecidas na seção "Como nos Contatar".
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Retenção de Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              Mantemos suas informações pelo tempo necessário para fornecer nossos serviços e cumprir as finalidades descritas nesta política. O período de retenção leva em consideração:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>A duração do seu relacionamento conosco</li>
              <li>Obrigações legais que devemos cumprir</li>
              <li>Prescrições legais aplicáveis</li>
              <li>Diretrizes de órgãos reguladores</li>
            </ul>

            <p>
              Quando suas informações não forem mais necessárias, as excluiremos ou anonimizaremos de forma segura.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alterações nesta Política</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente para refletir mudanças em nossas práticas ou por outros motivos operacionais, legais ou regulatórios. Notificaremos você sobre quaisquer alterações materiais através de aviso em nossa plataforma ou por e-mail antes que as mudanças entrem em vigor.
            </p>
            <p>
              Recomendamos que você revise esta política regularmente para estar informado sobre como protegemos suas informações.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Como nos Contatar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              Se você tiver dúvidas, preocupações ou solicitações relacionadas a esta Política de Privacidade ou ao processamento de seus dados pessoais, entre em contato conosco:
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
