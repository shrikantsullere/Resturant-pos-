import React from 'react';
import { motion } from 'framer-motion';

const Loader = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-dark flex flex-col items-center justify-center">
      <div className="relative">
        {/* Outer Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="w-24 h-24 border-4 border-white/5 border-t-landing-primary rounded-full"
        />
        {/* Inner Ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="absolute inset-2 border-4 border-white/5 border-b-landing-secondary rounded-full"
        />
        <div className="absolute inset-0 flex items-center justify-center">
            <img src="/1000464407-removebg-preview.png" alt="Logo" className="w-12 h-12 object-contain" />
        </div>
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="mt-8 text-gray-500 font-bold uppercase tracking-[0.3em] text-xs"
      >
        Gila House Loading
      </motion.p>
    </div>
  );
};

export default Loader;
