import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Globe, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const OrderingEntry = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#bdf0e7] to-[#e0f7f3] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* Language Selector Top Right */}
      <div className="absolute top-8 right-8">
        <div className="bg-surface/40 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ID</span>
          <span className="text-[10px] font-bold text-slate-600">Bahasa Indonesia</span>
        </div>
      </div>

      <div className="w-full max-w-md text-center flex flex-col items-center">
        {/* Logo in White Square */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-24 h-24 bg-surface rounded-[1.5rem] shadow-xl flex items-center justify-center mb-8"
        >
          <img src="/1000464407-removebg-preview.png" alt="Logo" className="w-16 h-auto" />
        </motion.div>

        {/* Welcome Message */}
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl md:text-3xl font-black text-[#2a2a2a] mb-3"
        >
          Welcome to Gila House
        </motion.h1>

        {/* Error Message - Red */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-[11px] md:text-xs font-bold text-red-500 max-w-[280px] leading-relaxed mb-10"
        >
          Invalid QR code. Please scan the QR code at your room or table.
        </motion.p>

        {/* Selection Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-teal-900/5 w-full border border-white/50"
        >
          <p className="text-gray-500 text-[13px] md:text-sm font-medium leading-relaxed mb-8">
            If you're a hotel guest, you can select your room manually.
          </p>

          <Link 
            to="/checkin"
            className="block w-full bg-orange-500 text-white py-4 md:py-5 rounded-2xl text-[13px] md:text-sm font-black tracking-tight shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-[0.98]"
          >
            Select my room
          </Link>
        </motion.div>

        {/* Staff Link */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10"
        >
          <Link to="/login" className="text-xs font-bold text-teal-700/60 hover:text-teal-700 transition-colors">
            Staff? <span className="underline underline-offset-4">Sign in here</span>
          </Link>
        </motion.div>
      </div>

      {/* Decorative Blur */}
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-surface/30 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />
    </div>
  );
};

export default OrderingEntry;
