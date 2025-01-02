import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { Building2 } from "lucide-react"

export default function Login() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/")
      }
    })
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md space-y-8 p-10 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl animate-fade-in">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              IntelliBiz
            </h2>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold text-gray-900">
              Bem-vindo de volta
            </h3>
            <p className="text-sm text-gray-600">
              Faça login para acessar seu painel de controle
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Continue com
            </span>
          </div>
        </div>

        <div className="mt-8">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#3b82f6',
                    brandAccent: '#2563eb',
                    inputBackground: 'white',
                    inputText: '#1f2937',
                    inputPlaceholder: '#9ca3af',
                    messageText: '#374151',
                    anchorTextColor: '#2563eb',
                    dividerBackground: '#e5e7eb',
                  },
                  radii: {
                    buttonBorderRadius: '0.75rem',
                    inputBorderRadius: '0.75rem',
                  },
                  space: {
                    inputPadding: '1rem',
                    buttonPadding: '1rem',
                  },
                  fonts: {
                    bodyFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
                    buttonFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
                  },
                  fontSizes: {
                    baseButtonSize: '0.875rem',
                    baseInputSize: '0.875rem',
                  },
                },
              },
              className: {
                container: 'space-y-4',
                button: 'w-full px-4 py-3 text-white font-medium rounded-lg shadow-sm hover:opacity-90 transition-opacity duration-200',
                input: 'w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200',
                label: 'block text-sm font-medium text-gray-700 mb-1',
                message: 'text-sm text-gray-600 mt-1',
                anchor: 'text-blue-600 hover:text-blue-700 font-medium',
                divider: 'my-6',
                socialButtonsBlockButton: 'text-black !important', // Força a cor preta nos botões sociais
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

        <div className="mt-6 text-center text-xs text-gray-600">
          <p>
            Ao continuar, você concorda com nossos{" "}
            <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">
              Termos de Serviço
            </a>{" "}
            e{" "}
            <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">
              Política de Privacidade
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}