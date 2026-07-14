import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Users, ChevronRight, X, Check, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const BookTable = () => {
  const [step, setStep] = useState(1);
  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('12:00');
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const [formData, setFormData] = useState({
    guestName: '',
    email: '',
    phone: '',
    notes: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else {
      setLoading(true);
      try {
        const payload = {
          ...formData,
          date,
          time,
          guests,
          type: 'Table',
          status: 'Pending'
        };
        
        // Using the same api instance as others
        const response = await api.post('/reservations', payload);
        
        if (response.data.success) {
          setConfirmed(true);
        } else {
          alert('Failed to book table: ' + response.data.message);
        }
      } catch (err) {
        console.error('Booking Error:', err);
        alert('An error occurred while booking. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-slate-800 font-sans">
      {/* Header - Consistent with Menu/Excursions */}
      <header className="bg-surface border-b border-gray-100 sticky top-0 z-50 py-4 px-6 md:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-orange-500 text-2xl">🧡</span>
          <span className="text-xl font-black uppercase tracking-tighter text-[#2a2a2a]">Gila House</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/menu" className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">Restaurant</Link>
          <Link to="/excursions" className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">Excursions</Link>
          <Link to="/transport" className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">Transport</Link>
        </nav>

        <Link to="/book" className="bg-orange-500 text-white px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all active:scale-95">
          Reserve Table
        </Link>
      </header>

      {/* Hero Section - Matching SS */}
      <section className="bg-gradient-to-br from-[#bdf0e7] to-[#e0f7f3] py-20 px-6 text-center relative overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <div className="w-12 h-12 bg-surface rounded-xl shadow-lg flex items-center justify-center text-orange-500 mb-6">
             <Calendar size={24} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#1e8a75] uppercase tracking-tighter mb-4">Reserve a Table</h1>
          <p className="text-sm md:text-lg text-[#1e8a75]/70 font-bold uppercase tracking-widest">
            Book your dining experience at Gila House
          </p>
        </div>
      </section>

      <main className="max-w-2xl mx-auto px-6 py-16">
        {/* Stepper - Matching SS */}
        {!confirmed && (
          <div className="flex items-center justify-center gap-4 md:gap-12 mb-12">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${step >= 1 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>1</div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${step >= 1 ? 'text-[#2a2a2a]' : 'text-gray-300'}`}>Choose Time</span>
            </div>
            <div className="h-[1px] w-12 bg-gray-100 hidden md:block" />
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${step >= 2 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>2</div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${step >= 2 ? 'text-[#2a2a2a]' : 'text-gray-300'}`}>Your Details</span>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {confirmed ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-surface rounded-[2.5rem] p-12 text-center shadow-2xl shadow-gray-100 border border-emerald-50"
            >
               <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-emerald-100">
                  <Check size={40} />
               </div>
               <h2 className="text-3xl font-black text-[#2a2a2a] uppercase tracking-tighter mb-4">Booking Confirmed!</h2>
               <p className="text-gray-400 text-sm mb-10">We've sent a confirmation email to your address. See you soon!</p>
               <Link to="/" className="inline-block bg-orange-500 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest">Back to Home</Link>
            </motion.div>
          ) : (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-surface rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-gray-100 border border-gray-50"
            >
              <form onSubmit={handleSubmit} className="space-y-8">
                {step === 1 ? (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                       <Clock size={20} className="text-orange-500" />
                       <h3 className="text-lg font-black text-[#2a2a2a] uppercase tracking-tight">Choose date & time</h3>
                    </div>

                    <div className="space-y-6">
                       <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Date</label>
                          <input 
                            type="date" 
                            required
                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-teal-500 focus:bg-surface transition-all text-sm font-bold"
                            onChange={(e) => setDate(e.target.value)}
                          />
                       </div>

                       <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Time</label>
                          <select 
                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-teal-500 focus:bg-surface transition-all text-sm font-bold appearance-none cursor-pointer"
                            onChange={(e) => setTime(e.target.value)}
                          >
                             <option>12:00</option>
                             <option>13:00</option>
                             <option>14:00</option>
                             <option>19:00</option>
                             <option>20:00</option>
                             <option>21:00</option>
                          </select>
                       </div>

                       <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Party size</label>
                          <div className="flex items-center gap-6 bg-gray-50 p-2 rounded-2xl w-fit">
                             <button type="button" onClick={() => setGuests(Math.max(1, guests - 1))} className="w-10 h-10 rounded-xl bg-surface shadow-sm flex items-center justify-center text-gray-400 hover:text-orange-500 transition-colors font-black text-xl">-</button>
                             <span className="text-xl font-black text-[#2a2a2a] w-8 text-center">{guests}</span>
                             <button type="button" onClick={() => setGuests(guests + 1)} className="w-10 h-10 rounded-xl bg-surface shadow-sm flex items-center justify-center text-gray-400 hover:text-orange-500 transition-colors font-black text-xl">+</button>
                             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pr-4">guests</span>
                          </div>
                       </div>
                    </div>

                    <button type="submit" className="w-full bg-orange-500 text-white py-5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-orange-100 hover:bg-orange-600 transition-all active:scale-95 mt-10">
                       Check Availability
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                       <Users size={20} className="text-orange-500" />
                       <h3 className="text-lg font-black text-[#2a2a2a] uppercase tracking-tight">Your Details</h3>
                    </div>

                    <div className="space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                             <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Full Name</label>
                             <input 
                               type="text" 
                               name="guestName"
                               required 
                               value={formData.guestName}
                               onChange={handleInputChange}
                               placeholder="John Doe" 
                               className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-teal-500 focus:bg-surface transition-all text-sm font-bold" 
                             />
                          </div>
                          <div>
                             <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Phone Number</label>
                             <input 
                               type="tel" 
                               name="phone"
                               required 
                               value={formData.phone}
                               onChange={handleInputChange}
                               placeholder="+00 000..." 
                               className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-orange-500 focus:bg-surface transition-all text-sm font-bold" 
                             />
                          </div>
                       </div>
                       <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Email Address</label>
                          <input 
                            type="email" 
                            name="email"
                            required 
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="john@example.com" 
                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-teal-500 focus:bg-surface transition-all text-sm font-bold" 
                          />
                       </div>
                       <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Special Requests (Optional)</label>
                          <textarea 
                             name="notes"
                             rows="3" 
                             value={formData.notes}
                             onChange={handleInputChange}
                             placeholder="Any allergies or celebrations?" 
                             className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-teal-500 focus:bg-surface transition-all text-sm font-bold resize-none"
                           ></textarea>
                       </div>
                    </div>

                    <div className="flex gap-4 mt-10">
                       <button type="button" onClick={() => setStep(1)} className="flex-1 bg-gray-50 text-gray-400 py-5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all">Back</button>
                       <button type="submit" disabled={loading} className="flex-[2] bg-orange-500 text-white py-5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-orange-100 hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-50">
                          {loading ? 'Confirming...' : 'Confirm Booking'}
                       </button>
                    </div>
                  </>
                )}
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-20 text-center">
           <div className="inline-flex items-center gap-2 text-xs font-black text-gray-300 uppercase tracking-widest">
              Visit us to order <ChevronRight size={14} /> Gila House Restaurant & Bar
           </div>
        </div>
      </main>

      {/* Mobile Footer Nav */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface/80 backdrop-blur-xl border border-gray-100 rounded-full py-3 px-8 shadow-2xl z-50 flex items-center gap-8">
         <Link to="/" className="text-gray-400 font-black text-xs uppercase tracking-widest">Home</Link>
         <Link to="/menu" className="text-gray-400 font-black text-xs uppercase tracking-widest">Menu</Link>
         <Link to="/book" className="text-orange-500 font-black text-xs uppercase tracking-widest underline decoration-2 underline-offset-4">Book</Link>
      </div>
    </div>
  );
};

export default BookTable;
