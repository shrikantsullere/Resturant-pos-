import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Transactions Daily', value: '50k+' },
  { label: 'Uptime Guarantee', value: '99.9%' },
  { label: 'Smart QR Partners', value: '500+' },
  { label: 'Expert Support', value: '24/7' },
];

const Stats = () => {
  return (
    <section className="relative z-20 -mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-surface border border-border rounded-3xl p-8 md:p-12 shadow-premium shadow-primary/5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <h3 className="text-3xl md:text-5xl font-bold text-gray-900 mb-2 font-display">{stat.value}</h3>
                <p className="text-text-secondary font-semibold uppercase tracking-widest text-[10px] md:text-xs">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
