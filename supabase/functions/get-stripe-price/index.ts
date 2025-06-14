
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

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Get the price for our Premium product
    const prices = await stripe.prices.list({
      product: "prod_SUz13U5Rif3qEr",
      active: true,
      type: "recurring",
      limit: 1,
    });

    if (prices.data.length === 0) {
      throw new Error("No active price found for Premium product");
    }

    const price = prices.data[0];
    const amount = price.unit_amount || 0;
    const currency = price.currency || 'brl';
    
    // Convert cents to currency units
    const formattedAmount = amount / 100;

    return new Response(JSON.stringify({
      amount: formattedAmount,
      currency: currency,
      formatted: `R$ ${formattedAmount.toFixed(2).replace('.', ',')}`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching price:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
