
import React from 'react';
import { useLocalization } from '@/hooks/use-localization';

interface TranslateProps {
  text: string;
  children?: React.ReactNode;
}

/**
 * Componente para traduzir textos baseado nas configurações de idioma
 */
export function Translate({ text, children }: TranslateProps) {
  const { t } = useLocalization();
  
  if (children) {
    return <>{t(text)}</>;
  }
  
  return t(text);
}

/**
 * Componente wrapper que traduz todos os textos filhos
 */
export function TranslateProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
