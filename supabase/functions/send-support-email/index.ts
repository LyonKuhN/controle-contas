
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

    // Prepare EmailJS template parameters
    const templateParams = {
      from_name: userName || 'Usuário',
      from_email: userEmail,
      subject: subject,
      message: description,
      to_email: 'adm@lyonpay.com'
    };

    // Send email using EmailJS API
    const emailJSResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: 'service_99hwcjp',
        template_id: 'template_default', // You may need to create a template in EmailJS
        user_id: 'a9S7JoGNsZByr0Pej',
        accessToken: 'gZ0SYUlZhi7kPr5JPvjJc',
        template_params: templateParams
      })
    });

    console.log("EmailJS Response Status:", emailJSResponse.status);

    if (!emailJSResponse.ok) {
      const errorText = await emailJSResponse.text();
      console.error("EmailJS Error:", errorText);
      throw new Error(`EmailJS error: ${emailJSResponse.status} - ${errorText}`);
    }

    const emailJSResult = await emailJSResponse.text();
    console.log("EmailJS Success:", emailJSResult);

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
