import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { Building2, BarChart2, PieChart, TrendingUp, Eye } from "lucide-react"

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
    <div className="flex min-h-screen">
      {/* Left Side - Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-12 flex-col justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-12">
            <Building2 className="h-10 w-10" />
            <h1 className="text-4xl font-bold">SightX</h1>
          </div>
          
          <div className="space-y-8">
            <h2 className="text-3xl font-bold mb-8">
              Transforme seus dados em insights valiosos
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <BarChart2 className="h-6 w-6 mt-1" />
                <div>
                  <h3 className="font-semibold text-xl mb-2">Análise Avançada</h3>
                  <p className="text-white/80">
                    Visualize e analise seus dados de forma intuitiva com dashboards personalizados
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <PieChart className="h-6 w-6 mt-1" />
                <div>
                  <h3 className="font-semibold text-xl mb-2">Insights Inteligentes</h3>
                  <p className="text-white/80">
                    Descubra padrões e tendências com nossa análise preditiva
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <TrendingUp className="h-6 w-6 mt-1" />
                <div>
                  <h3 className="font-semibold text-xl mb-2">Tomada de Decisão</h3>
                  <p className="text-white/80">
                    Tome decisões baseadas em dados com confiança e precisão
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Eye className="h-6 w-6 mt-1" />
                <div>
                  <h3 className="font-semibold text-xl mb-2">Visão Clara</h3>
                  <p className="text-white/80">
                    Obtenha uma visão completa do seu negócio em tempo real
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-white/60">
          © 2024 SightX. Todos os direitos reservados.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-6">
            <div className="lg:hidden flex items-center justify-center space-x-2 mb-8">
              <Building2 className="h-8 w-8 text-blue-600" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
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
          />
        </div>
      </div>
    </div>
  )
}