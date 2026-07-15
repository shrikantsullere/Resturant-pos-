import React from 'react';
import { motion } from 'framer-motion';
import { Utensils, CalendarDays, MousePointer2, Beer, Car, Map, MessageSquare, Hotel, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const actions = [
  { icon: Utensils, title: 'View Menu', desc: 'All items', color: 'text-orange-500', link: '/menu' },
  { icon: CalendarDays, title: 'Reserve Table', desc: 'Book now', color: 'text-landing-primary', link: '#reservation' },
  { icon: MousePointer2, title: 'Order Now', desc: 'Pay online or at bar', color: 'text-blue-500', link: '/order' },
  { icon: Beer, title: 'Bar & Drinks', desc: 'Cocktails & more', color: 'text-emerald-500', link: '/menu' },
  { icon: Car, title: 'Transport', desc: 'Transfers & rides', color: 'text-amber-600', link: '#' },
  { icon: Map, title: 'Excursions', desc: 'Tours & activities', color: 'text-sky-500', link: '/excursions' },
  { icon: MessageSquare, title: 'Contact Staff', desc: 'Chat with us', color: 'text-landing-secondary', link: '#' },
  { icon: Hotel, title: 'Hotel Guest', desc: 'Room service', color: 'text-indigo-500', link: '/login' },
];

const EcosystemGrid = () => {
  return (
    <section className="py-10 md:py-16 bg-background relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-landing-primary/5 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.span 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-landing-primary font-black uppercase tracking-[0.4em] text-[10px]"
        >
          What would you like to do?
        </motion.span>
        <h2 className="text-3xl md:text-5xl font-black font-display mt-4 mb-10 text-text-primary uppercase tracking-tighter">
          Explore the <span className="text-landing-primary italic">Ecosystem</span>
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {actions.map((item, i) => (
            <Link to={item.link} key={i}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative bg-surface card border border-border rounded-3xl p-6 md:p-8 hover:border-primary/30 hover:shadow-premium-hover transition-all duration-500 cursor-pointer overflow-hidden h-full shadow-premium"
              >
              {/* Glowing Background Accent */}
              <div className={`absolute -top-10 -right-10 w-32 h-32 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-full ${item.color.replace('text', 'bg')}`} />

              <div className="flex flex-col items-center text-center relative z-10">
                <div className={`w-20 h-20 rounded-[2rem] bg-background border border-border flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl`}>
                  <item.icon className={`w-10 h-10 ${item.color} drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]`} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-black text-text-primary mb-3 uppercase tracking-tight group-hover:text-landing-primary transition-colors">{item.title}</h3>
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest leading-relaxed">{item.desc}</p>
                
                {/* Interactive Indicator */}
                <div className="mt-8 flex items-center gap-2 text-[9px] font-black text-landing-primary uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-all duration-500">
                  <span>Explore</span>
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
      </div>
    </section>
  );
};

export default EcosystemGrid;
