// api/send-request.js — Vercel Serverless Function
// Token Telegram dibaca dari Vercel Environment Variables (server-side).
// Set di Vercel Dashboard → Settings → Environment Variables:
//   TELEGRAM_BOT_TOKEN
//   TELEGRAM_CHAT_ID

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse body — Vercel auto-parses JSON, tapi fallback manual jaga-jaga
  let body = req.body;
  if (!body || typeof body === 'string') {
    try { body = JSON.parse(body || '{}'); } catch { body = {}; }
  }

  const { name, category, character, reason } = body;

  if (!name || !category || !character || !reason) {
    return res.status(400).json({ error: 'Semua field wajib diisi.' });
  }
  if (
    String(name).length > 100 ||
    String(character).length > 100 ||
    String(reason).length > 2000
  ) {
    return res.status(400).json({ error: 'Input terlalu panjang.' });
  }

  const token  = process.env.BOT_TOKEN;
  const chatId = process.env.CHAT_ID;

  if (!token || !chatId) {
    console.error('Missing env: BOT_TOKEN / CHAT_ID');
    return res.status(503).json({ error: 'Fitur request belum dikonfigurasi di server.' });
  }

  const text =
    `\uD83C\uDFAD <b>REQUEST KARAKTER \u2014 ALTER EGO</b>\n\n` +
    `\uD83D\uDC64 <b>Dari:</b> ${esc(name)}\n` +
    `\uD83C\uDFAE <b>Kategori:</b> ${esc(category)}\n` +
    `\u2728 <b>Karakter:</b> ${esc(character)}\n\n` +
    `\uD83D\uDCAC <b>Alasan:</b>\n${esc(reason)}`;

  try {
    const tgRes = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
      }
    );

    if (!tgRes.ok) {
      const detail = await tgRes.text();
      console.error('Telegram API error:', tgRes.status, detail);
      return res.status(502).json({ error: 'Gagal kirim ke Telegram.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Fetch error:', err.message);
    return res.status(500).json({ error: 'Server error.' });
  }
};

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
