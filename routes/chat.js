// routes/chat.js
import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const router = express.Router();

router.post('/chat', async (req, res) => {
    const { llm = 'gemini', messages = [] } = req.body;

    const cleanedMessages = messages.map((msg) => ({
        role: msg.role,
        parts: msg.parts,
    }));

    if (llm !== 'gemini') {
        return res.status(400).json({ error: 'Only Gemini supported in /chat for now' });
    }

    try {
        const geminiRes = await fetch(`${process.env.GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: cleanedMessages }),
        });

        const data = await geminiRes.json();
        console.log("Gemini response data:", JSON.stringify(data, null, 2));
        console.log(data);

        const textChunks = data
            .map((entry) => entry?.candidates?.[0]?.content?.parts?.[0]?.text || '')
            .filter(Boolean);

        const fullText = textChunks.join(' ');

        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Transfer-Encoding', 'chunked');

        for (let word of fullText.split(' ')) {
            res.write(word + ' ');
            await new Promise((r) => setTimeout(r, 20));
        }
        res.end();
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        res.status(500).json({ error: 'LLM call failed' });
    }
});

export default router;