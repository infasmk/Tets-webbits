import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPostById, incrementPostViews } from '../services/api';
import { Post } from '../types';
import { ArrowLeft, Download, Tag, Globe, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const getSafeStr = (val: any, fallback: string = ''): string => {
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

  const ensureAbsoluteUrl = (url: string) => {
    if (!url) return '';
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:') || trimmed.startsWith('#')) {
      return trimmed;
    }
    return `https://${trimmed}`;
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
          <div className="min-h-[60vh] flex flex-col items-center justify-center bg-brand-darker px-4">
              <h2 className="text-3xl font-bold text-white mb-4 uppercase italic tracking-tighter text-center">Record Expired</h2>
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

  const hasCustomBtn = post.buttonText && post.buttonLink;
  const hasDownload = !!post.downloadUrl;

  return (
    <article className="min-h-screen pb-20 bg-brand-darker overflow-x-hidden">
        <div className="h-[50vh] md:h-[70vh] relative w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-brand-darker via-brand-darker/60 to-transparent z-10"></div>
            <img src={post.imageUrl || 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3'} alt={safeTitle} className="w-full h-full object-cover" />
            <div className="absolute bottom-0 left-0 w-full z-20 p-6 sm:p-12 lg:p-20">
                <div className="max-w-5xl mx-auto">
                    <Link to="/posts" className="inline-flex items-center text-slate-400 hover:text-brand-accent mb-6 transition-all font-black uppercase tracking-widest text-[9px] bg-brand-darker/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/5">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Knowledge Base
                    </Link>
                    <div className="flex gap-3 mb-4 md:mb-6">
                        <span className="bg-brand-accent text-brand-darker font-black px-4 py-1.5 md:px-5 md:py-2 rounded-xl text-[9px] md:text-[10px] uppercase tracking-widest">
                            {safeCategory}
                        </span>
                    </div>
                    <h1 className="text-3xl sm:text-6xl md:text-8xl font-black text-white mb-8 leading-[1] md:leading-[0.9] tracking-tighter italic break-words">
                        {safeTitle}
                    </h1>
                </div>
            </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 md:-mt-32 relative z-30">
            <div className="bg-brand-surface border border-slate-800/80 rounded-[2rem] md:rounded-[4rem] p-6 md:p-20 shadow-2xl overflow-hidden">
                <div className="prose prose-invert prose-sm sm:prose-base md:prose-xl max-w-none prose-p:text-slate-400 prose-headings:text-white break-words">
                    <ReactMarkdown>{safeContent}</ReactMarkdown>
                </div>

                <div className="mt-12 md:mt-16 pt-8 md:pt-12 border-t border-slate-800/50 flex flex-wrap gap-2 md:gap-3 mb-10">
                    {(Array.isArray(post.tags) ? post.tags : []).map((tag, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-brand-dark/50 px-3 py-1.5 md:px-5 md:py-3 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-800">
                            <Tag className="w-3 h-3 md:w-3.5 md:h-3.5 text-brand-accent" /> {getSafeStr(tag)}
                        </div>
                    ))}
                </div>

                <div className="mt-12 md:mt-24 bg-brand-dark/60 rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-16 border border-slate-800 flex flex-col lg:flex-row justify-between items-center gap-8 md:gap-12">
                    <div className="text-center lg:text-left flex-1">
                        <h3 className="text-xl md:text-4xl font-black text-white mb-3 md:mb-4 italic tracking-tight uppercase leading-none break-words">Project Resources</h3>
                        <p className="text-slate-500 font-medium max-w-md mx-auto lg:mx-0 text-xs md:text-base">Access production source code or request a specific implementation guide.</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 w-full lg:w-auto">
                        {hasDownload && (
                            <a 
                                href={ensureAbsoluteUrl(getSafeStr(post.downloadUrl))} 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 px-6 py-4 md:px-12 md:py-6 bg-white text-brand-darker hover:bg-slate-200 rounded-xl md:rounded-[2rem] font-black transition-all uppercase tracking-widest text-[9px] md:text-xs active:scale-95 shadow-lg"
                            >
                                <Download className="w-4 h-4" /> Download Assets
                            </a>
                        )}
                        <a 
                            href={waLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 px-6 py-4 md:px-12 md:py-6 bg-[#25D366] text-white hover:bg-[#22c35e] rounded-xl md:rounded-[2rem] font-black transition-all shadow-lg uppercase tracking-widest text-[9px] md:text-xs active:scale-95"
                        >
                            Request Custom
                        </a>
                        {hasCustomBtn && (
                            <a 
                                href={ensureAbsoluteUrl(getSafeStr(post.buttonLink))} 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 px-6 py-4 md:px-12 md:py-6 bg-brand-accent text-brand-darker hover:bg-brand-accentHover rounded-xl md:rounded-[2rem] font-black transition-all uppercase tracking-widest text-[9px] md:text-xs active:scale-95 shadow-lg shadow-brand-accent/10"
                            >
                                <ExternalLink className="w-4 h-4" /> {getSafeStr(post.buttonText)}
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