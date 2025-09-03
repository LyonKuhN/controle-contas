
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const logStep = (step: string, details?: any) => {
    const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
    console.log(`[GET-STRIPE-PRICE] ${step}${detailsStr}`);
  };

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY is not set");
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    logStep("Stripe key found, initializing client");
    const stripe = new Stripe(stripeKey, { 
      apiVersion: "2023-10-16",
      timeout: 6000, // Reduzido para 6 segundos para ficar dentro do timeout do cliente
      maxNetworkRetries: 1 // Reduzido para 1 retry para ser mais rápido
    });
    
    logStep("Fetching prices from Stripe", { product: "prod_SUz13U5Rif3qEr" });
    
    // Get the price for our Premium product with retry logic
    const prices = await stripe.prices.list({
      product: "prod_SUz13U5Rif3qEr",
      active: true,
      type: "recurring",
      limit: 1,
    });

    logStep("Stripe API response received", { priceCount: prices.data.length });

    if (prices.data.length === 0) {
      logStep("ERROR: No active price found");
      throw new Error("No active price found for Premium product");
    }

    const price = prices.data[0];
    const amount = price.unit_amount || 0;
    const currency = price.currency || 'brl';
    
    logStep("Price data processed", { amount, currency, priceId: price.id });
    
    // Convert cents to currency units
    const formattedAmount = amount / 100;

    const responseData = {
      amount: formattedAmount,
      currency: currency,
      formatted: `R$ ${formattedAmount.toFixed(2).replace('.', ',')}`
    };

    logStep("Sending successful response", responseData);

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in get-stripe-price", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
