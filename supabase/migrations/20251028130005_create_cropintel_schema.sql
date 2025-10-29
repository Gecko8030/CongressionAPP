/*
  # CropIntel AR Database Schema

  ## Overview
  Creates the complete database schema for the CropIntel AR crop disease monitoring system.
  
  ## New Tables
  
  ### 1. `reports`
  Stores disease detection reports from farmers
  - `id` (uuid, primary key) - Unique report identifier
  - `user_id` (uuid, foreign key) - References auth.users
  - `crop` (text) - Crop type (rice, soy, cotton)
  - `county` (text) - Arkansas county name
  - `image_url` (text) - Storage URL for uploaded image
  - `prediction` (text) - Disease prediction from ML model
  - `confidence` (float) - Model confidence score
  - `latitude` (float) - Optional GPS latitude
  - `longitude` (float) - Optional GPS longitude
  - `expert_feedback` (text) - Agronomist review/feedback
  - `status` (text) - Report status (pending, reviewed, resolved)
  - `created_at` (timestamptz) - Report timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 2. `alerts`
  County-level risk alerts computed from weather and reports
  - `id` (serial, primary key) - Alert identifier
  - `county` (text) - Arkansas county name
  - `crop` (text) - Crop type
  - `risk_score` (float) - Computed risk level (0-1)
  - `message` (text) - Alert message for farmers
  - `temperature` (float) - Current temperature (F)
  - `humidity` (float) - Current humidity (%)
  - `conditions` (text) - Weather conditions summary
  - `updated_at` (timestamptz) - Last computation timestamp
  
  ### 3. `user_profiles`
  Extended user information for farmers
  - `id` (uuid, primary key) - References auth.users
  - `full_name` (text) - Farmer name
  - `county` (text) - Primary county
  - `phone` (text) - Contact number
  - `farm_acres` (integer) - Farm size
  - `primary_crops` (text[]) - Array of crops grown
  - `notifications_enabled` (boolean) - Push notification preference
  - `created_at` (timestamptz) - Profile creation timestamp
  
  ## Security
  - Enable RLS on all tables
  - Users can only view/edit their own reports
  - Alerts are publicly readable
  - User profiles are private to the owner
*/

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  crop text NOT NULL,
  county text NOT NULL,
  image_url text,
  prediction text,
  confidence float,
  latitude float,
  longitude float,
  expert_feedback text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id serial PRIMARY KEY,
  county text NOT NULL,
  crop text NOT NULL,
  risk_score float NOT NULL DEFAULT 0,
  message text,
  temperature float,
  humidity float,
  conditions text,
  updated_at timestamptz DEFAULT now()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name text,
  county text,
  phone text,
  farm_acres integer,
  primary_crops text[],
  notifications_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reports
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON reports FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for alerts (publicly readable)
CREATE POLICY "Anyone can view alerts"
  ON alerts FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_county ON reports(county);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_county ON alerts(county);
CREATE INDEX IF NOT EXISTS idx_alerts_updated_at ON alerts(updated_at DESC);

-- Seed Arkansas counties alerts data
INSERT INTO alerts (county, crop, risk_score, message, updated_at) VALUES
  ('Lonoke', 'rice', 0.35, 'Moderate conditions for sheath blight', now()),
  ('Stuttgart', 'rice', 0.42, 'Monitor for rice blast', now()),
  ('Poinsett', 'rice', 0.28, 'Low risk conditions', now()),
  ('Jefferson', 'soy', 0.51, 'Favorable armyworm conditions', now()),
  ('Arkansas', 'rice', 0.38, 'Watch humidity levels', now()),
  ('Mississippi', 'cotton', 0.33, 'Standard monitoring recommended', now())
ON CONFLICT DO NOTHING;