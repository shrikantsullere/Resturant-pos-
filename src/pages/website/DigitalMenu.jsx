import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Search, Menu as MenuIcon, X, Building, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMenu, categoryIconMap } from '../../context/MenuContext';
import { getImageUrl } from '../../utils/imageUtils';

const DigitalMenu = () => {
  const { items, categoriesList } = useMenu();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get('category');
    if (categoryParam) {
      const formatted = categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1).toLowerCase();
      // Ensure 'Bar' is correctly parsed (keep category formatting consistent)
      if (formatted === 'Bar') return 'Bar';
      return formatted;
    }
    return 'All Items';
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const highlight = params.get('highlight');
    if (highlight && items.length > 0) {
      setTimeout(() => {
        const itemSlug = highlight.replace(/\s+/g, '-').toLowerCase();
        const element = document.getElementById(`item-${itemSlug}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-4', 'ring-orange-500/20', 'border-orange-500');
          setTimeout(() => {
            element.classList.remove('ring-4', 'ring-orange-500/20', 'border-orange-500');
          }, 3000);
        }
      }, 500);
    }
  }, [items]);

  const filteredItems = activeCategory === 'All Items'
    ? items
    : items.filter(item => (item.category_name || item.category) === activeCategory);

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-slate-800 font-sans">
      {/* Header - Matching Screenshot */}
      <header className="bg-surface border-b border-gray-100 sticky top-0 z-50 py-3 md:py-4 px-4 md:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 md:gap-3">
          <img src="/1000464407-removebg-preview.png" alt="Logo" className="h-7 md:h-10 w-auto object-contain" />
          <span className="text-[14px] md:text-xl font-black uppercase tracking-tighter text-[#2a2a2a]">Gila House</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-4 lg:gap-8">
          <Link to="/menu" className="text-xs lg:text-sm font-bold text-orange-500 border-b-2 border-orange-500 pb-1">Restaurant</Link>
          <Link to="/excursions" className="text-xs lg:text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">Excursions</Link>
          <Link to="/transport" className="text-xs lg:text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">Transport</Link>
        </nav>

        <Link to="/book" className="bg-orange-500 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all active:scale-95">
          Reserve Table
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Category Selector - Matching Screenshot */}
        <div className="flex items-center md:justify-center gap-2 md:gap-3 mb-8 md:mb-16 overflow-x-auto pb-4 no-scrollbar">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-all shrink-0 ${
                activeCategory === cat 
                ? 'bg-orange-500 text-white shadow-xl shadow-orange-100' 
                : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
              }`}
            >
              <span className={activeCategory === cat ? 'opacity-100' : 'opacity-40'}>
                {cat === 'All Items' ? <Search size={14} /> : (categoryIconMap[cat.toLowerCase()] || '🍽️')}
              </span>
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid - Matching Screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <AnimatePresence mode="wait">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                id={`item-${item.name.replace(/\s+/g, '-').toLowerCase()}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onClick={() => {
                  setSelectedItem(item);
                  setIsModalOpen(true);
                }}
                className="bg-surface rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl shadow-gray-100/50 hover:shadow-orange-100/50 transition-all duration-500 border border-transparent hover:border-orange-100 group cursor-pointer"
              >
                {/* Premium Food Image - Matching SS Style */}
                <div className="h-48 md:h-56 overflow-hidden relative bg-slate-50 flex items-center justify-center">
                  {getImageUrl(item.image).length > 2 ? (
                    <img 
                      src={getImageUrl(item.image)} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" 
                    />
                  ) : (
                    <span className="text-6xl">{getImageUrl(item.image)}</span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>
                
                <div className="p-6 md:p-8">
                  <h3 className="text-base md:text-lg font-black text-[#2a2a2a] mb-2 leading-tight group-hover:text-orange-500 transition-colors">{item.name}</h3>
                  <p className="text-[10px] md:text-xs text-gray-400 font-medium leading-relaxed mb-4 md:mb-6 overflow-hidden line-clamp-4">
                    {item.description || 'Freshly prepared with premium ingredients.'}
                  </p>
                  <p className="text-base md:text-lg font-black text-orange-500 tracking-tight">
                    {typeof item.price === 'string' ? item.price : `Rp ${parseFloat(item.price).toLocaleString()}`}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-16 md:mt-24 text-center">
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-4">Visit us to order</p>
          <p className="text-xs md:text-sm font-black text-gray-400 uppercase tracking-tighter">Gila House Restaurant & Bar</p>
        </div>
      </main>

      {/* Choice Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 relative p-6 md:p-8 z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all"
              >
                <X size={18} />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <span className="text-3xl mb-2 inline-block">🍽️</span>
                <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">
                  Ready to Order?
                </h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed px-2">
                  To order {selectedItem ? <span className="text-orange-500 font-bold">"{selectedItem.name}"</span> : "items"}, please select your booking type below.
                </p>
              </div>

              {/* Options Grid */}
              <div className="space-y-4">
                {/* Room Booking */}
                <Link
                  to="/checkin"
                  onClick={() => {
                    if (selectedItem) {
                      localStorage.setItem('pending_order_item', JSON.stringify(selectedItem));
                    }
                  }}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all group cursor-pointer text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 shrink-0 group-hover:scale-110 transition-transform">
                    <Building size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-black text-slate-800 group-hover:text-orange-500 transition-colors">
                      Booking Room
                    </h4>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5 leading-snug">
                      Staying with us? Enter room details to order food directly to your room.
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                </Link>

                {/* Table Reservation */}
                <Link
                  to="/book"
                  className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all group cursor-pointer text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 shrink-0 group-hover:scale-110 transition-transform">
                    <Calendar size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-black text-slate-800 group-hover:text-orange-500 transition-colors">
                      Reservation Table
                    </h4>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5 leading-snug">
                      Visiting for a meal? Reserve your table to order at the restaurant.
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                </Link>
              </div>

              {/* Footer info */}
              <div className="mt-6 text-center">
                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">
                  Gila House Restaurant & Bar
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Footer Nav (Optional but nice) */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface/80 backdrop-blur-xl border border-gray-100 rounded-full py-3 px-8 shadow-2xl z-50 flex items-center gap-8">
         <Link to="/" className="text-gray-400"><X size={20} /></Link>
         <Link to="/menu" className="text-orange-500 font-black text-xs uppercase tracking-widest">Menu</Link>
         <Link to="/excursions" className="text-gray-400 font-black text-xs uppercase tracking-widest">Tours</Link>
      </div>
    </div>
  );
};

export default DigitalMenu;
