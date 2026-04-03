-- The Hub: Database Migration
-- Run this in your Supabase SQL Editor

-- 1. user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  hub_name text DEFAULT 'The Hub',
  onboarded boolean DEFAULT false,
  plan text DEFAULT 'free',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (user_id = auth.uid());


-- 2. pillars table
CREATE TABLE IF NOT EXISTS pillars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  color text NOT NULL,
  position integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pillars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pillars"
  ON pillars FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own pillars"
  ON pillars FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own pillars"
  ON pillars FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own pillars"
  ON pillars FOR DELETE
  USING (user_id = auth.uid());


-- 3. hub_items table
CREATE TABLE IF NOT EXISTS hub_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pillar_id uuid REFERENCES pillars(id) ON DELETE CASCADE NOT NULL,
  subcat text NOT NULL,
  title text NOT NULL,
  subtitle text,
  url text,
  raw_input text NOT NULL,
  ai_notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE hub_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own items"
  ON hub_items FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own items"
  ON hub_items FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own items"
  ON hub_items FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own items"
  ON hub_items FOR DELETE
  USING (user_id = auth.uid());
