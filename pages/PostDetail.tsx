import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPostById, incrementPostViews } from '../services/api';
import { Post } from '../types';
import { ArrowLeft, Download, Calendar, Tag, Share2, ExternalLink, MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | undefined>(undefined);
  const [loading, setLoading] = useState(true);

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
              <h2 className="text-3xl font-bold text-white mb-4 uppercase italic tracking-tighter">Record missing</h2>
              <Link to="/posts" className="text-brand-accent hover:underline uppercase tracking-widest text-xs font-black">Return to Index</Link>
          </div>
      );
  }

  const getSafeStr = (val: any, fallback: string = ''): string => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      const nested = val.name || val.title || val.label || val.text || val.body || val.value;
      if (nested !== undefined && nested !== null && typeof nested !== 'object') {
          return String(nested);
      }
      return fallback;
    }
    return String(val);
  };

  const safeTitle = getSafeStr(post.title, 'Untitled');
  const safeCategory = getSafeStr(post.category, 'General');
  const safeContent = getSafeStr(post.content, '');
  const viewsCount = Number(post.views || 0);
  
  // WhatsApp Link Setup
  const waNumber = "9745019658";
  const waMessage = encodeURIComponent(`Hi, I'm interested in customising the project: ${safeTitle}`);
  const waLink = `https://wa.me/${waNumber}?text=${waMessage}`;

  return (
    <article className="min-h-screen pb-20 bg-brand-darker">
        {/* Dynamic Hero Section - Fixed spacing for mobile */}
        <div className="h-[60vh] md:h-[70vh] relative w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-brand-darker via-brand-darker/70 to-transparent z-10"></div>
            <img 
                src={post.imageUrl || 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3'} 
                alt={safeTitle} 
                className="w-full h-full object-cover" 
            />
            
            <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 sm:p-12 lg:p-20">
                <div className="max-w-5xl mx-auto w-full">
                    <Link to="/posts" className="inline-flex items-center text-slate-400 hover:text-brand-accent mb-10 transition-all font-black uppercase tracking-widest text-[10px]">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Knowledge Base
                    </Link>
                    <div className="flex gap-3 mb-4">
                        <span className="bg-brand-accent text-brand-darker font-black px-4 py-1.5 rounded-xl text-[10px] uppercase tracking-widest shadow-xl">
                            {safeCategory}
                        </span>
                    </div>
                    <h1 className="text-5xl sm:text-6xl md:text-8xl font-black text-white mb-8 leading-[0.85] tracking-tighter italic">
                        {safeTitle}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                        <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-brand-accent" /> 
                            {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                        <span className="flex items-center gap-2">
                            <Share2 className="w-4 h-4 text-brand-accent" />
                            {viewsCount.toLocaleString()} Impressions
                        </span>
                    </div>
                </div>
            </div>
        </div>

        {/* Content Area - Fixed layout with negative margin */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 md:-mt-32 relative z-30">
            <div className="bg-brand-surface border border-slate-800/80 rounded-[3rem] md:rounded-[4rem] p-8 md:p-20 shadow-2xl">
                
                <div className="prose prose-invert prose-lg md:prose-xl max-w-none 
                    prose-headings:text-white prose-headings:font-black prose-headings:italic prose-headings:tracking-tighter prose-headings:mt-12 prose-headings:mb-6
                    prose-p:text-slate-400 prose-p:leading-relaxed prose-p:mb-8
                    prose-a:text-brand-accent hover:prose-a:text-brand-accentHover 
                    prose-code:text-brand-accent prose-code:bg-brand-darker prose-code:px-2 prose-code:py-1 prose-code:rounded-lg prose-code:before:content-none prose-code:after:content-none
                    prose-pre:bg-brand-darker prose-pre:border prose-pre:border-slate-800 prose-pre:p-8 md:prose-pre:p-12 prose-pre:rounded-[2rem]
                    prose-ul:list-disc prose-ol:list-decimal prose-li:text-slate-400">
                    <ReactMarkdown>
                        {safeContent}
                    </ReactMarkdown>
                </div>

                {/* Engagement Section */}
                <div className="mt-20 pt-12 border-t border-slate-800/50 flex flex-wrap gap-3 mb-16">
                    {(Array.isArray(post.tags) ? post.tags : []).map((tag, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-brand-dark/50 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-800">
                            <Tag className="w-3 h-3 text-brand-accent" /> {getSafeStr(tag)}
                        </div>
                    ))}
                </div>

                <div className="bg-brand-dark/60 rounded-[3rem] p-10 border border-slate-800 flex flex-col lg:flex-row justify-between items-center gap-10">
                    <div className="text-center lg:text-left flex-1">
                        <h3 className="text-2xl md:text-3xl font-black text-white mb-2 italic tracking-tight uppercase">Implementation Assets</h3>
                        <p className="text-slate-500 font-medium">Request a specialized version or download original resources.</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        {/* WhatsApp Customization Button - Premium Design */}
                        <a 
                            href={waLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 px-10 py-5 bg-[#25D366] text-white hover:bg-[#22c35e] rounded-2xl font-black transition-all shadow-[0_15px_40px_rgba(37,211,102,0.25)] uppercase tracking-widest text-[11px] group active:scale-95"
                        >
                            <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" /> 
                            Request Customization
                        </a>

                        {post.downloadUrl && (
                            <a 
                                href={post.downloadUrl} 
                                className="flex items-center justify-center gap-3 px-10 py-5 bg-brand-accent text-brand-darker hover:bg-brand-accentHover rounded-2xl font-black transition-all shadow-xl uppercase tracking-widest text-[11px] active:scale-95"
                            >
                                <Download className="w-5 h-5" /> Download
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-20 text-center max-w-2xl mx-auto px-6">
                <div className="w-20 h-20 bg-brand-accent/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-brand-accent/20">
                    <ExternalLink className="text-brand-accent w-10 h-10" />
                </div>
                <h3 className="text-3xl font-black text-white mb-4 italic tracking-tighter uppercase">Professional Engineering</h3>
                <p className="text-slate-500 text-lg leading-relaxed mb-10 font-medium">For high-tier architectural needs, reach out to our core team for customized digital solutions.</p>
                <Link to="/posts" className="inline-flex items-center gap-3 px-10 py-5 bg-slate-800 text-white font-black rounded-2xl hover:bg-slate-700 transition-all uppercase tracking-widest text-xs">
                    Return to Repository <ArrowLeft className="w-4 h-4 rotate-180" />
                </Link>
            </div>
        </div>
    </article>
  );
};

export default PostDetail;