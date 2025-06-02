import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const router = express.Router();

router.post('/gemini', async (req, res) => {
  const { contents } = req.body;
  const cleanedContents = contents.map((msg) => ({
    role: msg.role,
    parts: msg.parts,
  }));

  try {
    const geminiRes = await fetch(`${process.env.GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: cleanedContents })
    });

    const data = await geminiRes.json();
    res.json(data);
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Gemini API call failed' });
  }
});

export default router;