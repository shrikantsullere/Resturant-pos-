import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '../../../services/api';

const Reservation = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeMeal, setActiveMeal] = useState('Dinner');
  
  const [formData, setFormData] = useState({
    guestName: '',
    date: '',
    time: '',
    guests: '2',
    notes: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const mealOptions = {
    Breakfast: [
      { name: 'Classic Omelette', desc: 'Farm fresh eggs with herbs' },
      { name: 'Pancake Stack', desc: 'Maple syrup and fresh berries' },
      { name: 'Avocado Toast', desc: 'Sourdough with poached eggs' },
    ],
    Lunch: [
      { name: 'Wagyu Burger', desc: 'Truffle mayo and brioche bun' },
      { name: 'Ceasar Salad', desc: 'Grilled chicken and parmesan' },
      { name: 'Pasta Carbonara', desc: 'Crispy pancetta and egg yolk' },
    ],
    Dinner: [
      { name: 'Ribeye Steak', desc: 'Aged beef with garlic butter' },
      { name: 'Grilled Salmon', desc: 'Lemon butter and asparagus' },
      { name: 'Lamb Chops', desc: 'Mint glaze and roasted roots' },
    ],
    Bar: [
      { name: 'Old Fashioned', desc: 'Bourbon with aromatic bitters' },
      { name: 'Signature Mojito', desc: 'Fresh mint and white rum' },
      { name: 'Craft Beer Flight', desc: 'Selection of 4 local brews' },
    ]
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        type: 'Table',
        status: 'Pending',
        notes: `Meal Preference: ${activeMeal}`
      };
      
      const response = await api.post('/reservations', payload);
      if (response.data.success) {
        setSubmitted(true);
      } else {
        alert('Failed to book table: ' + response.data.message);
      }
    } catch (err) {
      console.error('Booking Error:', err);
      alert('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section className="py-12 md:py-24 bg-background relative overflow-hidden" id="reservation">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
                        className="bg-surface border border-emerald-200 rounded-3xl p-16 shadow-premium"
          >
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="text-emerald-500" size={40} />
            </div>
            <h2 className="text-4xl font-black text-text-primary uppercase tracking-tight mb-4">Table Reserved!</h2>
            <p className="text-text-secondary text-lg mb-8">We've received your booking for {activeMeal}. Get ready for an exceptional dining experience.</p>
            <button 
              onClick={() => setSubmitted(false)}
              className="text-landing-primary font-black uppercase tracking-widest text-sm hover:underline"
            >
              Book another slot
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-24 bg-background relative overflow-hidden" id="reservation">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="bg-surface border border-border group p-0 overflow-hidden rounded-3xl hover:border-primary/30 hover:shadow-premium-hover transition-all duration-700 shadow-premium flex flex-col h-full" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-landing-secondary/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="text-landing-primary font-black uppercase tracking-[0.3em] text-xs">Reservations</span>
          <h2 className="text-4xl md:text-6xl font-black font-display mt-4 text-text-primary uppercase tracking-tighter leading-none">
            Secure Your <span className="text-landing-primary italic">Seat</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-black text-text-primary uppercase tracking-tight mb-8 flex items-center gap-4">
              <span className="w-8 h-px bg-landing-primary"></span>
              Step 1: Select Experience
            </h3>
            
            {/* Meal Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
              {Object.keys(mealOptions).map((meal) => (
                <button
                  key={meal}
                  onClick={() => setActiveMeal(meal)}
                  className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeMeal === meal 
                    ? 'bg-landing-primary text-white shadow-lg shadow-landing-primary/20' 
                    : 'bg-surface/5 text-text-secondary hover:bg-surface/10'
                  }`}
                >
                  {meal}
                </button>
              ))}
            </div>

            {/* Curated Menu Preview */}
            <div className="bg-surface border border-border rounded-3xl p-6 shadow-premium">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-landing-primary mb-6">Curated {activeMeal} Menu</p>
              <div className="space-y-6">
                {mealOptions[activeMeal].map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex justify-between items-center group cursor-default relative p-2 -mx-2 rounded-xl transition-all"
                  >
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                    <div className="relative z-10">
                      <h4 className="text-text-primary font-bold text-sm uppercase group-hover:text-landing-primary transition-colors">{item.name}</h4>
                      <p className="text-xs text-text-secondary">{item.desc}</p>
                    </div>
                    <div className="relative z-10 w-8 h-8 rounded-full bg-surface/5 flex items-center justify-center text-landing-primary transition-opacity">
                       <ArrowRight size={14} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-surface border border-border rounded-3xl p-8 md:p-12 shadow-premium relative"
          >
            <h3 className="text-2xl font-black text-text-primary uppercase tracking-tight mb-8 flex items-center gap-4">
              <span className="w-8 h-px bg-landing-secondary"></span>
              Step 2: Booking Info
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Full Name</label>
                  <input 
                    required 
                    type="text" 
                    name="guestName"
                    value={formData.guestName}
                    onChange={handleInputChange}
                    className="w-full bg-surface/5 border border-border rounded-2xl px-6 py-4 outline-none focus:border-landing-primary transition-all text-text-primary font-medium" 
                    placeholder="John Doe" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Guests</label>
                  <div className="relative">
                    <select 
                      name="guests"
                      value={formData.guests}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-border rounded-2xl px-6 py-4 outline-none focus:border-landing-primary transition-all text-text-primary font-medium appearance-none"
                    >
                      <option value="2" className="bg-surface">2 Persons</option>
                      <option value="4" className="bg-surface">4 Persons</option>
                      <option value="6" className="bg-surface">6 Persons</option>
                      <option value="8" className="bg-surface">8+ Persons</option>
                    </select>
                    <Users size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Date</label>
                  <input 
                    required 
                    type="date" 
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full bg-surface/5 border border-border rounded-2xl px-6 py-4 outline-none focus:border-landing-primary transition-all text-text-primary font-medium" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Time</label>
                  <input 
                    required 
                    type="time" 
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full bg-surface/5 border border-border rounded-2xl px-6 py-4 outline-none focus:border-landing-primary transition-all text-text-primary font-medium" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Meal Preference</label>
                <input readOnly value={activeMeal} className="w-full bg-surface/5 border border-landing-primary/30 rounded-2xl px-6 py-4 outline-none text-landing-primary font-bold uppercase tracking-widest text-xs" />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn-premium py-5 rounded-full flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-landing-primary/20 group disabled:opacity-50"
              >
                {loading ? 'Confirming...' : 'Confirm Booking'} <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Reservation;
