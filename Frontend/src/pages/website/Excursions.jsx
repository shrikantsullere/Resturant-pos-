import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, ArrowRight, X, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const excursionData = [
  {
    id: 1,
    name: 'Sunrise Snorkeling Tour',
    location: 'Coral Bay — 15 min boat ride',
    desc: 'Join our expert guides for a magical 3-hour snorkeling adventure at sunrise. Explore vibrant coral reefs, sea turtles, and tropical fish. All equipment included.',
    price: 'Rp 350.000',
    img: 'snorkeling_tour_menu_1778237919417.png'
  },
  {
    id: 2,
    name: 'Half-Day Island Hopping',
    location: 'Departs from hotel pier',
    desc: 'Visit 3 stunning nearby islands by private speedboat. Includes swimming stops, local lunch, and a guide. Perfect for families and groups.',
    price: 'Rp 550.000',
    img: 'island_hopping_menu_1778237935918.png'
  },
  {
    id: 3,
    name: 'Golden Sunset Cruise',
    location: 'West Coast — Luxury Boat',
    desc: 'Experience the magic of an island sunset from the deck of our luxury wooden boat. Includes snacks, drinks, and a relaxing 2-hour cruise.',
    price: 'Rp 450.000',
    img: 'sunset_cruise_menu_1778238312847.png'
  },
  {
    id: 4,
    name: 'Traditional Cooking Class',
    location: 'Organic Garden Kitchen',
    desc: 'Learn the secrets of authentic island cuisine in our outdoor kitchen. Harvest fresh ingredients and prepare a 3-course meal with our head chef.',
    price: 'Rp 300.000',
    img: 'cooking_class_menu_1778238328714.png'
  },
  {
    id: 5,
    name: 'Scuba Diving Adventure',
    location: 'Deep Sea Reef Wall',
    desc: 'For certified divers: explore the deeper secrets of the ocean. Visit our majestic coral wall and swim alongside rays and schools of exotic fish.',
    price: 'Rp 850.000',
    img: 'scuba_diving_menu_1778238342462.png'
  }
];

const Excursions = () => {
  return (
    <div className="min-h-screen bg-[#fcfcfc] text-slate-800 font-sans">
      {/* Header - Consistent with Menu */}
      <header className="bg-surface border-b border-gray-100 sticky top-0 z-50 py-3 md:py-4 px-4 md:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 md:gap-3">
          <img src="/1000464407-removebg-preview.png" alt="Logo" className="h-7 md:h-10 w-auto object-contain" />
          <span className="text-[14px] md:text-xl font-black uppercase tracking-tighter text-[#2a2a2a]">Gila House</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-4 lg:gap-8">
          <Link to="/menu" className="text-xs lg:text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">Restaurant</Link>
          <Link to="/excursions" className="text-xs lg:text-sm font-bold text-orange-500 border-b-2 border-orange-500 pb-1">Excursions</Link>
          <Link to="/transport" className="text-xs lg:text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">Transport</Link>
        </nav>

        <Link to="/book" className="bg-orange-500 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all">
          Reserve Table
        </Link>
      </header>

      {/* Hero Section - Matching SS */}
      <section className="bg-[#1e8a75] py-12 md:py-20 px-6 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/5" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Gila House</span>
          <h1 className="text-3xl md:text-6xl font-black uppercase tracking-tighter mt-4 mb-4 md:mb-6">Excursions & Activities</h1>
          <p className="text-xs md:text-lg opacity-80 font-medium max-w-2xl mx-auto leading-relaxed">
            Explore the island with our curated guided tours and local adventures
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
          {excursionData.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-surface rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl shadow-gray-100/50 border border-transparent hover:border-teal-100 group transition-all duration-500"
            >
              {/* Image Area - Matching SS Style */}
              <div className="h-60 md:h-72 overflow-hidden relative">
                 <img src={item.img} alt={item.name} className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110" />
                 <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
              </div>
              
              <div className="p-6 md:p-10">
                <h3 className="text-xl md:text-2xl font-black text-[#2a2a2a] mb-2 uppercase tracking-tight group-hover:text-[#1e8a75] transition-colors">{item.name}</h3>
                
                <div className="flex items-center gap-6 mb-4 md:mb-6">
                   <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold text-gray-400 uppercase">
                      <MapPin size={14} className="text-teal-500" /> {item.location}
                   </div>
                </div>

                <p className="text-xs md:text-sm text-gray-500 leading-relaxed mb-6 md:mb-8">
                  {item.desc}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-gray-50">
                  <span className="text-xl md:text-2xl font-black text-[#1e8a75] tracking-tighter">
                    {item.price}
                  </span>
                  <button className="w-full sm:w-auto bg-orange-500 text-white px-6 md:px-8 py-3 md:py-3.5 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-100 hover:bg-orange-600 transition-all active:scale-95">
                    Book This Excursion
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 md:mt-32 text-center">
           <div className="inline-flex items-center gap-2 text-[10px] md:text-xs font-black text-gray-300 uppercase tracking-widest">
              Visit us to order <ChevronRight size={14} /> Gila House Restaurant & Bar
           </div>
        </div>
      </main>

      {/* Mobile Footer Nav */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface/80 backdrop-blur-xl border border-gray-100 rounded-full py-3 px-8 shadow-2xl z-50 flex items-center gap-8">
         <Link to="/" className="text-gray-400"><X size={20} /></Link>
         <Link to="/menu" className="text-gray-400 font-black text-xs uppercase tracking-widest">Menu</Link>
         <Link to="/excursions" className="text-orange-500 font-black text-xs uppercase tracking-widest underline decoration-2 underline-offset-4">Tours</Link>
      </div>
    </div>
  );
};

export default Excursions;
