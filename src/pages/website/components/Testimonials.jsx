import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Food Critic',
    text: 'The best pizza I have ever tasted! The crust is perfect and the ingredients are incredibly fresh.',
    avatar: 'SJ'
  },
  {
    name: 'Michael Chen',
    role: 'Regular Customer',
    text: 'Lightning fast delivery and the food always arrives piping hot. Highly recommend the double wagyu burger.',
    avatar: 'MC'
  },
  {
    name: 'Elena Rodriguez',
    role: 'Chef de Cuisine',
    text: 'As a chef myself, I am impressed by the technical skill and flavor profiles they manage to achieve consistently.',
    avatar: 'ER'
  }
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-landing-primary font-bold uppercase tracking-widest text-sm">Testimonials</span>
          <h2 className="text-4xl md:text-5xl font-bold font-display mt-2 text-text-primary">What Our Customers Say</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-surface border border-border rounded-3xl p-8 relative shadow-premium hover:shadow-premium-hover transition-all"
            >
              <Quote className="absolute top-6 right-6 text-primary/10" size={60} />
              <div className="flex text-landing-secondary mb-6">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-landing-secondary" />)}
              </div>
              <p className="text-text-secondary italic mb-8 leading-relaxed">"{item.text}"</p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-premium flex items-center justify-center font-bold text-white">
                  {item.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-text-primary">{item.name}</h4>
                  <p className="text-xs text-text-secondary uppercase tracking-widest font-bold">{item.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
