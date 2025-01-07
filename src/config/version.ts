export const APP_VERSION = {
  major: 1, // Mudanças grandes que podem quebrar compatibilidade
  minor: 0, // Novas funcionalidades com compatibilidade mantida
  patch: 0, // Correções de bugs e pequenos ajustes
  toString: () => `${APP_VERSION.major}.${APP_VERSION.minor}.${APP_VERSION.patch}`,
};

// Histórico de mudanças principais
export const VERSION_HISTORY = [
  {
    version: '1.0.0',
    date: '2024-03-21',
    changes: [
      'Implementação inicial do dashboard',
      'Sistema de métricas e gráficos',
      'Painel de insights',
    ]
  }
];