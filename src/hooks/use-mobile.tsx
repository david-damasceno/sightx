
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
    
    // Função para manipular o redimensionamento com debounce
    let timeoutId: ReturnType<typeof setTimeout>
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setIsMobile(checkMobile())
      }, 100) // Pequeno debounce para melhorar performance
    }
    
    // Adicionar evento de redimensionamento
    window.addEventListener("resize", handleResize)
    
    // Limpar o evento e timeout quando o componente for desmontado
    return () => {
      window.removeEventListener("resize", handleResize)
      clearTimeout(timeoutId)
    }
  }, [])

  return isMobile
}

// Também exportamos a função com o nome original para manter compatibilidade
export const useIsMobile = useMobile
