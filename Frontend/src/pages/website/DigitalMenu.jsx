import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Search, Menu as MenuIcon, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  { id: 'Breakfast', name: 'Breakfast', icon: '🍳' },
  { id: 'Lunch', name: 'Lunch', icon: '🥗' },
  { id: 'Dinner', name: 'Dinner', icon: '🍽️' },
  { id: 'Bar', name: 'Bar', icon: '🍹' },
];

const menuData = {
  Breakfast: [
    { id: 1, name: 'Full English Breakfast', desc: 'Eggs, bacon, sausage, baked beans, toast', price: 'Rp 65.000', img: 'english_breakfast_menu_1778237603520.png' },
    { id: 2, name: 'Nasi Goreng Kampung', desc: 'Traditional Indonesian fried rice with egg & sambal', price: 'Rp 45.000', img: 'nasi_goreng_menu_1778237672701.png' },
    { id: 3, name: 'Pancakes with Maple Syrup', desc: 'Fluffy pancakes served with butter and maple syrup', price: 'Rp 55.000', img: 'pancakes_maple_syrup_1778237620802.png' },
    { id: 4, name: 'Fresh Fruit Platter', desc: 'Seasonal tropical fruits — mango, papaya, pineapple', price: 'Rp 35.000', img: 'dessert_featured_1778218675867.png' },
    { id: 5, name: 'Avocado Toast', desc: 'Sourdough, smashed avocado, poached egg, chili flakes', price: 'Rp 60.000', img: 'avocado_toast_menu_1778237638446.png' },
    { id: 6, name: 'Açai Bowl', desc: 'Açai blend, banana, honey, coconut flakes', price: 'Rp 70.000', img: 'acai_bowl_menu_1778237657529.png' },
  ],
  Lunch: [
    { id: 7, name: 'Wagyu Burger', desc: 'Premium wagyu beef, truffle mayo, caramelized onions', price: 'Rp 120.000', img: 'burger_featured_1778218636790.png' },
    { id: 8, name: 'Grilled Chicken Caesar', desc: 'Romaine lettuce, parmesan, garlic croutons', price: 'Rp 85.000', img: 'pasta_featured_1778218655333.png' },
  ],
  Dinner: [
    { id: 9, name: 'Ribeye Steak', desc: '250g Australian ribeye, garlic butter, potato wedges', price: 'Rp 245.000', img: 'pizza_featured_1778218619659.png' },
    { id: 10, name: 'Seafood Pasta', desc: 'Fresh prawns, clams, squid in spicy tomato sauce', price: 'Rp 115.000', img: 'pasta_featured_1778218655333.png' },
  ],
  Bar: [
    { id: 11, name: 'Classic Mojito', desc: 'White rum, fresh mint, lime, soda', price: 'Rp 95.000', img: 'drinks_featured_1778218694577.png' },
    { id: 12, name: 'Craft IPA', desc: 'Local craft beer with citrus notes', price: 'Rp 75.000', img: 'drinks_featured_1778218694577.png' },
  ]
};

const DigitalMenu = () => {
  const [activeCategory, setActiveCategory] = useState('Breakfast');

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
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-all shrink-0 ${
                activeCategory === cat.id 
                ? 'bg-orange-500 text-white shadow-xl shadow-orange-100' 
                : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
              }`}
            >
              <span className={activeCategory === cat.id ? 'opacity-100' : 'opacity-40'}>{cat.id === 'Breakfast' ? <Search size={14} /> : cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Grid - Matching Screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <AnimatePresence mode="wait">
            {menuData[activeCategory].map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-surface rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl shadow-gray-100/50 hover:shadow-orange-100/50 transition-all duration-500 border border-transparent hover:border-orange-100 group cursor-pointer"
              >
                {/* Premium Food Image - Matching SS Style */}
                <div className="h-48 md:h-56 overflow-hidden relative">
                   <img 
                     src={item.img} 
                     alt={item.name} 
                     className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" 
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>
                
                <div className="p-6 md:p-8">
                  <h3 className="text-base md:text-lg font-black text-[#2a2a2a] mb-2 leading-tight group-hover:text-orange-500 transition-colors">{item.name}</h3>
                  <p className="text-[10px] md:text-xs text-gray-400 font-medium leading-relaxed mb-4 md:mb-6 overflow-hidden line-clamp-4">
                    {item.desc}
                  </p>
                  <p className="text-base md:text-lg font-black text-orange-500 tracking-tight">
                    {item.price}
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
