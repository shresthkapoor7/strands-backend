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

router.post('/get-threads', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    const query = `
      SELECT DISTINCT ON ("chatId")
        "chatId",
        "chatTitle",
        "createdAt"
      FROM messages
      WHERE "userId" = $1
      ORDER BY "chatId", "createdAt" DESC;
    `;
    const { rows } = await pool.query(query, [userId]);

    res.status(200).json({ threads: rows });
  } catch (err) {
    console.error('Postgres fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch threads' });
  }
});

export default router;