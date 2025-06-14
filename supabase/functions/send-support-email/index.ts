
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

    console.log("Sending support email with subject:", subject);
    console.log("User email:", userEmail);
    console.log("User name:", userName);

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "LYONPAY Support <onboarding@resend.dev>",
      to: ["adm@lyonpay.com"],
      reply_to: userEmail,
      subject: `[SUPORTE] ${subject}`,
      html: `
        <h2>Nova solicitação de suporte - LYONPAY</h2>
        <p><strong>De:</strong> ${userName || 'Usuário'} (${userEmail})</p>
        <p><strong>Assunto:</strong> ${subject}</p>
        <p><strong>Descrição:</strong></p>
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #007bff; margin: 10px 0;">
          ${description.replace(/\n/g, '<br>')}
        </div>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Esta mensagem foi enviada através do sistema de suporte do LYONPAY.<br>
          Para responder, utilize o email: ${userEmail}
        </p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email de suporte enviado com sucesso!",
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
