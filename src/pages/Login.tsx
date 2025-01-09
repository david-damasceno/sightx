import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Lock, Mail } from "lucide-react"

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <Card className="w-full max-w-md p-8 space-y-6 bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl border-0 animate-fade-in">
        <div className="space-y-2 text-center">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 blur-md opacity-75" />
              <div className="relative bg-white rounded-full p-4">
                <Lock className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Bem-vindo de volta
          </h1>
          <p className="text-sm text-gray-500">
            Entre com suas credenciais para acessar sua conta
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Continue com</span>
          </div>
        </div>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#4F46E5',
                  brandAccent: '#4338CA',
                  inputBackground: 'white',
                  inputText: '#1F2937',
                  inputPlaceholder: '#9CA3AF',
                  messageText: '#374151',
                  anchorTextColor: '#4F46E5',
                  dividerBackground: '#E5E7EB',
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
                  bodyFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
                  buttonFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
                },
                fontSizes: {
                  baseButtonSize: '0.875rem',
                  baseInputSize: '0.875rem',
                },
              },
            },
            className: {
              container: 'space-y-4',
              button: 'w-full px-4 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2',
              input: 'w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200',
              label: 'block text-sm font-medium text-gray-700 mb-1',
              message: 'text-sm text-gray-600 mt-1',
              anchor: 'text-indigo-600 hover:text-indigo-700 font-medium',
              divider: 'my-6',
            },
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: "Email",
                password_label: "Senha",
                button_label: "Entrar",
                loading_button_label: "Entrando...",
                social_provider_text: "Entrar com {{provider}}",
                link_text: "Já tem uma conta? Entre",
              },
              sign_up: {
                email_label: "Email",
                password_label: "Senha",
                button_label: "Criar conta",
                loading_button_label: "Criando conta...",
                social_provider_text: "Cadastrar com {{provider}}",
                link_text: "Não tem uma conta? Cadastre-se",
              },
            },
          }}
          view="sign_in"
          providers={[]}
          socialLayout="horizontal"
        />

        <div className="mt-6">
          <p className="text-xs text-center text-gray-500">
            Ao continuar, você concorda com nossos{" "}
            <a href="#" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Termos de Serviço
            </a>{" "}
            e{" "}
            <a href="#" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Política de Privacidade
            </a>
          </p>
        </div>
      </Card>
    </div>
  )
}