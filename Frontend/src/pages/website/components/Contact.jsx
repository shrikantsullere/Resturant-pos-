import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
  return (
    <section className="py-12 md:py-24" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-landing-primary font-bold uppercase tracking-widest text-sm">Contact Us</span>
            <h2 className="text-4xl md:text-5xl font-bold font-display mt-2 mb-8 text-text-primary">Get In Touch</h2>
            <p className="text-text-secondary mb-12 text-lg">
              Have questions about our menu, delivery, or events? We're here to help! Send us a message and we'll get back to you shortly.
            </p>

            <div className="space-y-8">
              {[
                { icon: MapPin, title: 'Our Location', text: '123 Gourmet Street, Food City, FC 12345' },
                { icon: Phone, title: 'Call Us', text: '+00 (000) 000-0000' },
                { icon: Mail, title: 'Email Us', text: 'hello@restaurantpro.com' }
              ].map((item) => (
                <div key={item.title} className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-landing-primary/10 text-landing-primary flex items-center justify-center shrink-0">
                    <item.icon size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1 text-text-primary">{item.title}</h4>
                    <p className="text-text-secondary">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-surface border border-border rounded-3xl p-10 shadow-premium"
          >
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Full Name</label>
                  <input type="text" className="w-full bg-white border border-border rounded-xl px-6 py-4 outline-none focus:border-landing-primary transition-colors text-text-primary" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Email Address</label>
                  <input type="email" className="w-full bg-white border border-border rounded-xl px-6 py-4 outline-none focus:border-landing-primary transition-colors text-text-primary" placeholder="john@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Subject</label>
                <input type="text" className="w-full bg-white border border-border rounded-xl px-6 py-4 outline-none focus:border-landing-primary transition-colors text-text-primary" placeholder="Inquiry" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Message</label>
                <textarea rows="4" className="w-full bg-white border border-border rounded-xl px-6 py-4 outline-none focus:border-landing-primary transition-colors text-text-primary" placeholder="Tell us more..."></textarea>
              </div>
              <button className="btn-premium w-full flex items-center justify-center space-x-2">
                <span>Send Message</span>
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
