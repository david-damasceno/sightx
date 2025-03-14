import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Database,
  FileSpreadsheet,
  Power,
  GitBranch,
  Slack,
  Trello,
  Video,
  MessageSquare,
  Cloud,
  ArrowRight,
  BarChart,
  ShoppingCart,
  Mail,
  Monitor,
  CheckSquare,
  Calendar,
  CreditCard,
  DollarSign,
  ChevronDown
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ConnectorCategory = 
  | "ERP" 
  | "CRM" 
  | "Analytics" 
  | "Social" 
  | "Communication" 
  | "ProjectManagement" 
  | "Design" 
  | "Storage" 
  | "Finance" 
  | "Ecommerce" 
  | "Database"
  | "Productivity";

interface Connector {
  id: string;
  name: string;
  description: string;
  logo: string;
  category: ConnectorCategory;
  popular?: boolean;
}

const CONNECTORS: Connector[] = [
  {
    id: "excel",
    name: "Excel",
    description: "Importe dados de planilhas Microsoft Excel (.xlsx, .xls)",
    logo: "https://img.icons8.com/color/452/microsoft-excel-2019--v1.png",
    category: "Productivity",
    popular: true
  },
  {
    id: "powerbi",
    name: "PowerBI",
    description: "Conecte-se aos dashboards e datasets do Microsoft Power BI",
    logo: "https://img.icons8.com/color/452/power-bi.png",
    category: "Analytics",
    popular: true
  },
  {
    id: "sap-erp",
    name: "SAP ERP",
    description: "Integre com sistemas SAP ERP para dados corporativos",
    logo: "https://img.icons8.com/color/452/sap.png",
    category: "ERP"
  },
  {
    id: "totvs",
    name: "TOTVS",
    description: "Conecte-se a sistemas TOTVS para gestão empresarial",
    logo: "https://logodownload.org/wp-content/uploads/2020/02/totvs-logo-1.png",
    category: "ERP"
  },
  {
    id: "odoo",
    name: "Odoo",
    description: "Integre com o Odoo para gestão empresarial completa",
    logo: "https://odoocdn.com/openerp_website/static/img/assets/png/odoo_logo.png",
    category: "ERP"
  },
  {
    id: "dynamics-365",
    name: "Microsoft Dynamics 365",
    description: "Conecte-se ao Microsoft Dynamics para CRM e ERP",
    logo: "https://img.icons8.com/color/452/microsoft-dynamics-365.png",
    category: "ERP"
  },
  {
    id: "netsuite",
    name: "Oracle NetSuite",
    description: "Integre com o NetSuite para operações comerciais",
    logo: "https://www.netsuite.com/portal/assets/img/social-icons/touch-icon-ipad.png",
    category: "ERP"
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Conecte ao Salesforce para dados de CRM",
    logo: "https://img.icons8.com/color/452/salesforce.png",
    category: "CRM",
    popular: true
  },
  {
    id: "rdstation",
    name: "RD Station",
    description: "Obtenha dados de marketing e automação do RD Station",
    logo: "https://rdstation.com/wp-content/uploads/2021/06/Group-3-1.png",
    category: "CRM"
  },
  {
    id: "pipedrive",
    name: "Pipedrive",
    description: "Acesse dados de vendas e pipeline do Pipedrive",
    logo: "https://img.icons8.com/color/452/pipedrive.png",
    category: "CRM"
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Conecte ao HubSpot para marketing, vendas e atendimento",
    logo: "https://img.icons8.com/color/452/hubspot.png",
    category: "CRM",
    popular: true
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    description: "Obtenha métricas e insights de tráfego web",
    logo: "https://img.icons8.com/color/452/google-analytics.png",
    category: "Analytics",
    popular: true
  },
  {
    id: "facebook-ads",
    name: "Facebook Ads",
    description: "Analise dados de campanhas publicitárias do Facebook",
    logo: "https://img.icons8.com/fluency/452/facebook-new.png",
    category: "Social",
    popular: true
  },
  {
    id: "linkedin-ads",
    name: "LinkedIn Ads",
    description: "Dados de campanhas publicitárias do LinkedIn",
    logo: "https://img.icons8.com/color/452/linkedin.png",
    category: "Social"
  },
  {
    id: "instagram-ads",
    name: "Instagram Ads",
    description: "Métricas de campanhas publicitárias do Instagram",
    logo: "https://img.icons8.com/fluency/452/instagram-new.png",
    category: "Social",
    popular: true
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: "Dados de campanhas de email e automação de marketing",
    logo: "https://img.icons8.com/color/452/mailchimp.png",
    category: "Communication"
  },
  {
    id: "zendesk",
    name: "Zendesk",
    description: "Dados de atendimento ao cliente e suporte",
    logo: "https://img.icons8.com/color/452/zendesk.png",
    category: "CRM"
  },
  {
    id: "slack",
    name: "Slack",
    description: "Integre com o Slack para comunicação de equipe",
    logo: "https://img.icons8.com/color/452/slack-new.png",
    category: "Communication",
    popular: true
  },
  {
    id: "trello",
    name: "Trello",
    description: "Gerencie projetos e tarefas com o Trello",
    logo: "https://img.icons8.com/color/452/trello.png",
    category: "ProjectManagement"
  },
  {
    id: "zoom",
    name: "Zoom",
    description: "Dados de reuniões e webinars do Zoom",
    logo: "https://img.icons8.com/color/452/zoom.png",
    category: "Communication"
  },
  {
    id: "microsoft-teams",
    name: "Microsoft Teams",
    description: "Integre com o Teams para colaboração em equipe",
    logo: "https://img.icons8.com/color/452/microsoft-teams.png",
    category: "Communication",
    popular: true
  },
  {
    id: "google-meet",
    name: "Google Meet",
    description: "Dados de videoconferências do Google Meet",
    logo: "https://www.gstatic.com/meet/google_meet_horizontal_wordmark_2020q4_1x_icon_124_40_2373e79660dabbf194273d27aa7ee1f5.png",
    category: "Communication"
  },
  {
    id: "asana",
    name: "Asana",
    description: "Gerenciamento de projetos e tarefas com o Asana",
    logo: "https://img.icons8.com/color/452/asana.png",
    category: "ProjectManagement"
  },
  {
    id: "basecamp",
    name: "Basecamp",
    description: "Colaboração em projetos e organização de equipes",
    logo: "https://img.icons8.com/color/452/basecamp.png",
    category: "ProjectManagement"
  },
  {
    id: "monday",
    name: "Monday.com",
    description: "Plataforma de gerenciamento de trabalho visual",
    logo: "https://img.icons8.com/color/452/monday.png",
    category: "ProjectManagement"
  },
  {
    id: "notion",
    name: "Notion",
    description: "Organize seus dados e documentos com o Notion",
    logo: "https://img.icons8.com/color/452/notion.png",
    category: "Productivity",
    popular: true
  },
  {
    id: "clickup",
    name: "ClickUp",
    description: "Plataforma de produtividade e gerenciamento de projetos",
    logo: "https://clickup.com/landing/images/clickup-logo.png",
    category: "ProjectManagement"
  },
  {
    id: "jira",
    name: "Jira",
    description: "Acompanhe projetos e problemas de desenvolvimento",
    logo: "https://img.icons8.com/color/452/jira.png",
    category: "ProjectManagement",
    popular: true
  },
  {
    id: "confluence",
    name: "Confluence",
    description: "Colaboração em documentação e base de conhecimento",
    logo: "https://img.icons8.com/color/452/confluence.png",
    category: "Productivity"
  },
  {
    id: "github",
    name: "GitHub",
    description: "Repositórios de código e projetos de software",
    logo: "https://img.icons8.com/fluency/452/github.png",
    category: "ProjectManagement",
    popular: true
  },
  {
    id: "bitbucket",
    name: "Bitbucket",
    description: "Repositórios Git e colaboração de código",
    logo: "https://img.icons8.com/color/452/bitbucket.png",
    category: "ProjectManagement"
  },
  {
    id: "gitlab",
    name: "GitLab",
    description: "Ciclo de vida completo de DevOps",
    logo: "https://img.icons8.com/color/452/gitlab.png",
    category: "ProjectManagement"
  },
  {
    id: "miro",
    name: "Miro",
    description: "Quadros colaborativos e brainstorming",
    logo: "https://asset.brandfetch.io/idAnDTFapY/idZxiVxyxl.png",
    category: "Design"
  },
  {
    id: "lucidchart",
    name: "Lucidchart",
    description: "Diagramas e visualizações colaborativas",
    logo: "https://img.icons8.com/color/452/lucidchart.png",
    category: "Design"
  },
  {
    id: "canva",
    name: "Canva",
    description: "Projetos de design gráfico e marketing visual",
    logo: "https://img.icons8.com/color/452/canva.png",
    category: "Design"
  },
  {
    id: "adobe-cc",
    name: "Adobe Creative Cloud",
    description: "Dados de ferramentas criativas como Photoshop, Illustrator, etc.",
    logo: "https://img.icons8.com/color/452/adobe-creative-cloud.png",
    category: "Design"
  },
  {
    id: "dropbox",
    name: "Dropbox",
    description: "Armazenamento e compartilhamento de arquivos",
    logo: "https://img.icons8.com/color/452/dropbox.png",
    category: "Storage"
  },
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Sincronize documentos e arquivos do Google Drive",
    logo: "https://img.icons8.com/color/452/google-drive.png",
    category: "Storage",
    popular: true
  },
  {
    id: "onedrive",
    name: "OneDrive",
    description: "Armazenamento na nuvem da Microsoft",
    logo: "https://img.icons8.com/color/452/onedrive.png",
    category: "Storage"
  },
  {
    id: "box",
    name: "Box",
    description: "Gerenciamento de conteúdo e colaboração segura",
    logo: "https://img.icons8.com/color/452/box-com.png",
    category: "Storage"
  },
  {
    id: "evernote",
    name: "Evernote",
    description: "Organize notas e informações importantes",
    logo: "https://img.icons8.com/color/452/evernote.png",
    category: "Productivity"
  },
  {
    id: "todoist",
    name: "Todoist",
    description: "Gerenciamento de tarefas e produtividade",
    logo: "https://img.icons8.com/color/452/todoist-app.png",
    category: "Productivity"
  },
  {
    id: "minitab",
    name: "Minitab",
    description: "Análise estatística e melhoria de processos",
    logo: "https://www.minitab.com/content/dam/www/en/icons/logo-minitab.svg",
    category: "Analytics"
  },
  {
    id: "quickbooks",
    name: "QuickBooks",
    description: "Software de contabilidade e finanças",
    logo: "https://img.icons8.com/color/452/quickbooks.png",
    category: "Finance"
  },
  {
    id: "xero",
    name: "Xero",
    description: "Contabilidade na nuvem para pequenas empresas",
    logo: "https://img.icons8.com/color/452/xero.png",
    category: "Finance"
  },
  {
    id: "sap-concur",
    name: "SAP Concur",
    description: "Gerenciamento de despesas e viagens corporativas",
    logo: "https://www.concur.com/sites/default/files/logo-concur-social-sharing-512x512.png",
    category: "Finance"
  },
  {
    id: "expensify",
    name: "Expensify",
    description: "Relatórios de despesas e gerenciamento financeiro",
    logo: "https://img.icons8.com/color/452/expensify.png",
    category: "Finance"
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Processamento de pagamentos online",
    logo: "https://img.icons8.com/color/452/stripe.png",
    category: "Finance",
    popular: true
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Plataforma de pagamentos online",
    logo: "https://img.icons8.com/color/452/paypal.png",
    category: "Finance",
    popular: true
  },
  {
    id: "pagseguro",
    name: "PagSeguro",
    description: "Solução completa para pagamentos online",
    logo: "https://logospng.org/download/pagseguro/logo-pagseguro-icone-512.png",
    category: "Finance"
  },
  {
    id: "mercadopago",
    name: "Mercado Pago",
    description: "Processador de pagamentos do Mercado Livre",
    logo: "https://logospng.org/download/mercado-pago/logo-mercado-pago-icone-512.png",
    category: "Finance"
  },
  {
    id: "nuvemshop",
    name: "Nuvemshop",
    description: "Plataforma de e-commerce para América Latina",
    logo: "https://images.nuvemshop.com.br/1000x1000/logos/nuvemshop-icon.png",
    category: "Ecommerce"
  },
  {
    id: "shopify",
    name: "Shopify",
    description: "Plataforma de comércio eletrônico completa",
    logo: "https://img.icons8.com/color/452/shopify.png",
    category: "Ecommerce",
    popular: true
  },
  {
    id: "amazon-s3",
    name: "Amazon S3",
    description: "Armazenamento de dados na nuvem",
    logo: "https://img.icons8.com/color/452/amazon-web-services.png",
    category: "Storage"
  },
  {
    id: "google-ads",
    name: "Google Ads",
    description: "Dados de campanhas publicitárias do Google",
    logo: "https://img.icons8.com/color/452/google-ads.png",
    category: "Analytics",
    popular: true
  },
  {
    id: "youtube-analytics",
    name: "YouTube Analytics",
    description: "Métricas e insights de canais e vídeos",
    logo: "https://img.icons8.com/color/452/youtube-play.png",
    category: "Analytics"
  },
  {
    id: "twitter-ads",
    name: "Twitter Ads",
    description: "Dados de publicidade no Twitter",
    logo: "https://img.icons8.com/color/452/twitter.png",
    category: "Social"
  },
  {
    id: "magento",
    name: "Magento",
    description: "Plataforma de comércio eletrônico de código aberto",
    logo: "https://img.icons8.com/color/452/magento.png",
    category: "Ecommerce"
  },
  {
    id: "woocommerce",
    name: "WooCommerce",
    description: "Plugin de e-commerce para WordPress",
    logo: "https://img.icons8.com/color/452/woocommerce.png",
    category: "Ecommerce"
  },
  {
    id: "postgresql",
    name: "PostgreSQL",
    description: "Sistema de banco de dados relacional de código aberto",
    logo: "https://img.icons8.com/color/452/postgreesql.png",
    category: "Database"
  },
  {
    id: "mysql",
    name: "MySQL",
    description: "Sistema de gerenciamento de banco de dados relacional",
    logo: "https://img.icons8.com/color/452/mysql-logo.png",
    category: "Database"
  },
  {
    id: "amazon-redshift",
    name: "Amazon Redshift",
    description: "Data warehouse na nuvem da AWS",
    logo: "https://img.icons8.com/color/452/amazon-web-services.png",
    category: "Database"
  },
  {
    id: "snowflake",
    name: "Snowflake",
    description: "Data warehouse em nuvem para análise de dados",
    logo: "https://www.snowflake.com/wp-content/uploads/2021/03/favicon-1.png",
    category: "Database"
  },
  {
    id: "google-bigquery",
    name: "Google BigQuery",
    description: "Data warehouse sem servidor para análise de dados",
    logo: "https://lh3.googleusercontent.com/MQRk0_Pn0GTwDUzj6gfuS5hnF3YKv5H-MTtqsNMCgHo_ibDTq4CX8UTRsQU_Q8f5WeNf_pNf_iJ7LJgP_zxS0dA=w128-h128-e365-rj-sc0x00ffffff",
    category: "Database"
  },
  {
    id: "intercom",
    name: "Intercom",
    description: "Plataforma de mensagens para empresas e clientes",
    logo: "https://img.icons8.com/color/452/intercom.png",
    category: "CRM"
  }
];

const getCategoryIcon = (category: ConnectorCategory) => {
  switch (category) {
    case "ERP":
      return <Database className="h-4 w-4" />;
    case "CRM":
      return <Monitor className="h-4 w-4" />;
    case "Analytics":
      return <BarChart className="h-4 w-4" />;
    case "Social":
      return <MessageSquare className="h-4 w-4" />;
    case "Communication":
      return <Video className="h-4 w-4" />;
    case "ProjectManagement":
      return <CheckSquare className="h-4 w-4" />;
    case "Design":
      return <Monitor className="h-4 w-4" />;
    case "Storage":
      return <Cloud className="h-4 w-4" />;
    case "Finance":
      return <DollarSign className="h-4 w-4" />;
    case "Ecommerce":
      return <ShoppingCart className="h-4 w-4" />;
    case "Database":
      return <Database className="h-4 w-4" />;
    case "Productivity":
      return <Calendar className="h-4 w-4" />;
    default:
      return <Database className="h-4 w-4" />;
  }
};

const categoryLabels: Record<ConnectorCategory, string> = {
  ERP: "ERP",
  CRM: "CRM",
  Analytics: "Analytics",
  Social: "Redes Sociais",
  Communication: "Comunicação",
  ProjectManagement: "Gestão de Projetos",
  Design: "Design",
  Storage: "Armazenamento",
  Finance: "Finanças",
  Ecommerce: "E-commerce",
  Database: "Banco de Dados",
  Productivity: "Produtividade"
};

export default function DataConnectors() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ConnectorCategory | "all">("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filteredConnectors = useMemo(() => {
    return CONNECTORS.filter((connector) => {
      const matchesSearch = connector.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           connector.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || connector.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(CONNECTORS.map((connector) => connector.category)));
    return uniqueCategories;
  }, []);

  const handleConnectClick = (connector: Connector) => {
    if (connector.id === "excel") {
      toast({
        title: `Upload de arquivo Excel`,
        description: "Selecione um arquivo Excel para importar.",
      });
    } else {
      toast({
        title: `Conectando ao ${connector.name}`,
        description: "Você será redirecionado para autenticação em breve.",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col space-y-3">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Conectores de Dados
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Conecte-se a diferentes fontes de dados para análise avançada e geração de insights poderosos para seu negócio.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="relative">
            <div className="relative group">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <Input
                type="search"
                placeholder="Pesquisar conectores..."
                className="pl-10 h-12 text-base bg-background/70 backdrop-blur-sm border-muted focus-within:border-primary/50 transition-all focus-visible:ring-1 focus-visible:ring-primary/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-col">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between h-12 bg-background">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>{selectedCategory === "all" ? "Filtrar por categoria" : categoryLabels[selectedCategory]}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-background shadow-lg border-border">
                <DropdownMenuLabel>Categorias</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setSelectedCategory("all")}
                  className={selectedCategory === "all" ? "bg-accent text-accent-foreground" : ""}
                >
                  Todos
                </DropdownMenuItem>
                {categories.map((category) => (
                  <DropdownMenuItem
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category ? "bg-accent text-accent-foreground" : ""}
                  >
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(category)}
                      <span>{categoryLabels[category]}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex justify-end">
            <div className="flex items-center border rounded-md overflow-hidden shadow-sm">
              <Button
                variant={view === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("grid")}
                className="rounded-none h-10 px-4 font-medium"
              >
                Grid
              </Button>
              <Button
                variant={view === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("list")}
                className="rounded-none h-10 px-4 font-medium"
              >
                Lista
              </Button>
            </div>
          </div>
        </div>

        {filteredConnectors.length > 0 ? (
          <div className={view === "grid" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "space-y-4"}>
            {filteredConnectors.map((connector) => (
              <Card 
                key={connector.id} 
                className={`overflow-hidden transition-all hover:shadow-lg border-border/40 hover:border-primary/30 group ${view === "list" ? "flex" : ""}`}
              >
                <CardContent className={`p-0 ${view === "list" ? "flex items-center w-full" : ""}`}>
                  <div className={view === "list" ? "flex items-center space-x-6 p-5 w-full" : "flex flex-col"}>
                    <div className={view === "list" 
                      ? "flex-shrink-0 w-20 h-20" 
                      : "flex items-center justify-center p-8 w-full h-36 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 group-hover:from-slate-100 group-hover:to-slate-50 dark:group-hover:from-slate-800 dark:group-hover:to-slate-700 transition-colors"
                    }>
                      <div className={`
                        ${view === "list" ? "w-20 h-20" : "w-28 h-28"} 
                        rounded-full bg-white dark:bg-slate-700 flex items-center justify-center overflow-hidden border shadow-md group-hover:shadow-lg transition-all
                      `}>
                        <img 
                          src={connector.logo} 
                          alt={`${connector.name} logo`} 
                          className={`
                            ${view === "list" ? "w-16 h-16" : "w-24 h-24"}
                            object-contain p-1 group-hover:scale-110 transition-transform duration-300
                          `} 
                        />
                      </div>
                    </div>
                    
                    <div className={view === "list" ? "flex-grow" : "p-5 space-y-3"}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg">{connector.name}</h3>
                          {connector.popular && (
                            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary-foreground dark:border-primary/30">
                              Popular
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground line-clamp-2">
                        {connector.description}
                      </p>
                      
                      <div className={`flex items-center mt-3 ${view === "list" ? "justify-between" : ""}`}>
                        <Badge variant="outline" className="text-xs">
                          {getCategoryIcon(connector.category)}
                          <span className="ml-1">{categoryLabels[connector.category]}</span>
                        </Badge>
                        
                        {view === "list" && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleConnectClick(connector)}
                            className="ml-auto group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                          >
                            {connector.id === "excel" ? "Upload" : "Conectar"}
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        )}
                      </div>
                      
                      {view !== "list" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleConnectClick(connector)}
                          className="w-full mt-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        >
                          {connector.id === "excel" ? "Upload" : "Conectar"}
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 border rounded-lg bg-muted/10 border-dashed">
            <p className="text-muted-foreground text-lg mb-4">Nenhum conector encontrado. Tente uma pesquisa diferente.</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="px-6"
            >
              Limpar filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
