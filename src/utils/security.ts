import DOMPurify from 'dompurify';

/**
 * Utilitário de segurança para sanitização e validação de dados
 */
export const security = {
  /**
   * Sanitiza uma string HTML para prevenir XSS
   * @param html String HTML a ser sanitizada
   * @param options Opções adicionais para a sanitização
   * @returns String HTML sanitizada
   */
  sanitizeHtml: (html: string, options?: DOMPurify.Config): string => {
    return DOMPurify.sanitize(html, options) as string;
  },

  /**
   * Sanitiza valores de entrada do usuário
   * @param input Valor de entrada a ser sanitizado
   * @returns Valor sanitizado
   */
  sanitizeInput: (input: string): string => {
    // Remove tags HTML e caracteres potencialmente perigosos
    return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }) as string;
  },

  /**
   * Escapa uma string para uso seguro em consultas SQL
   * @param value Valor a ser escapado
   * @returns Valor escapado
   */
  escapeSql: (value: string): string => {
    if (!value) return '';
    // Escape básico de caracteres problemáticos em SQL
    return value.replace(/['";\\]/g, '\\$&');
  },

  /**
   * Valida um endereço de e-mail
   * @param email Endereço de e-mail a ser validado
   * @returns true se o e-mail for válido, false caso contrário
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Valida um UUID
   * @param uuid UUID a ser validado
   * @returns true se o UUID for válido, false caso contrário
   */
  isValidUuid: (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  /**
   * Substitui parâmetros em uma string com valores sanitizados
   * @param template String de template
   * @param params Parâmetros a serem substituídos
   * @returns String formatada com valores sanitizados
   */
  formatSafe: (template: string, params: Record<string, string | number>): string => {
    return Object.entries(params).reduce((result, [key, value]) => {
      const safeValue = DOMPurify.sanitize(String(value), { ALLOWED_TAGS: [] }) as string;
      return result.replace(new RegExp(`{${key}}`, 'g'), safeValue);
    }, template);
  }
};

/**
 * Classe para tratar segurança no lado do cliente
 */
export class ClientSecurity {
  /**
   * Gera um token CSRF para proteger contra ataques CSRF
   * @returns Token CSRF gerado
   */
  static generateCsrfToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Armazena um token CSRF no armazenamento local
   * @param token Token CSRF a ser armazenado
   */
  static storeCsrfToken(token: string): void {
    sessionStorage.setItem('csrf_token', token);
  }

  /**
   * Recupera o token CSRF do armazenamento local
   * @returns Token CSRF armazenado
   */
  static getCsrfToken(): string | null {
    return sessionStorage.getItem('csrf_token');
  }

  /**
   * Verifica se uma senha atende aos requisitos mínimos de segurança
   * @param password Senha a ser verificada
   * @returns true se a senha for segura, false caso contrário
   */
  static isSecurePassword(password: string): boolean {
    // Pelo menos 8 caracteres, 1 letra maiúscula, 1 letra minúscula, 1 número e 1 caractere especial
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  /**
   * Verifica a força de uma senha e retorna uma pontuação de 0 a 100
   * @param password Senha a ser verificada
   * @returns Pontuação de força da senha (0-100)
   */
  static getPasswordStrength(password: string): number {
    if (!password) return 0;
    
    let score = 0;
    // Comprimento
    score += Math.min(password.length * 2, 20);
    // Caracteres especiais
    score += (password.match(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/g) || []).length * 5;
    // Números
    score += (password.match(/[0-9]/g) || []).length * 3;
    // Letras maiúsculas
    score += (password.match(/[A-Z]/g) || []).length * 4;
    // Letras minúsculas
    score += (password.match(/[a-z]/g) || []).length * 2;
    
    return Math.min(score, 100);
  }
}

export default security;
