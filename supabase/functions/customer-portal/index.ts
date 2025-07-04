
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  apiVersion: "2023-10-16",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { customerId, action } = await req.json();

    if (!customerId) {
      throw new Error("Customer ID is required");
    }

    if (action === 'cancel') {
      // First, retrieve the customer's subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
      });

      if (subscriptions.data.length === 0) {
        throw new Error("No active subscription found");
      }

      // Cancel the subscription at period end (not immediately)
      const subscription = subscriptions.data[0];
      const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: true
      });

      console.log("Subscription set to cancel at period end:", updatedSubscription.id);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Subscription will be canceled at the end of the current billing period",
          subscription: updatedSubscription 
        }),
        {
          headers: { "Content-Type": "application/json", ...corsHeaders },
          status: 200,
        }
      );
    } else {
      // Default behavior: create billing portal session
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${req.headers.get("origin")}/`,
      });

      return new Response(
        JSON.stringify({ url: session.url }),
        {
          headers: { "Content-Type": "application/json", ...corsHeaders },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error("Error in customer-portal function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 400,
      }
    );
  }
});
