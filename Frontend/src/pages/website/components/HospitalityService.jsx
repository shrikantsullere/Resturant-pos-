import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, CreditCard, ChefHat, MapPin, Hotel, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  { icon: ShoppingBag, title: 'Pick your items', desc: 'Browse our full menu and add items to your cart. No account needed.' },
  { icon: CreditCard, title: 'Choose payment', desc: 'Pay online now or select "Pay at Bar" — your choice, confirmed instantly.' },
  { icon: ChefHat, title: 'We prepare it', desc: 'Our kitchen accepts and prepares your order. Track status in real time.' },
];

const HospitalityService = () => {
  return (
    <section className="py-12 md:py-24 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* How It Works Section */}
        <div className="text-center mb-20">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-landing-primary font-black uppercase tracking-[0.4em] text-[10px]"
          >
            How It Works
          </motion.span>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center group"
              >
                <div className="relative mb-8">
                  <div className="w-20 h-20 rounded-full bg-background border border-border flex items-center justify-center text-landing-primary group-hover:bg-landing-primary group-hover:text-white transition-all duration-500 shadow-xl">
                    <step.icon size={32} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-landing-primary border-4 border-background flex items-center justify-center text-[10px] font-black text-white">
                    {i + 1}
                  </div>
                </div>
                <h4 className="text-xl font-black text-text-primary mb-4 uppercase tracking-tight">{step.title}</h4>
                <p className="text-text-secondary text-sm leading-relaxed max-w-xs mx-auto md:mx-0">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Featured Promo Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-32">
          {/* Hotel Guest Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-surface border border-orange-200 rounded-3xl p-8 md:p-12 bg-gradient-to-br from-orange-50 to-surface relative group overflow-hidden shadow-premium hover:shadow-premium-hover transition-all"
          >
            <div className="flex items-start gap-6 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-500/20">
                <Hotel size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-text-primary uppercase tracking-tight">Staying with us?</h3>
                <p className="text-sm text-text-secondary font-bold uppercase tracking-widest mt-1">Hotel guest room service</p>
              </div>
            </div>
            <p className="text-text-secondary leading-relaxed mb-10 max-w-sm">
              Select your room and start ordering — everything goes on your room bill, settled at checkout.
            </p>
            <Link to="/order" className="w-full btn-premium bg-orange-500 hover:bg-orange-600 border-orange-500 px-8 py-5 text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3">
              Enter as Hotel Guest <ArrowRight size={18} />
            </Link>
          </motion.div>

          {/* Restaurant Visit Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-surface border border-emerald-200 rounded-3xl p-8 md:p-12 bg-gradient-to-br from-emerald-50 to-surface relative group overflow-hidden shadow-premium hover:shadow-premium-hover transition-all"
          >
            <div className="flex items-start gap-6 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20">
                <MapPin size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-text-primary uppercase tracking-tight">Find us</h3>
                <p className="text-sm text-text-secondary font-bold uppercase tracking-widest mt-1">Gila House Restaurant & Bar</p>
              </div>
            </div>
            <p className="text-text-secondary leading-relaxed mb-10 max-w-sm">
              Drop in, grab a seat, and let us bring the island to your table. No reservation needed for the bar.
            </p>
            <a href="#reservation" className="w-full btn-primary px-8 py-5 text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 rounded-full">
              Reserve a Table <ArrowRight size={18} />
            </a>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default HospitalityService;
