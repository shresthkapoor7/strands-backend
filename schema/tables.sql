-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- CHATS TABLE
CREATE TABLE chats (
  id UUID PRIMARY KEY,
  user_id UUID,
  title TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- MESSAGES TABLE
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  chat_id UUID REFERENCES chats(id),
  message_id UUID UNIQUE NOT NULL,
  user_id UUID,
  sent_by TEXT,
  text TEXT,
  summarized_content TEXT,
  embedding VECTOR(1536),
  is_deleted BOOLEAN DEFAULT FALSE,
  is_stranded BOOLEAN DEFAULT FALSE,
  parent_message_id UUID,
  chat_title TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ON messages USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE TABLE resources (
  id UUID PRIMARY KEY,
  message_id UUID REFERENCES messages(message_id),
  resource_url TEXT,
  uploaded_at TIMESTAMP DEFAULT NOW()
);