import { createClient } from '@supabase/supabase-js';

/**
 * DATABASE SCHEMA SETUP (SQL):
 * 
 * -- 1. Create Posts Table
 * CREATE TABLE posts (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   title TEXT NOT NULL,
 *   excerpt TEXT NOT NULL,
 *   content TEXT NOT NULL,
 *   category TEXT NOT NULL,
 *   image_url TEXT,
 *   tags TEXT[] DEFAULT '{}',
 *   download_url TEXT,
 *   button_text TEXT,
 *   button_link TEXT,
 *   views INTEGER DEFAULT 0,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- 2. Create Notifications Table
 * CREATE TABLE notifications (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   message TEXT NOT NULL,
 *   type TEXT DEFAULT 'info',
 *   active BOOLEAN DEFAULT true,
 *   button_text TEXT,
 *   button_link TEXT,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- 3. Create RPC for view counting
 * CREATE OR REPLACE FUNCTION increment_views(post_id UUID)
 * RETURNS void AS $$
 * BEGIN
 *   UPDATE posts SET views = views + 1 WHERE id = post_id;
 * END;
 * $$ LANGUAGE plpgsql;
 */

// Using the provided Supabase credentials
const supabaseUrl = 'https://xgizjcgaviuomqieqtdc.supabase.co';
const supabaseAnonKey = 'sb_publishable_2Hkf-hl2p3LPDfwoZQkD5A_7wG8MPrE';

export const isSupabaseConfigured = () => {
    return !!supabaseUrl && !!supabaseAnonKey;
};

// Initialize the client
export const supabase = isSupabaseConfigured() 
    ? createClient(supabaseUrl, supabaseAnonKey) 
    : null;