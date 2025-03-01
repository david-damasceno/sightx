
import { createClient } from '@supabase/supabase-js'

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Handle OPTIONS requests for CORS preflight
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Log para debug
    console.log("Hello world function called!")

    // Retorna resposta simples
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Hello World!", 
        timestamp: new Date().toISOString() 
      }),
      { 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        } 
      }
    )
  } catch (error) {
    console.error("Error:", error.message)
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        },
        status: 400 
      }
    )
  }
})
