/*
  # Add user_id based side_effects and exercise_activities tables

  1. New Tables
    - `side_effects_user` - side effects linked to user_id instead of patient_id
    - `exercise_activities_user` - exercise activities linked to user_id
    
  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Admins can access all data
*/

CREATE TABLE IF NOT EXISTS side_effects_user (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  side_effect text NOT NULL,
  severity text NOT NULL,
  reported_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE side_effects_user ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own side effects" ON side_effects_user;
CREATE POLICY "Users can view own side effects"
  ON side_effects_user
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own side effects" ON side_effects_user;
CREATE POLICY "Users can insert own side effects"
  ON side_effects_user
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all side effects" ON side_effects_user;
CREATE POLICY "Admins can view all side effects"
  ON side_effects_user
  FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE TABLE IF NOT EXISTS exercise_activities_user (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type text NOT NULL,
  duration_minutes integer NOT NULL,
  calories_burned integer,
  activity_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exercise_activities_user ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own exercise activities" ON exercise_activities_user;
CREATE POLICY "Users can view own exercise activities"
  ON exercise_activities_user
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own exercise activities" ON exercise_activities_user;
CREATE POLICY "Users can insert own exercise activities"
  ON exercise_activities_user
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all exercise activities" ON exercise_activities_user;
CREATE POLICY "Admins can view all exercise activities"
  ON exercise_activities_user
  FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE INDEX IF NOT EXISTS idx_side_effects_user_user_id ON side_effects_user(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_activities_user_user_id ON exercise_activities_user(user_id);