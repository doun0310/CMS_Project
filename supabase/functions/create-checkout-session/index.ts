import Stripe from 'npm:stripe@14';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-06-20',
});

const PRICE_IDS: Record<string, string> = {
  pro_monthly: Deno.env.get('STRIPE_PRICE_PRO_MONTHLY') ?? '',
  pro_yearly: Deno.env.get('STRIPE_PRICE_PRO_YEARLY') ?? '',
  enterprise_monthly: Deno.env.get('STRIPE_PRICE_ENTERPRISE_MONTHLY') ?? '',
  enterprise_yearly: Deno.env.get('STRIPE_PRICE_ENTERPRISE_YEARLY') ?? '',
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { planKey, userId, email, successUrl, cancelUrl } = await req.json();

    const priceId = PRICE_IDS[planKey];
    if (!priceId) {
      throw new Error(`Unknown plan key: ${planKey}`);
    }

    // Retrieve or create Stripe customer
    const existingCustomers = await stripe.customers.list({ email, limit: 1 });
    let customer = existingCustomers.data[0];

    if (!customer) {
      customer = await stripe.customers.create({
        email,
        metadata: { supabase_user_id: userId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&plan=${planKey}`,
      cancel_url: cancelUrl,
      subscription_data: {
        metadata: { supabase_user_id: userId, plan_key: planKey },
      },
      locale: 'ko',
    });

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
