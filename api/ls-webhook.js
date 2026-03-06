// api/ls-webhook.js
// This runs on Vercel's servers when Lemon Squeezy sends a payment notification.
// It creates an access token and stores it so the user can unlock Claude tools.

import { kv } from '@vercel/kv';
import crypto from 'crypto';

// Tell Vercel not to auto-parse the body — we need the raw bytes to verify the signature
export const config = {
  api: { bodyParser: false }
};

// Read the raw request body as a string
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => (data += chunk));
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const rawBody = await getRawBody(req);

  // Verify the request is genuinely from Lemon Squeezy
  const secret = process.env.LS_WEBHOOK_SECRET;
  const signature = req.headers['x-signature'];
  if (secret && signature) {
    const hash = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    if (hash !== signature) {
      console.error('Webhook signature mismatch');
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }

  const event = JSON.parse(rawBody);
  const eventName = event.meta?.event_name;
  console.log('LS webhook received:', eventName);

  // ── One-time purchase ──────────────────────────────────────────────
  if (eventName === 'order_created') {
    const orderId = String(event.data?.id);
    const email = event.data?.attributes?.user_email || '';

    const token = crypto.randomUUID();
    const tokenData = {
      type: 'onetime',
      generations_left: 50,
      generations_total: 50,
      email,
      order_id: orderId,
      created_at: Date.now(),
    };

    // Store the token data (expires after 1 year)
    await kv.set(`token:${token}`, JSON.stringify(tokenData), { ex: 60 * 60 * 24 * 365 });
    // Map order ID → token so the success page can retrieve it
    await kv.set(`order:${orderId}:token`, token, { ex: 60 * 60 * 24 * 365 });

    console.log(`One-time token created for order ${orderId}`);
  }

  // ── New Pro subscription ────────────────────────────────────────────
  if (eventName === 'subscription_created') {
    const subscriptionId = String(event.data?.id);
    const email = event.data?.attributes?.user_email || '';

    const token = crypto.randomUUID();
    const tokenData = {
      type: 'pro',
      generations_left: 500,
      generations_total: 500,
      email,
      subscription_id: subscriptionId,
      created_at: Date.now(),
    };

    await kv.set(`token:${token}`, JSON.stringify(tokenData), { ex: 60 * 60 * 24 * 400 });
    // Map subscription ID → token for renewal lookups
    await kv.set(`sub:${subscriptionId}:token`, token, { ex: 60 * 60 * 24 * 400 });

    // Also map by order ID so the success page can retrieve it
    const orderId = String(event.data?.attributes?.order_id || '');
    if (orderId) {
      await kv.set(`order:${orderId}:token`, token, { ex: 60 * 60 * 24 * 400 });
    }

    console.log(`Pro token created for subscription ${subscriptionId}`);
  }

  // ── Monthly renewal — reset generation count ────────────────────────
  if (eventName === 'subscription_renewed') {
    const subscriptionId = String(event.data?.id);
    const existingToken = await kv.get(`sub:${subscriptionId}:token`);

    if (existingToken) {
      const raw = await kv.get(`token:${existingToken}`);
      if (raw) {
        const data = JSON.parse(raw);
        data.generations_left = 500; // Reset monthly allowance
        data.renewed_at = Date.now();
        await kv.set(`token:${existingToken}`, JSON.stringify(data), { ex: 60 * 60 * 24 * 400 });
        console.log(`Pro token renewed for subscription ${subscriptionId}`);
      }
    }
  }

  // ── Subscription cancelled ──────────────────────────────────────────
  if (eventName === 'subscription_expired') {
    const subscriptionId = String(event.data?.id);
    const existingToken = await kv.get(`sub:${subscriptionId}:token`);

    if (existingToken) {
      const raw = await kv.get(`token:${existingToken}`);
      if (raw) {
        const data = JSON.parse(raw);
        data.generations_left = 0;
        data.expired = true;
        await kv.set(`token:${existingToken}`, JSON.stringify(data));
        console.log(`Pro token expired for subscription ${subscriptionId}`);
      }
    }
  }

  res.status(200).json({ received: true });
}
