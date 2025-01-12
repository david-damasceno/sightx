import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

export default function Login() {
  const navigate = useNavigate()

  useEffect(() => {
    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate("/")
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      navigate("/")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md space-y-4 p-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl animate-fade-in">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <img 
              src="/lovable-uploads/800dc37c-395b-470c-814b-1014271e967e.png" 
              alt="SightX Logo" 
              className="h-14 w-14"
            />
            <h2 className="text-4xl font-bold text-gray-900">
              SightX
            </h2>
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-gray-900">
              Bem-vindo
            </h3>
            <p className="text-sm text-gray-600">
              Faça login para acessar seu painel de controle
            </p>
          </div>
        </div>

        <div className="mt-4">
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
                    inputPadding: '0.75rem',
                    buttonPadding: '0.75rem',
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
                container: 'space-y-3',
                button: 'w-full px-4 py-2.5 text-black font-medium rounded-lg shadow-sm hover:opacity-90 transition-opacity duration-200',
                input: 'w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200',
                label: 'block text-sm font-medium text-gray-700 mb-1',
                message: 'text-sm text-gray-600 mt-1',
                anchor: 'text-blue-600 hover:text-blue-700 font-medium',
                divider: 'my-4',
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
                sign_up: {
                  email_label: "Email",
                  password_label: "Senha",
                  button_label: "Criar conta",
                  loading_button_label: "Criando conta...",
                },
              },
            }}
            view="sign_in"
            providers={[]}
            socialLayout="horizontal"
          />
        </div>
      </div>
    </div>
  )
}