
import { useToast as useToastInternal } from "@/components/ui/use-toast"
import { ToastProps } from "@/components/ui/use-toast"

export const useToast = () => {
  const internalToast = useToastInternal();
  
  return {
    ...internalToast,
    // Adicionamos 'toast' como alias para 'addToast' para compatibilidade
    toast: internalToast.addToast
  };
}

// Criar um objeto toast que pode ser usado sem hooks
export const toast = {
  // Esta função permite uso sem hooks em contextos não-React
  // como utilitários e serviços
  toast: (props: Parameters<ReturnType<typeof useToastInternal>['addToast']>[0]) => {
    // Isso captura a chamada para uso posterior quando o componente Toaster for montado
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('toast', { detail: props });
      window.dispatchEvent(event);
    }
  }
}
