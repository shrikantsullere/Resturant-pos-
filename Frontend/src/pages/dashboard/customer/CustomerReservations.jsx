import { formatCurrency } from '../../../utils/currencyUtils';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Calendar, 
  Clock, 
  Plus, 
  ChevronRight, 
  X, 
  Bed, 
  Table2, 
  Car, 
  Sparkles,
  Search,
  CalendarCheck,
  History,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Users,
  Printer
} from 'lucide-react';
import { cn } from "../../../utils/cn";
import { useHospitality } from "@/context/HospitalityContext";
import { useCustomer } from "@/context/CustomerContext";
import { useNavigate } from 'react-router-dom';
import printContent from '../../../utils/printUtil';

const CustomerReservations = () => {
  const { reservations, addReservation, tables = [], rooms = [] } = useHospitality();
  const { profile } = useCustomer();
  const navigate = useNavigate();
  const [showAddRes, setShowAddRes] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedResForPrint, setSelectedResForPrint] = useState(null);

  const [newResData, setNewResData] = useState({
    type: 'Table',
    targetId: '',
    date: '',
    time: '',
    guests: 2,
    notes: ''
  });

  // Filter reservations for current customer and remove 'Transport' type
  const myReservations = reservations.filter(res => {
    const userName = profile.full_name || profile.name;
    return res.guestName === userName && res.type !== 'Transport';
  });
  
  const filteredRes = myReservations.filter(res => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Upcoming') return ['Confirmed', 'Pending'].includes(res.status);
    if (activeTab === 'Past') return ['Checked In', 'Cancelled'].includes(res.status);
    return true;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Cancelled': return 'bg-primary/10 text-primary border-rose-500/20';
      case 'Checked In': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Table': return Table2;
      case 'Room': return Bed;
      case 'Transport': return Car;
      default: return Calendar;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleCreateRes = (e) => {
    e.preventDefault();
    addReservation({
      ...newResData,
      guestName: profile.full_name || profile.name,
      status: 'Pending',
      id: `RES-${Math.floor(1000 + Math.random() * 9000)}`
    });
    setNewResData({ type: 'Table', targetId: '', date: '', time: '', guests: 2, notes: '' });
    setShowAddRes(false);
    alert('Reservation request sent! We will notify you once confirmed.');
  };

  return (
    <div className="space-y-6 lg:space-y-8 pb-24 lg:pb-0">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                 <CalendarCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-black text-text-primary uppercase tracking-tight">Your <span className="text-primary">Bookings</span></h2>
           </div>
           <p className="text-text-secondary text-xs lg:text-sm font-medium">Manage your table and stay reservations.</p>
        </div>
        <button 
          onClick={() => setShowAddRes(true)}
          className="btn-primary px-8 py-4 rounded-full flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" /> New Reservation
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1 shrink-0">
        {['All', 'Upcoming', 'Past'].map(tab => (
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

      {/* Reservations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRes.length === 0 ? (
          <div className="col-span-full card p-12 bg-surface border-none shadow-xl shadow-slate-100/50 flex flex-col items-center text-center">
             <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
                <Calendar className="w-10 h-10 text-slate-200" />
             </div>
             <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">No Reservations Found</h3>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 max-w-xs">You haven't made any bookings yet. Book a table or room to see it here.</p>
             <button 
               onClick={() => setShowAddRes(true)}
               className="mt-8 text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:underline"
             >
                Make your first booking
             </button>
          </div>
        ) : (
          filteredRes.map((res) => {
            const TypeIcon = getTypeIcon(res.type);
            return (
              <div 
                key={res.id}
                className="card bg-surface border-none shadow-xl shadow-slate-100/50 p-6 rounded-[2.5rem] group hover:bg-slate-50 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 z-20">
                   <button 
                     onClick={() => { setSelectedResForPrint(res); setTimeout(() => printContent('printable-area'), 200); }}
                     className="p-2.5 bg-surface/80 backdrop-blur-md rounded-xl text-slate-400 hover:text-primary transition-all shadow-sm opacity-0 group-hover:opacity-100 no-print"
                   >
                      <Printer className="w-4 h-4" />
                   </button>
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
                
                <div className="flex justify-between items-start mb-6">
                   <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <TypeIcon className="w-6 h-6" />
                   </div>
                   <div className={cn("px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border", getStatusStyle(res.status))}>
                      {res.status}
                   </div>
                </div>

                <div className="space-y-4">
                   <div>
                      <h4 className="text-lg font-black text-text-primary uppercase tracking-tight">{res.type} Reservation</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{res.targetId || 'ID Pending'}</p>
                   </div>

                   <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                            <Calendar className="w-4 h-4" />
                         </div>
                         <p className="text-[10px] font-black text-text-primary uppercase tracking-tight leading-none">{formatDate(res.date)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                            <Clock className="w-4 h-4" />
                         </div>
                         <p className="text-[10px] font-black text-text-primary uppercase tracking-tight leading-none">{res.time}</p>
                      </div>
                   </div>

                   <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         <Users className="w-3.5 h-3.5" /> {res.guests} Guests
                      </div>
                      <span className="text-[9px] font-black text-primary uppercase tracking-widest">#{res.id}</span>
                   </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Reservation Modal */}
      {showAddRes && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-0 sm:p-4">
          <div onClick={() => setShowAddRes(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-[95%] md:max-w-lg bg-surface rounded-t-[2.5rem] sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] self-end sm:self-center animate-in fade-in slide-in-from-bottom-4 sm:zoom-in duration-300">
            <div className="px-6 py-5 md:px-8 md:py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 shrink-0">
               <div className="flex items-center gap-4">
                   <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <Plus className="w-5 h-5 text-primary stroke-[3]" />
                   </div>
                   <div className="min-w-0">
                     <h3 className="text-base sm:text-lg md:text-xl font-black uppercase tracking-tight leading-tight truncate">New Booking</h3>
                     <p className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 leading-none truncate">Hospitality Experience</p>
                   </div>
               </div>
               <button onClick={() => setShowAddRes(false)} className="p-2 hover:bg-surface rounded-xl border border-transparent hover:border-slate-100 transition-all shadow-sm"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreateRes} className="flex-1 overflow-y-auto scrollbar-hide">
               <div className="p-5 md:p-8 space-y-5 md:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Booking Type</label>
                    <div className="flex gap-2">
                       {['Table', 'Room'].map(type => (
                         <button
                           key={type}
                           type="button"
                           onClick={() => setNewResData({...newResData, type, targetId: ''})}
                           className={cn(
                             "flex-1 py-3 rounded-xl border-2 transition-all text-center",
                             newResData.type === type 
                             ? "bg-primary/5 border-primary text-primary" 
                             : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100"
                           )}
                         >
                            <p className="text-[9px] font-black uppercase tracking-tight">{type}</p>
                         </button>
                       ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Guests</label>
                    <input 
                      type="number"
                      min="1"
                      value={newResData.guests}
                      onChange={(e) => setNewResData({...newResData, guests: parseInt(e.target.value)})}
                      className="w-full px-5 py-3 bg-slate-50 rounded-xl sm:rounded-2xl text-xs font-bold outline-none border-2 border-transparent focus:border-primary/20 focus:bg-surface transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Select Available {newResData.type}
                  </label>
                  <select
                    required
                    value={newResData.targetId}
                    onChange={(e) => setNewResData({...newResData, targetId: e.target.value})}
                    className="w-full px-5 py-3 bg-slate-50 rounded-xl sm:rounded-2xl text-xs font-bold outline-none border-2 border-transparent focus:border-primary/20 focus:bg-surface transition-all shadow-sm cursor-pointer"
                  >
                    <option value="" disabled>Choose a {newResData.type}...</option>
                    {newResData.type === 'Table' && tables.filter(t => t.status === 'available').map(t => (
                      <option key={t.id} value={t.table_code || `T-${t.id}`}>
                        {t.table_code || `Table ${t.id}`} (Capacity: {t.capacity || 2} People)
                      </option>
                    ))}
                    {newResData.type === 'Room' && rooms.filter(r => r.status === 'available').map(r => (
                      <option key={r.id} value={r.room_name || `R-${r.id}`}>
                        {r.room_name || `Room ${r.id}`} - {formatCurrency(r.price || 0)}/night
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Preferred Date</label>
                    <input 
                      type="date"
                      required
                      value={newResData.date}
                      onChange={(e) => setNewResData({...newResData, date: e.target.value})}
                      className="w-full px-5 py-3 bg-slate-50 rounded-xl sm:rounded-2xl text-xs font-bold outline-none border-2 border-transparent focus:border-primary/20 focus:bg-surface transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Preferred Time</label>
                    <input 
                      type="time"
                      required
                      value={newResData.time}
                      onChange={(e) => setNewResData({...newResData, time: e.target.value})}
                      className="w-full px-5 py-3 bg-slate-50 rounded-xl sm:rounded-2xl text-xs font-bold outline-none border-2 border-transparent focus:border-primary/20 focus:bg-surface transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Special Notes</label>
                  <textarea 
                    value={newResData.notes}
                    onChange={(e) => setNewResData({...newResData, notes: e.target.value})}
                    className="w-full px-5 py-3 bg-slate-50 rounded-xl sm:rounded-2xl text-xs font-bold outline-none border-2 border-transparent focus:border-primary/20 focus:bg-surface h-20 sm:h-24 resize-none transition-all shadow-sm"
                    placeholder="Any specific requests..."
                  />
                </div>
              </div>

              <div className="p-5 md:p-8 border-t border-slate-50 bg-surface shrink-0 relative z-20">
                <button className="w-full btn-primary py-4 rounded-full flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all">
                   Book Experience
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
      {/* Hidden Printable Reservation */}
      {selectedResForPrint && (
        <div id="printable-area" className="hidden print:block printable-area receipt-print">
          <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
            <h1 className="text-xl font-black uppercase tracking-tighter">THE LUXE GRANDE</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-1">Booking Confirmation</p>
          </div>
          
          <div className="space-y-4">
             <div className="flex justify-between items-start">
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Booking For</p>
                   <p className="text-sm font-black uppercase">{profile.name}</p>
                </div>
                <div className="text-right">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Booking ID</p>
                   <p className="text-sm font-black">#{selectedResForPrint.id}</p>
                </div>
             </div>

             <div className="py-4 border-y border-slate-900 grid grid-cols-2 gap-4">
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Type</p>
                   <p className="text-xs font-black uppercase">{selectedResForPrint.type} • {selectedResForPrint.targetId || 'Pending'}</p>
                </div>
                <div className="text-right">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Guests</p>
                   <p className="text-xs font-black uppercase">{selectedResForPrint.guests} Person(s)</p>
                </div>
             </div>

             <div className="flex justify-between items-center py-2">
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Date</p>
                   <p className="text-xs font-black uppercase">{formatDate(selectedResForPrint.date)}</p>
                </div>
                <div className="text-right">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Time</p>
                   <p className="text-xs font-black uppercase">{selectedResForPrint.time}</p>
                </div>
             </div>

             {selectedResForPrint.notes && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Notes</p>
                   <p className="text-[10px] font-bold italic">"{selectedResForPrint.notes}"</p>
                </div>
             )}
          </div>

          <div className="text-center pt-8 border-t border-slate-200">
            <p className="text-[9px] font-black uppercase tracking-widest">Confirmation Slip</p>
            <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Please present this at arrival</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerReservations;
