/*
  # Add Doctor Linking Fields
  
  1. Schema Changes
    - Add `doctor_id` column to `patients` table to link patients to doctors
    - Add `state` and `city` columns to `patients` table for geographic analysis
    - Add `doctor_id` column to `doctors` table for unique doctor identification
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'doctor_id'
  ) THEN
    ALTER TABLE patients ADD COLUMN doctor_id text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'state'
  ) THEN
    ALTER TABLE patients ADD COLUMN state text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'city'
  ) THEN
    ALTER TABLE patients ADD COLUMN city text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'doctors' AND column_name = 'doctor_id'
  ) THEN
    ALTER TABLE doctors ADD COLUMN doctor_id text UNIQUE;
  END IF;
END $$;