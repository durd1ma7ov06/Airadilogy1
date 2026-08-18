import { createClient } from '@supabase/supabase-js';

// =====================================================
// SUPABASE CONFIGURATION - YANGI PROJECT
// =====================================================
const supabaseUrl = 'https://jucpsefxvoxxryoljbys.supabase.co';
const supabaseAnonKey = 'sb_publishable_ZeZZWUGelg8bVbT45qQRLA_Kjp1z9zw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
