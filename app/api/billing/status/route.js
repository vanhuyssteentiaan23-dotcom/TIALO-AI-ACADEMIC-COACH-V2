import { cookies } from 'next/headers';

export async function GET() {
  const store = await cookies();
  const sessionId = store.get('tialo_subscription')?.value;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!sessionId || !key) return Response.json({ active: false });

  try {
    const r = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=subscription`, {
      headers: { Authorization: `Bearer ${key}` },
      cache: 'no-store'
    });
    if (!r.ok) return Response.json({ active: false });
    const session = await r.json();
    const subscription = session?.subscription;
    const active = session?.status === 'complete' && ['active', 'trialing'].includes(subscription?.status);
    return Response.json({ active, status: subscription?.status || null });
  } catch {
    return Response.json({ active: false });
  }
}
