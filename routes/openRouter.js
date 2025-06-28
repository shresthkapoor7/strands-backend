import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();
const router = express.Router();

router.post('/chat-stream', async (req, res) => {
  let { messages = [], model } = req.body;

  if (!model) {
    return res.status(400).json({ error: 'Model name is required' });
  }

  if (model === "maverick") model = "meta-llama/llama-4-maverick:free";
  if (model === "gemma") model = "google/gemma-3n-e4b-it:free";
  if (model === "mistral") model = "mistralai/mistral-7b-instruct:free";
  if (model === "deepseek") model = "deepseek/deepseek-r1-0528:free";
  if (model === "deepseek-chat") model = "deepseek/deepseek-chat-v3-0324:free";
  if (model === "qwen3") model = "qwen/qwen3-235b-a22b:free";

  try {
    const streamRes = await fetch(process.env.OPEN_ROUTER_ROUTE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true
      })
    });

    if (!streamRes.ok) {
      const text = await streamRes.text();
      throw new Error(`OpenRouter responded ${streamRes.status}: ${text}`);
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    let buffer = '';
    streamRes.body.on('data', (chunk) => {
      buffer += chunk.toString();

      const parts = buffer.split('\n\n');
      buffer = parts.pop(); // keep leftover

      for (const part of parts) {
        if (part.startsWith('data: ')) {
          const json = part.replace('data: ', '').trim();
          if (json && json !== '[DONE]') {
            try {
              const parsed = JSON.parse(json);
              const text = parsed.choices?.[0]?.delta?.content;
              if (text) {
                res.write(`data: ${JSON.stringify({ text })}\n\n`);
              }
            } catch (e) {
              console.error('JSON parse error:', e);
            }
          }
        }
      }
    });

    streamRes.body.on('end', () => {
      res.write('event: done\ndata: {"message": "Stream complete"}\n\n');
      res.end();
    });

    streamRes.body.on('error', (err) => {
      console.error('Stream error:', err);
      res.end();
    });

  } catch (error) {
    console.error('Error streaming from OpenRouter:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to stream response from OpenRouter' });
    }
  }
});

export default router;