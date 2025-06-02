import express from 'express';
import supabase from './supabase.js';

const router = express.Router();

router.get('/get-chat/:chatId', async (req, res) => {
  const { chatId } = req.params;

  try {
    const { data, error } = await supabase
      .from('Messages')
      .select('*')
      .eq('chatId', chatId)
      .order('createdAt', { ascending: true }); // optional ordering

    if (error) {
      console.error('Supabase fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }

    res.status(200).json({ messages: data });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;