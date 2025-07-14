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

router.post('/save-chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages payload' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const msg of messages) {
      const {
        chatId,
        messageId,
        userId,
        sentBy,
        text,
        summarizedContent,
        embedding,
        isDeleted = false,
        strand = false,
        parentMessageId,
        chatTitle,
        createdAt
      } = msg;

      await client.query(
        `INSERT INTO messages (
          "messageId", "chatId", "userId", "sentBy", "text",
          "summarizedContent", "embedding",
          "isDeleted", "strand", "parentMessageId",
          "chatTitle", "createdAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT ("messageId") DO UPDATE SET
          "chatId" = EXCLUDED."chatId",
          "userId" = EXCLUDED."userId",
          "sentBy" = EXCLUDED."sentBy",
          "text" = EXCLUDED."text",
          "summarizedContent" = EXCLUDED."summarizedContent",
          "embedding" = EXCLUDED."embedding",
          "isDeleted" = EXCLUDED."isDeleted",
          "strand" = EXCLUDED."strand",
          "parentMessageId" = EXCLUDED."parentMessageId",
          "chatTitle" = EXCLUDED."chatTitle",
          "createdAt" = EXCLUDED."createdAt"`,
        [
          messageId, chatId, userId, sentBy, text,
          summarizedContent, embedding,
          isDeleted, strand, parentMessageId,
          chatTitle, createdAt || new Date()
        ]
      );
    }

    await client.query('COMMIT');
    res.status(200).json({ message: 'Messages saved successfully' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Save error:', err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    client.release();
  }
});

export default router;