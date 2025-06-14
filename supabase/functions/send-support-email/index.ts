
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

    console.log("Enviando email de suporte com assunto:", subject);
    console.log("Email do usuário:", userEmail);
    console.log("Nome do usuário:", userName);

    // Preparar conteúdo do email
    const emailBody = `
Assunto: ${subject}

Email do usuário: ${userEmail}
Nome do usuário: ${userName || 'Não informado'}

Descrição:
${description}

---
Email enviado através do sistema de suporte LYONPAY
Data: ${new Date().toLocaleString('pt-BR')}
    `;

    // Enviar email usando fetch para o serviço SMTP
    const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: 'gmail', // Usar Gmail como serviço
        template_id: 'template_support',
        user_id: 'public_key',
        template_params: {
          from_name: userName || 'Usuário LYONPAY',
          from_email: userEmail,
          to_email: 'adm@lyonpay.com',
          subject: `[SUPORTE LYONPAY] ${subject}`,
          message: emailBody
        }
      })
    });

    if (!emailResponse.ok) {
      throw new Error(`Erro ao enviar email: ${emailResponse.statusText}`);
    }

    console.log("Email enviado com sucesso!");

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
    console.error("Erro na função send-support-email:", error);
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
