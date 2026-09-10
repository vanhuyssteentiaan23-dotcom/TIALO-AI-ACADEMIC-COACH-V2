'use client';
import { useState } from 'react';
import styles from './pricing.module.css';

export default function PricingPage() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function subscribe() {
    setBusy(true); setError('');
    try {
      const r = await fetch('/api/checkout', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({email}) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Checkout could not start.');
      window.location.href = data.url;
    } catch (e) { setError(e.message); setBusy(false); }
  }

  async function manageBilling() {
    setBusy(true); setError('');
    try {
      const r = await fetch('/api/billing/portal', { method: 'POST' });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Billing portal unavailable.');
      window.location.href = data.url;
    } catch (e) { setError(e.message); setBusy(false); }
  }

  return <main className={styles.page}>
    <header className={styles.nav}><a href="/" className={styles.brand}><span>T</span> TIALO</a><a href="/">Back to app</a></header>
    <section className={styles.hero}><div className={styles.eyebrow}>TIALO ACADEMIC COACH</div><h1>Stop studying harder.<br/><span>Start studying smarter.</span></h1><p>One focused workspace for AI tutoring, practice, mock exams, course materials and measurable progress.</p></section>
    <section className={styles.card}>
      <div className={styles.copy}><div className={styles.badge}>TIALO PRO</div><h2>Everything you need to make progress.</h2><div className={styles.price}><strong>€12.99</strong><span>/ month</span></div><p className={styles.trial}>Cancel anytime. Secure recurring billing through Stripe.</p><ul><li>AI Tutor with your course context</li><li>Unlimited focused practice</li><li>Configurable mock exams</li><li>Course-material library</li><li>Progress and study-streak tracking</li><li>Subscription management portal</li></ul></div>
      <div className={styles.checkout}><h3>Start TIALO</h3><p>Enter your email so Stripe can prefill checkout.</p><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/><button className={styles.cta} disabled={busy} onClick={subscribe}>{busy?'Opening checkout…':'Start TIALO Pro →'}</button><button className={styles.manage} disabled={busy} onClick={manageBilling}>Already subscribed? Manage billing</button>{error&&<div className={styles.error}>{error}</div>}<small className={styles.fine}>Payments are processed by Stripe. TIALO never stores your card details.</small></div>
    </section>
    <section className={styles.foot}><div><b>Built for real study.</b><span>AI guidance · Active recall · Exam practice · Progress</span></div><a href="/">Open TIALO →</a></section>
  </main>
}
