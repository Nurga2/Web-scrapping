import axios from 'axios';
export default async function handler(req, res) {
  const { url, alias } = req.query;
  const author = "AngelaImut";
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  if (!url) {
    return res.status(400).json({
      status: false,
      author: author,
      message: "Parameter 'url' wajib diisi!"
    });
  }
  try {
    const apiUrl = `https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}${alias ? `&shorturl=${encodeURIComponent(alias)}` : ''}`;
    const response = await axios.get(apiUrl);
    const data = response.data;
    if (data.shorturl) {
      return res.status(200).json({
        status: true,
        author: author,
        result: {
          original: url,
          short: data.shorturl,
          alias: alias || data.shorturl.split('/').pop(),
          qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${data.shorturl}`
        }
      });
    } else {
      throw new Error(data.errormessage || "Gagal memperpendek URL.");
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      author: author,
      error: error.message
    });
  }
}
