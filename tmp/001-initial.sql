-- migrate:up

CREATE TABLE sessions (
  id INTEGER PRIMARY KEY,
  type TEXT not null,
  external_id TEXT not null,

  created_at INTEGER not null,
  updated_at INTEGER not null
);

CREATE TABLE conversations (
  id integer PRIMARY KEY,
  session_id integer not null,
  external_id TEXT,

  mode_type TEXT not null,
  mode_version TEXT not null,
  extra TEXT,

  created_at INTEGER not null,
  updated_at INTEGER not null
);

CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  external_id TEXT not null,
  session_id INTEGER not null,

  name TEXT not null,
  extra TEXT,

  created_at INTEGER not null,
  updated_at INTEGER not null
);

CREATE TABLE messages (
  id INTEGER PRIMARY KEY,
  conversation_id INTEGER not null,
  parent_message_id INTEGER,

  command text,
  prompt text not null,
  response text,
  extra TEXT,

  created_at INTEGER not null,
  updated_at INTEGER not null
);

-- migrate:down

DROP TABLE sessions;
DROP TABLE conversions;
DROP TABLE messages;
