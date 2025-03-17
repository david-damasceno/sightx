
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function FacebookIntegration() {
  const { toast } = useToast();
  const { currentOrganization } = useAuth();

  const handleConnect = async () => {
    try {
      if (!currentOrganization?.id) {
        throw new Error("Organização não selecionada");
      }

      // Criar ou atualizar registro de integração
      const { data: integration, error: integrationError } = await supabase
        .from("integrations")
        .upsert({
          organization_id: currentOrganization.id,
          integration_type: "facebook",
          status: "pending"
        })
        .select()
        .single();

      if (integrationError) throw integrationError;

      // Configurar parâmetros OAuth do Facebook
      const clientId = "123456789012345"; // Substituir pelo seu App ID do Facebook
      const redirectUri = `${window.location.origin}/api/facebook-oauth-callback`;
      const scope = "pages_show_list,pages_read_engagement,email,public_profile";
      const state = currentOrganization.id; // Usar organization_id como state

      // Construir URL de autorização
      const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?${new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        state,
        scope,
        response_type: "code"
      })}`;

      // Redirecionar para página de autorização do Facebook
      window.location.href = authUrl;

      toast({
        title: "Iniciando integração",
        description: "Você será redirecionado para autorizar o acesso do Facebook.",
      });
    } catch (error) {
      console.error("Erro ao iniciar integração com o Facebook:", error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a integração com o Facebook.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button 
      variant="outline"
      onClick={handleConnect}
      className="flex items-center gap-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
      Conectar com Facebook
    </Button>
  );
}
