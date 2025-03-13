
// Estendendo os tipos de toast para incluir as variantes personalizadas
export type ToastVariants = "default" | "destructive" | "success" | "warning" | "info";

// Definições de cores para cada variante de toast
export const toastVariantStyles = {
  default: "border-border bg-background text-foreground",
  destructive:
    "border-destructive bg-destructive/10 text-destructive dark:border-destructive dark:bg-destructive/30",
  success:
    "border-green-600 bg-green-600/10 text-green-600 dark:border-green-600 dark:bg-green-600/30",
  warning:
    "border-yellow-600 bg-yellow-600/10 text-yellow-600 dark:border-yellow-600 dark:bg-yellow-600/30",
  info:
    "border-blue-600 bg-blue-600/10 text-blue-600 dark:border-blue-600 dark:bg-blue-600/30",
};
