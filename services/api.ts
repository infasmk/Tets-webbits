import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { Post, Stats, Notification } from '../types';

// --- MOCK DATA FOR DEMO PURPOSES ---
const MOCK_POSTS: Post[] = [
  {
    id: '1',
    title: 'Optimizing React Performance with useMemo',
    excerpt: 'Learn when and how to correctly use memoization hooks to speed up your render cycles.',
    content: `
# React Performance

Performance is key in modern web apps.

## Why useMemo?
\`useMemo\` returns a memoized value. Think of memoization as caching a value so that it does not need to be recalculated.

\`\`\`tsx
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
\`\`\`

### When to use it
- Expensive calculations
- Referential equality checks
    `,
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800',
    category: 'React',
    tags: ['Frontend', 'Hooks', 'Performance'],
    downloadUrl: '#',
    buttonText: 'View Source Code',
    buttonLink: 'https://github.com',
    createdAt: new Date().toISOString(),
    views: 1240,
  },
  {
    id: '2',
    title: 'The Future of CSS: Tailwind vs. CSS-in-JS',
    excerpt: 'A deep dive into utility-first CSS frameworks and how they compare to traditional styling methods.',
    content: 'Full analysis of Tailwind CSS architecture...',
    imageUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=800',
    category: 'CSS',
    tags: ['Design', 'Tailwind', 'Styling'],
    downloadUrl: '#',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    views: 850,
  },
  {
    id: '3',
    title: 'Secure Authentication Flows',
    excerpt: 'Implementing JWT and OAuth2 securely in your Node.js backend applications.',
    content: 'Security best practices guide...',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
    category: 'Backend',
    tags: ['Security', 'Node.js', 'Auth'],
    downloadUrl: '#',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    views: 2100,
  },
];

let localPosts = [...MOCK_POSTS];
let localNotifications: Notification[] = [
  { id: '1', message: '🚀 New feature: Dark mode editor is now live!', type: 'success', createdAt: new Date().toISOString(), active: true }
];

// --- API METHODS ---

export const fetchPosts = async (): Promise<Post[]> => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('createdAt', { ascending: false });
    if (error) throw error;
    return data as Post[];
  }
  return new Promise((resolve) => setTimeout(() => resolve(localPosts), 500));
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
  return new Promise((resolve) => {
    const post = localPosts.find((p) => p.id === id);
    setTimeout(() => resolve(post), 400);
  });
};

export const incrementPostViews = async (id: string, currentViews: number): Promise<void> => {
  if (isSupabaseConfigured() && supabase) {
    await supabase.rpc('increment_views', { row_id: id }); // Preferred method if RPC exists
    // Fallback if no RPC
    await supabase.from('posts').update({ views: currentViews + 1 }).eq('id', id);
  } else {
    const idx = localPosts.findIndex(p => p.id === id);
    if (idx > -1) localPosts[idx].views += 1;
  }
};

export const createPost = async (post: Omit<Post, 'id' | 'createdAt' | 'views'>): Promise<Post> => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.from('posts').insert([post]).select();
    if (error) throw error;
    return data[0] as Post;
  }
  const newPost: Post = {
    ...post,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    views: 0,
  };
  localPosts = [newPost, ...localPosts];
  return newPost;
};

export const updatePost = async (id: string, updates: Partial<Post>): Promise<Post> => {
    if(isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.from('posts').update(updates).eq('id', id).select();
        if(error) throw error;
        return data[0];
    }
    const idx = localPosts.findIndex(p => p.id === id);
    if(idx > -1) {
        localPosts[idx] = { ...localPosts[idx], ...updates };
        return localPosts[idx];
    }
    throw new Error("Post not found");
};

export const deletePost = async (id: string): Promise<void> => {
    if(isSupabaseConfigured() && supabase) {
        await supabase.from('posts').delete().eq('id', id);
        return;
    }
    localPosts = localPosts.filter(p => p.id !== id);
};

export const uploadImage = async (file: File): Promise<string> => {
  if (isSupabaseConfigured() && supabase) {
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('images').upload(fileName, file);
    if (error) throw error;
    const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(fileName);
    return publicUrlData.publicUrl;
  }
  return URL.createObjectURL(file);
};

export const fetchStats = async (): Promise<Stats> => {
  let posts: Post[] = [];
  if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from('posts').select('views');
      posts = data as any[] || [];
  } else {
      posts = localPosts;
  }
  
  return {
    totalPosts: posts.length,
    totalViews: posts.reduce((acc, curr) => acc + (Number(curr.views) || 0), 0),
    storageUsedMB: parseFloat((posts.length * 1.2 + 12.5).toFixed(1)), // Simulated growth
  };
};

export const fetchNotifications = async (): Promise<Notification[]> => {
    if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.from('notifications').select('*').order('createdAt', { ascending: false });
        if (error) return [];
        return data as Notification[];
    }
    return [...localNotifications];
};

export const saveNotification = async (notif: Omit<Notification, 'id' | 'createdAt' | 'active'>): Promise<Notification> => {
    if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.from('notifications').insert([notif]).select();
        if (error) throw error;
        return data[0] as Notification;
    }
    const newNotif: Notification = {
        ...notif,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        active: true
    };
    localNotifications = [newNotif, ...localNotifications];
    return newNotif;
};

export const deleteNotification = async (id: string): Promise<void> => {
    if (isSupabaseConfigured() && supabase) {
        await supabase.from('notifications').delete().eq('id', id);
    } else {
        localNotifications = localNotifications.filter(n => n.id !== id);
    }
};