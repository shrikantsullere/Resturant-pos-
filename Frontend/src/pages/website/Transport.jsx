import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Ship, Car, ChevronRight, X, Phone, MapPin, Receipt, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { paymentApi } from '../../services/payment.api';
import { QRCodeSVG } from 'qrcode.react';
import { useToast } from '../../context/ToastContext';

const Transport = () => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToastMessage } = useToast();
  
  // Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: 1,
    notes: ''
  });

  // Payment State
  const [paymentState, setPaymentState] = useState('idle'); // idle, waiting, success
  const [invoiceUrl, setInvoiceUrl] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [pollingInterval, setPollingInterval] = useState(null);

  useEffect(() => {
    fetchServices();
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [pollingInterval]);

  const fetchServices = async () => {
    try {
      const response = await api.get('/services/guest');
      if (response.data?.success) {
        // Filter for transport-related services (exclude excursions)
        const transports = response.data.data.filter(s => 
          !s.category?.toLowerCase().includes('excursion') &&
          !s.category?.toLowerCase().includes('tour') &&
          s.price > 0 // Ensure it has a price
        );
        setServices(transports);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getServiceIcon = (type) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('airport') || t.includes('plane')) return Plane;
    if (t.includes('harbor') || t.includes('ferry') || t.includes('boat')) return Ship;
    return Car;
  };

  const handleOpenModal = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
    setPaymentState('idle');
    setFormData({
      name: '', email: '', phone: '', date: '', time: '', guests: 1, notes: ''
    });
  };

  const submitBooking = async (isPaid = false) => {
    try {
      const totalAmount = selectedService.price * formData.guests;
      const payload = {
        service_id: selectedService.id,
        service_name: selectedService.name,
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        booking_date: formData.date,
        booking_time: formData.time,
        total_guests: formData.guests,
        total_amount: totalAmount,
        notes: formData.notes + (isPaid ? ' [PAID VIA XENDIT]' : '')
      };

      await api.post('/services/guest/bookings', payload);
      showToastMessage(isPaid ? 'Payment Successful! Booking confirmed.' : 'Booking requested successfully!');
      
      // Reset
      setIsModalOpen(false);
      setPaymentState('idle');
      if (pollingInterval) clearInterval(pollingInterval);
    } catch (error) {
      console.error(error);
      showToastMessage('Failed to submit booking', 'error');
    }
  };

  const handlePayment = async (method) => {
    // Validate
    if (!formData.name || !formData.date || !formData.time || !formData.guests) {
      return showToastMessage('Please fill all required fields', 'error');
    }

    try {
      const bookingId = `TRN_${Date.now()}`;
      const totalAmount = selectedService.price * formData.guests;
      let response;

      if (method === 'QR Code') {
        response = await paymentApi.createQrCode({
          bookingId,
          amount: totalAmount,
          description: `Transport Booking: ${selectedService.name}`
        });
      } else {
        response = await paymentApi.createInvoice({
          bookingId,
          guestName: formData.name || "Guest",
          email: formData.email || "guest@gilahouse.com",
          amount: totalAmount,
          description: `Transport Booking: ${selectedService.name}`
        });
      }

      if (response.success) {
        setInvoiceUrl(response.invoiceUrl);
        setPaymentState('waiting');
        setPaymentMethod(method);

        // Polling
        const interval = setInterval(async () => {
          try {
            const statusResponse = await paymentApi.getPaymentStatus(bookingId);
            if (statusResponse.data && statusResponse.data.status === 'PAID') {
              clearInterval(interval);
              setPaymentState('success');
              await submitBooking(true);
            }
          } catch (err) {}
        }, 3000);
        setPollingInterval(interval);
      }
    } catch (error) {
      showToastMessage(error.message || 'Payment failed to initiate', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-slate-800 font-sans pb-20">
      {/* Header */}
      <header className="bg-surface border-b border-gray-100 sticky top-0 z-40 py-3 md:py-4 px-4 md:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 md:gap-3">
          <img src="/1000464407-removebg-preview.png" alt="Logo" className="h-7 md:h-10 w-auto object-contain" />
          <span className="text-[14px] md:text-xl font-black uppercase tracking-tighter text-[#2a2a2a]">Gila House</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-4 lg:gap-8">
          <Link to="/menu" className="text-xs lg:text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">Restaurant</Link>
          <Link to="/excursions" className="text-xs lg:text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">Excursions</Link>
          <Link to="/transport" className="text-xs lg:text-sm font-bold text-orange-500 border-b-2 border-orange-500 pb-1">Transport</Link>
        </nav>

        <Link to="/#reservation" className="bg-orange-500 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all">
          Reserve Table
        </Link>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#bdf0e7] to-[#e0f7f3] py-12 md:py-20 px-6 text-center relative overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-surface rounded-xl shadow-lg flex items-center justify-center text-[#1e8a75] mb-4 md:mb-6">
             <Car size={24} />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[#1e8a75] uppercase tracking-tighter mb-2 md:mb-4">Transport Services</h1>
          <p className="text-[10px] md:text-lg text-[#1e8a75]/70 font-bold uppercase tracking-widest">
            Private transfers and local rides
          </p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-20 space-y-6 md:space-y-8">
        {isLoading ? (
           <div className="py-20 flex justify-center">
             <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
           </div>
        ) : services.length === 0 ? (
           <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest">
             No transport services available right now.
           </div>
        ) : (
          services.map((item) => {
            const IconComponent = getServiceIcon(item.category);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-surface rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-10 shadow-xl shadow-gray-100/50 border border-gray-50 flex flex-col md:flex-row items-center gap-6 md:gap-8 group hover:shadow-2xl hover:shadow-teal-100/50 transition-all duration-500 text-center md:text-left"
              >
                {/* Icon Box */}
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#f0fcf9] border border-[#e0f7f3] flex items-center justify-center text-[#1e8a75] group-hover:scale-110 group-hover:bg-[#1e8a75] group-hover:text-white transition-all duration-500 shrink-0">
                   <IconComponent size={32} />
                </div>

                {/* Content */}
                <div className="flex-1 w-full">
                   <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                      <h3 className="text-lg md:text-xl font-black text-[#2a2a2a] uppercase tracking-tight">{item.name}</h3>
                      <span className="text-lg font-black text-orange-500 tracking-tighter mt-1 md:mt-0">Rp {Number(item.price).toLocaleString()} <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">/pax</span></span>
                   </div>
                   <p className="text-[9px] font-black text-teal-600 uppercase tracking-widest mb-3 md:mb-4 inline-block px-3 py-1 bg-teal-50 rounded-lg">
                      {item.category}
                   </p>
                   <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
                      {item.description || 'Comfortable and reliable transport service.'}
                   </p>
                   <button 
                      onClick={() => handleOpenModal(item)}
                      className="w-full sm:w-auto mt-6 md:mt-8 bg-[#1e8a75] text-white px-8 py-3 md:py-3.5 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-xl shadow-teal-100 hover:bg-[#166959] transition-all active:scale-95 text-center">
                      Book Transfer
                   </button>
                </div>
              </motion.div>
            )
          })
        )}

        <div className="mt-16 md:mt-32 text-center">
           <div className="inline-flex items-center gap-2 text-[10px] md:text-xs font-black text-gray-300 uppercase tracking-widest">
              Contact us for custom routes <ChevronRight size={14} /> Gila House Concierge
           </div>
        </div>
      </main>

      {/* Mobile Footer Nav */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface/80 backdrop-blur-xl border border-gray-100 rounded-full py-3 px-8 shadow-2xl z-40 flex items-center gap-8">
         <Link to="/menu" className="text-gray-400 font-black text-xs uppercase tracking-widest">Menu</Link>
         <Link to="/excursions" className="text-gray-400 font-black text-xs uppercase tracking-widest">Tours</Link>
         <Link to="/transport" className="text-orange-500 font-black text-xs uppercase tracking-widest underline decoration-2 underline-offset-4">Rides</Link>
      </div>

      {/* Booking & Payment Modal */}
      <AnimatePresence>
        {isModalOpen && selectedService && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (paymentState === 'idle') setIsModalOpen(false);
              }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="relative bg-surface w-full max-w-2xl rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]"
            >
              <div className="p-6 md:p-8 overflow-y-auto no-scrollbar flex-1">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-[10px] font-bold text-teal-500 uppercase tracking-widest mb-1">Book Service</p>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">{selectedService.name}</h2>
                  </div>
                  {paymentState === 'idle' && (
                    <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-50 text-gray-400 hover:text-slate-800 rounded-xl transition-colors">
                      <X size={24} />
                    </button>
                  )}
                </div>

                {paymentState === 'idle' ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Full Name *</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm font-bold border border-transparent focus:border-teal-500 outline-none" placeholder="John Doe" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                        <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm font-bold border border-transparent focus:border-teal-500 outline-none" placeholder="john@example.com" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                        <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm font-bold border border-transparent focus:border-teal-500 outline-none" placeholder="+62 8..." />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Passengers *</label>
                        <div className="flex items-center bg-gray-50 rounded-xl">
                          <button onClick={() => setFormData({...formData, guests: Math.max(1, formData.guests - 1)})} className="px-4 py-3 text-gray-400 hover:text-teal-600"><Minus size={16} /></button>
                          <span className="flex-1 text-center text-sm font-black">{formData.guests}</span>
                          <button onClick={() => setFormData({...formData, guests: formData.guests + 1})} className="px-4 py-3 text-gray-400 hover:text-teal-600"><Plus size={16} /></button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Date *</label>
                        <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm font-bold border border-transparent focus:border-teal-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Time *</label>
                        <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm font-bold border border-transparent focus:border-teal-500 outline-none" />
                      </div>
                    </div>
                    
                    <div className="mb-8">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pickup / Drop-off details (Notes)</label>
                      <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows="2" placeholder="Flight number, hotel name, specific instructions..." className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm font-bold border border-transparent focus:border-teal-500 outline-none resize-none"></textarea>
                    </div>

                    <div className="bg-teal-50 p-6 rounded-2xl flex items-center justify-between mb-8 border border-teal-100/50">
                      <div>
                        <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest block mb-1">Total Price</span>
                        <span className="text-xs text-gray-500 font-bold">Rp {Number(selectedService.price).toLocaleString()} × {formData.guests} pax</span>
                      </div>
                      <span className="text-2xl font-black text-teal-600 tracking-tighter">Rp {(selectedService.price * formData.guests).toLocaleString()}</span>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-2">Complete Reservation</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onClick={() => handlePayment('Card')} className="p-4 rounded-[1.5rem] border-2 border-teal-100 bg-teal-50/20 hover:bg-teal-50 flex items-center gap-4 transition-all text-left">
                          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-100">
                            <Receipt size={20} />
                          </div>
                          <div>
                            <h4 className="text-[13px] font-black text-slate-800">Pay via Card / E-Wallet</h4>
                            <p className="text-[9px] font-bold text-gray-400 tracking-tight">Xendit Secure Checkout</p>
                          </div>
                        </button>

                        <button onClick={() => handlePayment('QR Code')} className="p-4 rounded-[1.5rem] border-2 border-emerald-100 bg-emerald-50/10 hover:bg-emerald-50 flex items-center gap-4 transition-all text-left">
                          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100 p-2">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><rect x="7" y="7" width="3" height="3"/><rect x="14" y="7" width="3" height="3"/><rect x="7" y="14" width="3" height="3"/><path d="M14 14h3v3h-3z"/></svg>
                          </div>
                          <div>
                            <h4 className="text-[13px] font-black text-slate-800">Pay via QRIS</h4>
                            <p className="text-[9px] font-bold text-gray-400 tracking-tight">Scan with banking app</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </>
                ) : paymentState === 'waiting' && invoiceUrl ? (
                  <div className="flex flex-col items-center justify-center space-y-6 py-8">
                     <div className="p-4 bg-white rounded-3xl shadow-sm border-2 border-slate-100 overflow-hidden w-full max-w-sm flex items-center justify-center">
                        {paymentMethod === 'QR Code' ? (
                          <QRCodeSVG value={invoiceUrl} size={200} />
                        ) : (
                          <iframe src={invoiceUrl} className="w-full h-[400px] border-none rounded-xl" />
                        )}
                     </div>
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Waiting for Payment...</p>
                  </div>
                ) : paymentState === 'success' ? (
                  <div className="flex flex-col items-center justify-center space-y-4 py-16 text-center">
                     <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 size={40} />
                     </div>
                     <h3 className="text-2xl font-black text-slate-800 tracking-tight">Booking Confirmed!</h3>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest max-w-xs">Your transport reservation has been paid successfully.</p>
                     <button onClick={() => setIsModalOpen(false)} className="mt-8 bg-slate-900 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 w-full sm:w-auto transition-all">Close Window</button>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Transport;
