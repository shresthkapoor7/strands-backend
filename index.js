import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import geminiRoute from './routes/gemini.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Must come before routes
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || [
      'http://localhost:3000',
      'https://shresthkapoor7.github.io',
      'https://shresthkapoor7.github.io/strands'
    ].includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/api', geminiRoute);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});