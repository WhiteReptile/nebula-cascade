import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Valores hardcodeados para evitar errores de entorno
const SUPABASE_URL = "https://pbklgtguxftmckwhwgtb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_iOSUCtYJya-qZTkYy6JYsQ_EQsbIcVC";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});