import { createClient } from '@supabase/supabase-js';

// Using the provided Supabase credentials
const supabaseUrl = 'https://fbyainbqdpwvhwoariaq.supabase.co';
const supabaseAnonKey = 'sb_publishable_EMIdTK5ICYqqEbQPP4qlCA_XRb9g9Hu';

export const isSupabaseConfigured = () => {
    return !!supabaseUrl && !!supabaseAnonKey;
};

// Initialize the client
export const supabase = isSupabaseConfigured() 
    ? createClient(supabaseUrl, supabaseAnonKey) 
    : null;
