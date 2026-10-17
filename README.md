# ALTER EGO — Character Archive
> Proyek Pemrograman Web · Kelompok 2

Website arsip karakter fiksi dan alter ego anggota kelompok, dibangun dengan **pure HTML + CSS + Vanilla JS** tanpa framework apapun.

## Tech Stack
- **HTML5** — semantik, aksesibel, mobile-first
- **CSS3** — Neobrutalist Pastel RPG theme, CSS custom properties, mobile-first responsive
- **Vanilla JS** — fetch API untuk load data JSON, focus trap, hamburger menu, Telegram integration

## Fitur
- 🗂️ **Character Archive** — 20 karakter dari 7 franchise berbeda dengan modal detail
- 🔍 **Search & Filter** — filter per kategori + pencarian real-time
- 🎭 **Our Alter Ego** — 5 pasangan anggota × karakter favorit dengan deskripsi kepribadian
- 📨 **Request Karakter** — form request langsung kirim ke Telegram bot
- 📱 **Mobile-first Responsive** — optimized untuk HP kecil sampai desktop lebar

## Struktur
```
alter-ego/
├── index.html          ← Main HTML
├── style.css           ← CSS (mobile-first, neobrutalist)
├── script.js           ← Vanilla JS logic
├── config.js           ← ⚙️ Telegram config (isi token di sini!)
├── favicon.svg         ← Logo SVG
├── data/
│   ├── characters.json ← Data 20 karakter
│   └── alter-egos.json ← Data 5 pasangan alter ego
└── images/
    ├── characters/     ← Foto karakter (nama: <slug>.jpg)
    └── members/        ← Foto anggota kelompok
```

## Setup Telegram (optional)
1. Chat `@BotFather` di Telegram → `/newbot` → salin **BOT TOKEN**
2. Buka `https://api.telegram.org/bot<TOKEN>/getUpdates` → salin **chat_id**
3. Edit `config.js`:
   ```js
   window.TELEGRAM_CONFIG = {
     enabled:  true,               // ubah jadi true
     botToken: 'ISI_TOKEN_KAMU',
     chatId:   'ISI_CHAT_ID_KAMU',
   };
   ```

## Cara Jalankan
```bash
# VS Code Live Server: klik kanan index.html → Open with Live Server
# Atau:
npx http-server .
# Atau:
python -m http.server 8000
```

> ⚠️ Harus via server lokal — `file://` tidak support fetch ke JSON lokal.

## Anggota Kelompok 2
| NIM | Nama | Alter Ego |
|---|---|---|
| 15201425001 | Alfisyahri Amrun A | Jinhsi (Wuthering Waves) |
| 15201425018 | Arsyto Adhwa Alvaro Muliawan | Han Sooyoung (ORV) |
| 15201425030 | Marsela Damalu | Jianxin (Wuthering Waves) |
| 15201425028 | Nabila Rajak | Hermione Granger (Harry Potter) |
| 15201425014 | Rahmat Suleman | Arlecchino (Genshin Impact) |
