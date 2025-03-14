
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { useEffect } from "react"

export function Toaster() {
  const { toasts, addToast } = useToast()

  // Capturar eventos toast globais
  useEffect(() => {
    const handleToast = (event: CustomEvent) => {
      addToast(event.detail);
    };

    window.addEventListener('toast' as any, handleToast as EventListener);
    
    return () => {
      window.removeEventListener('toast' as any, handleToast as EventListener);
    };
  }, [addToast]);

  return (
    <ToastProvider>
      {toasts.map(function ({ title, description, action, ...props }) {
        return (
          <Toast key={String(title)} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
