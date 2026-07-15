import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Play, ShoppingCart } from 'lucide-react';
import pizzaImg from '../../../assets/landing/pizza.png';
import burgerImg from '../../../assets/landing/burger.png';
import heroBg from '../../../assets/landing/hero-bg.png';

const Hero = () => {
  return (
    <section className="relative min-h-[70vh] lg:min-h-[90vh] flex items-center pt-24 lg:pt-32 overflow-hidden bg-background">
      {/* Background Tropical Accents */}
      <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-primary/[0.05] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-surface rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-8 md:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-6 border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Premium Restaurant OS
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black font-display leading-[0.95] md:leading-[0.9] mb-4 md:mb-6 text-text-primary uppercase tracking-tighter">
              Gila <span className="text-primary italic">House</span>
            </h1>
            <p className="text-base md:text-xl text-text-secondary mb-8 md:mb-10 max-w-lg leading-relaxed font-medium mx-auto lg:mx-0">
              Transform your restaurant with our tropical management suite. Premium UI, seamless ordering, and real-time AI-powered analytics.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 md:gap-6">
              <a href="#reservation" className="w-full sm:w-auto btn-premium px-10 md:px-14 py-4 md:py-5 text-[11px] md:text-[13px] uppercase tracking-[0.2em] font-black group text-center rounded-full">
                Book A Table
                <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform inline" />
              </a>
              <Link
                to="/order"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-surface border border-border px-10 py-4 md:py-5 rounded-2xl md:rounded-full shadow-xl shadow-black/5 hover:shadow-black/10 hover:scale-105 transition-all duration-500 group"
              >
                <ShoppingCart size={18} className="text-primary shrink-0" />
                <span className="text-[11px] md:text-[13px] font-black uppercase tracking-widest text-text-primary whitespace-nowrap">Order Now</span>
              </Link>
            </div>
          </motion.div>

          <div className="relative mt-12 md:mt-20 lg:mt-0">
            {/* Main Visual Container */}
            <div className="relative w-full aspect-square max-w-2xl mx-auto flex items-center justify-center">
              {/* Background Glow */}
              <div className="absolute inset-0 bg-landing-primary/20 rounded-full blur-[60px] md:blur-[120px] animate-pulse" />

              {/* 1. Main Atmosphere Photo (Base) */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0, rotate: 5 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="relative z-10 w-[90%] md:w-[95%] lg:w-[90%] h-[90%] md:h-[95%] lg:h-[90%] rounded-[2rem] md:rounded-[4rem] overflow-hidden border-4 md:border-[16px] border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]"
              >
                <img src="/1000464401.jpg" alt="Ambiance" className="w-full h-full object-cover hover:scale-110 transition-transform duration-[5s]" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent" />
              </motion.div>

              {/* 2. Floating Accents */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute top-4 md:top-10 right-0 -mr-2 md:-mr-10 z-20"
              >
                <div className="glass-card px-3 md:px-4 py-2 md:py-3 border-landing-primary/20 backdrop-blur-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] md:text-[9px] font-black text-white uppercase tracking-widest">Ecosystem Active</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-4 md:bottom-10 left-0 -ml-2 md:-ml-10 z-20"
              >
                <div className="glass-card px-3 md:px-4 py-2 md:py-3 border-white/10 backdrop-blur-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest italic">Smart Hospitality</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(12deg); }
          50% { transform: translateY(-20px) rotate(15deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}} />
    </section>
  );
};

export default Hero;
