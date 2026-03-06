// api/generate-claude.js
// Handles all Claude AI generations.
// The Anthropic API key NEVER touches the browser — it stays here on the server.
// Every request is verified against the user's token before calling Claude.

import { kv } from '@vercel/kv';

const SYSTEM_PROMPTS = {
  "Cover Letter Generator":
    "You are an expert cover letter writer. Write a concise, compelling, personalized cover letter based on the job description and background provided. Use a professional but warm tone. Output the letter only — no subject line, no preamble.",
  "LinkedIn Bio Writer":
    "You are a LinkedIn profile expert. Write a punchy, professional LinkedIn 'About' section in first person. Max 3 short paragraphs. Focus on value, achievements, and personality. Output only the bio text.",
  "Cold Email Generator":
    "You are a cold email copywriter. Write a concise, personalized cold email. Output format: first line is the subject line prefixed with 'Subject:', then a blank line, then the email body. Keep it under 150 words.",
  "Business Tagline Generator":
    "You are a brand copywriter. Generate 5 punchy, memorable taglines for this business. Output them as a numbered list only. No explanations.",
  "Essay Outline Generator":
    "You are an academic writing coach. Create a clear, structured essay outline with introduction, 3–4 body sections, and conclusion. Include bullet points for key arguments under each section. Output the outline only.",
  "Client Proposal Writer":
    "You are a freelance business consultant. Write a professional project proposal with these sections: Project Overview, Scope of Work, Deliverables, Timeline, and Investment. Be specific and persuasive. Output the proposal only.",
  "Invoice Text Generator":
    "You are a professional invoicing assistant. Generate clean invoice line items and a professional payment note based on the work described. Format it clearly with line items, subtotal, and a polite payment terms note. Output invoice text only.",
  "Marketing Email Writer":
    "You are an email marketing specialist. Write a high-converting marketing email. Output format — Subject: [line], Preview: [line], then the full email body with a clear CTA. Keep it punchy and benefit-focused.",
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { token, toolName, userInput } = req.body;

  if (!token || !toolName || !userInput) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // ── Verify token ────────────────────────────────────────────────────
  const raw = await kv.get(`token:${token}`);
  if (!raw) return res.status(401).json({ error: 'Invalid token. Please check your access or purchase again.' });

  const tokenData = JSON.parse(raw);

  if (tokenData.generations_left <= 0) {
    return res.status(403).json({
      error: tokenData.type === 'pro'
        ? 'Monthly limit reached. Your generations reset at the start of next billing cycle.'
        : 'Your 50 generations have been used. Purchase a new pack to continue.'
    });
  }

  // ── Call Claude ──────────────────────────────────────────────────────
  const systemPrompt = SYSTEM_PROMPTS[toolName]
    || `You are a professional ${toolName} tool. Generate a high-quality, practical result. Output only the result with no preamble.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userInput }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text;

    if (!text) {
      console.error('Claude API error:', data);
      return res.status(500).json({ error: 'Generation failed. Please try again.' });
    }

    // ── Decrement counter ──────────────────────────────────────────────
    tokenData.generations_left -= 1;
    await kv.set(`token:${token}`, JSON.stringify(tokenData));

    return res.status(200).json({
      result: text,
      generations_left: tokenData.generations_left,
      generations_total: tokenData.generations_total,
    });

  } catch (err) {
    console.error('Claude fetch error:', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}
