import { formatCurrency } from '../../../utils/currencyUtils';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Car, 
  Map, 
  Calendar, 
  Users, 
  Clock, 
  ChevronRight, 
  Search,
  Compass,
  Zap,
  Info,
  CheckCircle2,
  Plane,
  Camera,
  Waves,
  X
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useHospitality } from '@/context/HospitalityContext';
import { useCustomer } from '@/context/CustomerContext';

const CustomerServices = () => {
  const { services, addServiceBooking, serviceBookings } = useHospitality();
  const { profile } = useCustomer();
  const [activeTab, setActiveTab] = useState('All');
  const [selectedService, setSelectedService] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [guests, setGuests] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredServices = activeTab === 'All' ? services : services.filter(s => s.category === activeTab);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!bookingDate || !bookingTime || !selectedService) return;

    const result = await addServiceBooking({
      guestName: profile?.full_name || profile?.name,
      guestEmail: profile?.email || '',
      guestPhone: profile?.phone || '',
      guestId: profile?.id,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      category: selectedService.category,
      date: bookingDate,
      time: bookingTime,
      guests,
      total: selectedService.price * guests,
      notes: '' // Could add a notes field in the form later if needed
    });

    if (result?.success) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedService(null);
        setBookingDate('');
        setBookingTime('');
        setGuests(1);
      }, 3000);
    }
  };

  const currentGuestName = profile?.full_name || profile?.name;
  const myBookings = serviceBookings.filter(b => b.guestName === currentGuestName);

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-text-primary tracking-tight uppercase">Services <span className="text-primary">& Excursions</span></h1>
          <p className="text-text-secondary text-xs lg:text-sm font-medium mt-1">Explore and book transport or local adventures</p>
        </div>
        <div className="flex bg-surface p-1.5 rounded-2xl shadow-sm border border-slate-50 overflow-x-auto scrollbar-hide shrink-0">
           {['All', 'Transport', 'Excursion'].map(tab => (
             <button 
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={cn(
                 "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                 activeTab === tab ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:text-primary"
               )}
             >
               {tab}
             </button>
           ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map(service => (
          <div 
            key={service.id} 
            className="card group bg-surface border-none shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:shadow-slate-200 transition-all overflow-hidden flex flex-col h-full"
          >
             <div className="h-48 bg-slate-50 relative overflow-hidden flex items-center justify-center">
                <div className="text-7xl group-hover:scale-110 transition-transform duration-700">{service.icon}</div>
                <div className="absolute top-4 right-4 px-3 py-1 bg-surface/90 backdrop-blur-sm rounded-lg text-[10px] font-black uppercase tracking-widest text-primary shadow-sm">
                   {service.category}
                </div>
             </div>
             <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-black text-text-primary uppercase tracking-tight mb-2 group-hover:text-primary transition-colors">{service.name}</h3>
                <p className="text-xs font-medium text-slate-500 mb-6 flex-1">{service.description}</p>
                
                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price per person</p>
                      <p className="text-xl font-black text-text-primary">{formatCurrency(service.price)}</p>
                   </div>
                   <button 
                     onClick={() => setSelectedService(service)}
                     className="btn-primary h-11 px-6 rounded-xl flex items-center gap-2 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all"
                   >
                      Book Now <ChevronRight className="w-4 h-4" />
                   </button>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* My Bookings Section - Table */}
      {myBookings.length > 0 && (
        <div className="space-y-4">
           <h3 className="text-lg font-black uppercase tracking-tight">Your Booking History</h3>
           <div className="bg-surface rounded-[2rem] shadow-xl shadow-slate-100/50 border-none overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-slate-50/50">
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Service</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Date & Time</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 text-center">Guests</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 text-right">Total</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 text-center">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {myBookings.map(booking => (
                          <tr key={booking.id} className="group hover:bg-slate-50/50 transition-all">
                             <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary text-xl shadow-inner">
                                      {services.find(s => s.id === booking.serviceId)?.icon || '📅'}
                                   </div>
                                   <div>
                                      <p className="text-sm font-black text-text-primary uppercase leading-tight">{booking.serviceName}</p>
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">#{booking.id}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-6 py-5">
                                <p className="text-sm font-bold text-text-primary uppercase tracking-tight">
                                  {(() => {
                                    const d = new Date(booking.date);
                                    if (isNaN(d.getTime())) return booking.date;
                                    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                                  })()}
                                </p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{booking.time?.substring(0, 5)}</p>
                             </td>
                             <td className="px-6 py-5 text-center">
                                <span className="text-sm font-black text-text-primary">{booking.guests}</span>
                             </td>
                             <td className="px-6 py-5 text-right">
                                <p className="text-sm font-black text-primary">{formatCurrency(booking.total)}</p>
                             </td>
                             <td className="px-6 py-5 text-center">
                                <span className={cn(
                                   "inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                   booking.status === 'Confirmed' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                   booking.status === 'Cancelled' ? "bg-rose-50 text-primary border border-rose-100" :
                                   booking.status === 'Completed' ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                   "bg-amber-50 text-amber-600 border border-amber-100"
                                )}>
                                   {booking.status}
                                </span>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedService && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-0 sm:p-4">
           <div onClick={() => setSelectedService(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
           <div className="relative w-full max-w-md bg-surface rounded-t-[2.5rem] sm:rounded-[2.5rem] lg:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 sm:zoom-in-95 duration-300 self-end sm:self-center">
              {showSuccess ? (
                <div className="p-10 lg:p-12 text-center flex flex-col items-center gap-6 overflow-y-auto scrollbar-hide">
                   <div className="w-16 lg:w-20 h-16 lg:h-20 bg-emerald-50 rounded-[2rem] lg:rounded-[2.5rem] flex items-center justify-center text-emerald-500 shadow-inner">
                      <CheckCircle2 className="w-8 lg:w-10 h-8 lg:h-10" />
                   </div>
                   <div>
                      <h3 className="text-xl lg:text-2xl font-black text-text-primary uppercase tracking-tight">Booking Requested!</h3>
                      <p className="text-xs font-medium text-slate-400 mt-2">Our concierge will confirm your request shortly.</p>
                   </div>
                </div>
              ) : (
                <div className="flex flex-col flex-1 min-h-0">
                   <div className="p-4 sm:p-6 lg:p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center shrink-0">
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                         <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-primary rounded-xl sm:rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl lg:text-3xl shadow-xl shadow-primary/20 shrink-0">
                            {selectedService.icon}
                         </div>
                         <div className="min-w-0">
                            <h3 className="text-base sm:text-lg lg:text-xl font-black text-text-primary uppercase tracking-tight truncate">{selectedService.name}</h3>
                            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{selectedService.category}</p>
                         </div>
                      </div>
                      <button onClick={() => setSelectedService(null)} className="p-2 hover:bg-surface rounded-xl text-slate-300 transition-all shrink-0">
                         <X className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                   </div>
                   <form onSubmit={handleBook} className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 overflow-y-auto scrollbar-hide flex-1">
                      <div className="space-y-5">
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                               <input 
                                 type="date" 
                                 value={bookingDate}
                                 onChange={(e) => setBookingDate(e.target.value)}
                                 className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-sm shadow-sm transition-all" 
                                 required 
                               />
                            </div>
                            <div className="space-y-1.5">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time</label>
                               <input 
                                 type="time" 
                                 value={bookingTime}
                                 onChange={(e) => setBookingTime(e.target.value)}
                                 className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-sm shadow-sm transition-all" 
                                 required 
                               />
                            </div>
                         </div>

                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Number of Guests</label>
                            <div className="flex items-center gap-4 p-2 bg-slate-50 rounded-2xl">
                               <button 
                                 type="button"
                                 onClick={() => setGuests(Math.max(1, guests - 1))}
                                 className="w-10 h-10 bg-surface rounded-xl shadow-sm text-slate-400 hover:text-primary font-black transition-all active:scale-90"
                               >
                                  -
                               </button>
                               <span className="flex-1 text-center font-black text-text-primary">{guests}</span>
                               <button 
                                 type="button"
                                 onClick={() => setGuests(guests + 1)}
                                 className="w-10 h-10 bg-surface rounded-xl shadow-sm text-slate-400 hover:text-primary font-black transition-all active:scale-90"
                               >
                                  +
                               </button>
                            </div>
                         </div>
                      </div>

                      <div className="pt-5 border-t border-slate-50 shrink-0">
                         <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
                            <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estimated Total</p>
                               <p className="text-xl lg:text-2xl font-black text-text-primary mt-1">{formatCurrency(selectedService.price * guests)}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Safe & Secure</p>
                               <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Payment via Folio</p>
                            </div>
                         </div>
                         <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                            <button 
                              type="button" 
                              onClick={() => setSelectedService(null)}
                              className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] active:scale-95 transition-all order-2 sm:order-1"
                            >
                               Cancel
                            </button>
                            <button 
                              type="submit"
                              className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] shadow-xl shadow-primary/30 active:scale-95 transition-all order-1 sm:order-2"
                            >
                               Confirm Request
                            </button>
                         </div>
                      </div>
                   </form>
                </div>
              )}
           </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CustomerServices;
