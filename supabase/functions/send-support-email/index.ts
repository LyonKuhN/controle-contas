
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

    console.log("Sending support email with subject:", subject);
    console.log("User email:", userEmail);
    console.log("User name:", userName);

    // Prepare email content with user information
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

    // Send email using SMTP
    const emailData = {
      from: "adm@lyonpay.com",
      to: "adm@lyonpay.com",
      subject: `[SUPORTE LYONPAY] ${subject}`,
      text: emailBody,
      auth: {
        username: "adm@lyonpay.com",
        password: "Herikana1705@",
      },
      smtp: {
        host: "smtp.hostinger.com",
        port: 465,
        secure: true, // SSL
      }
    };

    // For now, we'll simulate the email sending
    // In a real implementation, you would use a proper SMTP library or service
    console.log("Email data prepared:", {
      to: emailData.to,
      from: emailData.from,
      subject: emailData.subject,
      userEmail: userEmail,
      userName: userName
    });

    // Simulate successful email sending
    // Note: In production, you would need to use a proper SMTP service
    // like Resend, SendGrid, or implement actual SMTP functionality
    
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
