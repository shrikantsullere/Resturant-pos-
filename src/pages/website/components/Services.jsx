import React from 'react';
import { motion } from 'framer-motion';
import { Utensils, Truck, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { useHospitality } from '@/context/HospitalityContext';

const ecosystem = [
  {
    title: 'WhatsApp Support',
    desc: 'Instant concierge assistance and community updates. Connect with our team directly for any requests or support.',
    img: '/Immagine 2026-04-16 042531.png',
    tag: 'CONCIERGE',
    fit: 'object-contain',
    bgColor: 'bg-surface',
    cta: 'Scan to Connect'
  },
  {
    title: 'Instagram Community',
    desc: 'Join our digital family. Follow Gila House for behind-the-scenes, daily specials, and tag us in your best moments.',
    img: '/Immagine 2026-04-16 042508.png',
    tag: 'SOCIAL',
    fit: 'object-contain',
    bgColor: 'bg-surface',
    cta: 'Join Community'
  },
  {
    title: 'Guest Wifi',
    desc: 'Stay connected with ultra-fast managed internet throughout the premises. Scan to join our high-speed network.',
    img: '/Modern Black and White Wifi Poster (2).jpg',
    tag: 'CONNECTED',
    fit: 'object-contain',
    bgColor: 'bg-[#f4d5a8]', // Matching the cream background of the poster
    cta: 'Join Network'
  }
];

const Services = () => {
  const { services } = useHospitality();
  const activeServices = services?.filter(s => s.availability !== 0) || [];

  return (
    <section className="py-32 relative overflow-hidden" id="services">
      <div className="absolute top-0 right-0 w-96 h-96 bg-landing-primary/5 rounded-full blur-[100px] -mr-48 -mt-48" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.span 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-landing-primary font-black uppercase tracking-[0.3em] text-xs"
        >
          Technology at Heart
        </motion.span>
        <h2 className="text-4xl md:text-6xl font-black font-display mt-4 mb-20 text-text-primary uppercase tracking-tighter">
          The <span className="text-landing-primary italic">Smart</span> Ecosystem
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {ecosystem.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="bg-surface border border-border group p-0 overflow-hidden rounded-3xl hover:border-primary/20 hover:shadow-premium-hover transition-all duration-700 shadow-premium flex flex-col h-full"
            >
              <div className={`relative h-96 overflow-hidden ${item.bgColor} flex items-center justify-center p-6 shadow-inner`}>
                 <img src={item.img} alt={item.title} className={`w-full h-full transition-transform duration-[2s] group-hover:scale-105 ${item.fit}`} />
                 <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                 <div className="absolute top-6 left-6 bg-landing-primary text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl z-20">
                    {item.tag}
                 </div>
              </div>
              <div className="p-10 text-left bg-surface border-t border-border flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-black mb-4 text-text-primary uppercase tracking-tight group-hover:text-landing-primary transition-colors">{item.title}</h3>
                  <p className="text-text-secondary leading-relaxed text-sm font-medium mb-8">{item.desc}</p>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-black text-landing-primary uppercase tracking-[0.3em] mt-auto">
                   {item.cta}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {activeServices.length > 0 && (
          <div className="mt-32">
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-landing-primary font-black uppercase tracking-[0.3em] text-xs"
            >
              Discover
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-black font-display mt-4 mb-20 text-text-primary uppercase tracking-tighter">
              Premium <span className="text-landing-primary italic">Services</span> & Excursions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {activeServices.map((service, i) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-surface border border-border group overflow-hidden rounded-3xl hover:border-primary/20 hover:shadow-premium-hover transition-all duration-700 shadow-premium flex flex-col h-full text-left"
                >
                  <div className="relative h-48 bg-slate-50 overflow-hidden flex items-center justify-center">
                    {service.image ? (
                      <img src={service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="text-6xl group-hover:scale-110 transition-transform duration-700">{service.icon || '🧭'}</div>
                    )}
                    <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur-sm px-3 py-1 text-primary rounded-lg text-[9px] font-black uppercase tracking-[0.2em] shadow-sm z-10">
                      {service.category}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h4 className="text-lg font-black text-text-primary uppercase tracking-tight mb-2 group-hover:text-primary transition-colors line-clamp-1">{service.name}</h4>
                    <p className="text-xs font-medium text-slate-500 line-clamp-3 mb-4 flex-1">{service.description || service.notes}</p>
                    <div className="pt-4 border-t border-slate-50">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Starting at</p>
                       <p className="text-xl font-black text-text-primary">₹ {service.price}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Services;
