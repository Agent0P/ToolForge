// api/get-token.js
// Called by the success page after payment.
// Lemon Squeezy redirects to /success?order_id=xxx
// This endpoint retrieves the token created by the webhook.

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { order_id } = req.query;
  if (!order_id) return res.status(400).json({ error: 'Missing order_id' });

  // Webhook may not have fired yet — retry logic is handled on the frontend
  const token = await kv.get(`order:${order_id}:token`);
  if (!token) return res.status(404).json({ error: 'not_ready' });

  const raw = await kv.get(`token:${token}`);
  if (!raw) return res.status(404).json({ error: 'token_missing' });

  const data = JSON.parse(raw);

  res.status(200).json({
    token,
    type: data.type,
    generations_left: data.generations_left,
    generations_total: data.generations_total,
  });
}
