// ==========================================
// Author  : If you like content like this, you can join this channel. 📲
// Contact : https://t.me/jieshuo_materials
// ==========================================

// File: api/index.js
// Project: atika-smoky (Vercel Native)

export default async function handler(req, res) {
  // 1. Ambil Parameter ?question=... &model=...
  const { question, model } = req.query;
  const selectedModel = model || 'gpt-5-nano';

  // Daftar Model ID
  const modelList = {
    'gpt-4o-mini': '25865',
    'gpt-5-nano': '25871',
    'gemini': '25874',
    'deepseek': '25873',
    'claude': '25875',
    'grok': '25872',
    'meta-ai': '25870',
    'qwen': '25869'
  };

  // Cek Input
  if (!question) {
    return res.status(200).json({
      status: true,
      author: "AngelaImut",
      message: "AI Chat Ready!",
      models: Object.keys(modelList),
      usage: "/api?question=Halo&model=gpt-5-nano"
    });
  }

  // Cek Model
  if (!modelList[selectedModel]) {
    return res.status(400).json({
      status: false,
      message: `Model tidak tersedia. Pilihan: ${Object.keys(modelList).join(', ')}`
    });
  }

  // FUNGSI BANTUAN: UUID Generator (Pengganti library 'uuid')
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  try {
    // --- LANGKAH 1: Ambil NONCE (Token Keamanan) ---
    // Kita tembak Proxy Nekolabs dulu untuk baca HTML
    const urlNonce = `https://api.nekolabs.web.id/px?url=${encodeURIComponent('https://chatgptfree.ai/')}&version=v2`;
    
    const responseNonce = await fetch(urlNonce, {
      method: 'POST' // Ikuti gaya axios.post di script asli
    });

    if (!responseNonce.ok) throw new Error("Gagal mengambil Nonce.");
    
    const jsonNonce = await responseNonce.json();
    const htmlContent = jsonNonce.result?.content || "";

    // Regex buat nyari nonce di dalam HTML (escaped quote)
    const nonceMatch = htmlContent.match(/&quot;nonce&quot;\s*:\s*&quot;([^&]+)&quot;/);
    
    if (!nonceMatch) throw new Error("Nonce tidak ditemukan di halaman target.");
    const nonce = nonceMatch[1];

    // --- LANGKAH 2: Kirim Chat ---
    const urlChat = `https://api.nekolabs.web.id/px?url=${encodeURIComponent('https://chatgptfree.ai/wp-admin/admin-ajax.php')}&version=v2`;
    
    const formData = new URLSearchParams();
    formData.append('action', 'aipkit_frontend_chat_message');
    formData.append('_ajax_nonce', nonce);
    formData.append('bot_id', modelList[selectedModel]);
    formData.append('session_id', generateUUID());
    formData.append('conversation_uuid', generateUUID());
    formData.append('post_id', '6');
    formData.append('message', question);

    const responseChat = await fetch(urlChat, {
      method: 'POST',
      headers: {
        // Headers ini penting buat nipu server target
        'Origin': 'https://chatgptfree.ai',
        'Referer': 'https://chatgptfree.ai/',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36'
      },
      body: formData
    });

    if (!responseChat.ok) throw new Error(`Gagal Chat: ${responseChat.status}`);

    const jsonChat = await responseChat.json();
    
    // Ambil jawaban dari struktur JSON Nekolabs -> Target
    const reply = jsonChat?.result?.content?.data?.reply;

    if (!reply) throw new Error("Jawaban kosong dari AI.");

    // --- SELESAI ---
    return res.status(200).json({
      status: true,
      author: "AngelaImut",
      model: selectedModel,
      question: question,
      result: reply
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message
    });
  }
}