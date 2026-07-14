import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '#about' },
    { name: 'Menu', href: '/menu' },
    { name: 'Services', href: '#services' },
    { name: 'Book Table', href: '#reservation' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-background/95 backdrop-blur-md py-2 md:py-3 shadow-lg border-b border-black/5' : 'bg-background/80 backdrop-blur-sm py-3 md:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-1 md:gap-3">
            <img src="/1000464407-removebg-preview.png" alt="Gila House Logo" className="h-8 md:h-14 w-auto object-contain" />
            <span className={`text-[16px] md:text-2xl font-black font-display tracking-tighter md:tracking-tight uppercase italic transition-colors ${scrolled ? 'text-text-primary' : 'text-text-primary'}`}>
              Gila<span className="text-primary">House</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              link.href.startsWith('/') ? (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm font-bold text-text-primary/80 hover:text-primary transition-colors duration-300 uppercase tracking-widest text-[11px]"
                >
                  {link.name}
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-bold text-text-primary/80 hover:text-primary transition-colors duration-300 uppercase tracking-widest text-[11px]"
                >
                  {link.name}
                </a>
              )
            ))}
            <Link
              to="/login"
              className="bg-primary text-white px-8 py-2.5 rounded-full font-bold hover:bg-primary-hover transition-all duration-300 shadow-xl shadow-primary/20 hover:scale-105 uppercase tracking-widest text-[11px]"
            >
              Login
            </Link>
          </div>

          {/* Mobile Button */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-text-primary p-2"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface border-b border-black/5 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                link.href.startsWith('/') ? (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-4 text-sm font-bold text-text-primary/70 hover:bg-primary/5 hover:text-primary rounded-xl uppercase tracking-widest"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-4 text-sm font-bold text-text-primary/70 hover:bg-primary/5 hover:text-primary rounded-xl uppercase tracking-widest"
                  >
                    {link.name}
                  </a>
                )
              ))}
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center bg-primary text-white py-4 rounded-full font-bold mt-4 shadow-xl shadow-primary/20 uppercase tracking-widest text-xs"
              >
                Login
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
