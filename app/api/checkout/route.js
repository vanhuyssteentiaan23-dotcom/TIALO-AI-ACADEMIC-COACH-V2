export async function POST(request) {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    const price = process.env.STRIPE_PRICE_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

    if (!key || !price) {
      return Response.json({ error: 'Stripe is not configured yet. Add STRIPE_SECRET_KEY and STRIPE_PRICE_ID in Vercel.' }, { status: 503 });
    }

    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const form = new URLSearchParams();
    form.set('mode', 'subscription');
    form.set('line_items[0][price]', price);
    form.set('line_items[0][quantity]', '1');
    form.set('success_url', `${appUrl}/api/billing/activate?session_id={CHECKOUT_SESSION_ID}`);
    form.set('cancel_url', `${appUrl}/pricing?checkout=cancelled`);
    form.set('allow_promotion_codes', 'true');
    form.set('billing_address_collection', 'auto');
    form.set('customer_creation', 'always');
    form.set('subscription_data[metadata][product]', 'tialo-academic-coach');
    if (email) form.set('customer_email', email);

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: form.toString()
    });

    const data = await response.json();
    if (!response.ok) return Response.json({ error: data?.error?.message || 'Unable to start checkout.' }, { status: response.status });
    return Response.json({ url: data.url });
  } catch {
    return Response.json({ error: 'Unable to start checkout.' }, { status: 500 });
  }
}
