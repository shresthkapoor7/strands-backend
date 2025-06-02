import express from 'express';
import supabase from './supabase.js';

const router = express.Router();

router.get('/get-threads', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('Messages')
            .select('chatId, chatTitle, createdAt')
            .order('createdAt', { ascending: false });

        if (error) {
            console.error('Supabase fetch error:', error);
            return res.status(500).json({ error: 'Failed to fetch threads' });
        }

        const uniqueThreadsMap = new Map();
        for (const message of data) {
            if (!uniqueThreadsMap.has(message.chatId)) {
                uniqueThreadsMap.set(message.chatId, {
                    chatId: message.chatId,
                    chatTitle: message.chatTitle,
                    createdAt: message.createdAt,
                });
            }
        }

        const uniqueThreads = Array.from(uniqueThreadsMap.values());

        res.status(200).json({ threads: uniqueThreads });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;