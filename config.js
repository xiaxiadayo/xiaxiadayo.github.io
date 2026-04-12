/**
 * Message Board Configuration
 *
 * Storage backend for the message board.
 * Currently supports: "supabase" or "local" (localStorage fallback).
 *
 * ──────────────────────────────────────────────
 * To use Supabase (recommended for public access):
 *   1. Create a free Supabase project at https://supabase.com
 *   2. Create a table called "messages" with the following SQL:
 *
 *      CREATE TABLE messages (
 *        id        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *        author    TEXT NOT NULL,
 *        content   TEXT NOT NULL,
 *        created_at TIMESTAMPTZ DEFAULT now()
 *      );
 *
 *      -- Enable Row Level Security
 *      ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
 *
 *      -- Allow anyone to read
 *      CREATE POLICY "Public read" ON messages FOR SELECT USING (true);
 *
 *      -- Allow anonymous inserts
 *      CREATE POLICY "Anon insert" ON messages FOR INSERT WITH CHECK (true);
 *
 *      -- Allow anonymous deletes (front-end password gate only)
 *      CREATE POLICY "Anon delete" ON messages FOR DELETE USING (true);
 *
 *   3. Copy your project URL and anon key below.
 *   4. Set STORAGE_BACKEND to "supabase".
 *
 * ──────────────────────────────────────────────
 * If you don't configure Supabase, set STORAGE_BACKEND to "local".
 * In local mode, messages are stored in the browser's localStorage
 * and are only visible on the same device / browser.
 * ──────────────────────────────────────────────
 *
 * SECURITY NOTE:
 * - The admin password ("xiaxia") is checked purely on the front end.
 *   It is visible in the source code and offers NO real security.
 *   It is only a simple barrier to prevent accidental deletions.
 * - The Supabase anon key is also visible in the source code.
 *   Use Row Level Security (RLS) to control access on the server side.
 */

const MESSAGE_BOARD_CONFIG = {
  /** "supabase" or "local" */
  STORAGE_BACKEND: "supabase",

  /** Supabase project URL (e.g. "https://xxxxx.supabase.co") */
  SUPABASE_URL: "https://aswowaalfwpaffcyokuh.supabase.co",

  /** Supabase anon / public key */
  SUPABASE_ANON_KEY: "sb_publishable_LXDRu0OGEjp4LUkUjXxRWQ_nuSgLzip",

  /** Admin password for deleting messages (front-end only, NOT secure) */
  ADMIN_PASSWORD: "xiaxia"
};
