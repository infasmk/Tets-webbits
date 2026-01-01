
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { Post, Stats, Notification } from '../types';

// Fallback persistence for Demo/Dev mode
const LOCAL_STORAGE_KEY = 'wb_local_posts';
const NOTIF_STORAGE_KEY = 'wb_local_notifs';

const getLocalPosts = (): Post[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

const saveLocalPost = (post: Post) => {
  const posts = getLocalPosts();
  const index = posts.findIndex(p => p.id === post.id);
  if (index >= 0) posts[index] = post;
  else posts.push(post);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(posts));
};

const getLocalNotifs = (): Notification[] => {
  try {
    const data = localStorage.getItem(NOTIF_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

const saveLocalNotif = (notif: Notification) => {
  const notifs = getLocalNotifs();
  notifs.unshift(notif);
  localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(notifs));
};

/**
 * Robust helper to stringify database or network errors
 * Prevents [object Object] by checking specific fields and using JSON fallback
 */
const stringifyError = (err: any): string => {
  if (!err) return "Unknown error occurred";
  if (typeof err === 'string') return err;
  
  // Specifically handle Supabase/PostgREST error objects
  const parts = [];
  if (err.message && typeof err.message === 'string') parts.push(err.message);
  if (err.details && typeof err.details === 'string') parts.push(err.details);
  if (err.hint && typeof err.hint === 'string') parts.push(`Hint: ${err.hint}`);
  if (err.code) parts.push(`[Error Code: ${err.code}]`);
  
  if (parts.length > 0) return parts.join(' | ');

  // Handle standard Error objects
  if (err instanceof Error) return err.message;
  
  // Last resort: Deep JSON check
  try {
    const json = JSON.stringify(err);
    if (json !== '{}' && json !== '[]') return json;
  } catch (e) {
    // Fail silently
  }
  
  return String(err);
};

// Helper to map DB snake_case to App camelCase
const mapPost = (dbPost: any): Post => ({
  id: dbPost.id,
  title: dbPost.title,
  excerpt: dbPost.excerpt,
  content: dbPost.content,
  category: dbPost.category,
  imageUrl: dbPost.image_url || dbPost.imageUrl,
  tags: dbPost.tags || [],
  downloadUrl: dbPost.download_url || dbPost.downloadUrl,
  buttonText: dbPost.button_text || dbPost.buttonText,
  buttonLink: dbPost.button_link || dbPost.buttonLink,
  createdAt: dbPost.created_at || dbPost.createdAt,
  views: dbPost.views || 0,
});

export const fetchPosts = async (): Promise<Post[]> => {
  let dbPosts: Post[] = [];
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) dbPosts = data.map(mapPost);
    } catch (e) { console.warn("Supabase fetch failed"); }
  }
  
  const localPosts = getLocalPosts();
  const merged = [...dbPosts];
  localPosts.forEach(lp => {
    if (!merged.find(p => p.id === lp.id)) merged.unshift(lp);
  });
  
  return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const fetchPostById = async (id: string): Promise<Post | undefined> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('posts').select('*').eq('id', id).single();
      if (!error && data) return mapPost(data);
    } catch {}
  }
  return getLocalPosts().find(p => p.id === id);
};

export const incrementPostViews = async (id: string, currentViews: number): Promise<void> => {
  if (isSupabaseConfigured() && supabase && !id.toString().startsWith('local-')) {
    try {
      const { error } = await supabase.rpc('increment_views', { post_id: id });
      if (error) throw error;
      return;
    } catch {
      await supabase.from('posts').update({ views: (currentViews || 0) + 1 }).eq('id', id);
    }
  }
  
  const localPosts = getLocalPosts();
  const localIdx = localPosts.findIndex(p => p.id === id);
  if (localIdx >= 0) {
    localPosts[localIdx].views = (localPosts[localIdx].views || 0) + 1;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localPosts));
  }
};

export const fetchNotifications = async (onlyActive: boolean = true): Promise<Notification[]> => {
    let dbNotifs: Notification[] = [];
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('notifications').select('*');
        if (onlyActive) query = query.eq('active', true);
        
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        
        if (data) dbNotifs = data.map(n => ({
            id: n.id,
            message: n.message,
            type: n.type,
            buttonText: n.button_text,
            buttonLink: n.button_link,
            active: n.active,
            createdAt: n.created_at,
            syncStatus: 'cloud'
        }));
      } catch (err) {
          console.error("Cloud fetch failed", err);
      }
    }
    
    // Merge local for demo/dev
    const local = getLocalNotifs().map(n => ({ ...n, syncStatus: 'local' })) as any[];
    const merged = [...dbNotifs];
    local.forEach(ln => {
        if (!merged.find(mn => mn.id === ln.id)) merged.push(ln);
    });

    const filtered = onlyActive ? merged.filter(n => n.active) : merged;
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const saveNotification = async (notifData: Omit<Notification, 'id' | 'createdAt' | 'active'>): Promise<Notification> => {
    const fullPayload = {
        message: notifData.message,
        type: notifData.type,
        button_text: notifData.buttonText || null,
        button_link: notifData.buttonLink || null,
        active: true
    };
    
    if (isSupabaseConfigured() && supabase) {
        // Attempt insert with full payload
        let { data, error } = await supabase.from('notifications').insert([fullPayload]).select();
        
        // Handle missing column error (PGRST204) by falling back to simplified schema
        if (error && error.code === 'PGRST204') {
            console.warn("Table schema mismatch detected (missing button_link/text). Falling back to basic broadcast.");
            const basicPayload = {
                message: notifData.message,
                type: notifData.type,
                active: true
            };
            const retry = await supabase.from('notifications').insert([basicPayload]).select();
            data = retry.data;
            error = retry.error;
        }

        if (error) {
            const readableError = stringifyError(error);
            console.error(`Broadcast sync failure: ${readableError}`, error);
            throw new Error(readableError);
        }
        
        if (data && data[0]) {
            return {
                id: data[0].id,
                message: data[0].message,
                type: data[0].type,
                buttonText: data[0].button_text,
                buttonLink: data[0].button_link,
                active: data[0].active,
                createdAt: data[0].created_at,
                syncStatus: 'cloud'
            } as any;
        }
    }

    // Local-only persistence if no Cloud connection
    const newNotif: Notification = { 
        ...notifData, 
        id: `local-${Date.now()}`,
        active: true,
        createdAt: new Date().toISOString(),
        syncStatus: 'local'
    } as any;
    saveLocalNotif(newNotif);
    return newNotif;
};

export const deactivateNotification = async (id: string): Promise<void> => {
    if (isSupabaseConfigured() && supabase && !id.toString().startsWith('local-')) {
        const { error } = await supabase.from('notifications').update({ active: false }).eq('id', id);
        if (error) throw new Error(stringifyError(error));
        return;
    }
    
    const notifs = getLocalNotifs();
    const idx = notifs.findIndex(n => n.id === id);
    if (idx >= 0) {
        notifs[idx].active = false;
        localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(notifs));
    }
};

export const deleteNotification = async (id: string): Promise<void> => {
    if (isSupabaseConfigured() && supabase && !id.toString().startsWith('local-')) {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw new Error(stringifyError(error));
    }
    const filtered = getLocalNotifs().filter(n => n.id !== id);
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(filtered));
};

export const createPost = async (postData: Omit<Post, 'id' | 'createdAt' | 'views'>): Promise<Post> => {
  const sanitized = {
    title: postData.title,
    excerpt: postData.excerpt,
    content: postData.content,
    category: postData.category,
    image_url: postData.imageUrl,
    tags: postData.tags,
    download_url: postData.downloadUrl || null,
    // FIXED: Changed postData.button_text to postData.buttonText to align with the Post type definition
    button_text: postData.buttonText || null,
    button_link: postData.buttonLink || null,
    views: 0,
  };

  if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('posts').insert([sanitized]).select();
      if (error) {
          throw new Error(stringifyError(error));
      }
      if (data) return mapPost(data[0]);
  }

  const newPost: Post = {
    ...postData,
    id: `local-${Date.now()}`,
    views: 0,
    createdAt: new Date().toISOString()
  } as Post;
  saveLocalPost(newPost);
  return newPost;
};

export const updatePost = async (id: string, updates: Partial<Post>): Promise<Post> => {
    if (isSupabaseConfigured() && supabase && !id.toString().startsWith('local-')) {
        const dbUpdates: any = {};
        if (updates.hasOwnProperty('title')) dbUpdates.title = updates.title;
        if (updates.hasOwnProperty('excerpt')) dbUpdates.excerpt = updates.excerpt;
        if (updates.hasOwnProperty('content')) dbUpdates.content = updates.content;
        if (updates.hasOwnProperty('category')) dbUpdates.category = updates.category;
        if (updates.hasOwnProperty('imageUrl')) dbUpdates.image_url = updates.imageUrl;
        if (updates.hasOwnProperty('tags')) dbUpdates.tags = updates.tags;
        if (updates.hasOwnProperty('downloadUrl')) dbUpdates.download_url = updates.downloadUrl;
        if (updates.hasOwnProperty('buttonText')) dbUpdates.button_text = updates.buttonText;
        if (updates.hasOwnProperty('buttonLink')) dbUpdates.button_link = updates.buttonLink;

        const { data, error } = await supabase.from('posts').update(dbUpdates).eq('id', id).select();
        if (error) {
            throw new Error(stringifyError(error));
        }
        if (data) return mapPost(data[0]);
    }

    const posts = getLocalPosts();
    const idx = posts.findIndex(p => p.id === id);
    if (idx >= 0) {
      posts[idx] = { ...posts[idx], ...updates };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(posts));
      return posts[idx];
    }
    throw new Error("Target resource not found");
};

export const deletePost = async (id: string): Promise<void> => {
    if (isSupabaseConfigured() && supabase && !id.toString().startsWith('local-')) {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) throw new Error(stringifyError(error));
    }
    const posts = getLocalPosts().filter(p => p.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(posts));
};

export const fetchStats = async (): Promise<Stats> => {
  const posts = await fetchPosts();
  return {
    totalPosts: posts.length,
    totalViews: posts.reduce((acc, curr) => acc + (Number(curr.views) || 0), 0),
    storageUsedMB: parseFloat((posts.length * 0.4 + 1.2).toFixed(1)),
  };
};

export const uploadImage = async (file: File): Promise<string> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
      const { error } = await supabase.storage.from('images').upload(fileName, file);
      if (!error) {
        const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(fileName);
        return publicUrlData.publicUrl;
      }
    } catch (e) {
      console.warn("Storage upload failed");
    }
  }
  return `https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200&t=${Date.now()}`;
};
