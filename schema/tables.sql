DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS messages;

CREATE EXTENSION IF NOT EXISTS vector;


CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  "chatId" TEXT,
  "messageId" UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  "userId" TEXT,
  "sentBy" SMALLINT,
  text TEXT,
  "summarizedContent" TEXT,
  embedding VECTOR(1536),
  "isDeleted" BOOLEAN DEFAULT FALSE,
  "strand" BOOLEAN DEFAULT FALSE,
  "parentMessageId" UUID,
  "chatTitle" TEXT,
  "createdAt" timestamptz not null default now()
);

CREATE INDEX idx_messages_embedding ON messages USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE TABLE resources (
  id TEXT PRIMARY KEY,
  "messageId" UUID REFERENCES messages("messageId"),
  "resourceUrl" TEXT,
  "uploadedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_chatId ON messages("chatId");