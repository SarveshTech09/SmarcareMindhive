-- GLP-1 Patient Tracking System - Complete Database Setup
-- Run this script in your Supabase SQL editor to set up the complete database

-- Create enum types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE severity_level AS ENUM ('mild', 'moderate', 'severe');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE transaction_type AS ENUM ('earned', 'redeemed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'patient',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  dc_code text UNIQUE NOT NULL,
  name text NOT NULL,
  specialty text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Doctors can view own data" ON doctors;
CREATE POLICY "Doctors can view own data" ON doctors FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Anyone can view doctors for linking" ON doctors;
CREATE POLICY "Anyone can view doctors for linking" ON doctors FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Doctors can insert own data" ON doctors;
CREATE POLICY "Doctors can insert own data" ON doctors FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- patients table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  age integer NOT NULL,
  gender text NOT NULL,
  height numeric NOT NULL,
  starting_weight numeric NOT NULL,
  goal_weight numeric,
  has_diabetes boolean DEFAULT false,
  doctor_id uuid REFERENCES doctors(id),
  total_points integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Patients can view own data" ON patients;
CREATE POLICY "Patients can view own data" ON patients FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Patients can update own data" ON patients;
CREATE POLICY "Patients can update own data" ON patients FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Patients can insert own data" ON patients;
CREATE POLICY "Patients can insert own data" ON patients FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Doctors can view assigned patients" ON patients;
CREATE POLICY "Doctors can view assigned patients" ON patients FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM doctors WHERE doctors.id = patients.doctor_id AND doctors.user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can view all patients" ON patients;
CREATE POLICY "Admins can view all patients" ON patients FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- therapy_entries table
CREATE TABLE IF NOT EXISTS therapy_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  medication text NOT NULL,
  dose_mg numeric NOT NULL,
  injection_date date NOT NULL,
  weeks_on_therapy integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE therapy_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Patients can manage own therapy entries" ON therapy_entries;
CREATE POLICY "Patients can manage own therapy entries" ON therapy_entries FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM patients WHERE patients.id = therapy_entries.patient_id AND patients.user_id = auth.uid()));

DROP POLICY IF EXISTS "Doctors can view assigned patients therapy" ON therapy_entries;
CREATE POLICY "Doctors can view assigned patients therapy" ON therapy_entries FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM patients JOIN doctors ON doctors.id = patients.doctor_id WHERE patients.id = therapy_entries.patient_id AND doctors.user_id = auth.uid()));

-- weight_vitals table
CREATE TABLE IF NOT EXISTS weight_vitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  entry_date date NOT NULL,
  current_weight numeric NOT NULL,
  blood_glucose numeric,
  blood_pressure_systolic integer,
  blood_pressure_diastolic integer,
  hba1c numeric,
  bmi numeric,
  weight_loss_percentage numeric,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE weight_vitals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Patients can manage own weight vitals" ON weight_vitals;
CREATE POLICY "Patients can manage own weight vitals" ON weight_vitals FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM patients WHERE patients.id = weight_vitals.patient_id AND patients.user_id = auth.uid()));

DROP POLICY IF EXISTS "Doctors can view assigned patients vitals" ON weight_vitals;
CREATE POLICY "Doctors can view assigned patients vitals" ON weight_vitals FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM patients JOIN doctors ON doctors.id = patients.doctor_id WHERE patients.id = weight_vitals.patient_id AND doctors.user_id = auth.uid()));

-- side_effects table
CREATE TABLE IF NOT EXISTS side_effects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  entry_date date NOT NULL,
  symptom text NOT NULL,
  severity severity_level NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE side_effects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Patients can manage own side effects" ON side_effects;
CREATE POLICY "Patients can manage own side effects" ON side_effects FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM patients WHERE patients.id = side_effects.patient_id AND patients.user_id = auth.uid()));

DROP POLICY IF EXISTS "Doctors can view assigned patients side effects" ON side_effects;
CREATE POLICY "Doctors can view assigned patients side effects" ON side_effects FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM patients JOIN doctors ON doctors.id = patients.doctor_id WHERE patients.id = side_effects.patient_id AND doctors.user_id = auth.uid()));

-- adherence_tracking table
CREATE TABLE IF NOT EXISTS adherence_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  entry_date date NOT NULL,
  missed_dose boolean DEFAULT false,
  appetite_change integer CHECK (appetite_change BETWEEN 1 AND 5),
  cravings_reduced boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE adherence_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Patients can manage own adherence" ON adherence_tracking;
CREATE POLICY "Patients can manage own adherence" ON adherence_tracking FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM patients WHERE patients.id = adherence_tracking.patient_id AND patients.user_id = auth.uid()));

-- weekly_entries table
CREATE TABLE IF NOT EXISTS weekly_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  week_number integer NOT NULL,
  entry_date date NOT NULL,
  therapy_entry_id uuid REFERENCES therapy_entries(id),
  weight_vitals_id uuid REFERENCES weight_vitals(id),
  adherence_id uuid REFERENCES adherence_tracking(id),
  completed boolean DEFAULT false,
  points_awarded integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE weekly_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Patients can manage own weekly entries" ON weekly_entries;
CREATE POLICY "Patients can manage own weekly entries" ON weekly_entries FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM patients WHERE patients.id = weekly_entries.patient_id AND patients.user_id = auth.uid()));

-- points_transactions table
CREATE TABLE IF NOT EXISTS points_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  points integer NOT NULL,
  reason text NOT NULL,
  transaction_type transaction_type NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Patients can view own points" ON points_transactions;
CREATE POLICY "Patients can view own points" ON points_transactions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM patients WHERE patients.id = points_transactions.patient_id AND patients.user_id = auth.uid()));

DROP POLICY IF EXISTS "System can insert points" ON points_transactions;
CREATE POLICY "System can insert points" ON points_transactions FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM patients WHERE patients.id = points_transactions.patient_id AND patients.user_id = auth.uid()));

-- rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  points_required integer NOT NULL,
  category text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active rewards" ON rewards;
CREATE POLICY "Anyone can view active rewards" ON rewards FOR SELECT TO authenticated USING (active = true);

-- patient_rewards table
CREATE TABLE IF NOT EXISTS patient_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  reward_id uuid REFERENCES rewards(id),
  redeemed_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending'
);

ALTER TABLE patient_rewards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Patients can view own redeemed rewards" ON patient_rewards;
CREATE POLICY "Patients can view own redeemed rewards" ON patient_rewards FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM patients WHERE patients.id = patient_rewards.patient_id AND patients.user_id = auth.uid()));

DROP POLICY IF EXISTS "Patients can redeem rewards" ON patient_rewards;
CREATE POLICY "Patients can redeem rewards" ON patient_rewards FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM patients WHERE patients.id = patient_rewards.patient_id AND patients.user_id = auth.uid()));

-- alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  severity text NOT NULL,
  message text NOT NULL,
  resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Patients can view own alerts" ON alerts;
CREATE POLICY "Patients can view own alerts" ON alerts FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM patients WHERE patients.id = alerts.patient_id AND patients.user_id = auth.uid()));

DROP POLICY IF EXISTS "System can create alerts" ON alerts;
CREATE POLICY "System can create alerts" ON alerts FOR INSERT TO authenticated WITH CHECK (true);

-- doctor_notes table
CREATE TABLE IF NOT EXISTS doctor_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  note text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE doctor_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Doctors can manage own notes" ON doctor_notes;
CREATE POLICY "Doctors can manage own notes" ON doctor_notes FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM doctors WHERE doctors.id = doctor_notes.doctor_id AND doctors.user_id = auth.uid()));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_doctor_id ON patients(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_therapy_entries_patient_id ON therapy_entries(patient_id);
CREATE INDEX IF NOT EXISTS idx_weight_vitals_patient_id ON weight_vitals(patient_id);
CREATE INDEX IF NOT EXISTS idx_side_effects_patient_id ON side_effects(patient_id);

-- Insert sample rewards
INSERT INTO rewards (name, description, points_required, category, active)
SELECT * FROM (VALUES
  ('Fitness Membership - 1 Month', 'Get 1 month free fitness center membership', 100, 'Fitness', true),
  ('Diet Planner Session', 'One-on-one session with a certified diet planner', 150, 'Nutrition', true),
  ('Health Coaching - 30 min', '30-minute health coaching session', 200, 'Coaching', true),
  ('Wellness Package', 'Complete wellness assessment and planning', 300, 'Wellness', true)
) AS v(name, description, points_required, category, active)
WHERE NOT EXISTS (SELECT 1 FROM rewards LIMIT 1);
