import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your-supabase-url') {
  console.warn('Supabase credentials are not configured properly. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
