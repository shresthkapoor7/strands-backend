import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import geminiRoute from './routes/gemini.js';
import saveChatRouter from './routes/saveChat.js';
import getChatRouter from './routes/getChat.js';
import getAllChatsRouter from './routes/getAllChats.js';
import geminiSearchRouter from './routes/geminiSearch.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || [
      'http://localhost:3000',
      'https://shresthkapoor7.github.io',
      'https://www.strandschat.com',
    ].includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/api', geminiRoute);
app.use('/api', saveChatRouter);
app.use('/api', getChatRouter);
app.use('/api', getAllChatsRouter);
app.use('/api', geminiSearchRouter);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});