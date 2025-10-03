// Fungsi ini akan berjalan di server Netlify, bukan di browser.
// Tugasnya adalah menjadi jembatan yang aman ke Google Gemini API.

exports.handler = async (event) => {
    // Hanya izinkan metode POST
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }
  
    try {
      const { userQuery, systemPrompt } = JSON.parse(event.body);
      
      // Ambil API key rahasia dari environment variables di Netlify
      const apiKey = process.env.GEMINI_API_KEY;
  
      if (!apiKey) {
        throw new Error("API key tidak ditemukan di environment server.");
      }
      
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
  
      const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
      };
  
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
  
      if (!response.ok) {
        // Jika Google API memberikan error, teruskan error tersebut
        const errorBody = await response.text();
        console.error("Google API Error:", errorBody);
        return {
          statusCode: response.status,
          body: JSON.stringify({ error: "Gagal menghubungi Google AI.", details: errorBody })
        };
      }
  
      const result = await response.json();
      const botResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, saya tidak mendapat jawaban.";
  
      // Kirim kembali jawaban dari AI ke aplikasi React Anda
      return {
        statusCode: 200,
        body: JSON.stringify({ response: botResponse }),
      };
  
    } catch (error) {
      console.error('Internal Server Error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Terjadi kesalahan di server fungsi.' }),
      };
    }
  };
  
  