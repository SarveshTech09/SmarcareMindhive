/*
  # Add start_date and medication fields to patients table

  1. Schema Changes
    - Add `start_date` column to patients table
    - Add `medication` column to patients table

  2. Notes
    - These fields are needed for tracking patient treatment timeline
    - start_date indicates when patient began GLP-1 therapy
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'start_date'
  ) THEN
    ALTER TABLE patients ADD COLUMN start_date date DEFAULT CURRENT_DATE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'medication'
  ) THEN
    ALTER TABLE patients ADD COLUMN medication text;
  END IF;
END $$;