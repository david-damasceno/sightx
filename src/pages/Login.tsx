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
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1A1F2C] to-[#2C1A3F] text-white p-12 flex-col justify-between animate-fade-in relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-10" />
        
        <div className="relative">
          <div className="flex items-center space-x-3 mb-12">
            <Building2 className="h-10 w-10 text-blue-400" />
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">SightX</h1>
          </div>
          
          <div className="space-y-8">
            <h2 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
              Transformando Dados em Decisões
            </h2>
            
            <div className="space-y-6">
              <div className="group flex items-start space-x-4 p-4 rounded-lg hover:bg-white/5 transition-all duration-300 cursor-default">
                <BarChart2 className="h-6 w-6 mt-1 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                <div>
                  <h3 className="font-semibold text-xl mb-2 text-blue-200">Análise Avançada</h3>
                  <p className="text-gray-300">
                    Visualize e analise seus dados de forma intuitiva com dashboards personalizados
                  </p>
                </div>
              </div>

              <div className="group flex items-start space-x-4 p-4 rounded-lg hover:bg-white/5 transition-all duration-300 cursor-default">
                <PieChart className="h-6 w-6 mt-1 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                <div>
                  <h3 className="font-semibold text-xl mb-2 text-purple-200">Insights Inteligentes</h3>
                  <p className="text-gray-300">
                    Descubra padrões e tendências com nossa análise preditiva
                  </p>
                </div>
              </div>

              <div className="group flex items-start space-x-4 p-4 rounded-lg hover:bg-white/5 transition-all duration-300 cursor-default">
                <TrendingUp className="h-6 w-6 mt-1 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
                <div>
                  <h3 className="font-semibold text-xl mb-2 text-cyan-200">Tomada de Decisão</h3>
                  <p className="text-gray-300">
                    Tome decisões baseadas em dados com confiança e precisão
                  </p>
                </div>
              </div>

              <div className="group flex items-start space-x-4 p-4 rounded-lg hover:bg-white/5 transition-all duration-300 cursor-default">
                <Eye className="h-6 w-6 mt-1 text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
                <div>
                  <h3 className="font-semibold text-xl mb-2 text-indigo-200">Visão Clara</h3>
                  <p className="text-gray-300">
                    Obtenha uma visão completa do seu negócio em tempo real
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-400">
          © 2024 SightX. Todos os direitos reservados.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
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
      </div>
    </div>
  )
}