
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { FacebookSDK } from "./FacebookSDK";
import { Loader2 } from "lucide-react";

export function FacebookIntegration() {
  const { toast } = useToast();
  const { currentOrganization } = useAuth();
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Substituir pelo seu App ID do Facebook
  const clientId = "123456789012345";

  const handleSDKLoaded = () => {
    setIsSDKLoaded(true);
    
    // Verificar o status de login quando o SDK for carregado
    window.FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });
  };

  // Processar a resposta do status de login
  const statusChangeCallback = (response: any) => {
    console.log('Status de login do Facebook:', response);
    
    if (response.status === 'connected') {
      // O usuário já está logado no Facebook e autorizou o aplicativo
      console.log('Usuário já autenticado:', response.authResponse);
      handleAuthResponse(response.authResponse);
    }
  };

  // Lidar com a resposta de autenticação
  const handleAuthResponse = async (authResponse: any) => {
    try {
      if (!currentOrganization?.id) {
        throw new Error("Organização não selecionada");
      }

      setIsLoggingIn(true);

      // Criar ou atualizar registro de integração
      const { data: integration, error: integrationError } = await supabase
        .from("integrations")
        .upsert({
          organization_id: currentOrganization.id,
          integration_type: "facebook",
          status: "pending",
          credentials: {
            access_token: authResponse.accessToken,
            user_id: authResponse.userID
          }
        })
        .select()
        .single();

      if (integrationError) throw integrationError;

      // Configurar parâmetros OAuth do Facebook para troca de código
      const redirectUri = `${window.location.origin}/api/facebook-oauth-callback`;
      const state = currentOrganization.id; // Usar organization_id como state

      // Fazer chamada ao edge function com o token de acesso para completar a integração
      const response = await fetch(`${redirectUri}?access_token=${authResponse.accessToken}&state=${state}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao processar autenticação");
      }

      toast({
        title: "Integração bem-sucedida",
        description: "Sua conta do Facebook foi conectada com sucesso.",
      });

      // Recarregar a página para atualizar o estado
      window.location.reload();
    } catch (error) {
      console.error("Erro ao processar integração com o Facebook:", error);
      toast({
        title: "Erro",
        description: "Não foi possível completar a integração com o Facebook.",
        variant: "destructive"
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Função para lidar com o clique no botão de login
  const handleLogin = () => {
    if (!isSDKLoaded) {
      toast({
        title: "Aguarde",
        description: "O SDK do Facebook ainda está carregando.",
      });
      return;
    }

    setIsLoggingIn(true);
    
    window.FB.login(function(response) {
      setIsLoggingIn(false);
      if (response.authResponse) {
        console.log('Login bem-sucedido:', response.authResponse);
        handleAuthResponse(response.authResponse);
      } else {
        console.log('Login cancelado pelo usuário');
        toast({
          title: "Autenticação cancelada",
          description: "O processo de login com o Facebook foi cancelado.",
          variant: "destructive"
        });
      }
    }, {scope: 'pages_show_list,pages_read_engagement,email,public_profile'});
  };

  return (
    <>
      <FacebookSDK appId={clientId} onSDKLoaded={handleSDKLoaded} />
      
      <Button 
        variant="outline"
        onClick={handleLogin}
        disabled={!isSDKLoaded || isLoggingIn}
        className="flex items-center gap-2"
      >
        {isLoggingIn ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        )}
        Conectar com Facebook
      </Button>
    </>
  );
}
