
import { useState, useEffect } from "react"

const MOBILE_BREAKPOINT = 768

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Função para verificar se a largura da tela é de um dispositivo móvel
    const checkMobile = () => {
      return typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT
    }

    // Definir o estado inicial
    setIsMobile(checkMobile())
    
    const handleResize = () => {
      setIsMobile(checkMobile())
    }
    
    // Adicionar evento de redimensionamento
    window.addEventListener("resize", handleResize)
    
    // Limpar o evento quando o componente for desmontado
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return isMobile
}

// Também exportamos a função com o nome original para manter compatibilidade
export const useIsMobile = useMobile
