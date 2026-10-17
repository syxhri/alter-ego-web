/* ═══════════════════════════════════════════════════════════════════════════
   ALTER EGO — Telegram Config
   ───────────────────────────────────────────────────────────────────────────
   Cara setup:
   1. Buat Telegram Bot lewat @BotFather → dapatkan BOT TOKEN
   2. Kirim pesan ke bot kamu, lalu buka:
      https://api.telegram.org/bot<TOKEN>/getUpdates
      untuk dapatkan CHAT_ID kamu
   3. Isi botToken dan chatId di bawah
   4. Ubah enabled: false → enabled: true
   ═══════════════════════════════════════════════════════════════════════════ */

/// from env
const dotenv = require('dotenv');
dotenv.config();

window.TELEGRAM_CONFIG = {
  enabled:  false,                      // ← ubah jadi true setelah isi token
  botToken: process.env.BOT_TOKEN,      // ← isi token dari @BotFather
  chatId:   process.env.CHAT_ID,        // ← isi chat_id kamu
};
