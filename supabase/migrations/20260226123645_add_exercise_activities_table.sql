/*
  # Add Exercise Activities Table

  ## New Table
    - `exercise_activities`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, foreign key to patients)
      - `entry_date` (date)
      - `activity_type` (text) - e.g., Walking, Running, Swimming, Cycling, Yoga, Gym
      - `duration_minutes` (integer) - duration in minutes
      - `intensity` (text) - low, moderate, high
      - `notes` (text, optional)
      - `created_at` (timestamptz)

  ## Security
    - Enable RLS on `exercise_activities` table
    - Patients can view and insert their own exercise activities
    - Doctors can view their patients' exercise activities
*/

CREATE TABLE IF NOT EXISTS exercise_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  activity_type text NOT NULL,
  duration_minutes integer NOT NULL,
  intensity text NOT NULL DEFAULT 'moderate',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exercise_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Patients can view own exercise activities" ON exercise_activities;
CREATE POLICY "Patients can view own exercise activities"
  ON exercise_activities
  FOR SELECT
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Patients can insert own exercise activities" ON exercise_activities;
CREATE POLICY "Patients can insert own exercise activities"
  ON exercise_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Doctors can view their patients exercise activities" ON exercise_activities;
CREATE POLICY "Doctors can view their patients exercise activities"
  ON exercise_activities
  FOR SELECT
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE doctor_id IN (
        SELECT id FROM doctors WHERE user_id = auth.uid()
      )
    )
  );