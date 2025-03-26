
import React, { useState, useEffect } from "react"

const MOBILE_BREAKPOINT = 768

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Verificar se a página está sendo carregada em um ambiente de cliente
    if (typeof window !== 'undefined') {
      // Definir o estado inicial imediatamente
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
      
      const handleResize = () => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
      }
      
      // Adicionar evento de redimensionamento
      window.addEventListener("resize", handleResize)
      
      // Limpar o evento quando o componente for desmontado
      return () => {
        window.removeEventListener("resize", handleResize)
      }
    }
  }, [])

  return isMobile
}

// Também exportamos a função com o nome original para manter compatibilidade
export const useIsMobile = useMobile
