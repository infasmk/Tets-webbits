import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPost, fetchPostById, updatePost, uploadImage } from '../../services/api';
import { Post } from '../../types';
import { Save, Image as ImageIcon, ArrowLeft, Link as LinkIcon, Type } from 'lucide-react';

const PostEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState<Partial<Post>>({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: [],
    imageUrl: '',
    downloadUrl: '',
    buttonText: '',
    buttonLink: ''
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const getSafeStr = (val: any, fallback: string = ''): string => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      const nested = val.name || val.title || val.label || val.text || val.value;
      if (nested !== undefined && nested !== null && typeof nested !== 'object') return String(nested);
      try { 
        const json = JSON.stringify(val);
        return json === '{}' ? fallback : json; 
      } catch { return fallback; }
    }
    return String(val);
  };

  useEffect(() => {
    if (isEditing && id) {
        fetchPostById(id).then(post => {
            if (post) {
                setFormData({
                    ...post,
                    title: getSafeStr(post.title),
                    excerpt: getSafeStr(post.excerpt),
                    content: getSafeStr(post.content),
                    category: getSafeStr(post.category),
                    tags: Array.isArray(post.tags) ? post.tags : [],
                    imageUrl: getSafeStr(post.imageUrl),
                    downloadUrl: getSafeStr(post.downloadUrl),
                    buttonText: getSafeStr(post.buttonText),
                    buttonLink: getSafeStr(post.buttonLink)
                });
            }
        });
    }
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        if (isEditing && id) {
            await updatePost(id, formData);
        } else {
            await createPost(formData as any);
        }
        navigate('/admin/posts');
    } catch (error) {
        console.error(error);
        alert('Failed to save post');
    } finally {
        setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      setUploading(true);
      try {
          const url = await uploadImage(file);
          setFormData({ ...formData, imageUrl: url });
      } catch (error) {
          alert('Upload failed');
      } finally {
          setUploading(false);
      }
  };

  const addTag = () => {
      const trimmed = tagInput.trim();
      if (trimmed && !formData.tags?.includes(trimmed)) {
          setFormData({ ...formData, tags: [...(formData.tags || []), trimmed] });
          setTagInput('');
      }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
        <div className="flex items-center gap-4 mb-8">
            <button onClick={() => navigate('/admin/posts')} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
                <ArrowLeft />
            </button>
            <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">{isEditing ? 'Edit Knowledge Base Entry' : 'Create New Blueprint'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-brand-surface p-8 rounded-3xl border border-slate-800 space-y-8 shadow-2xl">
                <div className="grid gap-2">
                    <label className="text-slate-500 text-[10px] font-black tracking-widest uppercase flex items-center gap-2">
                        <Type className="w-3 h-3" /> Post Title
                    </label>
                    <input 
                        className="w-full bg-brand-dark border border-slate-700 rounded-xl px-5 py-4 text-white focus:border-brand-accent outline-none font-bold text-xl transition-all"
                        value={String(formData.title || '')}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        required
                        placeholder="e.g., Advanced Hydration Patterns in React"
                    />
                </div>

                <div className="grid gap-2">
                    <label className="text-slate-500 text-[10px] font-black tracking-widest uppercase">Short Abstract (Excerpt)</label>
                    <textarea 
                        className="w-full bg-brand-dark border border-slate-700 rounded-xl px-5 py-4 text-white focus:border-brand-accent outline-none h-24 resize-none transition-all"
                        value={String(formData.excerpt || '')}
                        onChange={e => setFormData({...formData, excerpt: e.target.value})}
                        required
                        placeholder="Brief summary for the preview card..."
                    />
                </div>

                <div className="grid gap-2">
                    <label className="text-slate-500 text-[10px] font-black tracking-widest uppercase">Featured Visual asset</label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 bg-brand-dark/50 rounded-2xl border border-dashed border-slate-700">
                        {formData.imageUrl ? (
                            <div className="relative group">
                                <img src={String(formData.imageUrl)} alt="Preview" className="w-40 h-24 object-cover rounded-xl border border-slate-700 shadow-xl" />
                                <div className="absolute inset-0 bg-brand-darker/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                                    <ImageIcon className="text-brand-accent w-6 h-6" />
                                </div>
                            </div>
                        ) : (
                            <div className="w-40 h-24 bg-brand-dark rounded-xl border border-slate-800 flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-slate-700" />
                            </div>
                        )}
                        <div className="flex-1">
                            <p className="text-slate-400 text-xs mb-3 font-medium">Upload a high-resolution 16:9 thumbnail for the repository.</p>
                            <label className="inline-flex items-center gap-3 cursor-pointer bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest">
                                <ImageIcon className="w-4 h-4" />
                                <span>{uploading ? 'UPLOADING...' : 'SELECT IMAGE'}</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="grid gap-2">
                    <label className="text-slate-500 text-[10px] font-black tracking-widest uppercase">Technical Content (Markdown)</label>
                    <textarea 
                        className="w-full bg-brand-dark border border-slate-700 rounded-xl px-5 py-4 text-white focus:border-brand-accent outline-none h-96 font-mono text-sm transition-all"
                        value={String(formData.content || '')}
                        onChange={e => setFormData({...formData, content: e.target.value})}
                        placeholder="# Blueprint Specification&#10;&#10;Explain the implementation details here..."
                        required
                    />
                </div>

                <div className="p-6 bg-brand-accent/5 rounded-3xl border border-brand-accent/20 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <LinkIcon className="w-4 h-4 text-brand-accent" />
                        <h4 className="text-brand-accent text-[10px] font-black uppercase tracking-widest">Custom Call to Action</h4>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="grid gap-2">
                            <label className="text-slate-500 text-[10px] font-black tracking-widest uppercase">Button Text</label>
                            <input 
                                className="w-full bg-brand-dark border border-slate-700 rounded-xl px-5 py-3 text-white focus:border-brand-accent outline-none text-sm"
                                value={String(formData.buttonText || '')}
                                onChange={e => setFormData({...formData, buttonText: e.target.value})}
                                placeholder="e.g., Check Documentation"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-slate-500 text-[10px] font-black tracking-widest uppercase">Button Link (URL)</label>
                            <input 
                                className="w-full bg-brand-dark border border-slate-700 rounded-xl px-5 py-3 text-white focus:border-brand-accent outline-none text-sm"
                                value={String(formData.buttonLink || '')}
                                onChange={e => setFormData({...formData, buttonLink: e.target.value})}
                                placeholder="https://github.com/..."
                            />
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="grid gap-2">
                        <label className="text-slate-500 text-[10px] font-black tracking-widest uppercase">Classification (Category)</label>
                        <select 
                            className="w-full bg-brand-dark border border-slate-700 rounded-xl px-5 py-4 text-white focus:border-brand-accent outline-none appearance-none"
                            value={String(formData.category || '')}
                            onChange={e => setFormData({...formData, category: e.target.value})}
                        >
                            <option value="">Select Category</option>
                            <option value="React">React</option>
                            <option value="Backend">Backend</option>
                            <option value="CSS">CSS</option>
                            <option value="Career">Career</option>
                        </select>
                    </div>
                    <div className="grid gap-2">
                        <label className="text-slate-500 text-[10px] font-black tracking-widest uppercase">Resource Asset (Download URL)</label>
                        <input 
                            className="w-full bg-brand-dark border border-slate-700 rounded-xl px-5 py-4 text-white focus:border-brand-accent outline-none text-sm"
                            value={String(formData.downloadUrl || '')}
                            onChange={e => setFormData({...formData, downloadUrl: e.target.value})}
                            placeholder="https://cloud.storage/asset.zip"
                        />
                    </div>
                </div>

                <div className="grid gap-2">
                    <label className="text-slate-500 text-[10px] font-black tracking-widest uppercase">Keywords (Tags)</label>
                    <div className="flex gap-3 mb-2">
                        <input 
                             className="flex-1 bg-brand-dark border border-slate-700 rounded-xl px-5 py-3 text-white focus:border-brand-accent outline-none"
                             value={tagInput}
                             onChange={e => setTagInput(e.target.value)}
                             onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                             placeholder="Add keyword and hit Enter"
                        />
                        <button type="button" onClick={addTag} className="bg-slate-800 text-white px-6 rounded-xl font-bold hover:bg-slate-700 transition-colors uppercase text-[10px] tracking-widest">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[2rem]">
                        {(Array.isArray(formData.tags) ? formData.tags : []).map((tag, idx) => {
                            const tagStr = getSafeStr(tag, 'Tag');
                            return (
                                <span key={`${tagStr}-${idx}`} className="bg-brand-accent/10 text-brand-accent border border-brand-accent/20 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                                    {tagStr}
                                    <button 
                                        type="button" 
                                        onClick={() => setFormData({...formData, tags: formData.tags?.filter(t => t !== tag)})}
                                        className="hover:text-white transition-colors"
                                    >&times;</button>
                                </span>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="flex justify-end items-center gap-6 mt-12">
                <button type="button" onClick={() => navigate('/admin/posts')} className="text-slate-500 hover:text-white font-black uppercase text-xs tracking-widest transition-colors">Discard Changes</button>
                <button 
                    type="submit" 
                    disabled={loading || uploading} 
                    className="px-12 py-5 bg-brand-accent text-brand-darker font-black rounded-2xl hover:bg-brand-accentHover flex items-center gap-3 shadow-xl shadow-brand-accent/20 transition-all uppercase text-sm tracking-widest"
                >
                    {loading ? 'SYNCING...' : <><Save className="w-5 h-5" /> Commit Entry</>}
                </button>
            </div>
        </form>
    </div>
  );
};

export default PostEditor;