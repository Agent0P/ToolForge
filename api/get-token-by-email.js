// api/get-token-by-email.js
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const token = await redis.get(`email:${email.toLowerCase().trim()}:token`);
  if (!token) return res.status(404).json({ error: 'No account found for this email. Please check your email or contact support.' });

  const tokenData = await redis.get(`token:${token}`);
  if (!tokenData) return res.status(404).json({ error: 'Token expired or not found.' });

  return res.status(200).json({ token, tokenData });
}
