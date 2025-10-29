import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Report = {
  id: string
  user_id: string
  crop: string
  county: string
  image_url: string
  prediction: string
  confidence: number
  latitude?: number
  longitude?: number
  expert_feedback?: string
  status: string
  created_at: string
  updated_at: string
}

export type Alert = {
  id: number
  county: string
  crop: string
  risk_score: number
  message: string
  temperature?: number
  humidity?: number
  conditions?: string
  updated_at: string
}

export type UserProfile = {
  id: string
  full_name?: string
  county?: string
  phone?: string
  farm_acres?: number
  primary_crops?: string[]
  notifications_enabled: boolean
  created_at: string
}
