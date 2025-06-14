
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SupportEmailRequest {
  subject: string;
  description: string;
  userEmail: string;
  userName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, description, userEmail, userName }: SupportEmailRequest = await req.json();

    console.log("Processing support request with subject:", subject);
    console.log("User email:", userEmail);
    console.log("User name:", userName);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Create Supabase client with service role key for admin access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract user ID from auth header if available
    let userId = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id || null;
      } catch (error) {
        console.log('Could not extract user from token:', error);
      }
    }

    // Insert the support message into the database
    const { data, error } = await supabase
      .from('support_messages')
      .insert({
        user_id: userId,
        user_email: userEmail,
        user_name: userName || 'Usuário',
        subject: subject,
        description: description,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving support message:", error);
      throw error;
    }

    console.log("Support message saved successfully:", data.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Mensagem de suporte registrada com sucesso!",
        messageId: data.id,
        userEmail: userEmail
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-support-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Erro ao registrar mensagem de suporte",
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
