/*
  # Add Weight Entries and Medicine Intake Tables

  1. New Tables
    - `weight_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `weight` (numeric)
      - `height` (numeric)
      - `bmi` (numeric)
      - `waist_circumference` (numeric, optional)
      - `entry_date` (date)
      - `created_at` (timestamptz)
    
    - `medicine_intake`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `medication_name` (text)
      - `dosage` (text)
      - `taken_at` (timestamptz)
      - `notes` (text, optional)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Users can only access their own data
    - Admins can access all data
*/

CREATE TABLE IF NOT EXISTS weight_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  weight numeric NOT NULL,
  height numeric,
  bmi numeric,
  waist_circumference numeric,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE weight_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own weight entries" ON weight_entries;
CREATE POLICY "Users can view own weight entries"
  ON weight_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own weight entries" ON weight_entries;
CREATE POLICY "Users can insert own weight entries"
  ON weight_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own weight entries" ON weight_entries;
CREATE POLICY "Users can update own weight entries"
  ON weight_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all weight entries" ON weight_entries;
CREATE POLICY "Admins can view all weight entries"
  ON weight_entries
  FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE TABLE IF NOT EXISTS medicine_intake (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  medication_name text NOT NULL,
  dosage text NOT NULL,
  taken_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE medicine_intake ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own medicine intake" ON medicine_intake;
CREATE POLICY "Users can view own medicine intake"
  ON medicine_intake
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own medicine intake" ON medicine_intake;
CREATE POLICY "Users can insert own medicine intake"
  ON medicine_intake
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own medicine intake" ON medicine_intake;
CREATE POLICY "Users can update own medicine intake"
  ON medicine_intake
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all medicine intake" ON medicine_intake;
CREATE POLICY "Admins can view all medicine intake"
  ON medicine_intake
  FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE INDEX IF NOT EXISTS idx_weight_entries_user_id ON weight_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_entries_entry_date ON weight_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_medicine_intake_user_id ON medicine_intake(user_id);
CREATE INDEX IF NOT EXISTS idx_medicine_intake_taken_at ON medicine_intake(taken_at);