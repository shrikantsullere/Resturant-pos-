import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  MapPin, 
  Utensils, 
  Wine, 
  Compass, 
  Car, 
  MessageSquare, 
  Receipt, 
  ChefHat,
  GlassWater
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/services/api';

const GuestDashboard = () => {
  const [guestInfo, setGuestInfo] = useState({
    name: 'GUEST',
    roomName: '...',
    roomId: null
  });

  useEffect(() => {
    const savedInfo = localStorage.getItem('guest_info');
    if (savedInfo) {
      const parsed = JSON.parse(savedInfo);
      setGuestInfo(prev => ({ ...prev, name: parsed.name.toUpperCase(), roomId: parsed.roomId }));
      
      // Fetch room name if we only have ID
      const fetchRoomDetails = async () => {
        try {
          const response = await api.get('/rooms/available'); // We can reuse this or get all rooms
          const rooms = response.data.data;
          const room = rooms.find(r => r.id == parsed.roomId);
          if (room) {
            setGuestInfo(prev => ({ ...prev, roomName: room.room_name || `Room ${room.room_number || room.room_code}` }));
          }
        } catch (error) {
          console.error('Failed to fetch room details:', error);
        }
      };
      fetchRoomDetails();
    }
  }, []);

  const services = [
    { icon: Utensils, title: 'Restaurant', desc: 'Breakfast, Lunch & Dinner', color: 'text-orange-500', bg: 'bg-orange-50', link: '/guest-menu' },
    { icon: Wine, title: 'Bar & Drinks', desc: 'Cocktails & Beverages', color: 'text-purple-500', bg: 'bg-purple-50', link: '/guest-menu' },
    { icon: Compass, title: 'Excursions', desc: 'Adventures & Activities', color: 'text-emerald-500', bg: 'bg-emerald-50', link: '/excursions' },
    { icon: Car, title: 'Transport', desc: 'Transfers & Hire', color: 'text-blue-500', bg: 'bg-blue-50', link: '/transport' },
    { icon: MessageSquare, title: 'Reception', desc: 'Ask for anything', color: 'text-teal-500', bg: 'bg-teal-50', link: '/request-chat' },
    { icon: Receipt, title: 'My Bill', desc: 'View & pay charges', color: 'text-amber-600', bg: 'bg-amber-50', link: '/my-bill' },
  ];

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="min-h-screen bg-[#e0f7f3]/50 font-sans pb-20">
      {/* Top Header */}
      <header className="bg-surface px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <img src="/1000464407-removebg-preview.png" alt="Logo" className="w-5 h-auto brightness-0 invert" />
          </div>
          <span className="text-lg font-black uppercase tracking-tighter text-slate-800">Gila House</span>
        </div>

        {/* Welcome Toast - Floating Style */}
        <div className="hidden sm:flex items-center gap-2 bg-surface border border-gray-100 px-3 py-1.5 rounded-full shadow-md shadow-gray-100">
          <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px]">
             ✓
          </div>
          <span className="text-[10px] font-bold text-slate-600 tracking-tight">Welcome, {guestInfo.name}! 🎉</span>
        </div>

        <button className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center text-slate-400 hover:bg-gray-100 transition-colors relative">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-6 md:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Greeting Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-gradient-to-br from-orange-400 to-orange-500 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 text-white shadow-xl shadow-orange-100 overflow-hidden relative flex flex-col justify-center"
          >
            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] opacity-70 mb-3 md:mb-4">{today}</p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6 md:mb-8 tracking-tight leading-none text-white">Good morning, {guestInfo.name}!</h2>
            
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 bg-surface/20 backdrop-blur-md px-4 py-2 rounded-xl">
                <MapPin size={14} />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Gila House</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-surface/20 backdrop-blur-md px-4 py-2 rounded-xl">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">{guestInfo.roomName}</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Order Section */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2 px-2 text-left">Quick Actions</h3>
            <Link to="/guest-menu" className="flex-1 bg-orange-50/60 hover:bg-orange-50 transition-colors rounded-[2rem] p-6 flex items-center gap-6 border border-orange-100/30 group">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-orange-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200 group-hover:scale-110 transition-transform">
                <ChefHat size={28} />
              </div>
              <div className="text-left">
                <span className="block text-lg font-black text-slate-800 leading-tight">Order to Room</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full menu</span>
              </div>
            </Link>

            <Link to="/guest-menu" className="flex-1 bg-purple-50/60 hover:bg-purple-50 transition-colors rounded-[2rem] p-6 flex items-center gap-6 border border-purple-100/30 group">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform">
                <GlassWater size={28} />
              </div>
              <div className="text-left">
                <span className="block text-lg font-black text-slate-800 leading-tight">Bar Drinks</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cocktails & more</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Our Services Grid */}
        <section className="mb-20">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 px-2 text-left">Explore Our Services</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={service.link} className="bg-surface hover:shadow-2xl hover:shadow-orange-900/5 transition-all rounded-[2rem] p-6 flex flex-col border border-gray-50 h-full group text-left">
                  <div className={`w-12 h-12 md:w-14 md:h-14 ${service.bg} rounded-2xl flex items-center justify-center ${service.color} mb-5 group-hover:scale-110 transition-transform`}>
                    <service.icon size={22} strokeWidth={2.5} />
                  </div>
                  <span className="text-sm md:text-base font-black text-slate-800 mb-1 leading-tight">{service.title}</span>
                  <span className="text-[10px] md:text-[11px] font-bold text-gray-400 leading-relaxed line-clamp-2">{service.desc}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Mobile Bottom Bar - Consistent */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface/80 backdrop-blur-xl border border-gray-100 rounded-full py-3 px-8 shadow-2xl z-50 flex items-center gap-10">
         <Link to="/" className="text-gray-400"><Compass size={20} /></Link>
         <Link to="/guest-app" className="text-orange-500 font-black text-xs uppercase tracking-widest">App</Link>
         <Link to="/my-bill" className="text-gray-400"><Receipt size={20} /></Link>
      </div>
    </div>
  );
};

export default GuestDashboard;
