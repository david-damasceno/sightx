
// Importação do módulo de servidor HTTP do Deno
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Configuração dos cabeçalhos CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função principal que será servida pelo Deno
serve(async (req) => {
  // Tratamento para requisições de preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log para debug
    console.log("Função de teste executada com sucesso!");

    // Resposta simples da função
    return new Response(
      JSON.stringify({
        success: true,
        message: "Função de teste funcionando corretamente!",
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error("Erro na função de teste:", error.message);
    
    // Resposta de erro
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        },
        status: 400
      }
    );
  }
});
