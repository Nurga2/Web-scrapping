/**
 * ZIGLINK URL SHORTENER - Vercel Serverless
 * Standard: AngelaImut / SofiApis
 * Original Creator: Hazel
 */

import axios from 'axios';

export default async function handler(req, res) {
  // 1. Ambil parameter dari URL (?url=...&alias=...)
  const { url, alias } = req.query;
  const author = "AngelaImut";

  // Setup CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  // Validasi Input
  if (!url) {
    return res.status(400).json({
      status: false,
      author: author,
      message: "Parameter 'url' wajib diisi!"
    });
  }

  try {
    // 2. Request ke API Ziglink
    // Kita gunakan data form-url-encoded sesuai kebutuhan Ziglink
    const response = await axios.post('https://ziglink.id/api/url/add', {
      url: url,
      alias: alias || "" // Jika alias kosong, Ziglink akan buatkan otomatis
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
      }
    });

    const data = response.data;

    // 3. Cek hasil respon dari Ziglink
    if (data.status === 'success') {
      return res.status(200).json({
        status: true,
        author: author,
        result: {
          original: url,
          short: data.short_url,
          alias: data.alias,
          qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${data.short_url}`
        }
      });
    } else {
      throw new Error(data.message || "Gagal memperpendek URL.");
    }

  } catch (error) {
    // 4. Penanganan Error
    return res.status(500).json({
      status: false,
      author: author,
      error: error.message
    });
  }
}
