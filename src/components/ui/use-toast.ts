
import * as React from "react"

import { ToastVariants } from "./toast-variants";

interface ToastProps {
  variant?: ToastVariants;
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactElement
  duration?: number
}

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 1000000

type ActionType = {
  addToast: (toast: ToastProps) => void
  updateToast: (id: string, toast: Partial<ToastProps>) => void
  dismissToast: (toastId?: string) => void
  toasts: ToastProps[]
}

const context = React.createContext<ActionType | null>(null)

type ProviderProps = {
  children: React.ReactNode
}

function ToastProvider({ children }: ProviderProps) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const handleAddToast = React.useCallback(
    (toast: ToastProps) => {
      setToasts((t) => [toast, ...t].slice(0, TOAST_LIMIT))
    },
    [setToasts]
  )

  const handleUpdateToast = React.useCallback(
    (id: string, props: Partial<ToastProps>) => {
      setToasts((t) =>
        t.map((toast) => (toast.title === id ? { ...toast, ...props } : toast))
      )
    },
    [setToasts]
  )

  const handleDismissToast = React.useCallback(
    (toastId?: string) => {
      setToasts((t) => {
        if (toastId) {
          return t.filter((toast) => toast.title !== toastId)
        }
        return t.slice(1)
      })
    },
    [setToasts]
  )

  const value = React.useMemo(
    () => ({
      addToast: handleAddToast,
      updateToast: handleUpdateToast,
      dismissToast: handleDismissToast,
      toasts,
    }),
    [handleAddToast, handleUpdateToast, handleDismissToast, toasts]
  )

  return React.createElement(context.Provider, { value }, children)
}

function useToast() {
  const toast = React.useContext(context)

  if (!toast) {
    throw new Error("useToast must be used within a ToastProvider.")
  }

  const addToast = (props: ToastProps) => {
    const id = props.title 
      ? (typeof props.title === "string" 
          ? props.title 
          : String(props.title)) 
      : "toast-" + Date.now();

    toast.addToast({
      ...props,
      title: id,
    })

    setTimeout(() => toast.dismissToast(id), props.duration || TOAST_REMOVE_DELAY)
  }

  return {
    ...toast,
    addToast,
  }
}

export { ToastProvider, useToast }
export type { ToastProps }
