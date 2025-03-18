
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Termos de Serviço</h1>
          <p className="text-muted-foreground">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Introdução</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              Bem-vindo à SightX! Estes Termos de Serviço ("Termos") governam seu acesso e uso da plataforma SightX, incluindo qualquer conteúdo, funcionalidade e serviços oferecidos. Ao utilizar nossa plataforma, você aceita estar vinculado a estes Termos. Por favor, leia-os cuidadosamente.
            </p>
            <p>
              Se você estiver usando a SightX em nome de uma organização, você está concordando com estes Termos em nome dessa organização, e você declara e garante que tem autoridade para vincular essa organização a estes Termos.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Descrição do Serviço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              A SightX é uma plataforma de inteligência de negócios que integra múltiplas fontes de dados para fornecer insights acionáveis e personalizados. Com o poder de uma IA assistente, nosso objetivo é permitir que gestores e CEOs tomem decisões mais informadas e estratégicas, baseadas em dados precisos, em tempo real.
            </p>
            <p>
              Nossos serviços incluem, mas não se limitam a:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Integração e análise de dados de múltiplas fontes</li>
              <li>Geração de insights e recomendações personalizadas</li>
              <li>Visualização de dados através de dashboards interativos</li>
              <li>Análises contextualizadas e automatizadas</li>
              <li>Armazenamento seguro e escalável de dados</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conta do Usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              Para acessar e utilizar certos recursos da SightX, você precisa criar uma conta. Ao criar uma conta, você concorda em:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Fornecer informações precisas, atuais e completas</li>
              <li>Manter e atualizar prontamente suas informações conforme necessário</li>
              <li>Manter a segurança e confidencialidade de suas credenciais de login</li>
              <li>Ser responsável por todas as atividades que ocorrem sob sua conta</li>
              <li>Notificar-nos imediatamente sobre qualquer uso não autorizado ou suspeito de sua conta</li>
            </ul>
            <p>
              Reservamo-nos o direito de suspender ou encerrar sua conta se qualquer informação fornecida durante o processo de registro ou posteriormente se mostrar imprecisa, desatualizada ou incompleta, ou se você violar qualquer disposição destes Termos.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uso do Serviço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              Você concorda em usar a SightX apenas para fins legais e de acordo com estes Termos. Especificamente, você concorda em não:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Violar leis, regulamentos ou direitos de terceiros</li>
              <li>Enviar, fazer upload ou distribuir qualquer conteúdo ilegal, difamatório, ofensivo ou prejudicial</li>
              <li>Tentar contornar ou comprometer as medidas de segurança da plataforma</li>
              <li>Interferir na operação normal da plataforma ou sobrecarregar nossa infraestrutura</li>
              <li>Usar robôs, spiders ou outros meios automatizados para acessar a plataforma</li>
              <li>Aplicar engenharia reversa, descompilar ou desmontar qualquer parte da plataforma</li>
              <li>Usar a plataforma para enviar spam, phishing ou outros conteúdos maliciosos</li>
              <li>Revender, sublicenciar ou transferir seu acesso à plataforma sem nossa autorização</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conteúdo do Usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              Nossa plataforma permite que você faça upload, envie ou compartilhe conteúdo, incluindo textos, arquivos, imagens e dados ("Conteúdo do Usuário"). Você mantém todos os direitos de propriedade intelectual sobre seu Conteúdo do Usuário.
            </p>
            <p>
              Ao enviar Conteúdo do Usuário para a SightX, você nos concede uma licença mundial, não exclusiva, livre de royalties, transferível e sublicenciável para usar, reproduzir, modificar, adaptar, publicar, traduzir e distribuir esse conteúdo em conexão com o fornecimento e promoção dos nossos serviços.
            </p>
            <p>
              Você declara e garante que:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Você é o proprietário do Conteúdo do Usuário ou tem os direitos necessários para conceder a licença acima</li>
              <li>O Conteúdo do Usuário não viola a privacidade, direitos de publicidade, direitos autorais, marcas registradas ou outros direitos de propriedade intelectual</li>
              <li>O Conteúdo do Usuário não contém material que seja ilegal, difamatório, obsceno, pornográfico, assediador, ameaçador, prejudicial, invasivo da privacidade, odioso ou racialmente ou etnicamente ofensivo</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Propriedade Intelectual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              A SightX e seu conteúdo, recursos e funcionalidades são e permanecerão propriedade exclusiva da SightX e seus licenciadores. O serviço é protegido por direitos autorais, marcas registradas e outras leis de propriedade intelectual do Brasil e de outros países.
            </p>
            <p>
              Nosso nome, logotipo e todas as marcas relacionadas, nomes de produtos, nomes de serviços e designs são marcas registradas da SightX ou de suas afiliadas ou licenciadores. Você não deve usar essas marcas sem nossa prévia autorização por escrito.
            </p>
            <p>
              Nada nestes Termos constitui uma transferência de qualquer propriedade intelectual ou concede a você o direito de usar nossa propriedade intelectual, exceto conforme expressamente estabelecido aqui.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assinaturas e Pagamentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              A SightX oferece diversos planos de assinatura. Ao assinar um plano pago, você concorda com os seguintes termos:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Você autoriza a SightX a cobrar a forma de pagamento associada à sua conta para taxas recorrentes de assinatura</li>
              <li>As assinaturas serão renovadas automaticamente, a menos que você cancele antes do próximo ciclo de faturamento</li>
              <li>Você pode cancelar sua assinatura a qualquer momento através das configurações da sua conta</li>
              <li>Não oferecemos reembolsos para períodos parciais de assinatura</li>
              <li>Podemos alterar os preços da assinatura a qualquer momento, mas forneceremos aviso prévio antes que quaisquer alterações entrem em vigor</li>
            </ul>
            <p>
              Para mais informações sobre faturamento e pagamentos, consulte nossa Política de Faturamento.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Isenção de Garantias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              A SightX é fornecida "como está" e "conforme disponível", sem garantias de qualquer tipo, expressas ou implícitas. Não garantimos que o serviço atenderá aos seus requisitos específicos, que o serviço será ininterrupto, oportuno, seguro ou livre de erros, ou que os resultados que possam ser obtidos do uso do serviço serão precisos ou confiáveis.
            </p>
            <p>
              Você entende e concorda que:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Qualquer material baixado ou obtido através do uso do serviço é feito por sua própria conta e risco</li>
              <li>Nenhum conselho ou informação, seja oral ou escrita, obtida por você da SightX ou através do serviço criará qualquer garantia não expressamente estabelecida nestes Termos</li>
              <li>A SightX não é responsável por decisões de negócios tomadas com base nas análises e insights fornecidos pela plataforma</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Limitação de Responsabilidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              Em nenhum caso a SightX, seus diretores, funcionários, parceiros, agentes, fornecedores ou afiliados serão responsáveis por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo, sem limitação, perda de lucros, dados, uso, boa vontade ou outras perdas intangíveis, resultantes de:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Seu acesso ou uso ou incapacidade de acessar ou usar o serviço</li>
              <li>Qualquer conduta ou conteúdo de terceiros no serviço</li>
              <li>Qualquer conteúdo obtido do serviço</li>
              <li>Acesso não autorizado, uso ou alteração de suas transmissões ou conteúdo</li>
            </ul>
            <p>
              Em qualquer caso, nossa responsabilidade total por todas as reclamações relacionadas ao serviço será limitada ao valor pago por você pelos serviços nos últimos 12 meses.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Indenização</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              Você concorda em defender, indenizar e isentar a SightX, seus diretores, funcionários, parceiros, agentes, contratados, licenciadores, prestadores de serviços, subcontratados, fornecedores e afiliados, de e contra quaisquer reivindicações, responsabilidades, danos, julgamentos, prêmios, perdas, custos, despesas ou taxas (incluindo honorários advocatícios razoáveis) decorrentes de ou relacionados à sua violação destes Termos ou seu uso do serviço.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rescisão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              Podemos encerrar ou suspender seu acesso imediatamente, sem aviso prévio ou responsabilidade, por qualquer motivo, incluindo, sem limitação, se você violar os Termos.
            </p>
            <p>
              Você pode encerrar sua conta a qualquer momento desativando-a nas configurações da conta ou entrando em contato conosco. Após o término, seu direito de usar o serviço cessará imediatamente.
            </p>
            <p>
              Todas as disposições dos Termos que, por sua natureza, devem sobreviver ao término, sobreviverão ao término, incluindo, sem limitação, disposições de propriedade, isenções de garantia, indenização e limitações de responsabilidade.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lei Aplicável</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              Estes Termos serão regidos e interpretados de acordo com as leis do Brasil, sem considerar seus conflitos de disposições legais.
            </p>
            <p>
              Qualquer disputa legal decorrente ou relacionada a estes Termos será submetida à jurisdição exclusiva dos tribunais da Comarca de São Paulo, Brasil.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alterações nos Termos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              Reservamo-nos o direito, a nosso critério exclusivo, de modificar ou substituir estes Termos a qualquer momento. Se a revisão for material, tentaremos fornecer pelo menos 30 dias de aviso antes que quaisquer novos termos entrem em vigor.
            </p>
            <p>
              Ao continuar a acessar ou usar nosso serviço após essas revisões entrarem em vigor, você concorda em estar vinculado aos termos revisados. Se você não concordar com os novos termos, você não está mais autorizado a usar o serviço.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco:
            </p>
            <p className="font-medium">
              E-mail: legal@sightx.com<br />
              Endereço: Av. Paulista, 1000, São Paulo, SP - Brasil<br />
              Telefone: (11) 3456-7890
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
