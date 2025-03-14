
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    // Cliente com chave anônima para operações normais
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Cliente com chave de serviço para operações privilegiadas
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { email, organizationId, role } = await req.json();

    // Verificar se o email já existe no sistema
    const { data: existingUser, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      throw new Error(`Erro ao verificar usuário existente: ${userError.message}`);
    }
    
    const userExists = existingUser.users.some(user => user.email === email);
    
    // Buscar informações da organização
    const { data: organization, error: orgError } = await supabase
      .from("organizations")
      .select("name, slug")
      .eq("id", organizationId)
      .single();
    
    if (orgError) {
      throw new Error(`Erro ao buscar organização: ${orgError.message}`);
    }

    if (userExists) {
      // Adicionar usuário existente diretamente à organização
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
      const existingUserId = usersData.users.find(user => user.email === email)?.id;
      
      if (existingUserId) {
        const { error: memberError } = await supabase
          .from("organization_members")
          .insert({
            organization_id: organizationId,
            user_id: existingUserId,
            role: role
          });
        
        if (memberError) {
          throw new Error(`Erro ao adicionar membro existente: ${memberError.message}`);
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Usuário existente adicionado à organização",
            userExists: true 
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200
          }
        );
      }
    }
    
    // Gerar um link de convite
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expira em 7 dias
    
    // Salvar o convite no banco de dados
    const { error: inviteError } = await supabase
      .from("organization_invites")
      .insert({
        organization_id: organizationId,
        email,
        role,
        token,
        expires_at: expiresAt.toISOString(),
        status: "pending"
      });
    
    if (inviteError) {
      throw new Error(`Erro ao criar convite: ${inviteError.message}`);
    }
    
    // Enviar email de convite usando o serviço de email do Supabase
    const actionLink = `${supabaseUrl}/join?token=${token}&organization=${organization.slug}`;
    
    const { error: emailError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: actionLink,
      data: {
        organization_id: organizationId,
        organization_name: organization.name,
        invite_token: token,
        role: role
      }
    });
    
    if (emailError) {
      throw new Error(`Erro ao enviar email de convite: ${emailError.message}`);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Convite enviado com sucesso",
        userExists: false 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
  } catch (error) {
    console.error("Erro ao processar convite:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || "Ocorreu um erro ao processar o convite" 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
