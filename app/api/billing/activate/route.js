import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

async function getSession(id) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  const r = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(id)}?expand[]=subscription`, {
    headers: { Authorization: `Bearer ${key}` },
    cache: 'no-store'
  });
  if (!r.ok) return null;
  return r.json();
}

export async function GET(request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('session_id');
  if (!sessionId) redirect('/pricing?checkout=missing');

  const session = await getSession(sessionId);
  const subscription = session?.subscription;
  const active = session?.status === 'complete' && ['active', 'trialing'].includes(subscription?.status);
  if (!active) redirect('/pricing?checkout=not-active');

  const store = await cookies();
  store.set('tialo_subscription', sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365
  });
  redirect('/?subscription=active');
}
