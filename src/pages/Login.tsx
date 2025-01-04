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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo e Título */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-2">
            <Building2 className="h-12 w-12 text-blue-600" />
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              SightX
            </h2>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold text-gray-900">
              Bem-vindo de volta
            </h3>
            <p className="text-sm text-gray-600">
              Faça login para acessar seu painel
            </p>
          </div>
        </div>

        {/* Card do Formulário de Login */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 space-y-6 border border-gray-100">
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
                    inputText: '#1f2937',
                    inputPlaceholder: '#9ca3af',
                    messageText: '#374151',
                    anchorTextColor: '#4F46E5',
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
                button: 'w-full px-4 py-3 text-white font-medium bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5',
                input: 'w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md',
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
                },
              },
            }}
            view="sign_in"
            providers={[]}
          />
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            © 2024 SightX. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}