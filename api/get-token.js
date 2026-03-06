// api/get-token.js
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { order_id, token: directToken } = req.query;

  // Direct token lookup (for RestoreToken component)
  if (directToken) {
    const data = await redis.get(`token:${directToken}`);
    if (!data) return res.status(404).json({ error: 'token_not_found' });
    return res.status(200).json({
      token: directToken,
      type: data.type,
      generations_left: data.generations_left,
      generations_total: data.generations_total,
    });
  }

  if (!order_id) return res.status(400).json({ error: 'Missing order_id' });

  const token = await redis.get(`order:${order_id}:token`);
  if (!token) return res.status(404).json({ error: 'not_ready' });

  const data = await redis.get(`token:${token}`);
  if (!data) return res.status(404).json({ error: 'token_missing' });

  res.status(200).json({
    token,
    type: data.type,
    generations_left: data.generations_left,
    generations_total: data.generations_total,
  });
}
