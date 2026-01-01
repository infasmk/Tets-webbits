import { createClient } from '@supabase/supabase-js';

// Using the provided new Supabase credentials
const supabaseUrl = 'https://xgizjcgaviuomqieqtdc.supabase.co';
const supabaseAnonKey = 'sb_publishable_2Hkf-hl2p3LPDfwoZQkD5A_7wG8MPrE';

export const isSupabaseConfigured = () => {
    return !!supabaseUrl && !!supabaseAnonKey;
};

// Initialize the client
export const supabase = isSupabaseConfigured() 
    ? createClient(supabaseUrl, supabaseAnonKey) 
    : null;