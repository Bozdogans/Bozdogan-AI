// server.js - einfacher Express server, liefert static files und /api/chat
const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  const message = req.body?.message;
  if (!message) return res.status(400).json({ error: 'Message required' });

  const HF_KEY = process.env.HF_API_KEY;
  const HF_MODEL = process.env.HF_MODEL; // optional

  try {
    if (HF_KEY && HF_MODEL) {
      // Wenn du einen Hugging Face API Key & Modell hast, ruft es die HF Inference API
      const resp = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HF_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inputs: message })
      });
      const data = await resp.json();
      // HF-Antwort kann verschiedene Formen haben — wir versuchen typische Felder
      const reply = data?.generated_text ?? (Array.isArray(data) ? (data[0]?.generated_text ?? data[0]) : JSON.stringify(data));
      return res.json({ reply: String(reply) });
    } else {
      // Demo-Fallback: einfache, freundliche Antwort (kostenlos)
      return res.json({ reply: `Bordorn AI (Demo): Ich habe deine Nachricht erhalten: "${message}"` });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error', details: String(err) });
  }
});

// optionaler health check
app.get('/ping', (req, res) => res.send('ok'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server läuft auf Port ${port}`));
