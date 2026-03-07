// api/ls-webhook.js
import { Redis } from '@upstash/redis';
import crypto from 'crypto';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export const config = { api: { bodyParser: false } };

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
  const customData = event.meta?.custom_data || {};
  console.log('LS webhook received:', eventName, 'custom:', customData);

  // ── Top-up purchase (+100 generations to existing token) ────────────
  if (eventName === 'order_created' && customData.type === 'topup' && customData.existing_token) {
    const existingToken = customData.existing_token;
    const orderId = String(event.data?.id);
    const data = await redis.get(`token:${existingToken}`);
    if (data) {
      data.generations_left = (data.generations_left || 0) + 100;
      data.topup_at = Date.now();
      await redis.set(`token:${existingToken}`, data, { ex: 60 * 60 * 24 * 365 });
      await redis.set(`order:${orderId}:token`, existingToken, { ex: 60 * 60 * 24 * 30 });
      console.log(`Top-up: +100 generations to ${existingToken}`);
    } else {
      console.error(`Top-up failed: token ${existingToken} not found`);
    }
  }

  // ── One-time purchase (50 generations) ─────────────────────────────
  else if (eventName === 'order_created') {
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
    await redis.set(`token:${token}`, tokenData, { ex: 60 * 60 * 24 * 365 });
    await redis.set(`order:${orderId}:token`, token, { ex: 60 * 60 * 24 * 365 });
    if (email) await redis.set(`email:${email.toLowerCase()}:token`, token, { ex: 60 * 60 * 24 * 365 });
    console.log(`One-time token created for order ${orderId}`);
  }

  // ── New Pro subscription (400 generations/month) ────────────────────
  if (eventName === 'subscription_created') {
    const subscriptionId = String(event.data?.id);
    const email = event.data?.attributes?.user_email || '';
    const token = crypto.randomUUID();
    const tokenData = {
      type: 'pro',
      generations_left: 400,
      generations_total: 400,
      email,
      subscription_id: subscriptionId,
      created_at: Date.now(),
    };
    await redis.set(`token:${token}`, tokenData, { ex: 60 * 60 * 24 * 400 });
    await redis.set(`sub:${subscriptionId}:token`, token, { ex: 60 * 60 * 24 * 400 });
    const orderId = String(event.data?.attributes?.order_id || '');
    if (email) await redis.set(`email:${email.toLowerCase()}:token`, token, { ex: 60 * 60 * 24 * 400 });
    if (orderId) await redis.set(`order:${orderId}:token`, token, { ex: 60 * 60 * 24 * 400 });
    console.log(`Pro token created for subscription ${subscriptionId}`);
  }

  // ── Monthly renewal — reset to 400 ─────────────────────────────────
  if (eventName === "subscription_payment_success") {
    const subscriptionId = String(event.data?.id);
    const existingToken = await redis.get(`sub:${subscriptionId}:token`);
    if (existingToken) {
      const data = await redis.get(`token:${existingToken}`);
      if (data) {
        data.generations_left = 400;
        data.renewed_at = Date.now();
        await redis.set(`token:${existingToken}`, data, { ex: 60 * 60 * 24 * 400 });
        console.log(`Pro token renewed for subscription ${subscriptionId}`);
      }
    }
  }

  // ── Subscription cancelled — keep access until period ends ────────
  if (eventName === 'subscription_cancelled') {
    console.log('Subscription cancelled — access continues until period end');
  }

  // ── Subscription expired — remove access ───────────────────────────
  if (eventName === 'subscription_expired') {
    const subscriptionId = String(event.data?.id);
    const existingToken = await redis.get(`sub:${subscriptionId}:token`);
    if (existingToken) {
      const data = await redis.get(`token:${existingToken}`);
      if (data) {
        data.generations_left = 0;
        data.expired = true;
        await redis.set(`token:${existingToken}`, data);
        console.log(`Pro token expired for subscription ${subscriptionId}`);
      }
    }
  }

  res.status(200).json({ received: true });
}
