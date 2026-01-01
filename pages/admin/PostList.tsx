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

  const getSafeStr = (val: any, fallback: string = 'N/A'): string => {
    if (!val) return fallback;
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      const check = val.name || val.title || val.label || val.id;
      if (check && typeof check !== 'object') return String(check);
      try { return JSON.stringify(val); } catch { return fallback; }
    }
    return String(val);
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
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-800 pb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
            <span className="text-brand-accent font-black text-[10px] tracking-[0.3em] uppercase">Control Center</span>
          </div>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Content Repository</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Audit, edit, and optimize your engineering blueprints.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
            <Link to="/admin/post/new" className="flex-1 md:flex-none bg-brand-accent text-brand-darker px-8 py-4 rounded-2xl font-black hover:bg-brand-accentHover transition-all shadow-[0_10px_30px_rgba(34,211,238,0.2)] flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
              <Plus className="w-4 h-4" /> Create Entry
            </Link>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by title, category, or tags..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-brand-surface border border-slate-800 rounded-[1.5rem] pl-14 pr-6 py-4 text-white focus:border-brand-accent/50 outline-none text-sm transition-all focus:ring-4 focus:ring-brand-accent/5 shadow-xl"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 p-1 bg-brand-surface rounded-2xl border border-slate-800 shrink-0">
            <button 
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-brand-accent text-brand-darker' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-brand-accent text-brand-darker' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <List className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Grid of Post Cards */}
      <motion.div 
        layout
        className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
            : "flex flex-col gap-4"
        }
      >
        <AnimatePresence mode="popLayout">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post, idx) => {
              const safeTitle = getSafeStr(post.title, 'Untitled');
              const safeCategory = getSafeStr(post.category, 'General');
              const safeId = getSafeStr(post.id, 'ID');
              const tags = Array.isArray(post.tags) ? post.tags : [];

              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  key={safeId}
                  className={`group bg-brand-surface border border-slate-800/60 rounded-[2.5rem] overflow-hidden hover:border-brand-accent/40 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-brand-accent/5 flex ${viewMode === 'list' ? 'flex-row items-center p-4' : 'flex-col'}`}
                >
                  {/* Thumbnail */}
                  <div className={`relative overflow-hidden shrink-0 ${viewMode === 'list' ? 'w-48 h-32 rounded-2xl' : 'h-56'}`}>
                    <img 
                        src={post.imageUrl || 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?q=80&w=800'} 
                        alt={safeTitle} 
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-darker/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="absolute top-4 left-4">
                        <span className="bg-brand-accent text-brand-darker text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-xl">
                            {safeCategory}
                        </span>
                    </div>
                    
                    {viewMode === 'grid' && (
                        <div className="absolute bottom-4 right-4 flex gap-2 translate-y-10 group-hover:translate-y-0 transition-transform duration-300">
                             <Link 
                              to={`/posts/${safeId}`} 
                              target="_blank" 
                              className="w-10 h-10 bg-white/10 backdrop-blur-md text-white rounded-xl flex items-center justify-center hover:bg-brand-accent hover:text-brand-darker transition-all"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                        </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className={`flex-grow ${viewMode === 'list' ? 'px-8' : 'p-8'}`}>
                    <div className="flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className={`font-black text-white leading-tight group-hover:text-brand-accent transition-colors ${viewMode === 'list' ? 'text-xl' : 'text-2xl mb-2'}`}>
                                {safeTitle}
                            </h3>
                            {viewMode === 'list' && (
                                <div className="flex items-center gap-2">
                                    <Link to={`/admin/post/edit/${safeId}`} className="p-3 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
                                        <Edit2 className="w-4 h-4" />
                                    </Link>
                                    <button onClick={() => { setDeletingId(safeId); setIsModalOpen(true); }} className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {viewMode === 'grid' && (
                             <div className="flex flex-wrap gap-2 mb-6">
                                {tags.slice(0, 3).map((tag, i) => (
                                    <span key={i} className="text-[10px] text-slate-500 bg-brand-dark/50 px-3 py-1 rounded-lg border border-slate-800 flex items-center gap-1">
                                        <Hash className="w-2.5 h-2.5" />{getSafeStr(tag)}
                                    </span>
                                ))}
                                {tags.length > 3 && <span className="text-[10px] text-slate-600 font-bold">+{tags.length - 3}</span>}
                             </div>
                        )}

                        <div className={`flex items-center gap-6 mt-auto ${viewMode === 'list' ? '' : 'pt-6 border-t border-slate-800/50'}`}>
                            <div className="flex items-center gap-2 text-slate-500">
                                <Eye className="w-4 h-4 text-brand-accent" />
                                <span className="text-xs font-bold text-white">{Number(post.views || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500">
                                <Calendar className="w-4 h-4" />
                                <span className="text-xs font-medium uppercase tracking-tighter">
                                    {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                            
                            {viewMode === 'grid' && (
                                <div className="ml-auto flex items-center gap-1">
                                     <Link to={`/admin/post/edit/${safeId}`} className="p-2 text-slate-500 hover:text-white transition-all">
                                        <Edit2 className="w-4 h-4" />
                                    </Link>
                                    <button onClick={() => { setDeletingId(safeId); setIsModalOpen(true); }} className="p-2 text-slate-500 hover:text-red-400 transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="col-span-full py-40 text-center"
            >
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-brand-surface rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-slate-800 shadow-2xl">
                  <Search className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-2xl font-black text-white mb-3 italic tracking-tighter uppercase">No Intelligence Found</h3>
                <p className="text-slate-500 text-sm leading-relaxed px-10">Your query for "{searchTerm}" returned zero records from the engineering archives.</p>
                <button 
                    onClick={() => setSearchTerm('')}
                    className="mt-8 text-brand-accent font-black text-[10px] tracking-widest uppercase hover:underline"
                >
                    Clear Filter
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-brand-darker/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-brand-surface border border-slate-800 p-10 rounded-[3.5rem] max-w-md w-full relative z-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
              <div className="w-24 h-24 bg-red-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                <AlertTriangle className="text-red-500 w-12 h-12" />
              </div>
              <h3 className="text-3xl font-black text-white text-center mb-3 italic tracking-tighter uppercase">Purge Content?</h3>
              <p className="text-slate-400 text-center mb-10 font-medium leading-relaxed">This action will permanently delete all metadata, content, and engagement analytics associated with this record.</p>
              <div className="flex gap-4">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 px-8 py-5 bg-slate-800 text-white font-black rounded-2xl hover:bg-slate-700 transition-all uppercase tracking-widest text-[10px]">Abort</button>
                <button onClick={confirmDelete} className="flex-1 px-8 py-5 bg-red-500 text-white font-black rounded-2xl hover:bg-red-600 transition-all uppercase tracking-widest text-[10px] shadow-xl shadow-red-500/20">Execute</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostList;