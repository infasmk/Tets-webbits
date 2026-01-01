import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../supabaseClient';
import { Lock, Zap, ArrowLeft, Home } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        if (isSupabaseConfigured() && supabase) {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (authError) throw authError;
        } else {
            if (email === 'admin@webbits.com' && password === 'admin') {
                localStorage.setItem('mock_admin_session', 'true');
            } else {
                throw new Error('Invalid demo credentials. Try admin@webbits.com / admin');
            }
        }
        navigate('/admin');
    } catch (err: any) {
        let message = 'An unexpected error occurred';
        if (typeof err === 'string') {
            message = err;
        } else if (err && typeof err === 'object') {
            // Priority: .message -> .error_description -> .error -> stringify
            message = err.message || err.error_description || err.error || JSON.stringify(err);
        }
        // Final guard against [object Object]
        const finalMsg = String(message);
        setError(finalMsg === '[object Object]' ? 'Authentication failed. Please check your credentials.' : finalMsg);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-darker flex items-center justify-center p-4">
        <div className="w-full max-w-md">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-accent transition-colors mb-6 font-bold uppercase tracking-widest text-[10px]"
            >
                <ArrowLeft className="w-4 h-4" />
                Return to Site
            </Link>

            <div className="bg-brand-surface border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-brand-accent/10 transition-colors"></div>
                
                <div className="text-center mb-8 relative z-10">
                    <div className="w-16 h-16 bg-brand-darker rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-800 shadow-xl transform group-hover:rotate-6 transition-transform">
                        <Zap className="text-brand-accent w-8 h-8" fill="currentColor" />
                    </div>
                    <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Admin Console</h1>
                    <p className="text-slate-500 text-xs mt-2 font-medium tracking-wide">AUTHENTICATE TO ACCESS CORE SYSTEMS</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-4 rounded-xl font-bold flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                            <span className="break-all">{error}</span>
                        </div>
                    )}
                    <div>
                        <label className="block text-slate-500 text-[10px] font-black tracking-widest uppercase mb-2">Network ID (Email)</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-brand-dark border border-slate-700 rounded-xl px-5 py-4 text-white focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all placeholder:text-slate-700"
                            placeholder="operator@webbits.io"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-slate-500 text-[10px] font-black tracking-widest uppercase mb-2">Access Key (Password)</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-brand-dark border border-slate-700 rounded-xl px-5 py-4 text-white focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all placeholder:text-slate-700"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-brand-accent text-brand-darker font-black py-5 rounded-2xl hover:bg-brand-accentHover transition-all flex items-center justify-center gap-3 text-lg shadow-xl shadow-brand-accent/10 active:scale-[0.98]"
                    >
                        {loading ? 'SYNCING...' : <><Lock className="w-5 h-5" /> INITIALIZE SESSION</>}
                    </button>
                </form>
                
                {!isSupabaseConfigured() && (
                    <div className="mt-8 pt-8 border-t border-slate-800 text-center relative z-10">
                        <div className="inline-block px-4 py-2 bg-slate-800/50 rounded-lg">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Demo Credentials</p>
                            <p className="text-white text-xs font-mono mt-1">admin@webbits.com / admin</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 text-center">
                <Link to="/" className="text-slate-600 hover:text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                    <Home className="w-3 h-3" /> System Root
                </Link>
            </div>
        </div>
    </div>
  );
};

export default Login;