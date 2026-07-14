import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import heroBg from '../../../assets/landing/hero-bg.png'; // Reusing as a placeholder

const About = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <section className="py-8 md:py-16 overflow-hidden" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl border-8 border-primary/10 group">
              <img src="/1000464401.jpg" alt="Atmosphere" className="w-full h-[500px] object-cover group-hover:scale-110 transition-transform duration-[5s]" />
            </div>
            <div className="absolute -bottom-10 -right-10 bg-surface border border-border rounded-3xl p-8 shadow-premium hidden md:block max-w-[250px]">
              <h4 className="text-4xl font-black text-landing-primary mb-1">SMART</h4>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Integrated Hospitality Solutions</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-landing-primary font-bold uppercase tracking-widest text-sm">About Our Story</span>
            <h2 className="text-4xl md:text-5xl font-bold font-display mt-2 mb-4 text-text-primary">Traditional Taste with Modern Twist</h2>
            <p className="text-text-secondary mb-6 text-lg leading-relaxed">
              We started as a small family kitchen with one goal: to bring authentic flavors to your table. Today, we're proud to be one of the most loved restaurants in the city, blending traditional recipes with modern culinary techniques.
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="block overflow-hidden"
                  >
                    Gila House represents the pinnacle of integrated hospitality. We've combined our passion for culinary excellence with smart, cutting-edge technology. From our seamless table reservations and dynamic POS systems to our interconnected hotel and concierge services, every aspect of your visit is designed for comfort and efficiency. Our commitment to premium quality ensures that whether you're enjoying a curated dinner, booking an excursion, or relaxing in your room, your experience will be nothing short of extraordinary.
                  </motion.span>
                )}
              </AnimatePresence>
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {[
                'Premium Quality Food',
                'Master Chefs',
                'Fresh Ingredients',
                'Organic Vegetables',
                'Best Pricing',
                'Fast Home Delivery'
              ].map((item) => (
                <div key={item} className="flex items-center space-x-3 text-text-primary">
                  <CheckCircle2 className="text-landing-primary" size={20} />
                  <span className="font-semibold text-text-primary">{item}</span>
                </div>
              ))}
            </div>

            <button onClick={() => setIsExpanded(!isExpanded)} className="btn-premium">
              {isExpanded ? 'Read Less' : 'Read More Story'}
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
