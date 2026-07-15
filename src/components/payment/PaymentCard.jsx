import { formatCurrency } from '../../utils/currencyUtils';
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CreditCard, Lock, ArrowRight, Loader2 } from 'lucide-react';

const PaymentCard = ({ title, amount, description, buttonText, onPay, loading }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="bg-white rounded-[2rem] shadow-2xl shadow-teal-900/10 overflow-hidden border border-gray-50 relative"
    >
      {/* Decorative Top Accent */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-400 via-emerald-500 to-teal-600" />
      
      <div className="p-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-2">
            <CreditCard size={32} strokeWidth={1.5} />
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">{title || "Secure Checkout"}</h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{description}</p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100 relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-teal-500/5 rounded-full blur-xl" />
          
          <div className="flex justify-between items-center relative z-10">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Amount Due</span>
            <div className="flex flex-col items-end">
              <span className="text-3xl font-black text-slate-800 tracking-tighter">
                {formatCurrency(amount)}
              </span>
              <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 mt-1 uppercase tracking-wider">
                <ShieldCheck size={12} /> Secure Connection
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onPay}
          disabled={loading}
          className={`w-full py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 group
            ${loading 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
              : 'bg-teal-600 text-white hover:bg-teal-700 active:scale-[0.98] shadow-xl shadow-teal-600/20'
            }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating Secure Link...</span>
            </>
          ) : (
            <>
              {buttonText || 'Pay Securely'}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
        
        {!loading && (
          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <Lock size={12} />
            <span>Encrypted & Secured by Xendit</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PaymentCard;
