import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Building, ArrowLeft, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/services/api';

const GuestCheckIn = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    roomId: '',
    firstName: '',
    lastName: ''
  });

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await api.get('/rooms/available');
        setRooms(response.data.data);
      } catch (error) {
        console.error('Failed to fetch rooms:', error);
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchRooms();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.roomId || !formData.firstName) return;

    setSubmitting(true);
    try {
      const response = await api.post('/reservations', {
        guestName: `${formData.firstName} ${formData.lastName}`.trim(),
        room_id: formData.roomId,
        type: 'room',
        status: 'checked_in'
      });

      if (response.data.success) {
        // Store guest info in session/local storage for the guest app
        localStorage.setItem('guest_info', JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          roomId: formData.roomId,
          reservationId: response.data.data.id,
          guestId: response.data.data.guestId
        }));
        navigate('/guest-app');
      }
    } catch (error) {
      console.error('Check-in failed:', error);
      alert('Check-in failed. Please try again or see the front desk.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#bdf0e7] to-[#e0f7f3] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      
      <div className="w-full max-w-2xl text-center flex flex-col items-center">
        {/* Logo in White Square */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-20 h-20 md:w-24 md:h-24 bg-surface rounded-[1.5rem] shadow-xl flex items-center justify-center mb-6"
        >
          <img src="/1000464407-removebg-preview.png" alt="Logo" className="w-12 md:w-16 h-auto" />
        </motion.div>

        {/* Title & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-5xl font-black text-[#2a2a2a] mb-2 tracking-tight text-center">Gila House</h1>
          <p className="text-[10px] md:text-sm font-bold text-teal-700/60 uppercase tracking-widest text-center">Hotel Guest Check-in</p>
        </motion.div>

        {/* Check-in Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-teal-900/5 w-full border border-white/50 text-left"
        >
          <p className="text-gray-400 text-[11px] md:text-[13px] font-medium leading-relaxed mb-8 md:mb-10 text-center px-4 md:px-12">
            Select your room and enter your name to access the guest app — order food, view your bill, and request services.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            <div className="max-w-md mx-auto">
              <label className="block text-[10px] md:text-[11px] font-black text-[#2a2a2a] uppercase tracking-widest mb-3">Select your room</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400">
                  <Building size={18} />
                </div>
                <select 
                  required
                  value={formData.roomId}
                  onChange={(e) => setFormData({...formData, roomId: e.target.value})}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50/50 rounded-2xl border border-gray-100 text-sm font-bold text-gray-700 appearance-none cursor-pointer focus:border-teal-500 focus:bg-surface transition-all outline-none disabled:opacity-50"
                  disabled={loadingRooms}
                >
                  <option value="">{loadingRooms ? 'Loading rooms...' : 'Choose your room...'}</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.room_name || room.room_code} ({room.room_type})
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronRight size={16} className="text-gray-300 rotate-90" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-xl mx-auto">
              <div>
                <label className="block text-[10px] md:text-[11px] font-black text-[#2a2a2a] uppercase tracking-widest mb-3">First name</label>
                <input 
                  required
                  type="text" 
                  placeholder="Maria" 
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50/50 rounded-2xl border border-gray-100 text-sm font-bold placeholder:text-gray-200 outline-none focus:border-teal-500 focus:bg-surface transition-all" 
                />
              </div>
              <div>
                <label className="block text-[10px] md:text-[11px] font-black text-[#2a2a2a] uppercase tracking-widest mb-3">Last name</label>
                <input 
                  type="text" 
                  placeholder="Santos" 
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50/50 rounded-2xl border border-gray-100 text-sm font-bold placeholder:text-gray-200 outline-none focus:border-teal-500 focus:bg-surface transition-all" 
                />
              </div>
            </div>

            <div className="max-w-md mx-auto">
               <button 
                 type="submit"
                 disabled={submitting}
                 className="w-full bg-[#f3c19d] text-white py-4 md:py-5 rounded-2xl text-[13px] md:text-sm font-black tracking-tight shadow-lg shadow-orange-100 hover:bg-orange-400 transition-all active:scale-[0.98] text-center mt-4 flex items-center justify-center gap-2"
               >
                 {submitting ? (
                   <>
                     <Loader2 className="w-5 h-5 animate-spin" />
                     Checking in...
                   </>
                 ) : 'Enter Guest App'}
               </button>
            </div>
          </form>
        </motion.div>

        {/* Bottom Links */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 md:mt-12 space-y-3 flex flex-col items-center"
        >
          <Link to="/" className="text-[11px] md:text-xs font-bold text-teal-700/40 hover:text-teal-700 transition-colors flex items-center gap-1">
            <ArrowLeft size={12} /> Back to Gila House
          </Link>
          <Link to="/login" className="text-[11px] md:text-xs font-bold text-teal-700/40 hover:text-teal-700 transition-colors">
            Staff? <span className="underline underline-offset-4">Sign in here</span>
          </Link>
        </motion.div>
      </div>

      {/* Decorative Blur */}
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-surface/30 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />
    </div>
  );
};

export default GuestCheckIn;
