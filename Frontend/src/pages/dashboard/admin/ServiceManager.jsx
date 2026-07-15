import { formatCurrency } from '../../../utils/currencyUtils';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Compass, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronRight, 
  MoreVertical,
  Calendar,
  Users,
  MapPin,
  Car,
  Download,
  Plus,
  RefreshCw,
  Menu,
  ChevronLeft,
  X,
  Zap,
  Map,
  Printer
} from 'lucide-react';
import { cn } from "../../../utils/cn";
import { useHospitality } from "@/context/HospitalityContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from 'react-router-dom';
import printContent from '../../../utils/printUtil';

import { useSettings } from "@/context/SettingsContext";

const ServiceManager = () => {
  const { services, addService, serviceBookings, updateServiceBookingStatus, loading } = useHospitality();
  const { settings } = useSettings();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [viewMode, setViewMode] = useState('Bookings'); // 'Bookings' or 'Services'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    transport: 'Airport Shuttle',
    price: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    const rolePrefix = user?.role?.toLowerCase() || 'admin';
    navigate(`/${rolePrefix}/dashboard`);
  };

  const filteredBookings = serviceBookings.filter(b => {
    const matchesTab = activeTab === 'All' || b.status === activeTab;
    const matchesSearch = (b.guestName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (b.serviceName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const filteredServicesList = services.filter(s => 
    (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.transport || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePrintManifest = () => {
    if (filteredBookings.length === 0) {
      alert('No bookings found in the current filter to print.');
      return;
    }
    printContent('batch-print-services', 'A4');
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.transport || !formData.price) return;
    
    setIsSubmitting(true);
    try {
      const result = await addService({
        ...formData,
        price: parseFloat(formData.price)
      });
      
      if (result.success) {
        setIsModalOpen(false);
        setFormData({ name: '', transport: 'Airport Shuttle', price: '', notes: '' });
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 lg:gap-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center justify-between w-full lg:w-auto">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleBack}
              className="lg:hidden p-2 bg-surface rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-primary transition-all mr-1"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary rounded-xl lg:rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
              <Compass className="w-5 h-5 lg:w-6 lg:h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg lg:text-2xl font-black tracking-tight text-text-primary uppercase tracking-wider leading-none">Service <span className="text-primary">Manager</span></h2>
              <p className="text-text-secondary text-[10px] lg:text-sm font-bold mt-1">Coordinate transport and guest excursions</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 lg:gap-3 w-full lg:w-auto">
          <div className="relative group flex-1 lg:min-w-[240px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder={viewMode === 'Bookings' ? "Search bookings..." : "Search services..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-5 py-2.5 lg:py-3 bg-surface border border-slate-100 rounded-xl lg:rounded-2xl outline-none shadow-sm text-xs font-bold focus:ring-4 focus:ring-primary/5 transition-all"
            />
          </div>
          {viewMode === 'Bookings' ? (
            <button 
              onClick={handlePrintManifest}
              className="btn-primary h-[42px] lg:h-[48px] px-4 lg:px-6 rounded-xl lg:rounded-full flex items-center gap-2 lg:gap-3 font-black uppercase text-[9px] lg:text-[10px] tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all shrink-0"
            >
               <Printer className="w-4 h-4" /> <span className="hidden sm:inline">Export Manifest</span><span className="sm:hidden">Export</span>
            </button>
          ) : (
            (user?.role_name?.toUpperCase() === 'ADMIN' || user?.role_name?.toUpperCase() === 'MANAGER') && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="btn-primary h-[42px] lg:h-[48px] px-4 lg:px-6 rounded-xl lg:rounded-full flex items-center gap-2 lg:gap-3 font-black uppercase text-[9px] lg:text-[10px] tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all shrink-0"
              >
                 <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Service</span><span className="sm:hidden">Add</span>
              </button>
            )
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Main Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-2xl w-full lg:w-fit shrink-0">
          <button 
            onClick={() => setViewMode('Bookings')}
            className={cn(
              "flex-1 lg:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              viewMode === 'Bookings' ? "bg-surface text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Bookings
          </button>
          <button 
            onClick={() => setViewMode('Services')}
            className={cn(
              "flex-1 lg:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              viewMode === 'Services' ? "bg-surface text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Manage Services
          </button>
        </div>

        {viewMode === 'Bookings' ? (
          <>
            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1 shrink-0">
              {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-5 lg:px-8 py-2.5 lg:py-3 rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest border-2 whitespace-nowrap transition-all",
                    activeTab === tab 
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/10" 
                    : "bg-surface text-text-secondary border-transparent hover:bg-slate-50 shadow-sm"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Bookings List */}
            <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide space-y-4">
               {filteredBookings.length === 0 ? (
                 <div className="h-64 flex flex-col items-center justify-center text-center opacity-40">
                    <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-4">
                       <Compass className="w-10 h-10 text-slate-200" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest">No bookings found</p>
                 </div>
               ) : (
                 filteredBookings.map((booking) => (
                   <div key={booking.id} className="card p-6 bg-surface border-none shadow-xl shadow-slate-100/50 flex flex-col lg:flex-row lg:items-center gap-6 group hover:shadow-2xl hover:shadow-slate-200 transition-all">
                      <div className="flex items-center gap-4 shrink-0">
                         <div className="w-16 h-16 bg-primary/5 rounded-3xl flex items-center justify-center text-3xl shadow-inner group-hover:bg-primary/10 transition-all">
                            {services.find(s => s.id === booking.serviceId)?.icon || '📅'}
                         </div>
                         <div>
                            <h4 className="text-xl font-black text-text-primary uppercase tracking-tight leading-none mb-1.5">{booking.serviceName}</h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{booking.category} • Booking ID: {booking.id}</p>
                         </div>
                      </div>

                      <div className="flex-1 grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 px-0 lg:px-6 py-4 lg:py-0 border-y lg:border-y-0 lg:border-x border-slate-50">
                         <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Guest</p>
                            <p className="text-sm font-black text-text-primary uppercase">{booking.guestName}</p>
                            <p className="text-[9px] font-bold text-slate-400">{booking.guestPhone || booking.guestEmail}</p>
                         </div>
                         <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Schedule</p>
                            <p className="text-sm font-bold text-text-primary">
                              {(() => {
                                const d = new Date(booking.date);
                                if (isNaN(d.getTime())) return booking.date;
                                return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                              })()} • {booking.time?.substring(0, 5)}
                            </p>
                         </div>
                         <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Guests</p>
                            <p className="text-sm font-bold text-text-primary">{booking.guests} Person(s)</p>
                         </div>
                         <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Total Charge</p>
                            <p className="text-sm font-black text-primary">{formatCurrency(booking.total)}</p>
                         </div>
                         <div className="hidden lg:block">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Notes</p>
                            <p className="text-[10px] font-medium text-slate-500 line-clamp-2">{booking.notes || '—'}</p>
                         </div>
                      </div>

                      <div className="flex flex-row items-center gap-2.5 lg:gap-3 w-full sm:w-auto shrink-0">
                         {booking.status === 'Pending' ? (
                           <>
                             <button 
                               onClick={() => updateServiceBookingStatus(booking.id, 'Confirmed')}
                               className="flex-1 sm:flex-none lg:flex-none h-11 px-4 sm:px-6 bg-emerald-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                             >
                                <CheckCircle2 className="w-4 h-4" /> Approve
                             </button>
                             <button 
                               onClick={() => updateServiceBookingStatus(booking.id, 'Cancelled')}
                               className="flex-1 sm:flex-none lg:flex-none h-11 px-4 sm:px-6 bg-surface border border-slate-100 text-primary rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-50 active:scale-95 transition-all flex items-center justify-center gap-2"
                             >
                                <XCircle className="w-4 h-4" /> Reject
                             </button>
                           </>
                         ) : booking.status === 'Confirmed' ? (
                            <button 
                              onClick={() => updateServiceBookingStatus(booking.id, 'Completed')}
                              className="w-full sm:w-auto h-11 px-8 bg-primary text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all text-center"
                            >
                               Mark Completed
                            </button>
                         ) : (
                            <div className="w-full sm:w-auto px-8 py-3 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                               {booking.status}
                            </div>
                         )}
                      </div>
                   </div>
                 ))
               )}
            </div>
          </>
        ) : (
          /* Services Management View */
          <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredServicesList.length === 0 ? (
                <div className="col-span-full h-64 flex flex-col items-center justify-center text-center opacity-40">
                  <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-4">
                     <Zap className="w-10 h-10 text-slate-200" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest">No services found</p>
                </div>
              ) : (
                filteredServicesList.map((service) => (
                  <div key={service.id} className="card p-5 bg-surface border-none shadow-xl shadow-slate-100/50 group hover:shadow-2xl transition-all flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-all">
                        {service.icon || '🧭'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-black text-text-primary uppercase tracking-tight truncate leading-tight">{service.name}</h4>
                        <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-1">{service.transport}</p>
                      </div>
                    </div>
                    
                    <div className="flex-1 py-3 border-y border-slate-50">
                       <p className="text-[10px] font-medium text-slate-500 line-clamp-2">{service.notes || 'No description available'}</p>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-2">
                       <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Rate</p>
                          <p className="text-lg font-black text-text-primary tracking-tighter">{formatCurrency(service.price)}</p>
                       </div>
                       <div className={cn(
                          "px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest",
                          service.availability !== 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-primary"
                       )}>
                          {service.availability !== 0 ? 'Active' : 'Disabled'}
                       </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Service Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div 
            onClick={() => setIsModalOpen(false)} 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
          />
          <div className="relative w-full max-w-lg bg-surface rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-300">
            <div className="p-6 lg:p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
                     <Plus className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">Add New <span className="text-primary">Service</span></h3>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Define transport or excursion offerings</p>
                  </div>
               </div>
               <button 
                 onClick={() => setIsModalOpen(false)}
                 className="p-2 hover:bg-surface rounded-xl text-slate-300 transition-all"
               >
                  <X className="w-6 h-6" />
               </button>
            </div>

            <form onSubmit={handleAddService} className="p-6 lg:p-8 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Name</label>
                     <input 
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g. Moonlight Safari"
                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-sm shadow-sm transition-all"
                     />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                     <select 
                        required
                        value={formData.transport}
                        onChange={(e) => setFormData({...formData, transport: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-sm shadow-sm transition-all appearance-none cursor-pointer"
                     >
                        <option value="Airport Shuttle">Airport Shuttle</option>
                        <option value="Private City Tour">Private City Tour</option>
                        <option value="Sunset Cruise">Sunset Cruise</option>
                        <option value="Guided Hike">Guided Hike</option>
                     </select>
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (Rp)</label>
                     <input 
                        type="number"
                        min="0"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        placeholder="0.00"
                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-sm shadow-sm transition-all"
                     />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description / Notes</label>
                  <textarea 
                     value={formData.notes}
                     onChange={(e) => setFormData({...formData, notes: e.target.value})}
                     placeholder="Details about the service, timing, inclusion, etc."
                     className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-sm shadow-sm transition-all h-24 lg:h-32 resize-none"
                  />
               </div>

               <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all"
                  >
                     Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                  >
                     {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                     {isSubmitting ? 'Adding...' : 'Create Service'}
                  </button>
               </div>
            </form>
          </div>
        </div>,
        document.body
      )}
      {/* Hidden Batch Print Section */}
      <div id="batch-print-services" className="hidden print:block printable-area">
        <div className="text-center border-b-2 border-slate-900 pb-4 mb-8">
           <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900">{settings?.businessName || 'Gila House'}</h2>
           {settings?.motto && <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">{settings.motto}</p>}
           <div className="text-[10px] font-bold text-slate-500 mt-2 mb-6">
             {settings?.address && <span>{settings.address}</span>}
             {settings?.phone && <span className="ml-2">| {settings.phone}</span>}
             {settings?.email && <span className="ml-2">| {settings.email}</span>}
           </div>
           <h1 className="text-xl font-black uppercase tracking-tighter">Service Booking Manifest</h1>
           <p className="text-[10px] font-bold uppercase tracking-widest mt-1">Generated: {new Date().toLocaleString()} • Filter: {activeTab}</p>
        </div>
        <table className="w-full text-left text-[10px]">
           <thead>
             <tr className="border-b border-slate-900">
               <th className="py-2 uppercase font-black">ID</th>
               <th className="py-2 uppercase font-black">Guest</th>
               <th className="py-2 uppercase font-black">Service</th>
               <th className="py-2 uppercase font-black">Schedule</th>
               <th className="py-2 uppercase font-black text-right">Amount</th>
               <th className="py-2 uppercase font-black text-center">Status</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
             {filteredBookings.map(booking => (
               <tr key={booking.id}>
                 <td className="py-3 font-bold uppercase">#{booking.id}</td>
                 <td className="py-3 font-black uppercase">
                    {booking.guestName}
                    <div className="text-[8px] font-bold text-slate-400 mt-0.5">{booking.guestPhone || booking.guestEmail}</div>
                 </td>
                 <td className="py-3 uppercase font-black">
                    {booking.serviceName}
                    <div className="text-[8px] font-bold text-slate-400 mt-0.5">{booking.category} • {booking.guests} P</div>
                 </td>
                 <td className="py-3 uppercase">
                    {(() => {
                        const d = new Date(booking.date);
                        return isNaN(d.getTime()) ? booking.date : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                    })()} • {booking.time?.substring(0, 5)}
                 </td>
                 <td className="py-3 text-right font-black">{formatCurrency(booking.total)}</td>
                 <td className="py-3 text-center uppercase font-bold text-slate-500">{booking.status}</td>
               </tr>
             ))}
           </tbody>
           <tfoot>
              <tr className="border-t-2 border-slate-900">
                 <td colSpan="4" className="py-4 font-black uppercase text-right pr-4">Total Manifest Value</td>
                 <td className="py-4 text-right font-black text-sm">{formatCurrency(filteredBookings.reduce((acc, curr) => acc + curr.total, 0))}</td>
                 <td></td>
              </tr>
           </tfoot>
        </table>
      </div>
    </div>
  );
};

export default ServiceManager;

