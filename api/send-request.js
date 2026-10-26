// api/send-request.js — Vercel Serverless Function
// Menerima data submit karakter, kirim notifikasi ke Telegram untuk direview.
// Env vars (Vercel Dashboard → Settings → Environment Variables):
//   TELEGRAM_BOT_TOKEN
//   TELEGRAM_CHAT_ID

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let body = req.body;
  if (!body || typeof body === 'string') {
    try { body = JSON.parse(body || '{}'); } catch { body = {}; }
  }

  const { sender, charName, franchise, imageUrl, personality, stats, note } = body;

  if (!sender || !charName || !franchise || !personality) {
    return res.status(400).json({ error: 'Field wajib belum lengkap.' });
  }
  if (String(charName).length > 100 || String(personality).length > 1000) {
    return res.status(400).json({ error: 'Input terlalu panjang.' });
  }

  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(503).json({ error: 'Telegram belum dikonfigurasi di server.' });
  }

  // Format stats
  const statsLines = Array.isArray(stats)
    ? stats.filter(s => s.label && s.value)
        .map(s => `  \u2022 <b>${esc(s.label)}:</b> ${esc(s.value)}`)
        .join('\n')
    : '';

  const text =
    `\uD83C\uDFAD <b>SUBMIT KARAKTER \u2014 ALTER EGO</b>\n\n` +
    `\uD83D\uDC64 <b>Dari:</b> ${esc(sender)}\n\n` +
    `\u2728 <b>Karakter:</b> ${esc(charName)}\n` +
    `\uD83C\uDFAE <b>Franchise:</b> ${esc(franchise)}\n` +
    (imageUrl ? `\uD83D\uDDBC <b>Gambar:</b> <a href="${esc(imageUrl)}">Lihat gambar</a>\n` : '') +
    `\n\uD83D\uDCDD <b>Kepribadian:</b>\n${esc(personality)}\n` +
    (statsLines ? `\n\uD83D\uDCCA <b>Stats:</b>\n${statsLines}\n` : '') +
    (note ? `\n\uD83D\uDCAC <b>Catatan:</b>\n${esc(note)}` : '');

  try {
    // Kirim pesan teks
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: false }),
    });
    if (!tgRes.ok) throw new Error(`Telegram ${tgRes.status}`);

    // Kirim gambar terpisah jika ada URL
    if (imageUrl) {
      await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, photo: imageUrl, caption: `📸 ${esc(charName)}` }),
      }).catch(() => {}); // jangan blok response kalau photo gagal
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Telegram error:', err.message);
    return res.status(502).json({ error: 'Gagal kirim ke Telegram.' });
  }
};

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
