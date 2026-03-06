import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'patient' | 'doctor' | 'admin';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  user_id: string;
  name: string;
  age: number;
  gender: string;
  height: number;
  starting_weight: number;
  goal_weight?: number;
  has_diabetes: boolean;
  doctor_id?: string;
  total_points: number;
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  id: string;
  user_id: string;
  dc_code: string;
  name: string;
  specialty: string;
  created_at: string;
}

export interface TherapyEntry {
  id: string;
  patient_id: string;
  medication: string;
  dose_mg: number;
  injection_date: string;
  weeks_on_therapy: number;
  created_at: string;
}

export interface WeightVitals {
  id: string;
  patient_id: string;
  entry_date: string;
  current_weight: number;
  blood_glucose?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  hba1c?: number;
  bmi?: number;
  weight_loss_percentage?: number;
  created_at: string;
}

export interface SideEffect {
  id: string;
  patient_id: string;
  entry_date: string;
  symptom: string;
  severity: 'mild' | 'moderate' | 'severe';
  notes: string;
  created_at: string;
}

export interface AdherenceTracking {
  id: string;
  patient_id: string;
  entry_date: string;
  missed_dose: boolean;
  appetite_change: number;
  cravings_reduced: boolean;
  created_at: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  points_required: number;
  category: string;
  active: boolean;
}

export interface Alert {
  id: string;
  patient_id: string;
  alert_type: string;
  severity: string;
  message: string;
  resolved: boolean;
  created_at: string;
  resolved_at?: string;
}
