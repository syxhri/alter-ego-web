// config.js — ALTER EGO
// Token Telegram dihandle server-side oleh Vercel (api/send-request.js).
// Set di Vercel Dashboard → Settings → Environment Variables:
//   TELEGRAM_BOT_TOKEN   → token dari @BotFather
//   TELEGRAM_CHAT_ID     → chat_id tujuan
//
// Untuk upload gambar karakter, daftar di cloudinary.com (gratis):
//   1. Buka Settings → Upload → Add upload preset → Mode: Unsigned
//   2. Salin Cloud Name dari dashboard
//   3. Isi dua field di bawah:

window.TELEGRAM_CONFIG = {
  enabled: true,
};

window.CLOUDINARY_CONFIG = {
  cloudName:    '',   // isi: cloud name dari Cloudinary dashboard
  uploadPreset: '',   // isi: nama unsigned upload preset kamu
};
