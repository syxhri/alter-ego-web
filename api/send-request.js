// api/send-request.js — Vercel Serverless Function
// Membaca TELEGRAM_BOT_TOKEN dan TELEGRAM_CHAT_ID dari Vercel Environment Variables
// Token tidak pernah terekspos ke browser.

module.exports = async (req, res) => {
  // Hanya terima POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, category, character, reason } = req.body ?? {};

  // Validasi field
  if (!name || !category || !character || !reason) {
    return res.status(400).json({ error: 'Semua field wajib diisi.' });
  }
  if (name.length > 100 || character.length > 100 || reason.length > 2000) {
    return res.status(400).json({ error: 'Input terlalu panjang.' });
  }

  // Baca env vars dari Vercel (tidak pernah sampai ke browser)
  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error('TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID belum diset di Vercel env.');
    return res.status(503).json({ error: 'Fitur request belum dikonfigurasi.' });
  }

  const text =
    `🎭 <b>REQUEST KARAKTER — ALTER EGO</b>\n\n` +
    `👤 <b>Dari:</b> ${esc(name)}\n` +
    `🎮 <b>Kategori:</b> ${esc(category)}\n` +
    `✨ <b>Karakter:</b> ${esc(character)}\n\n` +
    `💬 <b>Alasan:</b>\n${esc(reason)}`;

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
      console.error('Telegram API error:', detail);
      return res.status(502).json({ error: 'Gagal kirim ke Telegram.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Fetch error:', err);
    return res.status(500).json({ error: 'Server error.' });
  }
};

// Escape HTML entities untuk Telegram HTML parse mode
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
