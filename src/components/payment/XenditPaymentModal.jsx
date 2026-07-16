import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

const XenditPaymentModal = ({ 
  isOpen, 
  onClose, 
  invoiceUrl, 
  paymentState = 'waiting', // 'waiting' | 'success' 
  paymentMethod = 'Online Payment', // 'Online Payment' | 'QR Code'
  amount,
  expiresIn = "15:00"
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => paymentState !== 'success' && onClose()}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        
        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-surface w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="p-6 md:p-8 overflow-y-auto scrollbar-hide flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Pay Online</h2>
              <button 
                onClick={onClose} 
                className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            {/* Amount Due Card */}
            <div className="bg-orange-50/50 p-5 rounded-[1.5rem] flex items-center justify-between mb-6 border border-orange-100/50 shadow-inner">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Order Summary</p>
                <p className="text-sm font-black text-slate-800 uppercase">Amount due</p>
              </div>
              <span className="text-2xl lg:text-3xl font-black text-orange-500 tracking-tighter">
                Rp {amount ? amount.toLocaleString() : '0'}
              </span>
            </div>

            {/* Timer */}
            {paymentState === 'waiting' && (
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-4 h-4 text-slate-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  Pay within <span className="text-orange-500 font-black">{expiresIn}</span> or the order expires
                </p>
              </div>
            )}

            {/* Payment Content */}
            {paymentState === 'waiting' && invoiceUrl ? (
              <div className="flex flex-col items-center justify-center space-y-6">
                 <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden w-full flex items-center justify-center p-2">
                    {paymentMethod === 'QR Code' ? (
                      <div className="p-8">
                        <QRCodeSVG value={invoiceUrl} size={250} />
                      </div>
                    ) : (
                      <iframe 
                        src={invoiceUrl} 
                        className="w-full h-[500px] border-none bg-white rounded-xl"
                        title="Xendit Payment"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                      />
                    )}
                 </div>
                 <p className="text-xs font-black text-primary uppercase tracking-widest animate-pulse flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    Waiting for Payment...
                 </p>
              </div>
            ) : paymentState === 'success' ? (
              <div className="flex flex-col items-center justify-center space-y-5 py-12">
                 <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] shadow-inner flex items-center justify-center">
                    <CheckCircle2 size={48} className="animate-bounce" />
                 </div>
                 <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Payment Successful!</h3>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center px-4 leading-relaxed">
                   Your payment has been received and verified. The kitchen has been notified.
                 </p>
                 <button 
                   onClick={onClose} 
                   className="mt-6 w-full btn-primary py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all"
                 >
                   Continue
                 </button>
              </div>
            ) : (
              <div className="py-12 flex items-center justify-center flex-col gap-4">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Generating Payment Link...</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default XenditPaymentModal;
