import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-dark pt-24 pb-12 relative overflow-hidden text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-3 mb-8">
               <img src="/1000464407-removebg-preview.png" alt="Logo" className="h-12 w-auto object-contain" />
               <span className="text-2xl font-black font-display tracking-tight uppercase italic text-white">
                  Gila<span className="text-landing-primary">House</span>
               </span>
            </Link>
            <p className="text-gray-400 leading-relaxed">
              Bringing you the best culinary experiences since 2014. Quality food, fast delivery, and unmatched service.
            </p>
            <div className="flex space-x-4">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-landing-primary hover:border-landing-primary transition-all duration-300">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-8">Quick Links</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="/" className="hover:text-landing-primary transition-colors">Home</a></li>
              <li><a href="#about" className="hover:text-landing-primary transition-colors">About Us</a></li>
              <li><a href="#menu" className="hover:text-landing-primary transition-colors">Our Menu</a></li>
              <li><a href="#services" className="hover:text-landing-primary transition-colors">Services</a></li>
              <li><a href="#contact" className="hover:text-landing-primary transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-8">Working Hours</h4>
            <ul className="space-y-4 text-gray-400">
              <li className="flex justify-between"><span>Mon - Fri:</span> <span>09:00 - 22:00</span></li>
              <li className="flex justify-between"><span>Saturday:</span> <span>10:00 - 23:00</span></li>
              <li className="flex justify-between"><span>Sunday:</span> <span>Closed</span></li>
              <li className="flex justify-between font-bold text-landing-primary"><span>Holiday:</span> <span>10:00 - 18:00</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-8">Newsletter</h4>
            <p className="text-gray-400 mb-6 text-sm">Subscribe to get latest news and special offers.</p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full bg-surface/5 border border-white/10 rounded-full px-6 py-4 outline-none focus:border-landing-primary transition-colors pr-16"
              />
              <button className="absolute right-2 top-2 bottom-2 w-12 h-12 bg-landing-primary rounded-full flex items-center justify-center hover:bg-landing-primary-dark transition-colors">
                <ArrowUp size={20} className="rotate-90" />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <p>© 2026 Gila House. All Rights Reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>

      {/* Scroll to Top */}
      <button 
        onClick={scrollToTop}
        className="fixed bottom-4 right-4 md:bottom-8 md:right-8 w-12 h-12 md:w-14 md:h-14 bg-landing-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 z-50 group"
      >
        <ArrowUp size={24} className="group-hover:-translate-y-1 transition-transform" />
      </button>
    </footer>
  );
};

export default Footer;
