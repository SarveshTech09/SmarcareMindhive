/*
  # Add Missing Admin Policies for Dashboard Access

  1. Changes
    - Add policy for admins to view all weekly entries (if not exists)
    - Add policy for admins to view all alerts (if not exists)
    - Add policy for admins to update alerts (if not exists)
    - Add policy for doctors to view alerts for their patients (if not exists)
    - Add policy for doctors to view weekly entries for their patients (if not exists)

  2. Security
    - All policies check for admin role in profiles table
    - Maintains existing user access patterns
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'weekly_entries' 
    AND policyname = 'Admins can view all weekly entries'
  ) THEN
    CREATE POLICY "Admins can view all weekly entries"
      ON weekly_entries
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'alerts' 
    AND policyname = 'Admins can view all alerts'
  ) THEN
    CREATE POLICY "Admins can view all alerts"
      ON alerts
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'alerts' 
    AND policyname = 'Admins can update alerts'
  ) THEN
    CREATE POLICY "Admins can update alerts"
      ON alerts
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'alerts' 
    AND policyname = 'Doctors can view alerts for their patients'
  ) THEN
    CREATE POLICY "Doctors can view alerts for their patients"
      ON alerts
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM patients p
          JOIN doctors d ON d.id = p.doctor_id
          WHERE p.id = alerts.patient_id
          AND d.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'weekly_entries' 
    AND policyname = 'Doctors can view weekly entries for their patients'
  ) THEN
    CREATE POLICY "Doctors can view weekly entries for their patients"
      ON weekly_entries
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM patients p
          JOIN doctors d ON d.id = p.doctor_id
          WHERE p.id = weekly_entries.patient_id
          AND d.user_id = auth.uid()
        )
      );
  END IF;
END $$;
