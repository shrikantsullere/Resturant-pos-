import { useState } from 'react';
import { 
  Bell, 
  Search, 
  Filter, 
  Trash2, 
  CheckCircle2, 
  MessageSquare, 
  CalendarCheck, 
  UtensilsCrossed,
  Bed,
  MoreVertical,
  Activity,
  History,
  X,
  AlertCircle,
  ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { useNotifications } from '@/context/NotificationContext';
import { useAuth, roles } from '@/context/AuthContext';

const NotificationsPage = () => {
  const { notifications, markAsRead, clearNotifications, markAllAsRead, deleteNotification } = useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const myNotifications = notifications; // Context already filters by role
  
  const filteredNotifications = myNotifications.filter(n => {
    const type = n.notification_type || n.type || 'System';
    const matchesTab = activeTab === 'All' || type.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch = (n.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (n.message || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getIcon = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('reservation')) return <CalendarCheck className="w-5 h-5" />;
    if (t.includes('message')) return <MessageSquare className="w-5 h-5" />;
    if (t.includes('service')) return <UtensilsCrossed className="w-5 h-5" />;
    if (t.includes('check')) return <Bed className="w-5 h-5" />;
    if (t.includes('kitchen')) return <Activity className="w-5 h-5" />;
    return <Bell className="w-5 h-5" />;
  };

  const getColor = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('reservation')) return 'bg-indigo-50 text-primary';
    if (t.includes('message')) return 'bg-amber-50 text-amber-600';
    if (t.includes('service')) return 'bg-rose-50 text-primary';
    if (t.includes('check')) return 'bg-emerald-50 text-emerald-600';
    if (t.includes('kitchen')) return 'bg-blue-50 text-blue-600';
    return 'bg-slate-50 text-slate-600';
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="lg:hidden p-2 bg-surface rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-primary transition-all mr-1"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
            <Bell className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-text-primary uppercase tracking-wider">Alert <span className="text-primary">Center</span></h2>
            <p className="text-text-secondary text-sm font-bold mt-1">Monitor real-time hospitality operations</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group min-w-[240px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Filter alerts..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-5 py-3 bg-surface border border-slate-100 rounded-2xl outline-none shadow-sm text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all"
            />
          </div>
          <button 
            onClick={() => markAllAsRead(user?.role)}
            className="px-6 py-3 bg-surface border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-all flex items-center gap-2"
          >
             <CheckCircle2 className="w-4 h-4" /> Mark all read
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1 shrink-0">
          {['All', 'Reservation', 'Message', 'Room Service', 'Kitchen'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 whitespace-nowrap transition-all",
                activeTab === tab 
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/10" 
                : "bg-surface text-text-secondary border-transparent hover:bg-slate-50 shadow-sm"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide space-y-4">
           {filteredNotifications.length === 0 ? (
             <div className="h-64 flex flex-col items-center justify-center text-center opacity-40">
                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-4">
                   <Bell className="w-10 h-10 text-slate-200" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest">No matching notifications found</p>
             </div>
           ) : (
             filteredNotifications.map((n) => (
               <div 
                 key={n.id}
                 onClick={() => markAsRead(n.id)}
                 className={cn(
                   "group p-5 lg:p-6 bg-surface rounded-[2rem] lg:rounded-[2.5rem] border-2 transition-all flex flex-col sm:flex-row items-start gap-4 lg:gap-6 cursor-pointer hover:shadow-xl hover:shadow-slate-100",
                   n.read ? "border-transparent" : "border-primary/20 bg-primary/[0.01]"
                 )}
               >
                  <div className={cn("w-12 lg:w-14 h-12 lg:h-14 rounded-2xl flex items-center justify-center shrink-0", getColor(n.type))}>
                     {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-1 lg:gap-4 mb-2 sm:mb-1">
                        <h4 className="text-base lg:text-lg font-black text-text-primary uppercase tracking-tight">{n.title}</h4>
                        <span className="text-[8px] lg:text-[10px] font-black text-slate-300 uppercase tracking-widest whitespace-nowrap">{new Date(n.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                     </div>
                     <p className="text-xs lg:text-sm font-medium text-slate-500 leading-relaxed max-w-2xl">{n.message}</p>
                     {!n.read && (
                       <div className="mt-3 lg:mt-4 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                          <span className="text-[8px] lg:text-[9px] font-black text-primary uppercase tracking-widest">New Update</span>
                       </div>
                     )}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                    className="hidden sm:block p-2 lg:p-3 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-primary transition-all shrink-0"
                  >
                    <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                  </button>
               </div>
             ))
           )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
