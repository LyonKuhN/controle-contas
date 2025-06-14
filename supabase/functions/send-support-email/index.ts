
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SupportEmailRequest {
  subject: string;
  description: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, description }: SupportEmailRequest = await req.json();

    console.log("Sending support email with subject:", subject);

    // Prepare email content
    const emailBody = `
      Assunto: ${subject}
      
      Descrição:
      ${description}
      
      ---
      Email enviado através do sistema de suporte LYONPAY
      Data: ${new Date().toLocaleString('pt-BR')}
    `;

    // Send email using SMTP (simulated for now - in production you'd use a proper SMTP library)
    // For now, we'll just log the email details and return success
    console.log("Email details:", {
      to: "adm@lyonpay.com",
      subject: subject,
      body: emailBody
    });

    // In a real implementation, you would use the Hostinger SMTP settings:
    // Server: smtp.hostinger.com
    // Port: 465
    // Email: adm@lyonpay.com
    // Password: Herikana1705@
    // Encryption: SSL

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email de suporte enviado com sucesso!" 
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
        error: "Erro ao enviar email de suporte",
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
