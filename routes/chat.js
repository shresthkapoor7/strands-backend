import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_2);

router.post('/chat', async (req, res) => {
  const { messages = [] } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const cleanedMessages = messages.map(({ role, parts }) => ({
      role,
      parts
    }));

    const result = await model.generateContentStream({ contents: cleanedMessages });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write('event: done\ndata: {"message": "Stream complete"}\n\n');
    res.end();

  } catch (err) {
    console.error('Error streaming from Gemini:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to stream response from Gemini' });
    } else {
      res.write('event: error\ndata: {"error": "Stream failed"}\n\n');
      res.end();
    }
  }
});

export default router;