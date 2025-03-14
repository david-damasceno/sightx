// Utilitários para formatação baseada nas configurações de localização do usuário
import { toast } from "@/hooks/use-toast";
import DOMPurify from 'dompurify';

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

// Lista de idiomas válidos
const VALID_LANGUAGES = ['pt-BR', 'en-US', 'es-ES'];
const VALID_DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD.MM.YYYY', 'DD-MMM-YYYY'];
const VALID_NUMBER_FORMATS = ['pt-BR', 'en-US', 'es-ES'];
const VALID_CURRENCIES = ['BRL', 'USD', 'EUR'];
const VALID_TIMEZONES = ['America/Sao_Paulo', 'America/New_York', 'Europe/Madrid', 'UTC'];
const VALID_FIRST_DAYS = ['monday', 'sunday'];
const VALID_MEASUREMENT_UNITS = ['metric', 'imperial'];

// Evento personalizado para alterações de localização
export const LOCALIZATION_CHANGE_EVENT = 'localization-settings-changed';

// Função de validação de configurações
function validateSettings(settings: Partial<LocalizationSettings>): boolean {
  // Validar idioma
  if (settings.language && !VALID_LANGUAGES.includes(settings.language)) {
    console.error('Idioma inválido:', settings.language);
    return false;
  }
  
  // Validar formato de data
  if (settings.dateFormat && !VALID_DATE_FORMATS.includes(settings.dateFormat)) {
    console.error('Formato de data inválido:', settings.dateFormat);
    return false;
  }
  
  // Validar formato de número
  if (settings.numberFormat && !VALID_NUMBER_FORMATS.includes(settings.numberFormat)) {
    console.error('Formato de número inválido:', settings.numberFormat);
    return false;
  }
  
  // Validar moeda
  if (settings.currency && !VALID_CURRENCIES.includes(settings.currency)) {
    console.error('Moeda inválida:', settings.currency);
    return false;
  }
  
  // Validar fuso horário
  if (settings.timezone && !VALID_TIMEZONES.includes(settings.timezone)) {
    console.error('Fuso horário inválido:', settings.timezone);
    return false;
  }
  
  // Validar primeiro dia da semana
  if (settings.firstDayOfWeek && !VALID_FIRST_DAYS.includes(settings.firstDayOfWeek)) {
    console.error('Primeiro dia da semana inválido:', settings.firstDayOfWeek);
    return false;
  }
  
  // Validar unidade de medida
  if (settings.measurementUnit && !VALID_MEASUREMENT_UNITS.includes(settings.measurementUnit)) {
    console.error('Unidade de medida inválida:', settings.measurementUnit);
    return false;
  }
  
  return true;
}

// Carregar configurações de localização salvas
export function getLocalizationSettings(): LocalizationSettings {
  try {
    const savedSettings = localStorage.getItem("localizationSettings");
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      
      // Validar configurações recuperadas
      if (validateSettings(parsedSettings)) {
        return parsedSettings;
      } else {
        console.warn('Configurações recuperadas são inválidas, usando valores padrão');
      }
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
    // Validar configurações antes de salvar
    if (!validateSettings(settings)) {
      throw new Error('Configurações inválidas');
    }
    
    localStorage.setItem("localizationSettings", JSON.stringify(settings));
    
    // Disparar evento para notificar sobre a mudança
    window.dispatchEvent(new CustomEvent(LOCALIZATION_CHANGE_EVENT, { 
      detail: settings 
    }));
    
    // Aplicar as configurações imediatamente
    applyLocalizationSettings(settings);
    
    toast.toast({
      title: getTranslation('settingsSaved', settings.language),
      description: getTranslation('localizationUpdated', settings.language),
      variant: "success",
    });
  } catch (error) {
    console.error("Erro ao salvar configurações de localização:", error);
    toast.toast({
      title: getTranslation('errorSaving', settings.language),
      description: String(error),
      variant: "destructive",
    });
  }
}

// Formatador de números baseado nas configurações
export function formatNumber(value: number, options: Intl.NumberFormatOptions = {}): string {
  const settings = getLocalizationSettings();
  
  // Verificar se o valor é um número válido
  if (typeof value !== 'number' || isNaN(value)) {
    console.error("Valor inválido para formatação de número:", value);
    return String(value);
  }
  
  try {
    return new Intl.NumberFormat(settings.numberFormat, options).format(value);
  } catch (error) {
    console.error("Erro ao formatar número:", error);
    return String(value);
  }
}

// Formatador de moeda baseado nas configurações
export function formatCurrency(value: number): string {
  const settings = getLocalizationSettings();
  
  // Verificar se o valor é um número válido
  if (typeof value !== 'number' || isNaN(value)) {
    console.error("Valor inválido para formatação de moeda:", value);
    return String(value);
  }
  
  try {
    return new Intl.NumberFormat(settings.numberFormat, {
      style: 'currency',
      currency: settings.currency
    }).format(value);
  } catch (error) {
    console.error("Erro ao formatar moeda:", error);
    return String(value);
  }
}

// Formatador de datas baseado nas configurações
export function formatDate(date: Date | string | number): string {
  const settings = getLocalizationSettings();
  
  // Validar data
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
  // Sanitizar parâmetros
  if (typeof key !== 'string') {
    console.error('Chave de tradução inválida:', key);
    return '';
  }
  
  const sanitizedKey = key.trim();
  if (sanitizedKey.length === 0) {
    return '';
  }
  
  // Verificar se o idioma é válido
  if (!VALID_LANGUAGES.includes(locale)) {
    locale = 'pt-BR'; // Fallback seguro
  }
  
  const fallbackLocale = 'pt-BR';
  
  // Se o idioma solicitado não existe, usar o fallback
  if (!translations[locale]) {
    locale = fallbackLocale;
  }
  
  // Se a chave não existe no idioma, tentar no fallback
  if (!translations[locale][sanitizedKey] && locale !== fallbackLocale) {
    return translations[fallbackLocale][sanitizedKey] || sanitizedKey;
  }
  
  return translations[locale][sanitizedKey] || sanitizedKey;
}

// Aplicar configurações de localização em todo o sistema
export function applyLocalizationSettings(settings?: LocalizationSettings): void {
  const currentSettings = settings || getLocalizationSettings();
  
  // Verificar se as configurações são válidas
  if (!validateSettings(currentSettings)) {
    console.error('Configurações inválidas, não aplicando');
    return;
  }
  
  // Definir idioma do documento com sanitização
  const lang = currentSettings.language.split('-')[0];
  if (['pt', 'en', 'es'].includes(lang)) {
    document.documentElement.lang = lang;
  } else {
    document.documentElement.lang = 'pt'; // Fallback
  }
  
  // Aplicar o tema no data attribute para ser usado no CSS
  const safeLanguage = DOMPurify.sanitize(currentSettings.language);
  const safeNumberFormat = DOMPurify.sanitize(currentSettings.numberFormat);
  const safeDateFormat = DOMPurify.sanitize(currentSettings.dateFormat);
  const safeMeasurement = DOMPurify.sanitize(currentSettings.measurementUnit);
  const safeFirstDay = DOMPurify.sanitize(currentSettings.firstDayOfWeek);
  
  document.documentElement.setAttribute('data-locale', safeLanguage);
  document.documentElement.setAttribute('data-number-format', safeNumberFormat);
  document.documentElement.setAttribute('data-date-format', safeDateFormat);
  document.documentElement.setAttribute('data-measurement', safeMeasurement);
  document.documentElement.setAttribute('data-first-day', safeFirstDay);
  
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
  
  // Verificar se o idioma é válido
  const lang = locale.split('-')[0];
  if (!['pt', 'en', 'es'].includes(lang)) {
    locale = 'pt-BR'; // Fallback seguro
  }
  
  switch(lang) {
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
  
  // Sanitizar antes de definir
  const safeSiteName = DOMPurify.sanitize(siteName);
  const safePageTitle = DOMPurify.sanitize(pageTitle);
  const safeSuffix = DOMPurify.sanitize(suffix);
  
  document.title = `${safePageTitle} | ${safeSiteName} - ${safeSuffix}`;
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
        // Validar configurações antes de aplicar
        if (validateSettings(newSettings)) {
          applyLocalizationSettings(newSettings);
        }
      } catch (error) {
        console.error("Erro ao processar mudança de configurações:", error);
      }
    }
  });
  
  // Adicionar listener para o evento personalizado
  window.addEventListener(LOCALIZATION_CHANGE_EVENT, ((event: CustomEvent<LocalizationSettings>) => {
    // Validar configurações antes de aplicar
    if (validateSettings(event.detail)) {
      applyLocalizationSettings(event.detail);
    }
  }) as EventListener);
}
