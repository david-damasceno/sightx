
import { useState, useEffect, useCallback } from 'react';
import { 
  getLocalizationSettings, 
  saveLocalizationSettings, 
  formatDate, 
  formatNumber, 
  formatCurrency, 
  getTranslation,
  LocalizationSettings,
  LOCALIZATION_CHANGE_EVENT
} from '@/utils/localization';

/**
 * Hook personalizado para acessar e gerenciar as configurações de localização
 * @returns Objeto com configurações e funções de formatação
 */
export function useLocalization() {
  const [settings, setSettings] = useState<LocalizationSettings>(getLocalizationSettings());
  
  // Atualizar as configurações quando elas mudarem
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'localizationSettings' && event.newValue) {
        try {
          // Sanitizar dados antes de processar
          const parsedSettings = JSON.parse(event.newValue);
          // Validação básica das configurações recebidas
          if (typeof parsedSettings === 'object' && parsedSettings !== null) {
            setSettings(parsedSettings);
          }
        } catch (e) {
          console.error('Erro ao processar novas configurações:', e);
        }
      }
    };
    
    const handleLocalizationChange = (event: CustomEvent<LocalizationSettings>) => {
      // Validação de segurança dos dados recebidos
      const newSettings = event.detail;
      if (typeof newSettings === 'object' && newSettings !== null) {
        setSettings(newSettings);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(
      LOCALIZATION_CHANGE_EVENT, 
      handleLocalizationChange as EventListener
    );
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(
        LOCALIZATION_CHANGE_EVENT, 
        handleLocalizationChange as EventListener
      );
    };
  }, []);
  
  // Função para atualizar as configurações com validação
  const updateSettings = useCallback((newSettings: Partial<LocalizationSettings>) => {
    // Verificar e validar as novas configurações
    if (typeof newSettings !== 'object' || newSettings === null) {
      console.error('Configurações inválidas recebidas:', newSettings);
      return;
    }
    
    // Construir configurações atualizadas
    const updatedSettings = {
      ...settings,
      ...newSettings
    };
    
    // Verificar valores permitidos
    if (newSettings.language && !['pt-BR', 'en-US', 'es-ES'].includes(newSettings.language)) {
      console.error('Idioma inválido:', newSettings.language);
      return;
    }
    
    saveLocalizationSettings(updatedSettings);
    setSettings(updatedSettings);
  }, [settings]);
  
  // Funções de formatação com base nas configurações atuais
  const formatDateWithSettings = useCallback((date: Date | string | number) => {
    return formatDate(date);
  }, [settings.dateFormat, settings.language]);
  
  const formatNumberWithSettings = useCallback((value: number, options?: Intl.NumberFormatOptions) => {
    return formatNumber(value, options);
  }, [settings.numberFormat]);
  
  const formatCurrencyWithSettings = useCallback((value: number) => {
    return formatCurrency(value);
  }, [settings.numberFormat, settings.currency]);
  
  // Função de tradução utilizando o idioma atual
  const t = useCallback((key: string) => {
    return getTranslation(key, settings.language);
  }, [settings.language]);
  
  return {
    settings,
    updateSettings,
    formatDate: formatDateWithSettings,
    formatNumber: formatNumberWithSettings,
    formatCurrency: formatCurrencyWithSettings,
    t
  };
}
