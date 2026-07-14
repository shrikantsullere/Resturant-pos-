import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  X, 
  Calendar, 
  Clock, 
  User, 
  ChevronRight, 
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Table2 as TableIcon,
  Bed,
  Car,
  CalendarCheck,
  TrendingUp,
  Activity,
  History,
  CheckCircle,
  XCircle,
  LogIn,
  ClipboardList,
  Sparkles,
  Printer,
  MapPin
} from 'lucide-react';
import { cn } from "../../../utils/cn";
import { useHospitality } from "../../../context/HospitalityContext";
import { useToast } from "../../../context/ToastContext";
import printContent from '../../../utils/printUtil';

const Reservations = () => {
  const { 
    reservations, 
    addReservation: ctxAddReservation,
    approveReservation, 
    rejectReservation, 
    checkInReservation, 
    completeReservation, 
    cancelReservation,
    deleteReservation,
    activityLog,
    tables,
    rooms
  } = useHospitality();
  
  const { showToast } = useToast();
  const [selectedRes, setSelectedRes] = useState(null);
  const [showAddRes, setShowAddRes] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [orderForPrint, setOrderForPrint] = useState(null);
  const [newBookingType, setNewBookingType] = useState('Table');

  const handlePrint = (res) => {
    setOrderForPrint(res);
    setTimeout(() => {
      printContent('single-reservation-print');
    }, 100);
  };

  const resStatuses = ['Pending', 'Confirmed', 'Checked_in', 'Completed', 'Cancelled'];

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'confirmed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'cancelled': return 'bg-rose-50 text-primary border-rose-100';
      case 'checked_in': return 'bg-indigo-50 text-primary border-indigo-100';
      case 'completed': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getTypeIcon = (type) => {
    const t = type?.toLowerCase();
    switch (t) {
      case 'table': return TableIcon;
      case 'room': return Bed;
      case 'transport': return Car;
      default: return Calendar;
    }
  };

  const filteredReservations = reservations.filter(res => {
    const matchesSearch = (res.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                          (res.reservation_code?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'All' || res.reservation_status?.toLowerCase() === activeTab.toLowerCase();
    const matchesType = typeFilter === 'All' || res.booking_type?.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesTab && matchesType;
  });

  const stats = [
    { label: 'Pending Bookings', value: reservations.filter(r => r.reservation_status?.toLowerCase() === 'pending').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Confirmed Today', value: reservations.filter(r => r.reservation_status?.toLowerCase() === 'confirmed').length, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Active Guests', value: reservations.filter(r => r.reservation_status?.toLowerCase() === 'checked_in').length, icon: User, color: 'text-primary', bg: 'bg-indigo-50' },
    { label: 'Total Volume', value: reservations.length, icon: TrendingUp, color: 'text-slate-500', bg: 'bg-slate-50' },
  ];

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Area */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
            <CalendarCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-text-primary uppercase tracking-wider">Hospitality Desk</h2>
            <p className="text-text-secondary text-sm font-bold mt-1">Manage reservations and guest stays</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group min-w-[240px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search guest or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-5 py-3 bg-surface border border-slate-100 rounded-2xl outline-none shadow-sm text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all"
            />
          </div>
          <button 
             onClick={() => {
               if (filteredReservations.length === 0) {
                 alert('No reservations to print in the current filter (' + activeTab + ')');
                 return;
               }
               printContent('batch-print-reservations', 'A4');
             }}
            className="p-3 bg-surface border border-slate-100 rounded-2xl text-slate-400 hover:text-primary transition-all shadow-sm"
          >
            <Printer className="w-5 h-5" />
          </button>
          <button 
             onClick={() => setShowAddRes(true)}
            className="btn-primary h-[48px] px-6 rounded-full flex items-center gap-3 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5" /> New Booking
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         {stats.map((stat, i) => (
           <div key={i} className="card bg-surface border-none shadow-xl shadow-slate-100/50 p-5 flex items-center gap-4 rounded-[2rem]">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
                 <stat.icon className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                 <h3 className="text-xl font-black text-text-primary mt-0.5">{stat.value}</h3>
              </div>
           </div>
         ))}
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Main Content: Reservations List */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Tabs and Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide -mx-1 px-1 w-full sm:w-auto flex-1">
              {['All', ...resStatuses].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 whitespace-nowrap transition-all",
                    activeTab === tab 
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/10" 
                    : "bg-surface text-text-secondary border-transparent hover:bg-slate-50"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative shrink-0 w-full sm:w-[160px] pb-2 sm:pb-0">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full appearance-none pl-5 pr-10 py-2.5 bg-surface border border-slate-100 rounded-xl outline-none shadow-sm text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-primary/5 cursor-pointer hover:border-primary/30 transition-all text-slate-600"
              >
                <option value="All">All Types</option>
                <option value="Room">Room</option>
                <option value="Table">Table</option>
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex-1 overflow-hidden lg:card bg-transparent lg:bg-surface border-none lg:shadow-xl lg:shadow-slate-100/50 lg:rounded-[2.5rem]">
            <div className="h-full overflow-y-auto scrollbar-hide">
              {/* Desktop Table View */}
              <table className="w-full border-collapse hidden lg:table">
                <thead>
                  <tr className="text-left bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Guest</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Schedule</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                    <th className="px-8 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredReservations.map((res) => {
                    const TypeIcon = getTypeIcon(res.booking_type);
                    return (
                      <tr key={res.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={() => setSelectedRes(res)}>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-text-primary">
                              <User className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-text-primary uppercase tracking-tight">{res.full_name}</p>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">#{res.reservation_code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                              <TypeIcon className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black text-text-primary uppercase tracking-widest">{res.booking_type}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-[11px] font-bold text-text-primary">
                          {new Date(res.booking_date).toLocaleDateString()} • {res.booking_time}
                        </td>
                        <td className="px-8 py-5">
                          <span className={cn("px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border", getStatusBadge(res.reservation_status))}>
                            {res.reservation_status}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button 
                            className="p-2.5 bg-surface border border-slate-100 rounded-xl text-slate-300 hover:text-primary hover:border-primary transition-all shadow-sm"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4 pb-20">
                {filteredReservations.map((res) => {
                  const TypeIcon = getTypeIcon(res.booking_type);
                  return (
                    <div 
                      key={res.id} 
                      onClick={() => setSelectedRes(res)}
                      className="card bg-surface p-5 rounded-[2rem] shadow-lg shadow-slate-200/40 border-none space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-text-primary">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-text-primary uppercase tracking-tight">{res.full_name}</p>
                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-0.5">#{res.reservation_code}</p>
                          </div>
                        </div>
                        <span className={cn("px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border", getStatusBadge(res.reservation_status))}>
                          {res.reservation_status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-50">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center text-primary">
                            <TypeIcon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-widest">{res.booking_type}</span>
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                           <Clock className="w-3.5 h-3.5 text-slate-300" />
                           <span className="text-[9px] font-bold text-slate-500 uppercase">{res.booking_time}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(res.booking_date).toLocaleDateString()}</span>
                        <ChevronRight className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredReservations.length === 0 && (
                <div className="h-64 flex flex-col items-center justify-center text-center opacity-40">
                   <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-4">
                      <CalendarCheck className="w-10 h-10 text-slate-200" />
                   </div>
                   <p className="text-xs font-black uppercase tracking-widest">No reservations found</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Modals */}
      {showAddRes && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div onClick={() => setShowAddRes(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="relative w-full sm:max-w-[550px] bg-surface rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] self-center animate-in fade-in slide-in-from-bottom-4 sm:zoom-in duration-300">
            <div className="px-6 py-5 md:px-8 md:py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 shrink-0">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                     <CalendarCheck className="w-5 h-5 text-primary stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-black uppercase tracking-tight leading-none">New Reservation</h3>
                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 md:mt-1 leading-none">Register and schedule guest booking</p>
                  </div>
               </div>
              <button onClick={() => setShowAddRes(false)} className="p-2 hover:bg-surface rounded-xl border border-transparent hover:border-slate-100 transition-all shadow-sm"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                try {
                  const formData = new FormData(e.target);
                  const guestName = formData.get('guestName');
                  const type = formData.get('type');
                  const targetId = formData.get('targetId');
                  const date = formData.get('date');
                  const time = formData.get('time');
                  const guests = parseInt(formData.get('guests'));

                  if (!guestName || !targetId || !date || !time) {
                    showToast('Please fill all required fields', 'error');
                    return;
                  }

                  if (ctxAddReservation) {
                    ctxAddReservation({
                      guestName,
                      type,
                      targetId,
                      date,
                      time,
                      guests,
                      status: 'Pending',
                      notes: formData.get('notes') || ''
                    });
                    showToast('New booking created successfully!', 'success');
                    setShowAddRes(false);
                  } else {
                    console.error('addReservation function is missing from context');
                    showToast('Error: System not ready', 'error');
                  }
                } catch (err) {
                  console.error('Booking Error:', err);
                  showToast('Failed to create booking', 'error');
                }
              }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-hide">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Guest Name</label>
                    <input name="guestName" required placeholder="Guest full name" className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl text-xs font-bold outline-none border-2 border-transparent focus:border-primary/20 focus:bg-surface transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Guests</label>
                    <input name="guests" type="number" min="1" required defaultValue={2} className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl text-xs font-bold outline-none border-2 border-transparent focus:border-primary/20 focus:bg-surface transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Booking Type</label>
                    <div className="relative">
                      <select 
                        name="type" 
                        value={newBookingType}
                        onChange={(e) => setNewBookingType(e.target.value)}
                        className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl text-xs font-bold outline-none border-2 border-transparent focus:border-primary/20 focus:bg-surface transition-all appearance-none"
                      >
                        <option value="Table">Table Reservation</option>
                        <option value="Room">Room Booking</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Unit ID / Table Name</label>
                    {newBookingType === 'Table' ? (
                      <div className="relative">
                        <select name="targetId" required className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl text-xs font-bold outline-none border-2 border-transparent focus:border-primary/20 focus:bg-surface transition-all appearance-none">
                          <option value="">Select Table...</option>
                          {tables?.map(t => (
                            <option key={t.id} value={t.id}>{t.table_code || `Table ${t.id}`}</option>
                          ))}
                        </select>
                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                      </div>
                    ) : (
                      <div className="relative">
                        <select name="targetId" required className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl text-xs font-bold outline-none border-2 border-transparent focus:border-primary/20 focus:bg-surface transition-all appearance-none">
                          <option value="">Select Room...</option>
                          {rooms?.map(r => (
                            <option key={r.id} value={r.id}>{r.room_name || r.room_code || `Room ${r.id}`}</option>
                          ))}
                        </select>
                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Date</label>
                    <input name="date" type="date" required className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl text-xs font-bold outline-none border-2 border-transparent focus:border-primary/20 focus:bg-surface transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Time</label>
                    <input name="time" type="time" required className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl text-xs font-bold outline-none border-2 border-transparent focus:border-primary/20 focus:bg-surface transition-all" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Special Notes</label>
                  <textarea name="notes" placeholder="Any special requests or instructions..." className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl text-xs font-bold outline-none border-2 border-transparent focus:border-primary/20 focus:bg-surface h-24 resize-none transition-all" />
                </div>
              </div>
              
              <div className="px-6 py-4 md:px-8 md:py-6 border-t border-slate-50 bg-surface shrink-0 relative z-20">
                <button type="submit" className="w-full btn-primary py-3.5 rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 active:scale-95 transition-all text-center">
                  Create Booking
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Detail Modal */}
      {selectedRes && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-0 sm:p-4">
          <div onClick={() => setSelectedRes(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="relative w-full sm:max-w-[500px] bg-surface rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] self-center animate-in fade-in slide-in-from-bottom-4 sm:zoom-in duration-300">
            <div className="p-5 md:p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 md:w-14 h-12 md:h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-sm">
                   {React.createElement(getTypeIcon(selectedRes.booking_type), { className: "w-6 h-6 md:w-7 md:h-7" })}
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-text-primary uppercase tracking-tight leading-none">{selectedRes.full_name}</h3>
                  <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 md:mt-1">#{selectedRes.reservation_code}</p>
                </div>
              </div>
              <button onClick={() => setSelectedRes(null)} className="p-2.5 hover:bg-surface rounded-xl border border-transparent hover:border-slate-100 transition-all shadow-sm"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-8 md:px-8 md:py-10 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status Lifecycle</p>
                  <div className="flex mt-2.5">
                    <span className={cn("px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm", getStatusBadge(selectedRes.reservation_status))}>
                      {selectedRes.reservation_status}
                    </span>
                  </div>
                </div>
                <div className="sm:text-right space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Booking Context</p>
                  <p className="text-base md:text-lg font-black text-text-primary uppercase mt-1.5">{selectedRes.booking_type || selectedRes.type}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/50">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Guest Email</p>
                  <p className="text-xs font-black text-text-primary truncate">{selectedRes.email || 'N/A'}</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/50">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Guest Phone</p>
                  <p className="text-xs font-black text-text-primary">{selectedRes.phone || 'N/A'}</p>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100/50 space-y-5">
                 <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center shadow-sm">
                          <MapPin className="w-5 h-5 text-primary" />
                       </div>
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned Location</p>
                          <p className="text-sm font-black text-text-primary uppercase tracking-tight">{selectedRes.location || selectedRes.targetId || 'Not Assigned'}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center shadow-sm">
                          <Calendar className="w-5 h-5 text-primary" />
                       </div>
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Stay Schedule</p>
                          <p className="text-sm font-black text-text-primary uppercase tracking-tight">{new Date(selectedRes.booking_date).toLocaleDateString()} • {selectedRes.booking_time}</p>
                       </div>
                    </div>
                    <div className="sm:text-right bg-surface/50 px-4 py-2 rounded-xl border border-white/50">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Guests</p>
                       <p className="text-xl font-black text-primary">{selectedRes.guests_count}</p>
                    </div>
                 </div>
                 {selectedRes.notes && (
                   <p className="text-xs font-medium text-text-secondary leading-relaxed italic border-t border-slate-100 pt-5 mt-4">
                      "{selectedRes.notes}"
                   </p>
                 )}
              </div>

            </div>

            <div className="px-6 py-4 md:px-8 md:py-6 border-t border-slate-50 bg-surface shrink-0 relative z-20 flex flex-row items-center gap-3">
               {selectedRes.reservation_status === 'pending' && (
                 <>
                   <button 
                     onClick={() => { approveReservation(selectedRes.id); setSelectedRes(null); }}
                     className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-black uppercase tracking-widest text-[9px] md:text-[10px] shadow-lg shadow-emerald-500/10 active:scale-95 transition-all flex items-center justify-center gap-2"
                   >
                     <CheckCircle className="w-4 h-4" /> Approve
                   </button>
                   <button 
                     onClick={() => { rejectReservation(selectedRes.id); setSelectedRes(null); }}
                     className="flex-1 py-3 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[9px] md:text-[10px] shadow-lg shadow-rose-500/10 active:scale-95 transition-all flex items-center justify-center gap-2"
                   >
                     <XCircle className="w-4 h-4" /> Reject
                   </button>
                 </>
               )}

               {selectedRes.reservation_status === 'confirmed' && (
                 <>
                   <button 
                     onClick={() => { checkInReservation(selectedRes.id); setSelectedRes(null); }}
                     className="flex-1 py-3 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[9px] md:text-[10px] shadow-lg shadow-primary/10 active:scale-95 transition-all flex items-center justify-center gap-2"
                   >
                     <LogIn className="w-4 h-4" /> Check In
                   </button>
                   <button 
                     onClick={() => { cancelReservation(selectedRes.id); setSelectedRes(null); }}
                     className="flex-1 py-3 bg-rose-50 text-primary rounded-xl font-black uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-primary hover:text-white transition-all active:scale-95 text-center"
                   >
                     Cancel
                   </button>
                 </>
               )}

               {selectedRes.reservation_status === 'checked_in' && (
                 <button 
                   onClick={() => { completeReservation(selectedRes.id); setSelectedRes(null); }}
                   className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[9px] md:text-[10px] shadow-lg shadow-slate-900/10 active:scale-95 transition-all flex items-center justify-center gap-2"
                 >
                   <Sparkles className="w-4 h-4 text-amber-400" /> Mark Completed
                 </button>
               )}

               {(selectedRes.reservation_status === 'completed' || selectedRes.reservation_status === 'cancelled') && (
                  <button 
                    onClick={() => { 
                      if(confirm('Archive this record?')) {
                        deleteReservation(selectedRes.id); 
                        setSelectedRes(null); 
                      }
                    }}
                    className="flex-1 py-3 bg-rose-50 text-primary rounded-xl font-black uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-primary hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Archive History
                  </button>
               )}

               <button 
                 onClick={() => setSelectedRes(null)}
                 className="px-4 py-3 bg-slate-50 text-slate-500 rounded-xl font-black uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-slate-100 transition-all active:scale-95 text-center"
               >
                 Close
               </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* Hidden Printable Reservation */}
      {orderForPrint && (
        <div id="single-reservation-print" className="hidden print:block printable-area receipt-print">
          <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
            <h1 className="text-xl font-black uppercase tracking-tighter">RESERVATION CONFIRMATION</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-1">The Luxe Grande Hospitality</p>
          </div>
          
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Guest Name</p>
                <p className="text-lg font-black uppercase">{orderForPrint.guestName}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Booking ID</p>
                <p className="text-sm font-black">{orderForPrint.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 py-6 border-y border-slate-900">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date & Time</p>
                <p className="text-sm font-black uppercase">{orderForPrint.date} • {orderForPrint.time}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Unit Assignment</p>
                <p className="text-sm font-black uppercase">{orderForPrint.type}: {orderForPrint.targetId}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Number of Guests</p>
              <p className="text-sm font-black uppercase">{orderForPrint.guests} Person(s)</p>
            </div>

            {orderForPrint.notes && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Special Instructions</p>
                <p className="text-[10px] font-bold italic">"{orderForPrint.notes}"</p>
              </div>
            )}
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200 text-center">
            <p className="text-[9px] font-black uppercase tracking-widest">Please present this slip at the reception desk</p>
            <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Thank you for choosing The Luxe Grande</p>
          </div>
        </div>
      )}

      {/* Batch Print Area (All Reservations) */}
      <div id="batch-print-reservations" className="hidden print:block printable-area">
        <div className="text-center border-b-2 border-slate-900 pb-4 mb-8">
           <h1 className="text-2xl font-black uppercase tracking-tighter">Reservation Manifest</h1>
           <p className="text-[10px] font-bold uppercase tracking-widest mt-1">Generated: {new Date().toLocaleString()}</p>
        </div>
        <table className="w-full text-left text-[10px]">
           <thead>
             <tr className="border-b border-slate-900">
               <th className="py-2 uppercase font-black">Guest</th>
               <th className="py-2 uppercase font-black">Type</th>
               <th className="py-2 uppercase font-black">Unit</th>
               <th className="py-2 uppercase font-black">Schedule</th>
               <th className="py-2 uppercase font-black">Status</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
             {filteredReservations.map(res => (
               <tr key={res.id}>
                 <td className="py-2 font-black uppercase">{res.guestName}</td>
                 <td className="py-2 uppercase">{res.type}</td>
                 <td className="py-2 font-black">{res.targetId}</td>
                 <td className="py-2">{res.date} • {res.time}</td>
                 <td className="py-2 font-bold uppercase">{res.status}</td>
               </tr>
             ))}
           </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reservations;
