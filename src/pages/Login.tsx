import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

export default function Login() {
  const navigate = useNavigate()

  useEffect(() => {
    // Verificar se o usuário já está autenticado
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/")
      }
    })
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8 bg-white/80 backdrop-blur-sm rounded-lg shadow-xl animate-fade-in">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">IntelliBiz</h2>
          <p className="mt-2 text-sm text-gray-600">
            Faça login para acessar seu painel
          </p>
        </div>

        <div className="mt-8">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#2563eb',
                    brandAccent: '#1d4ed8',
                  },
                  borderRadii: {
                    borderRadiusButton: '0.5rem',
                    inputBorderRadius: '0.5rem',
                  },
                },
              },
              className: {
                container: 'w-full',
                button: 'w-full px-4 py-2 text-white rounded-lg hover:bg-opacity-90',
                input: 'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500',
              },
            }}
            providers={["google", "github"]}
            redirectTo={window.location.origin}
            localization={{
              variables: {
                sign_in: {
                  email_label: "Email",
                  password_label: "Senha",
                  button_label: "Entrar",
                  loading_button_label: "Entrando...",
                  social_provider_text: "Continuar com {{provider}}",
                  link_text: "Já tem uma conta? Entre",
                },
                sign_up: {
                  email_label: "Email",
                  password_label: "Senha",
                  button_label: "Criar conta",
                  loading_button_label: "Criando conta...",
                  social_provider_text: "Criar conta com {{provider}}",
                  link_text: "Não tem uma conta? Cadastre-se",
                },
              },
            }}
          />
        </div>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Ao continuar, você concorda com nossos{" "}
            <a href="#" className="text-blue-600 hover:text-blue-800">
              Termos de Serviço
            </a>{" "}
            e{" "}
            <a href="#" className="text-blue-600 hover:text-blue-800">
              Política de Privacidade
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}