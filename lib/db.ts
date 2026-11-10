import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { TASKS, type Difficulty, type Task } from "@/data/tasks";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "app.db");

let db: DatabaseSync | null = null;

export interface User {
  id: number;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

export interface Session {
  tokenHash: string;
  userId: number;
  expiresAt: number;
}

export interface Attempt {
  id: number;
  userId: number;
  taskId: string;
  answerText: string;
  answerCode: string;
  selfRating: "solved" | "with_material" | "unsolved";
  createdAt: string;
}

export type TaskRow = {
  id: string;
  topic: string;
  title: string;
  difficulty: string;
  description: string;
  material: string;
  requirements: string;
  clarifying_questions: string;
  model_answer: string;
  model_code: string;
  sort_order: number;
};

export interface ProgressRow {
  topic: string;
  solved: number;
  total: number;
}

function migrate(database: DatabaseSync) {
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      topic TEXT NOT NULL,
      title TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      description TEXT NOT NULL,
      material TEXT NOT NULL,
      requirements TEXT NOT NULL,
      clarifying_questions TEXT NOT NULL,
      model_answer TEXT NOT NULL,
      model_code TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      answer_text TEXT NOT NULL DEFAULT '',
      answer_code TEXT NOT NULL DEFAULT '',
      self_rating TEXT NOT NULL DEFAULT 'unsolved',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_attempts_user ON attempts(user_id);
    CREATE INDEX IF NOT EXISTS idx_attempts_task ON attempts(task_id);

    CREATE TABLE IF NOT EXISTS streaks (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      current_streak INTEGER NOT NULL DEFAULT 0,
      longest_streak INTEGER NOT NULL DEFAULT 0,
      last_activity_date TEXT
    );
  `);
}

// Идемпотентный сид: новые задачи добавляются, существующие обновляются.
function seedTasks(database: DatabaseSync) {
  const upsert = database.prepare(`
    INSERT INTO tasks (
      id, topic, title, difficulty, description,
      material, requirements, clarifying_questions,
      model_answer, model_code, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      topic = excluded.topic,
      title = excluded.title,
      difficulty = excluded.difficulty,
      description = excluded.description,
      material = excluded.material,
      requirements = excluded.requirements,
      clarifying_questions = excluded.clarifying_questions,
      model_answer = excluded.model_answer,
      model_code = excluded.model_code,
      sort_order = excluded.sort_order
  `);

  for (const t of TASKS) {
    upsert.run(
      t.id,
      t.topic,
      t.title,
      t.difficulty,
      t.description,
      t.material,
      JSON.stringify(t.requirements),
      JSON.stringify(t.clarifyingQuestions),
      t.modelAnswer,
      t.modelCode,
      t.sortOrder,
    );
  }
}

export function getDb(): DatabaseSync {
  if (db) return db;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  db = new DatabaseSync(DB_PATH);
  migrate(db);
  seedTasks(db);
  return db;
}

function parseTask(row: TaskRow): Task {
  return {
    id: row.id,
    topic: row.topic,
    title: row.title,
    difficulty: row.difficulty as Difficulty,
    description: row.description,
    material: row.material,
    requirements: JSON.parse(row.requirements),
    clarifyingQuestions: JSON.parse(row.clarifying_questions),
    modelAnswer: row.model_answer,
    modelCode: row.model_code,
    sortOrder: row.sort_order,
  };
}

// ───────────────────────── Пользователи ─────────────────────────

export function createUser(email: string, name: string, passwordHash: string): User {
  const database = getDb();
  const result = database
    .prepare("INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)")
    .run(email.toLowerCase().trim(), name.trim(), passwordHash);
  const id = Number(result.lastInsertRowid);
  return getUserById(id)!;
}

export function getUserByEmail(email: string): User | null {
  const row = getDb()
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email.toLowerCase().trim()) as
    | {
        id: number;
        email: string;
        name: string;
        password_hash: string;
        created_at: string;
      }
    | undefined;
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

export function getUserById(id: number): User | null {
  const row = getDb()
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(id) as
    | {
        id: number;
        email: string;
        name: string;
        password_hash: string;
        created_at: string;
      }
    | undefined;
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

// ───────────────────────── Сессии ─────────────────────────

export function createSession(userId: number, tokenHash: string, expiresAt: number) {
  getDb()
    .prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)")
    .run(tokenHash, userId, expiresAt);
}

export function getSessionByTokenHash(tokenHash: string): Session | null {
  const row = getDb()
    .prepare("SELECT * FROM sessions WHERE token_hash = ?")
    .get(tokenHash) as
    | { token_hash: string; user_id: number; expires_at: number }
    | undefined;
  if (!row) return null;
  return {
    tokenHash: row.token_hash,
    userId: row.user_id,
    expiresAt: row.expires_at,
  };
}

export function deleteSession(tokenHash: string) {
  getDb().prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash);
}

// ───────────────────────── Задачи ─────────────────────────

export function listTasks(topic?: string): Task[] {
  const database = getDb();
  const rows = (
    topic
      ? database
          .prepare("SELECT * FROM tasks WHERE topic = ? ORDER BY sort_order ASC")
          .all(topic)
      : database.prepare("SELECT * FROM tasks ORDER BY topic ASC, sort_order ASC").all()
  ) as TaskRow[];
  return rows.map(parseTask);
}

export function getTask(id: string): Task | null {
  const row = getDb().prepare("SELECT * FROM tasks WHERE id = ?").get(id) as
    | TaskRow
    | undefined;
  return row ? parseTask(row) : null;
}

export function getSolvedTaskIds(userId: number): Set<string> {
  const rows = getDb()
    .prepare(
      `SELECT DISTINCT task_id FROM attempts
       WHERE user_id = ? AND self_rating != 'unsolved'`,
    )
    .all(userId) as { task_id: string }[];
  return new Set(rows.map((r) => r.task_id));
}

export function listTopics(): { topic: string; count: number }[] {
  const rows = getDb()
    .prepare("SELECT topic, COUNT(*) AS count FROM tasks GROUP BY topic ORDER BY topic")
    .all() as { topic: string; count: number }[];
  return rows;
}

// ───────────────────────── Попытки ─────────────────────────

export function createAttempt(
  userId: number,
  taskId: string,
  answerText: string,
  answerCode: string,
): Attempt {
  const database = getDb();
  const result = database
    .prepare(
      "INSERT INTO attempts (user_id, task_id, answer_text, answer_code, self_rating) VALUES (?, ?, ?, ?, 'unsolved')",
    )
    .run(userId, taskId, answerText, answerCode);
  const id = Number(result.lastInsertRowid);
  return getAttemptById(id)!;
}

export function getAttemptById(id: number): Attempt | null {
  const row = getDb().prepare("SELECT * FROM attempts WHERE id = ?").get(id) as
    | {
        id: number;
        user_id: number;
        task_id: string;
        answer_text: string;
        answer_code: string;
        self_rating: "solved" | "with_material" | "unsolved";
        created_at: string;
      }
    | undefined;
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    taskId: row.task_id,
    answerText: row.answer_text,
    answerCode: row.answer_code,
    selfRating: row.self_rating,
    createdAt: row.created_at,
  };
}

export function rateAttempt(
  attemptId: number,
  userId: number,
  rating: "solved" | "with_material" | "unsolved",
) {
  getDb()
    .prepare("UPDATE attempts SET self_rating = ? WHERE id = ? AND user_id = ?")
    .run(rating, attemptId, userId);
}

export function listAttemptsByUser(userId: number, limit = 50): (Attempt & {
  taskTitle: string;
  topic: string;
  difficulty: Difficulty;
})[] {
  const rows = getDb()
    .prepare(
      `SELECT a.*, t.title AS task_title, t.topic AS topic, t.difficulty AS difficulty
       FROM attempts a
       JOIN tasks t ON t.id = a.task_id
       WHERE a.user_id = ?
       ORDER BY a.created_at DESC, a.id DESC
       LIMIT ?`,
    )
    .all(userId, limit) as {
    id: number;
    user_id: number;
    task_id: string;
    answer_text: string;
    answer_code: string;
    self_rating: "solved" | "with_material" | "unsolved";
    created_at: string;
    task_title: string;
    topic: string;
    difficulty: Difficulty;
  }[];

  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    taskId: r.task_id,
    answerText: r.answer_text,
    answerCode: r.answer_code,
    selfRating: r.self_rating,
    createdAt: r.created_at,
    taskTitle: r.task_title,
    topic: r.topic,
    difficulty: r.difficulty,
  }));
}

export function getLatestAttemptForTask(userId: number, taskId: string): Attempt | null {
  const row = getDb()
    .prepare(
      `SELECT * FROM attempts WHERE user_id = ? AND task_id = ?
       ORDER BY id DESC LIMIT 1`,
    )
    .get(userId, taskId) as
    | {
        id: number;
        user_id: number;
        task_id: string;
        answer_text: string;
        answer_code: string;
        self_rating: "solved" | "with_material" | "unsolved";
        created_at: string;
      }
    | undefined;
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    taskId: row.task_id,
    answerText: row.answer_text,
    answerCode: row.answer_code,
    selfRating: row.self_rating,
    createdAt: row.created_at,
  };
}

// ───────────────────────── Прогресс ─────────────────────────

export interface TopicProgress {
  topic: string;
  solved: number;
  total: number;
}

export function getTopicProgress(userId: number): TopicProgress[] {
  const rows = getDb()
    .prepare(
      `SELECT t.topic AS topic,
              COUNT(DISTINCT t.id) AS total,
              COUNT(DISTINCT CASE WHEN a.self_rating != 'unsolved' THEN a.task_id END) AS solved
       FROM tasks t
       LEFT JOIN attempts a
         ON a.task_id = t.id AND a.user_id = ?
       GROUP BY t.topic
       ORDER BY t.topic`,
    )
    .all(userId) as { topic: string; solved: number; total: number }[];
  return rows;
}

export function getOverallProgress(userId: number): { solved: number; total: number } {
  const row = getDb()
    .prepare(
      `SELECT
         COUNT(DISTINCT t.id) AS total,
         COUNT(DISTINCT CASE WHEN a.self_rating != 'unsolved' THEN a.task_id END) AS solved
       FROM tasks t
       LEFT JOIN attempts a ON a.task_id = t.id AND a.user_id = ?`,
    )
    .get(userId) as { solved: number; total: number } | undefined;
  return { solved: row?.solved ?? 0, total: row?.total ?? 0 };
}

// ───────────────────────── Стрик ─────────────────────────

export interface Streak {
  current: number;
  longest: number;
  lastActivityDate: string | null;
}

function todayStr(): string {
  // локальная дата в формате YYYY-MM-DD
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getStreak(userId: number): Streak {
  const row = getDb().prepare("SELECT * FROM streaks WHERE user_id = ?").get(userId) as
    | {
        user_id: number;
        current_streak: number;
        longest_streak: number;
        last_activity_date: string | null;
      }
    | undefined;
  if (!row) return { current: 0, longest: 0, lastActivityDate: null };
  return {
    current: row.current_streak,
    longest: row.longest_streak,
    lastActivityDate: row.last_activity_date,
  };
}

export function touchStreak(userId: number): Streak {
  const database = getDb();
  const streak = getStreak(userId);
  const today = todayStr();

  if (streak.lastActivityDate === today) {
    return streak; // уже активность сегодня
  }

  const isYesterday = streak.lastActivityDate === yesterdayStr();
  const current = isYesterday ? streak.current + 1 : 1;
  const longest = Math.max(streak.longest, current);

  database
    .prepare(
      `INSERT INTO streaks (user_id, current_streak, longest_streak, last_activity_date)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         current_streak = excluded.current_streak,
         longest_streak = excluded.longest_streak,
         last_activity_date = excluded.last_activity_date`,
    )
    .run(userId, current, longest, today);

  return { current, longest, lastActivityDate: today };
}
