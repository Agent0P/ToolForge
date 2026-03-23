// api/keep-alive.js
// Runs daily via Vercel cron to keep Upstash Redis active
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  // Only allow cron job calls or manual calls with secret
  const authHeader = req.headers.authorization;
  const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  const isManual = req.query.secret === process.env.CRON_SECRET;

  if (!isCron && !isManual) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const timestamp = new Date().toISOString();
    await redis.set("tf:keepalive", timestamp, { ex: 172800 }); // expires in 2 days
    const check = await redis.get("tf:keepalive");
    return res.status(200).json({ ok: true, pinged: check });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
