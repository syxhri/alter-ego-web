// api/guestbook.js — Vercel Serverless Function
// Menyimpan dan mengambil pesan buku tamu menggunakan Vercel KV (Redis).
// Env vars yang dibutuhkan (otomatis diinjeksi Vercel saat KV terhubung):
//   KV_REST_API_URL
//   KV_REST_API_TOKEN

const KEY    = 'guestbook';
const MAX    = 100; // maksimum entri yang disimpan

// Helper: panggil Vercel KV REST API
async function kvCommand(command) {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    throw new Error('KV_REST_API_URL / KV_REST_API_TOKEN belum diset.');
  }

  const res = await fetch(`${url}/pipeline`, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([command]),
  });

  if (!res.ok) throw new Error(`KV error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data[0]?.result;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — ambil semua entri
  if (req.method === 'GET') {
    try {
      const raw     = await kvCommand(['LRANGE', KEY, 0, MAX - 1]);
      const entries = (raw ?? []).map(s => { try { return JSON.parse(s); } catch { return null; } }).filter(Boolean);
      return res.status(200).json(entries);
    } catch (err) {
      console.error('GET guestbook error:', err.message);
      // Kalau KV belum dikonfigurasi, return array kosong (graceful)
      return res.status(200).json([]);
    }
  }

  // POST — tambah entri baru
  if (req.method === 'POST') {
    let body = req.body;
    if (!body || typeof body === 'string') {
      try { body = JSON.parse(body || '{}'); } catch { body = {}; }
    }

    const name    = String(body.name    ?? '').trim();
    const message = String(body.message ?? '').trim();

    if (!name || !message) {
      return res.status(400).json({ error: 'Nama dan pesan wajib diisi.' });
    }
    if (name.length > 50)     return res.status(400).json({ error: 'Nama maksimal 50 karakter.' });
    if (message.length > 300) return res.status(400).json({ error: 'Pesan maksimal 300 karakter.' });

    const entry = {
      id:        `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name:      esc(name),
      message:   esc(message),
      timestamp: new Date().toISOString(),
    };

    try {
      // Simpan ke kiri list (terbaru duluan), lalu trim ke MAX entri
      await kvCommand(['LPUSH', KEY, JSON.stringify(entry)]);
      await kvCommand(['LTRIM', KEY, 0, MAX - 1]);
      return res.status(201).json({ ok: true, entry });
    } catch (err) {
      console.error('POST guestbook error:', err.message);
      return res.status(503).json({ error: 'Guestbook belum dikonfigurasi di server.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
