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

// ── Send purchase confirmation email via Resend ──────────────────────
async function sendPurchaseEmail({ toEmail, productLabel, generationsLabel }) {
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:40px 20px;background:#f0ede6;font-family:'DM Sans',Arial,sans-serif;">
<div style="max-width:520px;margin:0 auto;">
  <div style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 32px rgba(15,15,13,0.10);">

    <!-- Header -->
    <div style="background:#0f0f0d;padding:32px 36px 28px;">
      <div style="margin-bottom:20px;">
        <span style="font-family:Georgia,serif;font-weight:700;font-size:22px;color:#ffffff;letter-spacing:-0.5px;">Tool</span><span style="font-family:Georgia,serif;font-weight:700;font-size:22px;color:#e85d04;letter-spacing:-0.5px;">Forge</span>
      </div>
      <div style="font-size:24px;font-weight:800;color:#ffffff;line-height:1.2;margin-bottom:8px;">Your access is ready. ✦</div>
      <div style="font-size:14px;color:rgba(255,255,255,0.55);line-height:1.5;">${productLabel} · ${generationsLabel}</div>
    </div>

    <!-- Body -->
    <div style="padding:32px 36px;">
      <p style="font-size:15px;color:#3a3a32;line-height:1.7;margin:0 0 24px;">Hi there,<br><br>
      Thank you for your purchase! Your ToolForge access is now active and ready to use.</p>

      <!-- Access email box -->
      <div style="background:#f7f5f0;border:1.5px solid #e85d04;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
        <div style="font-size:11px;color:#e85d04;font-weight:700;letter-spacing:1px;margin-bottom:10px;text-transform:uppercase;">Your Access Email</div>
        <div style="font-size:15px;color:#0f0f0d;font-weight:700;margin-bottom:12px;">${toEmail}</div>
        <div style="font-size:12px;color:#6b6b5f;line-height:1.6;">This is the email tied to your purchase. Use it anytime to restore access on any device — no password needed.</div>
      </div>

      <!-- What's included -->
      <div style="background:#f7f5f0;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
        <div style="font-size:12px;color:#6b6b5f;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:14px;">What's included</div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
          <span style="color:#e85d04;font-size:16px;">✦</span>
          <span style="font-size:13px;color:#3a3a32;"><strong>${generationsLabel}</strong> — never expire</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
          <span style="color:#e85d04;font-size:16px;">✦</span>
          <span style="font-size:13px;color:#3a3a32;">Works across all AI-powered tools on ToolForge</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="color:#e85d04;font-size:16px;">✦</span>
          <span style="font-size:13px;color:#3a3a32;">Restore access anytime from any device using your email</span>
        </div>
      </div>

      <!-- How to restore -->
      <div style="margin-bottom:28px;">
        <div style="font-size:12px;color:#6b6b5f;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:14px;">How to restore access on a new device</div>
        <div style="display:flex;gap:12px;margin-bottom:10px;align-items:flex-start;">
          <div style="width:22px;height:22px;border-radius:99px;background:#0f0f0d;color:white;font-size:11px;font-weight:700;text-align:center;line-height:22px;flex-shrink:0;">1</div>
          <div style="font-size:13px;color:#3a3a32;line-height:1.6;">Your access is already active in the browser you purchased from</div>
        </div>
        <div style="display:flex;gap:12px;margin-bottom:10px;align-items:flex-start;">
          <div style="width:22px;height:22px;border-radius:99px;background:#0f0f0d;color:white;font-size:11px;font-weight:700;text-align:center;line-height:22px;flex-shrink:0;">2</div>
          <div style="font-size:13px;color:#3a3a32;line-height:1.6;">On any new device, go to <strong>toolforge.pro</strong> and click <strong>"Restore Access"</strong></div>
        </div>
        <div style="display:flex;gap:12px;align-items:flex-start;">
          <div style="width:22px;height:22px;border-radius:99px;background:#0f0f0d;color:white;font-size:11px;font-weight:700;text-align:center;line-height:22px;flex-shrink:0;">3</div>
          <div style="font-size:13px;color:#3a3a32;line-height:1.6;">Enter this email address — your access will be restored instantly</div>
        </div>
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:28px;">
        <a href="https://toolforge.pro" style="display:inline-block;background:#e85d04;color:white;text-decoration:none;font-size:14px;font-weight:700;padding:14px 36px;border-radius:10px;letter-spacing:0.3px;">Start Using ToolForge →</a>
      </div>

      <div style="padding-top:20px;border-top:1px solid #e8e5de;">
        <p style="font-size:12px;color:#9b9b8f;line-height:1.7;margin:0;">Questions? Email us at <a href="mailto:toolforgesupport@gmail.com" style="color:#e85d04;text-decoration:none;">toolforgesupport@gmail.com</a><br>
        You're receiving this because you made a purchase at <a href="https://toolforge.pro" style="color:#e85d04;text-decoration:none;">toolforge.pro</a>.<br>
        © 2026 ToolForge · Made with ☕</p>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ToolForge <noreply@toolforge.pro>',
        to: [toEmail],
        bcc: ['toolforgesupport@gmail.com'],
        subject: '✦ Your ToolForge access is ready',
        html,
      }),
    });
    const data = await res.json();
    if (!res.ok) console.error('Resend error:', data);
    else console.log('Purchase email sent to:', toEmail);
  } catch (err) {
    // Email failure should never block the webhook response
    console.error('Resend fetch error:', err);
  }
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
    const email = event.data?.attributes?.user_email || '';
    const data = await redis.get(`token:${existingToken}`);
    if (data) {
      data.generations_left = (data.generations_left || 0) + 100;
      data.topup_at = Date.now();
      await redis.set(`token:${existingToken}`, data, { ex: 60 * 60 * 24 * 365 });
      await redis.set(`order:${orderId}:token`, existingToken, { ex: 60 * 60 * 24 * 30 });
      console.log(`Top-up: +100 generations to ${existingToken}`);
      if (email) {
        await sendPurchaseEmail({
          toEmail: email,
          productLabel: 'Top-Up Pack',
          generationsLabel: '+100 Claude Sonnet AI generations added',
        });
      }
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
    if (email) {
      await sendPurchaseEmail({
        toEmail: email,
        productLabel: 'One-Time Pack',
        generationsLabel: '50 Claude Sonnet AI generations',
      });
    }
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
    if (email) {
      await sendPurchaseEmail({
        toEmail: email,
        productLabel: 'Pro Monthly',
        generationsLabel: '400 Claude Sonnet AI generations / month',
      });
    }
  }

  // ── Monthly renewal — reset to 400 ─────────────────────────────────
  if (eventName === 'subscription_payment_success') {
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

  // ── Subscription cancelled — keep access until period ends ─────────
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
