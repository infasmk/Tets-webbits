import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { Post, Stats, Notification } from '../types';

export const fetchPosts = async (): Promise<Post[]> => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('createdAt', { ascending: false });
    if (error) throw error;
    return data as Post[];
  }
  return [];
};

export const fetchPostById = async (id: string): Promise<Post | undefined> => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return undefined;
    return data as Post;
  }
  return undefined;
};

export const incrementPostViews = async (id: string, currentViews: number): Promise<void> => {
  if (isSupabaseConfigured() && supabase) {
    // Attempt the public.increment_views RPC function
    const { error: rpcError } = await supabase.rpc('increment_views', { row_id: id });
    if (rpcError) {
      console.warn("RPC failed, falling back to manual update", rpcError);
      await supabase.from('posts').update({ views: (currentViews || 0) + 1 }).eq('id', id);
    }
  }
};

export const fetchNotifications = async (): Promise<Notification[]> => {
    if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('active', true)
            .order('createdAt', { ascending: false });
        if (error) {
            console.error("Error fetching notifications", error);
            return [];
        }
        return data as Notification[];
    }
    return [];
};

export const createPost = async (post: Omit<Post, 'id' | 'createdAt' | 'views'>): Promise<Post> => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.from('posts').insert([post]).select();
    if (error) throw error;
    return data[0] as Post;
  }
  throw new Error("Supabase not configured");
};

export const updatePost = async (id: string, updates: Partial<Post>): Promise<Post> => {
    if(isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.from('posts').update(updates).eq('id', id).select();
        if(error) throw error;
        return data[0];
    }
    throw new Error("Post not found");
};

export const deletePost = async (id: string): Promise<void> => {
    if(isSupabaseConfigured() && supabase) {
        await supabase.from('posts').delete().eq('id', id);
    }
};

export const fetchStats = async (): Promise<Stats> => {
  if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from('posts').select('views');
      const posts = data || [];
      return {
        totalPosts: posts.length,
        totalViews: posts.reduce((acc, curr) => acc + (Number(curr.views) || 0), 0),
        storageUsedMB: parseFloat((posts.length * 0.4 + 1.2).toFixed(1)),
      };
  }
  return { totalPosts: 0, totalViews: 0, storageUsedMB: 0 };
};

export const saveNotification = async (notif: Omit<Notification, 'id' | 'createdAt' | 'active'>): Promise<Notification> => {
    if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.from('notifications').insert([notif]).select();
        if (error) throw error;
        return data[0] as Notification;
    }
    throw new Error("Supabase not configured");
};

export const deleteNotification = async (id: string): Promise<void> => {
    if (isSupabaseConfigured() && supabase) {
        await supabase.from('notifications').delete().eq('id', id);
    }
};

export const uploadImage = async (file: File): Promise<string> => {
  if (isSupabaseConfigured() && supabase) {
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const { error } = await supabase.storage.from('images').upload(fileName, file);
    if (error) throw error;
    const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(fileName);
    return publicUrlData.publicUrl;
  }
  return "";
};