import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;

const router = express.Router();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

router.get('/get-chat/:chatId', async (req, res) => {
  const { chatId } = req.params;

  try {
    const { rows } = await pool.query(
      'SELECT * FROM messages WHERE "chatId" = $1 ORDER BY "createdAt" ASC',
      [chatId]
    );

    res.status(200).json({ messages: rows });
  } catch (err) {
    console.error('Postgres fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export default router;