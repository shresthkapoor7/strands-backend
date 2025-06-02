import express from 'express';
import supabase from './supabase.js';

const router = express.Router();

router.post('/save-chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages payload' });
  }

  try {
    const response = await supabase
      .from('Messages')
      .upsert(messages, { onConflict: ['id'] });

    console.log("Supabase insert error:", response);
    const { error } = response;

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to save messages' });
    }

    return res.status(200).json({ message: 'Messages saved successfully' });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;