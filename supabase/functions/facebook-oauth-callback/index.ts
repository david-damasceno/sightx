
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Lidar com requisições CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // URL do Supabase e chaves
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    // Cliente com chave anônima para operações normais
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Cliente com chave de serviço para operações privilegiadas
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Extrair parâmetros da query string
    const url = new URL(req.url);
    const accessToken = url.searchParams.get("access_token");
    const state = url.searchParams.get("state");

    // Verificar se chegamos aqui via código de autorização ou via token de acesso
    if (accessToken) {
      // Processar usando token de acesso
      // Obter informações do usuário do Facebook
      const userInfoResponse = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`,
        {
          method: "GET",
        }
      );

      const userInfo = await userInfoResponse.json();

      if (userInfo.error) {
        throw new Error(`Erro ao obter informações do usuário: ${userInfo.error.message}`);
      }

      // Obter informações das páginas do usuário
      const pagesResponse = await fetch(
        `https://graph.facebook.com/me/accounts?access_token=${accessToken}`,
        {
          method: "GET",
        }
      );

      const pagesData = await pagesResponse.json();

      if (pagesData.error) {
        console.log("Aviso: Não foi possível obter as páginas do usuário:", pagesData.error);
      }

      // Armazenar dados da integração
      const organizationId = state; // O state deve conter o ID da organização
      
      // Obter informações do token de longa duração
      const longLivedTokenResponse = await fetch(
        `https://graph.facebook.com/oauth/access_token?` +
        `grant_type=fb_exchange_token&` +
        `client_id=${Deno.env.get("FACEBOOK_APP_ID")}&` +
        `client_secret=${Deno.env.get("FACEBOOK_APP_SECRET")}&` +
        `fb_exchange_token=${accessToken}`,
        {
          method: "GET",
        }
      );

      const longLivedTokenData = await longLivedTokenResponse.json();
      let tokenData = { access_token: accessToken, expires_in: 3600 };
      
      if (!longLivedTokenData.error) {
        tokenData = longLivedTokenData;
      } else {
        console.log("Aviso: Não foi possível obter token de longa duração:", longLivedTokenData.error);
      }

      const { error: integrationError } = await supabase
        .from("integrations")
        .upsert({
          organization_id: organizationId,
          integration_type: "facebook",
          status: "active",
          credentials: {
            access_token: tokenData.access_token,
            expires_in: tokenData.expires_in,
            user_id: userInfo.id
          },
          metadata: {
            user_name: userInfo.name,
            user_email: userInfo.email,
            pages: pagesData.data || []
          },
          settings: {},
          updated_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        });

      if (integrationError) {
        throw new Error(`Erro ao salvar informações da integração: ${integrationError.message}`);
      }

      // Retornar sucesso para chamadas de API diretas
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Autenticação com Facebook concluída com sucesso" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    } else {
      // Código original para troca de código por token
      const code = url.searchParams.get("code");
      
      if (!code) {
        throw new Error("Código de autorização não fornecido");
      }

      // Troca o código por um token de acesso do Facebook
      const fbAppId = Deno.env.get("FACEBOOK_APP_ID") || "";
      const fbAppSecret = Deno.env.get("FACEBOOK_APP_SECRET") || "";
      const redirectUri = `${supabaseUrl}/functions/v1/facebook-oauth-callback`;

      const tokenResponse = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?` +
        `client_id=${fbAppId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `client_secret=${fbAppSecret}&` +
        `code=${code}`,
        {
          method: "GET",
        }
      );

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        throw new Error(`Erro ao trocar o código por token: ${tokenData.error.message}`);
      }

      // Obter informações do usuário do Facebook
      const userInfoResponse = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email&access_token=${tokenData.access_token}`,
        {
          method: "GET",
        }
      );

      const userInfo = await userInfoResponse.json();

      if (userInfo.error) {
        throw new Error(`Erro ao obter informações do usuário: ${userInfo.error.message}`);
      }

      // Obter informações da página comercial (Business) se autorizado
      const pagesResponse = await fetch(
        `https://graph.facebook.com/me/accounts?access_token=${tokenData.access_token}`,
        {
          method: "GET",
        }
      );

      const pagesData = await pagesResponse.json();

      // Armazenar dados da integração
      const organizationId = state; // O state deve conter o ID da organização
      
      const { error: integrationError } = await supabase
        .from("integrations")
        .upsert({
          organization_id: organizationId,
          integration_type: "facebook",
          status: "active",
          credentials: {
            access_token: tokenData.access_token,
            token_type: tokenData.token_type,
            expires_in: tokenData.expires_in,
            user_id: userInfo.id
          },
          metadata: {
            user_name: userInfo.name,
            user_email: userInfo.email,
            pages: pagesData.data || []
          },
          settings: {},
          updated_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        });

      if (integrationError) {
        throw new Error(`Erro ao salvar informações da integração: ${integrationError.message}`);
      }

      // Redirecionar de volta para o aplicativo
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          "Location": `${supabaseUrl}/settings/integrations?status=success&provider=facebook`
        }
      });
    }
  } catch (error) {
    console.error("Erro no fluxo de OAuth do Facebook:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || "Ocorreu um erro ao processar a autenticação com o Facebook" 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
