DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS chats;

CREATE EXTENSION IF NOT EXISTS vector;


CREATE TABLE chats (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  title TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  chat_id TEXT REFERENCES chats(id),
  message_id TEXT UNIQUE NOT NULL,
  user_id TEXT,
  sent_by TEXT,
  text TEXT,
  summarized_content TEXT,
  embedding VECTOR(1536),
  is_deleted BOOLEAN DEFAULT FALSE,
  is_stranded BOOLEAN DEFAULT FALSE,
  parent_message_id TEXT,
  chat_title TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ON messages USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE TABLE resources (
  id TEXT PRIMARY KEY,
  message_id TEXT REFERENCES messages(message_id),
  resource_url TEXT,
  uploaded_at TIMESTAMP DEFAULT NOW()
);