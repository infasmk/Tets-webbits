import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchPosts, deletePost } from '../../services/api';
import { Post } from '../../types';
import { Edit2, Trash2, ExternalLink, AlertTriangle, Search, X, Filter, Hash, Eye, Calendar, Plus, MoreVertical, LayoutGrid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PostList: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const getSafeStr = (val: any, fallback: string = 'N/A'): string => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'string') return val === '[object Object]' ? fallback : val;
    if (typeof val === 'object') {
      const check = val.message || val.text || val.title || val.name || val.value || val.rendered;
      if (check !== undefined && check !== null && typeof check !== 'object') {
         const s = String(check);
         return s === '[object Object]' ? fallback : s;
      }
      try {
        const json = JSON.stringify(val);
        return (json === '{}' || json === '[]') ? fallback : json;
      } catch { return fallback; }
    }
    const res = String(val);
    return res === '[object Object]' ? fallback : res;
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await fetchPosts();
      setPosts(data);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = useMemo(() => {
    if (!searchTerm.trim()) return posts;
    const search = searchTerm.toLowerCase();
    return posts.filter(post => {
      const title = getSafeStr(post.title).toLowerCase();
      const category = getSafeStr(post.category).toLowerCase();
      const tags = (Array.isArray(post.tags) ? post.tags : []).map(t => getSafeStr(t).toLowerCase());
      
      return title.includes(search) || 
             category.includes(search) || 
             tags.some(tag => tag.includes(search));
    });
  }, [posts, searchTerm]);

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deletePost(deletingId);
      setPosts(posts.filter(p => p.id !== deletingId));
      setIsModalOpen(false);
      setDeletingId(null);
    } catch (error) {
      alert("Failed to delete post");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-black text-[10px] tracking-[0.2em] uppercase animate-pulse">Scanning Repository...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-800 pb-10">
        <div>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Content Repository</h1>
        </div>
        <Link to="/admin/post/new" className="bg-brand-accent text-brand-darker px-8 py-4 rounded-2xl font-black hover:bg-brand-accentHover transition-all flex items-center gap-2 uppercase tracking-widest text-xs">
          <Plus className="w-4 h-4" /> Create Entry
        </Link>
      </div>

      <div className="relative w-full">
        <input 
          type="text" 
          placeholder="Search by title, category, or tags..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-brand-surface border border-slate-800 rounded-[1.5rem] pl-14 pr-6 py-4 text-white focus:border-brand-accent/50 outline-none text-sm transition-all shadow-xl"
        />
      </div>

      <motion.div layout className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "flex flex-col gap-4"}>
        <AnimatePresence mode="popLayout">
          {filteredPosts.map((post, idx) => {
            const safeTitle = getSafeStr(post.title, 'Untitled');
            const safeCategory = getSafeStr(post.category, 'General');
            const safeId = getSafeStr(post.id, 'ID');
            const tags = Array.isArray(post.tags) ? post.tags : [];

            return (
              <motion.div layout key={safeId} className="group bg-brand-surface border border-slate-800/60 rounded-[2.5rem] overflow-hidden hover:border-brand-accent/40 flex flex-col shadow-xl">
                <div className="h-56 relative overflow-hidden">
                  <img src={post.imageUrl || 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3'} alt={safeTitle} className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-brand-accent text-brand-darker text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-xl">
                        {safeCategory}
                    </span>
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="font-black text-white text-2xl mb-4 group-hover:text-brand-accent transition-colors italic">
                      {safeTitle}
                  </h3>
                  <div className="flex items-center gap-6 pt-6 border-t border-slate-800/50">
                      <Link to={`/admin/post/edit/${safeId}`} className="text-slate-500 hover:text-white transition-all">
                          <Edit2 className="w-4 h-4" />
                      </Link>
                      <button onClick={() => { setDeletingId(safeId); setIsModalOpen(true); }} className="text-slate-500 hover:text-red-400 transition-all">
                          <Trash2 className="w-4 h-4" />
                      </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-brand-darker/80 backdrop-blur-md" />
            <div className="bg-brand-surface border border-slate-800 p-10 rounded-[3.5rem] max-w-md w-full relative z-10">
              <h3 className="text-3xl font-black text-white text-center mb-10 italic tracking-tighter uppercase">Purge Content?</h3>
              <div className="flex gap-4">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 px-8 py-5 bg-slate-800 text-white font-black rounded-2xl uppercase tracking-widest text-[10px]">Abort</button>
                <button onClick={confirmDelete} className="flex-1 px-8 py-5 bg-red-500 text-white font-black rounded-2xl uppercase tracking-widest text-[10px]">Execute</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostList;