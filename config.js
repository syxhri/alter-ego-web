/* ═══════════════════════════════════════════════════════════════════════════
   ALTER EGO — Telegram Config
   ───────────────────────────────────────────────────────────────────────────
   Cara setup:
   1. Buat Telegram Bot lewat @BotFather → dapatkan BOT TOKEN
   2. Kirim pesan ke bot kamu, lalu buka:
      https://api.telegram.org/bot<TOKEN>/getUpdates
      untuk dapatkan CHAT_ID kamu
   3. Isi botToken dan chatId di file .env atau di Environment Variables tempat hosting
   4. Atur ENABLE_REQUEST ke true di env
   ═══════════════════════════════════════════════════════════════════════════ */

const dotenv = require('dotenv');
dotenv.config();

window.TELEGRAM_CONFIG = {
  enabled:  process.env.ENABLE_REQUEST,
  botToken: process.env.BOT_TOKEN,
  chatId:   process.env.CHAT_ID,
};
