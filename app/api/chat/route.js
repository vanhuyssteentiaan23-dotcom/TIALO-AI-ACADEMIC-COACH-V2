export async function POST(request) {
  try {
    const { messages = [], subject = '', materials = '' } = await request.json();
    const key = process.env.OPENAI_API_KEY;
    if (!key) return Response.json({ error: 'OPENAI_API_KEY is not configured in Vercel.' }, { status: 500 });
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const context = materials ? `\n\nStudent-provided material for context:\n${String(materials).slice(0,20000)}` : '';
    const system = `You are TIALO, an expert academic coach. Help the student understand and improve rather than blindly giving answers. Explain clearly, use examples, ask useful follow-up questions when needed, and structure study plans into actionable steps. Current subject: ${subject || 'general studies'}.${context}`;
    const cleanMessages = Array.isArray(messages) ? messages.slice(-20).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content || '').slice(0,8000) })) : [];
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {'Content-Type':'application/json','Authorization':`Bearer ${key}`},
      body: JSON.stringify({model, temperature:0.4, messages:[{role:'system',content:system}, ...cleanMessages]})
    });
    const data = await r.json();
    if (!r.ok) return Response.json({error:data?.error?.message||'AI request failed.'},{status:r.status});
    return Response.json({message:data.choices?.[0]?.message?.content||'No response.'});
  } catch (e) {
    return Response.json({error:'Invalid request.'},{status:400});
  }
}
