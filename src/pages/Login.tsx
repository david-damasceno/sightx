
import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function Login() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          console.log("Sessão existente encontrada, redirecionando")
          navigate("/")
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error)
        toast({
          title: "Erro",
          description: "Erro ao verificar sessão. Tente novamente.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", event, !!session)
      
      if (event === 'SIGNED_IN' && session) {
        console.log("Usuário logado, redirecionando")
        setTimeout(() => navigate("/"), 500)
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate, toast])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/95">
        <div className="animate-pulse flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Verificando sessão...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background to-background/95">
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse delay-700"></div>
      
      <div className="container relative min-h-screen mx-auto flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-card/50 backdrop-blur-xl rounded-2xl border border-border/50 shadow-xl p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-3 mb-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="60" 
                  height="40" 
                  viewBox="0 0 300 187.499995" 
                  className="text-primary transition-all hover:scale-105"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    <clipPath id="e7ffea59ae"><path d="M 53.777344 53 L 127.507812 53 L 127.507812 133.84375 L 53.777344 133.84375 Z M 53.777344 53 " clip-rule="nonzero"/></clipPath>
                    <clipPath id="eed79ac1ca"><path d="M 53.777344 93.496094 L 127.507812 53.148438 L 127.507812 133.84375 Z M 53.777344 93.496094 " clip-rule="nonzero"/></clipPath>
                    <clipPath id="55922dfb59"><path d="M 172.488281 53.152344 L 246.21875 53.152344 L 246.21875 134 L 172.488281 134 Z M 172.488281 53.152344 " clip-rule="nonzero"/></clipPath>
                    <clipPath id="457a8ca164"><path d="M 246.21875 93.5 L 172.488281 133.847656 L 172.488281 53.152344 Z M 246.21875 93.5 " clip-rule="nonzero"/></clipPath>
                    <clipPath id="013f02e760"><path d="M 12.253906 10.425781 L 288 10.425781 L 288 176.574219 L 12.253906 176.574219 Z M 12.253906 10.425781 " clip-rule="nonzero"/></clipPath>
                    <clipPath id="358954cd96"><path d="M 142.285156 173.972656 L 14.984375 98.097656 C 13.367188 97.132812 12.375 95.386719 12.375 93.5 C 12.375 91.617188 13.367188 89.871094 14.984375 88.90625 L 142.285156 13.027344 C 147.035156 10.195312 152.953125 10.195312 157.703125 13.027344 L 285.003906 88.90625 C 286.621094 89.871094 287.613281 91.617188 287.613281 93.5 C 287.613281 95.386719 286.621094 97.132812 285.003906 98.097656 L 157.703125 173.972656 C 152.953125 176.804688 147.035156 176.804688 142.285156 173.972656 Z M 142.285156 173.972656 " clip-rule="nonzero"/></clipPath>
                    <clipPath id="c1469d9fa5"><path d="M 86 74 L 162 74 L 162 117 L 86 117 Z M 86 74 " clip-rule="nonzero"/></clipPath>
                    <clipPath id="4730d2e2ec"><path d="M 88.050781 122.371094 L 84.675781 79.945312 L 158.660156 74.0625 L 162.035156 116.484375 Z M 88.050781 122.371094 " clip-rule="nonzero"/></clipPath>
                    <clipPath id="acbf368fb8"><path d="M 86.9375 100.488281 L 156.515625 74.34375 C 157.015625 74.15625 157.570312 74.214844 158.019531 74.5 C 158.464844 74.785156 158.753906 75.261719 158.796875 75.792969 L 161.894531 114.757812 C 161.9375 115.289062 161.726562 115.804688 161.332031 116.15625 C 160.933594 116.507812 160.394531 116.652344 159.875 116.546875 L 87.035156 101.726562 C 86.753906 101.667969 86.542969 101.433594 86.519531 101.144531 C 86.496094 100.859375 86.667969 100.589844 86.9375 100.488281 Z M 86.9375 100.488281 " clip-rule="nonzero"/></clipPath>
                    <clipPath id="a96eaee0f1"><path d="M 138 70 L 214 70 L 214 113 L 138 113 Z M 138 70 " clip-rule="nonzero"/></clipPath>
                    <clipPath id="3b94516d4d"><path d="M 211.941406 64.625 L 215.316406 107.050781 L 141.332031 112.933594 L 137.957031 70.507812 Z M 211.941406 64.625 " clip-rule="nonzero"/></clipPath>
                    <clipPath id="44287166fc"><path d="M 213.054688 86.503906 L 143.476562 112.652344 C 142.976562 112.839844 142.421875 112.78125 141.976562 112.496094 C 141.527344 112.210938 141.238281 111.734375 141.195312 111.203125 L 138.097656 72.238281 C 138.054688 71.707031 138.265625 71.191406 138.664062 70.839844 C 139.058594 70.488281 139.597656 70.34375 140.117188 70.449219 L 212.957031 85.269531 C 213.238281 85.328125 213.449219 85.5625 213.472656 85.851562 C 213.496094 86.136719 213.324219 86.40625 213.054688 86.503906 Z M 213.054688 86.503906 " clip-rule="nonzero"/></clipPath>
                  </defs>
                  <g clip-path="url(#e7ffea59ae)">
                    <g clip-path="url(#eed79ac1ca)">
                      <path fill="#ffffff" d="M 53.777344 133.84375 L 53.777344 53.203125 L 127.507812 53.203125 L 127.507812 133.84375 Z M 53.777344 133.84375 " fill-opacity="1" fill-rule="nonzero"/>
                    </g>
                  </g>
                  <g clip-path="url(#55922dfb59)">
                    <g clip-path="url(#457a8ca164)">
                      <path fill="#ffffff" d="M 246.21875 53.152344 L 246.21875 133.792969 L 172.488281 133.792969 L 172.488281 53.152344 Z M 246.21875 53.152344 " fill-opacity="1" fill-rule="nonzero"/>
                    </g>
                  </g>
                  <g clip-path="url(#013f02e760)">
                    <g clip-path="url(#358954cd96)">
                      <path fill="#450d82" d="M 292.714844 178.570312 L 7.601562 178.570312 L 7.601562 8.433594 L 292.714844 8.433594 Z M 292.714844 178.570312 " fill-opacity="1" fill-rule="nonzero"/>
                    </g>
                  </g>
                  <g clip-path="url(#c1469d9fa5)">
                    <g clip-path="url(#4730d2e2ec)">
                      <g clip-path="url(#acbf368fb8)">
                        <path fill="#459d3d" d="M 86.5625 123 L 83.109375 79.558594 L 158.621094 73.554688 L 162.074219 116.996094 Z M 86.5625 123 " fill-opacity="1" fill-rule="nonzero"/>
                      </g>
                    </g>
                  </g>
                  <g clip-path="url(#a96eaee0f1)">
                    <g clip-path="url(#3b94516d4d)">
                      <g clip-path="url(#44287166fc)">
                        <path fill="#4abd40" d="M 213.429688 63.996094 L 216.882812 107.4375 L 141.371094 113.441406 L 137.917969 70 Z M 213.429688 63.996094 " fill-opacity="1" fill-rule="nonzero"/>
                      </g>
                    </g>
                  </g>
                </svg>
                <h1 className="text-3xl font-bold text-foreground">
                  SightX
                </h1>
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-foreground">
                  Bem-vindo de volta
                </h2>
                <p className="text-sm text-muted-foreground">
                  Use suas credenciais para acessar sua conta
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
                      brand: 'hsl(var(--primary))',
                      brandAccent: 'hsl(var(--primary))',
                      inputBackground: 'hsl(var(--background))',
                      inputText: 'hsl(var(--foreground))',
                      inputPlaceholder: 'hsl(var(--muted-foreground))',
                      messageText: 'hsl(var(--foreground))',
                      anchorTextColor: 'hsl(var(--primary))',
                      dividerBackground: 'hsl(var(--border))',
                    },
                    radii: {
                      buttonBorderRadius: 'var(--radius)',
                      inputBorderRadius: 'var(--radius)',
                    },
                    space: {
                      inputPadding: '0.75rem',
                      buttonPadding: '0.75rem',
                    },
                    fonts: {
                      bodyFontFamily: `"Inter var", ui-sans-serif, system-ui, -apple-system, sans-serif`,
                      buttonFontFamily: `"Inter var", ui-sans-serif, system-ui, -apple-system, sans-serif`,
                    },
                    fontSizes: {
                      baseButtonSize: '0.875rem',
                      baseInputSize: '0.875rem',
                    },
                  },
                },
                className: {
                  container: 'space-y-4',
                  button: 'w-full px-4 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg shadow-sm hover:bg-primary/90 transition-colors duration-200',
                  input: 'w-full px-3 py-2 bg-background border border-input rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow duration-200',
                  label: 'block text-sm font-medium text-foreground mb-1.5',
                  message: 'text-sm text-muted-foreground mt-1',
                  anchor: 'text-primary hover:text-primary/90 font-medium transition-colors',
                  divider: 'my-4',
                },
              }}
              localization={{
                variables: {
                  sign_up: {
                    email_label: "Email",
                    password_label: "Senha",
                    email_input_placeholder: "Seu endereço de email",
                    password_input_placeholder: "Escolha uma senha segura",
                    button_label: "Criar conta",
                    loading_button_label: "Criando sua conta...",
                    social_provider_text: "Continuar com {{provider}}",
                    link_text: "Não tem uma conta? Cadastre-se",
                  },
                  sign_in: {
                    email_label: "Email",
                    password_label: "Senha",
                    email_input_placeholder: "Seu endereço de email",
                    password_input_placeholder: "Sua senha",
                    button_label: "Entrar",
                    loading_button_label: "Entrando...",
                    social_provider_text: "Continuar com {{provider}}",
                    link_text: "Já tem uma conta? Entre",
                  },
                  forgotten_password: {
                    email_label: "Email",
                    password_label: "Senha",
                    email_input_placeholder: "Seu endereço de email",
                    button_label: "Recuperar senha",
                    loading_button_label: "Enviando instruções...",
                    link_text: "Esqueceu sua senha?",
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
    </div>
  )
}
