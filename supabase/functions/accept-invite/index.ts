
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Variáveis de ambiente necessárias não encontradas");
    return new Response(
      JSON.stringify({ error: "Configuração de servidor incompleta" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { token, userId } = await req.json();

    if (!token || !userId) {
      return new Response(
        JSON.stringify({ error: "Token de convite ou ID do usuário não fornecido" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se o token é válido e não expirou
    const { data: invite, error: inviteError } = await supabase
      .from("organization_invites")
      .select("*")
      .eq("token", token)
      .gte("expires_at", new Date().toISOString())
      .single();

    if (inviteError || !invite) {
      console.error("Erro ao verificar convite:", inviteError);
      return new Response(
        JSON.stringify({ 
          error: "Convite inválido ou expirado", 
          details: inviteError?.message 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se o usuário já é membro da organização
    const { data: existingMember, error: memberError } = await supabase
      .from("organization_members")
      .select("*")
      .eq("organization_id", invite.organization_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (existingMember) {
      return new Response(
        JSON.stringify({ message: "Você já é membro desta organização" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Adicionar o usuário como membro da organização
    const { error: addMemberError } = await supabase
      .from("organization_members")
      .insert({
        organization_id: invite.organization_id,
        user_id: userId,
        role: invite.role,
      });

    if (addMemberError) {
      console.error("Erro ao adicionar membro:", addMemberError);
      throw addMemberError;
    }

    // Marcar o convite como aceito
    const { error: updateInviteError } = await supabase
      .from("organization_invites")
      .update({ status: "accepted" })
      .eq("id", invite.id);

    if (updateInviteError) {
      console.error("Erro ao atualizar status do convite:", updateInviteError);
      // Não vamos falhar a operação por isso, já que o usuário já foi adicionado
    }

    // Atualizar o perfil do usuário com a organização padrão, se ainda não tiver uma
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("default_organization_id")
      .eq("id", userId)
      .single();

    if (!profileError && profile && !profile.default_organization_id) {
      await supabase
        .from("profiles")
        .update({ default_organization_id: invite.organization_id })
        .eq("id", userId);
    }

    console.log(`Usuário ${userId} adicionado à organização ${invite.organization_id} com sucesso`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Convite aceito com sucesso", 
        organizationId: invite.organization_id 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erro ao processar aceitação de convite:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
