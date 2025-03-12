
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, inviterName, organizationName, role, token, inviteLink } = await req.json();

    if (!email || !organizationName || !token || !inviteLink) {
      return new Response(
        JSON.stringify({
          error: "Dados incompletos para envio do convite",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Criar uma mensagem de convite formatada
    const roleName = 
      role === 'admin' ? 'Administrador' : 
      role === 'owner' ? 'Proprietário' : 'Membro';
    
    const inviterInfo = inviterName ? `${inviterName} da` : "Um administrador da";

    const { data, error } = await resend.emails.send({
      from: "SightX <noreply@resend.dev>",
      to: [email],
      subject: `Convite para participar da organização ${organizationName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #4F46E5;">Você foi convidado para a SightX!</h2>
          <p>${inviterInfo} organização <strong>${organizationName}</strong> convidou você para se juntar como <strong>${roleName}</strong>.</p>
          
          <p>A SightX é uma plataforma de inteligência de negócios que integra múltiplas fontes de dados para fornecer insights acionáveis e personalizados.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;">Para aceitar o convite, clique no botão abaixo:</p>
          </div>
          
          <a href="${inviteLink}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Aceitar Convite</a>
          
          <p style="margin-top: 20px; font-size: 14px; color: #666;">Se você não esperava este convite, pode ignorar este e-mail com segurança.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
            <p>SightX - Transforme dados em decisões inteligentes com IA</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Erro ao enviar e-mail:", error);
      throw error;
    }

    console.log("E-mail de convite enviado com sucesso para:", email);
    return new Response(
      JSON.stringify({ success: true, message: "Convite enviado com sucesso", id: data?.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erro no processamento do convite:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
