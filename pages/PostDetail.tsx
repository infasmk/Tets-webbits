import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPostById, incrementPostViews } from '../services/api';
import { Post } from '../types';
import { ArrowLeft, Download, Calendar, Tag, Share2, MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const getSafeStr = (val: any, fallback: string = ''): string => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      const check = val.title || val.name || val.text || val.value || val.label;
      if (check && typeof check !== 'object') return String(check);
      try { 
          const s = JSON.stringify(val);
          return s === '{}' ? fallback : s; 
      } catch { return fallback; }
    }
    return String(val);
  };

  useEffect(() => {
    if (id) {
        fetchPostById(id).then(data => {
            if (data) {
                setPost(data);
                const views = typeof data.views === 'number' ? data.views : 0;
                incrementPostViews(id, views);
            }
            setLoading(false);
        }).catch(err => {
            console.error("Error fetching post details", err);
            setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-brand-darker">
            <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
  }

  if (!post) {
      return (
          <div className="min-h-[60vh] flex flex-col items-center justify-center bg-brand-darker">
              <h2 className="text-3xl font-bold text-white mb-4 uppercase italic tracking-tighter">Record Expired</h2>
              <Link to="/posts" className="text-brand-accent hover:underline uppercase tracking-widest text-xs font-black">Return to Index</Link>
          </div>
      );
  }

  const safeTitle = getSafeStr(post.title, 'Untitled Blueprint');
  const safeCategory = getSafeStr(post.category, 'General');
  const safeContent = getSafeStr(post.content, '');
  
  const waNumber = "9745019658";
  const waMsg = encodeURIComponent(`Hi! I'm interested in customising the project: ${safeTitle}`);
  const waLink = `https://wa.me/${waNumber}?text=${waMsg}`;

  return (
    <article className="min-h-screen pb-20 bg-brand-darker">
        <div className="h-[60vh] md:h-[70vh] relative w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-brand-darker via-brand-darker/60 to-transparent z-10"></div>
            <img 
                src={post.imageUrl || 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3'} 
                alt={safeTitle} 
                className="w-full h-full object-cover" 
            />
            
            <div className="absolute bottom-0 left-0 w-full z-20 p-6 sm:p-12 lg:p-20">
                <div className="max-w-5xl mx-auto">
                    <Link to="/posts" className="inline-flex items-center text-slate-400 hover:text-brand-accent mb-8 md:mb-12 transition-all font-black uppercase tracking-widest text-[9px] bg-brand-darker/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/5">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Knowledge Base
                    </Link>
                    <div className="flex gap-3 mb-6">
                        <span className="bg-brand-accent text-brand-darker font-black px-5 py-2 rounded-xl text-[10px] uppercase tracking-widest shadow-2xl">
                            {safeCategory}
                        </span>
                    </div>
                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white mb-10 leading-[0.85] tracking-tighter italic drop-shadow-2xl">
                        {safeTitle}
                    </h1>
                    <div className="flex flex-wrap items-center gap-8 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                        <span className="flex items-center gap-2 bg-brand-darker/30 backdrop-blur px-3 py-1.5 rounded-lg border border-white/5">
                            <Calendar className="w-4 h-4 text-brand-accent" /> 
                            {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                        <span className="flex items-center gap-2 bg-brand-darker/30 backdrop-blur px-3 py-1.5 rounded-lg border border-white/5">
                            <Share2 className="w-4 h-4 text-brand-accent" />
                            {Number(post.views || 0).toLocaleString()} Impressions
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 md:-mt-32 relative z-30">
            <div className="bg-brand-surface border border-slate-800/80 rounded-[3rem] md:rounded-[4rem] p-8 md:p-20 shadow-2xl">
                <div className="prose prose-invert prose-lg md:prose-xl max-w-none 
                    prose-headings:text-white prose-headings:font-black prose-headings:italic prose-headings:tracking-tighter prose-headings:mt-12 prose-headings:mb-6
                    prose-p:text-slate-400 prose-p:leading-relaxed prose-p:mb-8
                    prose-a:text-brand-accent hover:prose-a:text-brand-accentHover 
                    prose-code:text-brand-accent prose-code:bg-brand-darker prose-code:px-2 prose-code:py-1 prose-code:rounded-lg
                    prose-pre:bg-brand-darker prose-pre:border prose-pre:border-slate-800 prose-pre:p-10 prose-pre:rounded-[2.5rem]">
                    <ReactMarkdown>{safeContent}</ReactMarkdown>
                </div>

                <div className="mt-20 pt-12 border-t border-slate-800/50 flex flex-wrap gap-3 mb-10">
                    {(Array.isArray(post.tags) ? post.tags : []).map((tag, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-brand-dark/50 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-800">
                            <Tag className="w-3.5 h-3.5 text-brand-accent" /> {getSafeStr(tag)}
                        </div>
                    ))}
                </div>

                <div className="mt-20 bg-brand-dark/60 rounded-[3.5rem] p-10 md:p-16 border border-slate-800 flex flex-col lg:flex-row justify-between items-center gap-12">
                    <div className="text-center lg:text-left flex-1">
                        <h3 className="text-3xl md:text-4xl font-black text-white mb-4 italic tracking-tight uppercase leading-none">Customize This Project</h3>
                        <p className="text-slate-500 font-medium max-w-md mx-auto lg:mx-0">Need this technical pattern adapted for your platform? Contact our engineering team.</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-5 w-full lg:w-auto">
                        <a 
                            href={waLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-4 px-12 py-6 bg-[#25D366] text-white hover:bg-[#22c35e] rounded-[2rem] font-black transition-all shadow-lg uppercase tracking-widest text-xs active:scale-95 group"
                        >
                            <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" /> 
                            Request Customization
                        </a>

                        {(post.buttonText && post.buttonLink) && (
                            <a 
                                href={post.buttonLink} 
                                className="flex items-center justify-center gap-4 px-12 py-6 bg-brand-accent text-brand-darker hover:bg-brand-accentHover rounded-[2rem] font-black transition-all shadow-xl uppercase tracking-widest text-xs active:scale-95"
                            >
                                {getSafeStr(post.buttonText)}
                            </a>
                        )}

                        {post.downloadUrl && (
                            <a 
                                href={post.downloadUrl} 
                                className="flex items-center justify-center gap-4 px-12 py-6 border border-slate-700 text-white hover:bg-slate-800 rounded-[2rem] font-black transition-all uppercase tracking-widest text-xs active:scale-95"
                            >
                                <Download className="w-6 h-6" /> Assets
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </article>
  );
};

export default PostDetail;