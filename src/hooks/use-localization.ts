
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

// Hook para acessar e gerenciar as configurações de localização
export function useLocalization() {
  const [settings, setSettings] = useState<LocalizationSettings>(getLocalizationSettings());
  
  // Atualizar as configurações quando elas mudarem
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'localizationSettings' && event.newValue) {
        try {
          setSettings(JSON.parse(event.newValue));
        } catch (e) {
          console.error('Erro ao processar novas configurações:', e);
        }
      }
    };
    
    const handleLocalizationChange = (event: CustomEvent<LocalizationSettings>) => {
      setSettings(event.detail);
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
  
  // Função para atualizar as configurações
  const updateSettings = useCallback((newSettings: Partial<LocalizationSettings>) => {
    const updatedSettings = {
      ...settings,
      ...newSettings
    };
    
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
