
import React from 'react';
import { useLocalization } from '@/hooks/use-localization';
import DOMPurify from 'dompurify';

interface TranslateProps {
  text: string;
  children?: React.ReactNode;
  // Opção para permitir conteúdo HTML (desativada por padrão)
  allowHtml?: boolean;
  // Permitir substituições de marcadores
  substitutions?: Record<string, string | number>;
}

/**
 * Componente para traduzir textos baseado nas configurações de idioma
 */
export function Translate({ text, children, allowHtml = false, substitutions }: TranslateProps) {
  const { t } = useLocalization();
  
  // Sanitizar a chave de tradução
  const safeKey = typeof text === 'string' ? text.trim() : '';
  
  if (!safeKey) {
    console.error('Chave de tradução inválida:', text);
    return null;
  }
  
  // Obter texto traduzido
  let translatedText = t(safeKey);
  
  // Aplicar substituições se fornecidas
  if (substitutions && typeof substitutions === 'object') {
    Object.entries(substitutions).forEach(([key, value]) => {
      // Sanitizar as chaves e valores
      const safeKey = DOMPurify.sanitize(key);
      const safeValue = DOMPurify.sanitize(String(value));
      
      // Substituir marcadores no padrão {{chave}}
      const regex = new RegExp(`{{${safeKey}}}`, 'g');
      translatedText = translatedText.replace(regex, safeValue);
    });
  }
  
  // Sanitizar o HTML se não for permitido
  const outputText = allowHtml 
    ? DOMPurify.sanitize(translatedText, { 
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span', 'br'], 
        ALLOWED_ATTR: ['class'] 
      }) 
    : translatedText;
  
  if (children) {
    return <>{outputText}</>;
  }
  
  return allowHtml 
    ? <span dangerouslySetInnerHTML={{ __html: outputText }} /> 
    : <>{outputText}</>;
}

/**
 * Componente wrapper que traduz todos os textos filhos
 * com contexto de tradução
 */
export function TranslateProvider({ 
  children, 
  prefix = '', 
  context = {} 
}: { 
  children: React.ReactNode;
  prefix?: string;
  context?: Record<string, string | number>;
}) {
  // Verificar se os parâmetros são válidos
  if (typeof prefix !== 'string' || typeof context !== 'object') {
    console.error('Parâmetros inválidos para TranslateProvider');
    return <>{children}</>;
  }
  
  return (
    <div className="translation-context" data-prefix={DOMPurify.sanitize(prefix)}>
      {children}
    </div>
  );
}
