
// Utilitários para formatação baseada nas configurações de localização do usuário
import { toast } from "@/hooks/use-toast";

export interface LocalizationSettings {
  language: string;
  dateFormat: string;
  numberFormat: string;
  currency: string;
  timezone: string;
  useAutoTimezone: boolean;
  firstDayOfWeek: string;
  measurementUnit: string;
}

// Evento personalizado para alterações de localização
export const LOCALIZATION_CHANGE_EVENT = 'localization-settings-changed';

// Carregar configurações de localização salvas
export function getLocalizationSettings(): LocalizationSettings {
  try {
    const savedSettings = localStorage.getItem("localizationSettings");
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
  } catch (error) {
    console.error("Erro ao carregar configurações de localização:", error);
  }

  // Valores padrão
  return {
    language: "pt-BR",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "pt-BR",
    currency: "BRL",
    timezone: "America/Sao_Paulo",
    useAutoTimezone: true,
    firstDayOfWeek: "monday",
    measurementUnit: "metric"
  };
}

// Salvar configurações de localização
export function saveLocalizationSettings(settings: LocalizationSettings): void {
  try {
    localStorage.setItem("localizationSettings", JSON.stringify(settings));
    
    // Disparar evento para notificar sobre a mudança
    window.dispatchEvent(new CustomEvent(LOCALIZATION_CHANGE_EVENT, { 
      detail: settings 
    }));
    
    // Aplicar as configurações imediatamente
    applyLocalizationSettings(settings);
    
    toast({
      title: getTranslation('settingsSaved', settings.language),
      description: getTranslation('localizationUpdated', settings.language),
      variant: "success",
    });
  } catch (error) {
    console.error("Erro ao salvar configurações de localização:", error);
    toast({
      title: getTranslation('errorSaving', settings.language),
      description: String(error),
      variant: "destructive",
    });
  }
}

// Formatador de números baseado nas configurações
export function formatNumber(value: number, options: Intl.NumberFormatOptions = {}): string {
  const settings = getLocalizationSettings();
  
  try {
    return new Intl.NumberFormat(settings.numberFormat, options).format(value);
  } catch (error) {
    console.error("Erro ao formatar número:", error);
    return value.toString();
  }
}

// Formatador de moeda baseado nas configurações
export function formatCurrency(value: number): string {
  const settings = getLocalizationSettings();
  
  try {
    return new Intl.NumberFormat(settings.numberFormat, {
      style: 'currency',
      currency: settings.currency
    }).format(value);
  } catch (error) {
    console.error("Erro ao formatar moeda:", error);
    return value.toString();
  }
}

// Formatador de datas baseado nas configurações
export function formatDate(date: Date | string | number): string {
  const settings = getLocalizationSettings();
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    console.error("Data inválida:", date);
    return String(date);
  }

  try {
    // Implementação básica para formatos comuns
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    
    switch (settings.dateFormat) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'DD.MM.YYYY':
        return `${day}.${month}.${year}`;
      case 'DD-MMM-YYYY':
        // Meses abreviados de acordo com o idioma
        return formatDateWithMonthName(dateObj, settings.language);
      default:
        return `${day}/${month}/${year}`;
    }
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return String(date);
  }
}

// Formatar data com nome do mês
function formatDateWithMonthName(date: Date, locale: string): string {
  try {
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const monthName = date.toLocaleString(locale, { month: 'short' });
    
    return `${day}-${monthName}-${year}`;
  } catch (error) {
    // Fallback para formato simples
    return date.toLocaleDateString();
  }
}

// Traduzir texto com base no idioma
const translations: Record<string, Record<string, string>> = {
  'pt-BR': {
    'settingsSaved': 'Configurações salvas',
    'localizationUpdated': 'As configurações de localização foram atualizadas com sucesso.',
    'errorSaving': 'Erro ao salvar',
    'home': 'Início',
    'dashboard': 'Painel',
    'settings': 'Configurações',
    'profile': 'Perfil',
    'logout': 'Sair',
    'sales': 'Vendas',
    'performance': 'Desempenho',
    'reports': 'Relatórios',
    'dataConnectors': 'Conectores de Dados',
    'feedback': 'Feedback',
    'aiInsights': 'Insights de IA',
    'social': 'Social',
    'demographics': 'Demografia',
    // Adicione mais traduções conforme necessário
  },
  'en-US': {
    'settingsSaved': 'Settings saved',
    'localizationUpdated': 'Localization settings have been successfully updated.',
    'errorSaving': 'Error saving',
    'home': 'Home',
    'dashboard': 'Dashboard',
    'settings': 'Settings',
    'profile': 'Profile',
    'logout': 'Logout',
    'sales': 'Sales',
    'performance': 'Performance',
    'reports': 'Reports',
    'dataConnectors': 'Data Connectors',
    'feedback': 'Feedback',
    'aiInsights': 'AI Insights',
    'social': 'Social',
    'demographics': 'Demographics',
    // Add more translations as needed
  },
  'es-ES': {
    'settingsSaved': 'Configuración guardada',
    'localizationUpdated': 'La configuración de localización se ha actualizado correctamente.',
    'errorSaving': 'Error al guardar',
    'home': 'Inicio',
    'dashboard': 'Panel',
    'settings': 'Configuración',
    'profile': 'Perfil',
    'logout': 'Cerrar sesión',
    'sales': 'Ventas',
    'performance': 'Rendimiento',
    'reports': 'Informes',
    'dataConnectors': 'Conectores de datos',
    'feedback': 'Comentarios',
    'aiInsights': 'Ideas de IA',
    'social': 'Social',
    'demographics': 'Demografía',
    // Añadir más traducciones según sea necesario
  },
};

// Função para obter texto traduzido
export function getTranslation(key: string, locale: string = 'pt-BR'): string {
  const fallbackLocale = 'pt-BR';
  
  // Se o idioma solicitado não existe, usar o fallback
  if (!translations[locale]) {
    locale = fallbackLocale;
  }
  
  // Se a chave não existe no idioma, tentar no fallback
  if (!translations[locale][key] && locale !== fallbackLocale) {
    return translations[fallbackLocale][key] || key;
  }
  
  return translations[locale][key] || key;
}

// Aplicar configurações de localização em todo o sistema
export function applyLocalizationSettings(settings?: LocalizationSettings): void {
  const currentSettings = settings || getLocalizationSettings();
  
  // Definir idioma do documento
  document.documentElement.lang = currentSettings.language.split('-')[0];
  
  // Aplicar o tema no data attribute para ser usado no CSS
  document.documentElement.setAttribute('data-locale', currentSettings.language);
  document.documentElement.setAttribute('data-number-format', currentSettings.numberFormat);
  document.documentElement.setAttribute('data-date-format', currentSettings.dateFormat);
  document.documentElement.setAttribute('data-measurement', currentSettings.measurementUnit);
  document.documentElement.setAttribute('data-first-day', currentSettings.firstDayOfWeek);
  
  // Configurar o título da página de acordo com o idioma
  updatePageTitle(currentSettings.language);
  
  console.log("Configurações de localização aplicadas:", currentSettings);
}

// Atualizar título da página com base no idioma
function updatePageTitle(locale: string): void {
  const siteName = "SightX";
  const pageTitle = document.title.includes('|') 
    ? document.title.split('|')[0].trim()
    : document.title;
  
  let suffix = "";
  
  switch(locale.split('-')[0]) {
    case 'pt':
      suffix = "Transforme Dados em Decisões Inteligentes";
      break;
    case 'en':
      suffix = "Transform Data into Smart Decisions";
      break;
    case 'es':
      suffix = "Transforme Datos en Decisiones Inteligentes";
      break;
    default:
      suffix = "Transforme Dados em Decisões Inteligentes";
  }
  
  document.title = `${pageTitle} | ${siteName} - ${suffix}`;
}

// Inicializar configurações de localização
export function initializeLocalization(): void {
  const settings = getLocalizationSettings();
  applyLocalizationSettings(settings);
  
  // Adicionar listeners para mudanças de configuração
  window.addEventListener('storage', (event) => {
    if (event.key === 'localizationSettings') {
      try {
        const newSettings = JSON.parse(event.newValue || '');
        applyLocalizationSettings(newSettings);
      } catch (error) {
        console.error("Erro ao processar mudança de configurações:", error);
      }
    }
  });
  
  // Adicionar listener para o evento personalizado
  window.addEventListener(LOCALIZATION_CHANGE_EVENT, ((event: CustomEvent<LocalizationSettings>) => {
    applyLocalizationSettings(event.detail);
  }) as EventListener);
}
