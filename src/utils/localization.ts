
// Utilitários para formatação baseada nas configurações de localização do usuário

interface LocalizationSettings {
  language: string;
  dateFormat: string;
  numberFormat: string;
  currency: string;
  timezone: string;
  useAutoTimezone: boolean;
  firstDayOfWeek: string;
  measurementUnit: string;
}

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
        // Simplificado, não traduzido
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                          'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return `${day}-${monthNames[dateObj.getMonth()]}-${year}`;
      default:
        return `${day}/${month}/${year}`;
    }
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return String(date);
  }
}

// Aplicar configurações de localização em todo o sistema
export function applyLocalizationSettings(): void {
  const settings = getLocalizationSettings();
  
  // Definir idioma do documento
  document.documentElement.lang = settings.language.split('-')[0];
  
  // Aplicar o tema no data attribute para ser usado no CSS
  document.documentElement.setAttribute('data-locale', settings.language);
  document.documentElement.setAttribute('data-number-format', settings.numberFormat);
  document.documentElement.setAttribute('data-date-format', settings.dateFormat);
  
  // Pode ser expandido para aplicar mais configurações conforme necessário
  console.log("Configurações de localização aplicadas:", settings);
}

// Inicializar configurações de localização
export function initializeLocalization(): void {
  applyLocalizationSettings();
  
  // Pode adicionar listeners para mudanças de configuração, etc.
  window.addEventListener('storage', (event) => {
    if (event.key === 'localizationSettings') {
      applyLocalizationSettings();
    }
  });
}
