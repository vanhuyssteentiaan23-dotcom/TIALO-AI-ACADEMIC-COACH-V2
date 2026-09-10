export async function POST(request) {
  try {
    const { messages = [], subject = '' } = await request.json();
    const key = process.env.OPENAI_API_KEY;
    if (!key) return Response.json({ error: 'OPENAI_API_KEY is not configured in Vercel.' }, { status: 500 });
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const system = `You are TIALO, an academic coach. Help the student learn rather than simply giving answers. Be concise, structured and encouraging. Current subject: ${subject || 'general studies'}.`;
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`},
      body:JSON.stringify({model,temperature:0.4,messages:[{role:'system',content:system},...messages.map(m=>({role:m.role,content:m.content}))]})
    });
    const data = await r.json();
    if (!r.ok) return Response.json({error:data?.error?.message||'AI request failed.'},{status:r.status});
    return Response.json({message:data.choices?.[0]?.message?.content||'No response.'});
  } catch (e) { return Response.json({error:'Invalid request.'},{status:400}); }
}
