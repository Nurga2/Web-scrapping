// ==========================================
// Author  : If you like content like this, you can join this channel. 📲
// Contact : https://t.me/jieshuo_materials
// ==========================================

export default async function handler(req, res) {
  // 1. Setup Header CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Content-Type', 'application/json');

  // 2. Ambil Parameter (Bisa dari Query URL atau Body JSON)
  // Prioritas: Body JSON > Query URL
  const { 
    q,          // Pertanyaan
    question,   // Alias pertanyaan
    model,      // Pilihan model
    system,     // System prompt (Sifat AI)
    image,      // URL Gambar (Jika mau mode Vision)
    url         // Alias URL Gambar
  } = { ...req.query, ...req.body };

  const finalQuestion = q || question;
  const finalImage = image || url;
  const selectedModel = model || 'gpt-4.1-mini'; // Default model
  const systemPrompt = system || "You are a helpful assistant.";

  if (!finalQuestion) {
    return res.status(400).json({
      status: false,
      creator: "AngelaImut",
      message: "Masukkan pertanyaan! Contoh: /api/ai?q=Siapa kamu?"
    });
  }

  // 3. Mapping Model (Sesuai script kamu)
  const modelList = {
    'gpt-4.1': 'openai-large',      // Paling pintar
    'gpt-4.1-mini': 'openai',       // Standar
    'gpt-4.1-nano': 'openai-fast'   // Paling cepat
  };

  // Cek apakah model valid, kalau tidak pakai default
  const targetModel = modelList[selectedModel] || 'openai';

  try {
    // 4. Susun Pesan (Content Array)
    const userContent = [
      { type: 'text', text: finalQuestion }
    ];

    // Jika ada gambar, tambahkan ke payload
    if (finalImage) {
      userContent.push({
        type: 'image_url',
        image_url: { 
          url: finalImage // Pollinations bisa baca URL gambar langsung
        }
      });
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent }
    ];

    // 5. Tembak ke Pollinations (Native Fetch)
    const response = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer dummy', // Sesuai trik kamu
        'Origin': 'https://sur.pollinations.ai',
        'Referer': 'https://sur.pollinations.ai/',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
      },
      body: JSON.stringify({
        messages: messages,
        model: targetModel,
        temperature: 0.5,
        presence_penalty: 0,
        top_p: 1,
        frequency_penalty: 0
      })
    });

    const json = await response.json();

    // 6. Ambil Hasil
    const resultText = json.choices[0].message.content;

    return res.status(200).json({
      status: true,
      author: "AngelaImut",
      model: selectedModel,
      result: resultText
    });

  } catch (e) {
    return res.status(500).json({
      status: false,
      error: "Server Error: " + e.message
    });
  }
}