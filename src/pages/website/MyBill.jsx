import { formatCurrency } from '../../utils/currencyUtils';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Clock, CheckCircle2, XCircle, Bike, Receipt, Loader2, Utensils, Bed, Compass, X, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/services/api';

const MyBill = () => {
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTimingModal, setShowTimingModal] = useState(false);
  const navigate = useNavigate();

  const handlePaymentClick = () => {
    if (!bill || bill.remaining_balance <= 0) return;
    
    const savedInfo = localStorage.getItem('guest_info');
    if (!savedInfo) return;
    
    const { reservationId, guestName, email, phone } = JSON.parse(savedInfo);
    
    navigate(`/payment/${reservationId}`, {
      state: {
        bookingDetails: {
          bookingId: reservationId,
          guestName: guestName || "Guest",
          email: email || "guest@example.com",
          phone: phone || "",
          amount: Math.round(bill.remaining_balance), // Xendit expects integer amount
          description: `Bill Settlement - Folio #${bill.id}`
        }
      }
    });
  };

  useEffect(() => {
    const fetchBill = async () => {
      const savedInfo = localStorage.getItem('guest_info');
      if (!savedInfo) {
        setError('No active booking found. Please check in first.');
        setLoading(false);
        return;
      }

      const { reservationId } = JSON.parse(savedInfo);
      try {
        const response = await api.get(`/billing/my-bill?reservationId=${reservationId}`);
        setBill(response.data.data);
      } catch (err) {
        console.error('Failed to fetch bill:', err);
        setError('Failed to load your bill. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchBill();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e0f7f3]/50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="min-h-screen bg-[#e0f7f3]/50 flex flex-col items-center justify-center p-6 text-center">
        <XCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-gray-600 font-bold mb-6">{error || 'Bill not found'}</p>
        <Link to="/checkin" className="bg-teal-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl">Go to Check-in</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e0f7f3]/50 font-sans pb-20">
      {/* Header */}
      <header className="bg-surface px-4 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm border-b border-gray-50">
        <div className="flex items-center gap-3">
          <Link to="/guest-app" className="text-slate-400 hover:text-slate-800 transition-colors">
            <ChevronLeft size={20} strokeWidth={3} />
          </Link>
          <h1 className="text-lg font-black text-slate-800 tracking-tight uppercase tracking-[0.2em]">My Bill</h1>
        </div>
        <button 
          onClick={() => setShowTimingModal(true)}
          className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center text-teal-600 hover:bg-gray-100 transition-colors relative"
          title="Stay Timing Details"
        >
           <Clock size={18} />
        </button>
      </header>

      <main className="max-w-md md:max-w-3xl mx-auto px-4 pt-6 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-[2rem] shadow-xl shadow-teal-900/5 overflow-hidden border border-white"
        >
          {/* Bill Info Header */}
          <div className="p-6 border-b border-gray-50 flex items-start justify-between">
             <div>
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Folio #{bill.id}</p>
                <p className="text-[11px] font-bold text-gray-400 mb-1">{new Date(bill.createdAt).toLocaleDateString()}</p>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{bill.roomName}</p>
             </div>
             <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ${bill.status === 'Settled' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
               {bill.status}
             </span>
          </div>

          {/* Charges List */}
          <div className="p-6 space-y-6">
             {bill.items.length === 0 ? (
               <p className="text-center text-gray-400 text-xs font-bold py-4">No charges added yet.</p>
             ) : (
               bill.items.map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between">
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.type === 'Room' ? 'bg-indigo-50 text-indigo-500' : 'bg-orange-50 text-orange-500'}`}>
                           {item.type === 'Room' ? <Bed size={18} /> : <Utensils size={18} />}
                        </div>
                        <div>
                           <p className="text-sm font-black text-slate-800 leading-tight">{item.description}</p>
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.date}</p>
                        </div>
                     </div>
                     <span className="text-sm font-black text-slate-800">{formatCurrency(item.amount)}</span>
                  </div>
               ))
             )}
          </div>

          {/* Bill Summary */}
          <div className="bg-gray-50/50 p-6 space-y-4 border-t border-gray-100">
             <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-gray-400">Total Charges</span>
                <span className="text-[13px] font-black text-slate-800">{formatCurrency(bill.total)}</span>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-emerald-500">Amount Paid</span>
                <span className="text-[13px] font-black text-emerald-500">-{formatCurrency(parseFloat(bill.paid_amount || 0))}</span>
             </div>
             
             <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                <span className="text-base font-black text-slate-800">Balance Due</span>
                <span className={`text-xl font-black tracking-tighter ${bill.remaining_balance > 0 ? 'text-orange-500' : 'text-emerald-500'}`}>
                  {formatCurrency(parseFloat(bill.remaining_balance || 0))}
                </span>
             </div>
          </div>
        </motion.div>

        {/* Action Link */}
        <div className="mt-8 text-center px-4">
           {bill.remaining_balance > 0 ? (
             <>
               <button 
                 onClick={handlePaymentClick}
                 className="w-full bg-teal-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-teal-700 transition-colors mb-6 flex items-center justify-center gap-2"
               >
                 Pay Now {formatCurrency(parseFloat(bill.remaining_balance))}
               </button>
               <p className="text-[10px] font-bold text-gray-400 leading-relaxed mb-6">
                 Settle your outstanding balance securely online via Xendit.
               </p>
             </>
           ) : (
             <p className="text-[10px] font-bold text-gray-400 leading-relaxed mb-6">
               Your bill is fully settled. Thank you for staying at Gila House.
             </p>
           )}
           <Link to="/guest-app" className="text-[11px] font-black text-teal-700/40 hover:text-teal-700 transition-colors uppercase tracking-[0.2em] flex items-center justify-center gap-2">
              <Receipt size={14} /> Back to Dashboard
           </Link>
        </div>
      </main>

      {/* Mobile Bottom Bar - Consistent */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface/80 backdrop-blur-xl border border-gray-100 rounded-full py-3 px-8 shadow-2xl z-50 flex items-center gap-10 max-w-[90%] md:max-w-md">
         <Link to="/guest-app" className="text-gray-400"><Compass size={20} /></Link>
         <Link to="/guest-app" className="text-gray-400"><Receipt size={20} /></Link>
         <Link to="/my-bill" className="text-orange-500 font-black text-xs uppercase tracking-widest">Bill</Link>
      </div>

      {/* Timing Details Modal */}
      {showTimingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowTimingModal(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 z-10 border border-slate-100"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-50">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Stay Duration & Timing</h3>
              <button 
                onClick={() => setShowTimingModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-teal-50/50 rounded-2xl border border-teal-100/30">
                <Calendar className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-teal-600">Check-In Date</p>
                  <p className="text-xs font-black text-slate-700 mt-1">
                    {bill.checkIn ? new Date(bill.checkIn).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-orange-50/50 rounded-2xl border border-orange-100/30">
                <Calendar className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-orange-500">Check-Out Date</p>
                  <p className="text-xs font-black text-slate-700 mt-1">
                    {bill.checkOut ? new Date(bill.checkOut).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                  </p>
                </div>
              </div>

              {bill.checkIn && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Stay Duration Details</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500">Total Nights</span>
                    <span className="text-xs font-black text-slate-800">
                      {bill.checkOut 
                        ? Math.max(1, Math.round(Math.abs(new Date(bill.checkOut) - new Date(bill.checkIn)) / (1000 * 60 * 60 * 24)))
                        : 1
                      } {Math.max(1, Math.round(Math.abs(new Date(bill.checkOut || new Date()) - new Date(bill.checkIn)) / (1000 * 60 * 60 * 24))) > 1 ? 'Nights' : 'Night'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setShowTimingModal(false)}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 active:scale-95 transition-all"
            >
              Close Details
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MyBill;
