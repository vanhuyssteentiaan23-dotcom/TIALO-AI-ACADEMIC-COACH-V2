import { cookies } from 'next/headers';

async function getSession(id, key) {
  const r = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(id)}?expand[]=subscription`, {
    headers: { Authorization: `Bearer ${key}` },
    cache: 'no-store'
  });
  return r.ok ? r.json() : null;
}

export async function POST(request) {
  const key = process.env.STRIPE_SECRET_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  if (!key) return Response.json({ error: 'Stripe is not configured.' }, { status: 503 });

  const store = await cookies();
  const sessionId = store.get('tialo_subscription')?.value;
  if (!sessionId) return Response.json({ error: 'No active subscription found on this browser.' }, { status: 401 });

  try {
    const session = await getSession(sessionId, key);
    const customer = typeof session?.customer === 'string' ? session.customer : session?.customer?.id;
    if (!customer) return Response.json({ error: 'Customer record not found.' }, { status: 404 });

    const form = new URLSearchParams();
    form.set('customer', customer);
    form.set('return_url', `${appUrl}/?billing=returned`);
    const r = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString()
    });
    const data = await r.json();
    if (!r.ok) return Response.json({ error: data?.error?.message || 'Unable to open billing portal.' }, { status: r.status });
    return Response.json({ url: data.url });
  } catch {
    return Response.json({ error: 'Unable to open billing portal.' }, { status: 500 });
  }
}
