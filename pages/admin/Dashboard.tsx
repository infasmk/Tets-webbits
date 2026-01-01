import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchStats, fetchNotifications, saveNotification, deleteNotification, deactivateNotification } from '../../services/api';
import { Stats, Notification } from '../../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FileText, Eye, Database, Bell, Plus, Trash2, Info, CheckCircle, AlertTriangle, TrendingUp, Link as LinkIcon, Power, Loader2, Globe, WifiOff, RefreshCw } from 'lucide-react';
import { isSupabaseConfigured } from '../../supabaseClient';

const safeString = (val: any, fallback: string = ''): string => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return val.toLocaleString();
  if (typeof val === 'object') {
    // Check for standard fields that might contain the message
    const check = val.message || val.name || val.title || val.rendered || val.value || val.count || val.total;
    if (check !== undefined && check !== null && typeof check !== 'object') return String(check);
    try { 
      const json = JSON.stringify(val);
      return (json === '{}' || json === '[]') ? fallback : json; 
    } catch { return fallback; }
  }
  return String(val);
};

const extractErrorMessage = (err: any): string => {
    if (!err) return "Unknown system error";
    
    // Priority 1: Handle actual Error objects
    if (err instanceof Error) return err.message;
    
    // Priority 2: Handle string errors
    if (typeof err === 'string') return err;
    
    // Priority 3: Handle Supabase error objects or nested fields
    if (err.message && typeof err.message === 'string') return err.message;
    if (err.error && typeof err.error === 'string') return err.error;
    if (err.error?.message && typeof err.error.message === 'string') return err.error.message;
    if (err.details && typeof err.details === 'string') return err.details;
    
    // Fallback: Serialize object safely
    try {
        const str = JSON.stringify(err);
        return (str === '{}' || str === '[]') ? "Internal system exception (check network console)" : str;
    } catch {
        return "Critical: Un-serializable exception";
    }
};

const StatCard = ({ icon: Icon, label, value, color, suffix = '', trend = '' }: { icon: any, label: string, value: any, color: string, suffix?: string, trend?: string }) => (
    <div className="bg-brand-surface p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden group">
        <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform`}>
            <Icon className="w-16 h-16 text-white" />
        </div>
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-slate-400 text-sm font-bold tracking-tight">{label}</p>
            </div>
            <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-white leading-none tracking-tight">
                  {typeof value === 'number' ? value.toLocaleString() : safeString(value, '0')}{suffix}
                </h3>
                {trend && <span className="text-emerald-400 text-xs font-bold">{trend}</span>}
            </div>
        </div>
    </div>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newNotifMsg, setNewNotifMsg] = useState('');
  const [notifType, setNotifType] = useState<Notification['type']>('info');
  const [notifBtnText, setNotifBtnText] = useState('');
  const [notifBtnLink, setNotifBtnLink] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [cloudStatus, setCloudStatus] = useState<'online' | 'offline'>('offline');

  useEffect(() => {
    setCloudStatus(isSupabaseConfigured() ? 'online' : 'offline');
    loadData();
  }, []);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    
    try {
        const [statsData, notifsData] = await Promise.all([
            fetchStats(),
            fetchNotifications(false) 
        ]);
        setStats(statsData);
        setNotifications(notifsData);
    } catch (err) {
        console.error("Failed to load dashboard data", err);
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotifMsg.trim()) return;
    
    setSending(true);
    try {
        await saveNotification({
            message: newNotifMsg,
            type: notifType,
            buttonText: notifBtnText || undefined,
            buttonLink: notifBtnLink || undefined
        });
        setNewNotifMsg('');
        setNotifBtnText('');
        setNotifBtnLink('');
        await loadData(true);
        alert("Broadcast successfully synchronized with the Global Cloud.");
    } catch (err: any) {
        const errorMsg = extractErrorMessage(err);
        alert(`❌ BROADCAST FAILED: ${errorMsg}\n\nHint: If you're using a custom Supabase, ensure the 'notifications' table has 'button_text' and 'button_link' columns.`);
    } finally {
        setSending(false);
    }
  };

  const handleEndNotif = async (id: string) => {
      if (!confirm("End this broadcast? It will be hidden on all devices immediately.")) return;
      setProcessingId(id);
      try {
          await deactivateNotification(id);
          await loadData(true);
      } catch (err: any) {
          alert(`Failed to end broadcast: ${extractErrorMessage(err)}`);
      } finally {
          setProcessingId(null);
      }
  };

  const handleDeleteNotif = async (id: string) => {
      if (!confirm("Permanently delete this record?")) return;
      setProcessingId(id);
      try {
          await deleteNotification(id);
          setNotifications(prev => prev.filter(n => n.id !== id));
      } catch (err) {
          alert(`Failed to delete: ${extractErrorMessage(err)}`);
      } finally {
          setProcessingId(null);
      }
  };

  const getNotifIcon = (type: Notification['type']) => {
      switch (type) {
          case 'success': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
          case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
          default: return <Info className="w-4 h-4 text-blue-400" />;
      }
  };

  const trafficData = [
    { name: 'Mon', views: 400 }, { name: 'Tue', views: 300 }, { name: 'Wed', views: 600 },
    { name: 'Thu', views: 800 }, { name: 'Fri', views: 500 }, { name: 'Sat', views: 900 },
    { name: 'Sun', views: 750 },
  ];

  if (loading && !stats) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Accessing Command Center...</p>
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-8">
        <div>
            <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">CONSOLE</h1>
            <div className="flex items-center gap-3 mt-2">
                <p className="text-slate-400 font-medium">Global infrastructure management.</p>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors ${
                    cloudStatus === 'online' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                    {cloudStatus === 'online' ? <Globe className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    {cloudStatus === 'online' ? 'CLOUD: SYNCED' : 'CLOUD: DISCONNECTED'}
                </div>
            </div>
        </div>
        <div className="flex gap-4">
            <Link 
                to="/admin/post/new" 
                className="flex items-center gap-2 bg-brand-accent text-brand-darker px-6 py-3 rounded-2xl font-black hover:bg-brand-accentHover transition-all shadow-lg"
            >
                <Plus className="w-5 h-5" /> NEW CONTENT
            </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <StatCard icon={FileText} label="TOTAL ARTICLES" value={stats?.totalPosts || 0} color="bg-blue-500" trend="+2 this week" />
        <StatCard icon={Eye} label="AGGREGATE VIEWS" value={stats?.totalViews || 0} color="bg-emerald-500" trend="+12.4%" />
        <StatCard icon={Database} label="STORAGE USED" value={stats?.storageUsedMB || 0} suffix=" MB" color="bg-purple-500" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-brand-surface p-8 rounded-[2rem] border border-slate-800 shadow-2xl">
              <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                      <TrendingUp className="w-6 h-6 text-brand-accent" /> VISITOR ANALYTICS
                  </h3>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trafficData}>
                        <defs>
                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="name" stroke="#475569" fontSize={12} fontWeight="bold" axisLine={false} tickLine={false} />
                        <YAxis stroke="#475569" fontSize={12} fontWeight="bold" axisLine={false} tickLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px' }}
                            itemStyle={{ color: '#22d3ee' }}
                        />
                        <Area type="monotone" dataKey="views" stroke="#22d3ee" strokeWidth={4} fillOpacity={1} fill="url(#colorViews)" />
                    </AreaChart>
                </ResponsiveContainer>
              </div>
          </div>

          <div className="bg-brand-surface p-8 rounded-[2rem] border border-slate-800 shadow-2xl relative">
              <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                  <Bell className="w-6 h-6 text-brand-accent" /> GLOBAL BROADCAST
              </h3>
              
              <div className="mb-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex items-start gap-3">
                  <Globe className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                      Broadcasts are pushed to the <span className="text-white font-bold">Cloud Infrastructure</span>. All visitors on any device will see the message immediately.
                  </p>
              </div>

              <form onSubmit={handleSendNotification} className="space-y-6">
                  <div>
                      <label className="block text-slate-500 text-[10px] font-black tracking-widest uppercase mb-3">Priority Level</label>
                      <div className="flex gap-2">
                          {['info', 'success', 'warning'].map(type => (
                              <button 
                                key={type}
                                type="button"
                                onClick={() => setNotifType(type as any)}
                                className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                                    notifType === type 
                                    ? 'bg-brand-accent text-brand-darker border-brand-accent' 
                                    : 'bg-brand-dark text-slate-500 border-slate-700 hover:border-slate-500'
                                }`}
                              >
                                  {type}
                              </button>
                          ))}
                      </div>
                  </div>
                  <div>
                      <label className="block text-slate-500 text-[10px] font-black tracking-widest uppercase mb-3">Broadcast Message</label>
                      <textarea 
                        value={newNotifMsg}
                        onChange={e => setNewNotifMsg(e.target.value)}
                        className="w-full bg-brand-dark border border-slate-700 rounded-2xl p-4 text-white focus:border-brand-accent outline-none text-sm h-24 resize-none transition-all focus:bg-slate-900" 
                        placeholder="Global signal content..." 
                        required
                      />
                  </div>
                  <div className="space-y-4 pt-4 border-t border-slate-800">
                      <div className="flex items-center gap-2 mb-2">
                          <LinkIcon className="w-3.5 h-3.5 text-brand-accent" />
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Trigger</h4>
                      </div>
                      <input 
                        type="text"
                        value={notifBtnText}
                        onChange={e => setNotifBtnText(e.target.value)}
                        className="w-full bg-brand-dark border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none text-xs" 
                        placeholder="Button Title (optional)" 
                      />
                      <input 
                        type="text"
                        value={notifBtnLink}
                        onChange={e => setNotifBtnLink(e.target.value)}
                        className="w-full bg-brand-dark border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none text-xs" 
                        placeholder="Destination URL (optional)" 
                      />
                  </div>
                  <button 
                    type="submit" 
                    disabled={sending}
                    className="w-full bg-brand-accent text-brand-darker font-black py-4 rounded-2xl hover:bg-brand-accentHover transition-all disabled:opacity-50 mt-4 shadow-xl shadow-brand-accent/10 flex items-center justify-center gap-2"
                  >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                      {sending ? 'COMMITTING...' : 'BROADCAST TO ALL DEVICES'}
                  </button>
              </form>
          </div>
      </div>

      <div className="bg-brand-surface p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                  <h3 className="text-xl font-black text-white italic uppercase">GLOBAL SIGNAL HISTORY</h3>
                  <button 
                    onClick={() => loadData(true)} 
                    disabled={refreshing}
                    className="p-2 text-slate-500 hover:text-brand-accent transition-all active:rotate-180 duration-500"
                  >
                      <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
              </div>
              <span className="bg-slate-800 px-4 py-1 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">{notifications.length} SIGNALS RECORDED</span>
          </div>
          <div className="space-y-4">
              {notifications.map(n => (
                  <div key={n.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border transition-all group gap-4 ${n.active ? 'bg-brand-dark/40 border-slate-800 hover:border-slate-700/50 shadow-lg' : 'bg-brand-darker/50 border-slate-900 opacity-60'}`}>
                      <div className="flex items-center gap-4">
                          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 relative shadow-inner">
                              {getNotifIcon(n.type)}
                              {n.active && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-accent rounded-full border-2 border-slate-900 animate-pulse"></span>}
                          </div>
                          <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-3">
                                  <p className="text-slate-100 text-sm font-bold truncate max-w-[200px] md:max-w-md">{safeString(n.message)}</p>
                                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${n.active ? 'bg-brand-accent/10 text-brand-accent border-brand-accent/20' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                                      {n.active ? 'LIVE' : 'EXPIRED'}
                                  </span>
                                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1 border ${
                                      n.syncStatus === 'cloud' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  }`}>
                                      {n.syncStatus === 'cloud' ? <Globe className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
                                      {n.syncStatus === 'cloud' ? 'GLOBAL' : 'LOCAL CACHE'}
                                  </span>
                              </div>
                              <div className="flex flex-wrap gap-3 mt-1.5">
                                  <p className="text-[10px] font-black text-slate-600 uppercase">{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'N/A'}</p>
                              </div>
                          </div>
                      </div>
                      <div className="flex items-center gap-2 justify-end sm:justify-start">
                        {n.active && (
                            <button 
                                onClick={() => handleEndNotif(n.id)}
                                disabled={processingId === n.id}
                                className="p-3 text-slate-500 hover:text-amber-400 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                            >
                                {processingId === n.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
                                <span className="hidden md:inline">End Sync</span>
                            </button>
                        )}
                        <button 
                            onClick={() => handleDeleteNotif(n.id)}
                            disabled={processingId === n.id}
                            className="p-3 text-slate-600 hover:text-red-400 transition-all disabled:opacity-50"
                        >
                            {processingId === n.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

export default Dashboard;