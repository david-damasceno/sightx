import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"

export default function IntegrationsCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const error = searchParams.get('error')

      if (error) {
        console.error('OAuth error:', error)
        toast({
          title: "Erro na integração",
          description: "Não foi possível completar a integração.",
          variant: "destructive"
        })
        navigate('/settings/integrations')
        return
      }

      if (!code || !state) {
        toast({
          title: "Erro na integração",
          description: "Parâmetros inválidos.",
          variant: "destructive"
        })
        navigate('/settings/integrations')
        return
      }

      try {
        // Chamar a Edge Function para trocar o código por tokens
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-business-oauth`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ code, state }),
          }
        )

        if (!response.ok) {
          throw new Error('Failed to exchange code for tokens')
        }

        toast({
          title: "Sucesso",
          description: "Integração concluída com sucesso!",
        })
      } catch (error) {
        console.error('Error completing integration:', error)
        toast({
          title: "Erro",
          description: "Não foi possível completar a integração.",
          variant: "destructive"
        })
      }

      navigate('/settings/integrations')
    }

    handleCallback()
  }, [searchParams, navigate, toast])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Completando integração...</h1>
        <p className="text-muted-foreground">Por favor, aguarde enquanto finalizamos a configuração.</p>
      </div>
    </div>
  )
}