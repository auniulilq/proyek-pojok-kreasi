import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import 'dotenv/config'; // Cara modern untuk memuat .env

const app = express();
const port = 3001; // Server backend akan berjalan di port ini

app.use(cors());
app.use(express.json());

app.post('/api/askAI', async (req, res) => {
  try {
    const { userQuery, systemPrompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "API key tidak ditemukan di server." });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    
    const combinedPrompt = `${systemPrompt}\n\nPertanyaan Pengguna: "${userQuery}"`;

    const payload = {
      contents: [{ parts: [{ text: combinedPrompt }] }],
    };

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
        const errorBody = await apiResponse.text();
        console.error("Google API Error:", errorBody);
        return res.status(apiResponse.status).json({ error: "Gagal menghubungi Google AI.", details: errorBody });
    }

    const result = await apiResponse.json();
    const botResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, saya tidak mendapat jawaban.";

    res.json({ response: botResponse });

  } catch (error) {
    console.error('Internal Server Error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan di server lokal.' });
  }
});

app.listen(port, () => {
  console.log(`[server] Server backend lokal berjalan di http://localhost:${port}`);
});

