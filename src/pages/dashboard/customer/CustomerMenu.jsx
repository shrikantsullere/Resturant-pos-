import { formatCurrency } from '../../../utils/currencyUtils';
import { useState } from 'react';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  Heart, 
  Plus, 
  Star, 
  Sparkles,
  UtensilsCrossed,
  X,
  Minus,
  Check,
  ShoppingBag
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useMenu } from '@/context/MenuContext';
import { useCustomer } from '@/context/CustomerContext';
import { useLocation, useNavigate } from 'react-router-dom';

const CustomerMenu = () => {
  const { items, categoriesList } = useMenu();
  const { addToCart, toggleFavorite, favorites } = useCustomer();
  const location = useLocation();
  const navigate = useNavigate();
  
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || 'All Items';

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [toast, setToast] = useState(null);

  // Modal State
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const showFeedback = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const openItemModal = (item) => {
    setSelectedItem(item);
    setSelectedSize(item.sizes ? item.sizes[0] : { name: 'Regular', price: item.price });
    setQuantity(1);
    setNotes('');
    setShowItemModal(true);
  };

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addToCart(selectedItem, selectedSize, quantity, notes);
    setShowItemModal(false);
    showFeedback(`${selectedItem.name} added to cart!`);
  };

  const handleToggleFavorite = (id, e) => {
    e.stopPropagation();
    toggleFavorite(id);
  };

  return (
    <div className="flex flex-col h-full gap-6 relative">
      {/* Toast Feedback */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[400] px-6 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl font-black text-[10px] uppercase tracking-widest border border-white/10 animate-in fade-in slide-in-from-top-4">
           {toast}
        </div>
      )}

      {/* Search & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1 shrink-0">
        <div className="flex items-center gap-3">
           <button onClick={() => navigate(-1)} className="p-2.5 bg-surface rounded-xl shadow-sm border border-slate-100 lg:hidden">
              <ChevronLeft className="w-5 h-5 text-text-primary" />
           </button>
           <h2 className="text-xl lg:text-2xl font-black text-text-primary uppercase tracking-tight leading-none">The Menu</h2>
        </div>
        <div className="flex-1 max-w-md relative group">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
           <input 
             type="text" 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             placeholder="Search your favorites..." 
             className="w-full pl-11 pr-5 py-3 bg-surface border border-slate-100 rounded-xl lg:rounded-2xl outline-none shadow-sm text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all"
           />
        </div>
      </div>

      {/* Categories Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1 shrink-0">
        {categoriesList.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-6 lg:px-8 py-2.5 rounded-xl text-[10px] lg:text-[11px] font-black uppercase tracking-widest border-2 whitespace-nowrap transition-all",
              activeCategory === cat 
              ? "bg-primary text-white border-primary shadow-xl shadow-primary/20" 
              : "bg-surface text-text-secondary border-transparent hover:border-primary/20 hover:bg-slate-50"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pr-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 pb-20 lg:pb-10">
          {filteredItems.map(item => (
            <div 
              key={item.id} 
              onClick={() => openItemModal(item)}
              className="card group cursor-pointer border-none shadow-xl shadow-slate-100/50 p-4 lg:p-5 bg-surface hover:bg-slate-50 transition-all flex flex-col h-full relative overflow-hidden"
            >
              {/* Veg/Non-Veg Badge */}
              <div className="absolute top-4 left-4 z-10 w-4 h-4 border-2 border-slate-200 rounded-sm flex items-center justify-center bg-surface">
                <div className={cn("w-2 h-2 rounded-full", item.id % 2 === 0 ? "bg-primary" : "bg-emerald-500")} />
              </div>

              <div className="h-40 lg:h-48 bg-slate-50 rounded-[2rem] flex items-center justify-center text-6xl mb-5 shadow-inner relative group-hover:scale-[1.02] transition-transform duration-500">
                 {item.image}
                 <button 
                   onClick={(e) => handleToggleFavorite(item.id, e)}
                   className={cn(
                     "absolute top-4 right-4 p-2.5 rounded-xl shadow-lg transition-all active:scale-90",
                     favorites.includes(item.id) ? "bg-primary text-white shadow-rose-200" : "bg-surface/90 text-slate-300 hover:text-primary"
                   )}
                 >
                    <Heart className={cn("w-4 h-4", favorites.includes(item.id) && "fill-current")} />
                 </button>
              </div>
              
              <div className="flex-1 space-y-1.5 px-1">
                <div className="flex items-center gap-1.5 mb-2">
                   <div className="flex items-center gap-1 px-1.5 py-0.5 bg-yellow-50 rounded-md">
                      <Star className="w-2.5 h-2.5 fill-yellow-500 text-yellow-500" />
                      <span className="text-[9px] font-black text-yellow-700 uppercase">4.8</span>
                   </div>
                   <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">• {item.category}</span>
                </div>
                <h4 className="font-black text-text-primary text-sm lg:text-base uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">{item.name}</h4>
                <p className="text-[10px] font-medium text-slate-400 line-clamp-2 leading-relaxed">{item.description}</p>
              </div>

              <div className="mt-5 flex items-center justify-between px-1">
                <div>
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Price</p>
                   <p className="text-base lg:text-xl font-black text-text-primary tracking-tighter">{formatCurrency(item.price)}</p>
                </div>
                <button 
                  className="w-10 h-10 lg:w-12 lg:h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                >
                   <Plus className="w-6 h-6" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Item Detail Modal */}
      {showItemModal && selectedItem && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <div 
            onClick={() => setShowItemModal(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-lg bg-surface rounded-[2rem] lg:rounded-[3rem] shadow-2xl overflow-hidden self-end lg:self-center flex flex-col max-h-[90vh] animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header / Image Area */}
            <div className="relative h-48 sm:h-56 lg:h-64 bg-slate-50 flex items-center justify-center text-7xl lg:text-9xl shrink-0">
               {selectedItem.image}
               <button 
                 onClick={() => setShowItemModal(false)}
                 className="absolute top-4 sm:top-6 right-4 sm:right-6 p-2.5 sm:p-3 bg-surface/80 backdrop-blur-md rounded-2xl text-slate-400 hover:text-primary shadow-xl transition-all active:scale-95"
               >
                 <X className="w-5 sm:w-6 h-5 sm:h-6" />
               </button>
            </div>

            <div className="p-6 lg:p-10 space-y-6 lg:space-y-8 overflow-y-auto scrollbar-hide">
               <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest rounded-md shrink-0">{selectedItem.category}</span>
                       <div className="flex items-center gap-1 text-[9px] font-black text-yellow-500 uppercase shrink-0">
                          <Star className="w-3 h-3 fill-current" /> 4.8 Ratings
                       </div>
                    </div>
                    <h3 className="text-xl lg:text-3xl font-black text-text-primary uppercase tracking-tight leading-none truncate">{selectedItem.name}</h3>
                    <p className="text-[11px] lg:text-sm text-slate-400 font-medium mt-2 lg:mt-3 leading-relaxed">{selectedItem.description}</p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <p className="text-[9px] lg:text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Total Price</p>
                    <p className="text-xl lg:text-3xl font-black text-primary tracking-tighter">{formatCurrency(selectedSize.price * quantity)}</p>
                  </div>
               </div>

               {/* Size Selector */}
               {selectedItem.sizes && (
                 <div className="space-y-3 lg:space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Size</p>
                    <div className="flex flex-wrap gap-2 lg:gap-3">
                       {selectedItem.sizes.map(size => (
                         <button 
                           key={size.name}
                           onClick={() => setSelectedSize(size)}
                           className={cn(
                             "flex-1 min-w-[70px] sm:min-w-[80px] px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl border-2 transition-all text-center",
                             selectedSize.name === size.name 
                             ? "bg-primary/5 border-primary text-primary shadow-lg shadow-primary/5" 
                             : "bg-surface border-slate-100 text-slate-400 hover:bg-slate-50"
                           )}
                         >
                            <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest leading-none mb-1">{size.name}</p>
                            <p className="text-xs font-bold leading-none">{formatCurrency(size.price)}</p>
                         </button>
                       ))}
                    </div>
                 </div>
               )}

               {/* Quantity & Instructions */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
                  <div className="space-y-3 lg:space-y-4">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Quantity</p>
                     <div className="flex items-center gap-4 lg:gap-6 p-2 bg-slate-50 rounded-2xl w-fit">
                        <button 
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-9 lg:w-10 h-9 lg:h-10 bg-surface rounded-xl flex items-center justify-center text-slate-400 hover:text-primary shadow-sm active:scale-90 transition-all"
                        >
                           <Minus className="w-4 lg:w-5 h-4 lg:h-5" />
                        </button>
                        <span className="text-base lg:text-lg font-black text-text-primary w-4 text-center">{quantity}</span>
                        <button 
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-9 lg:w-10 h-9 lg:h-10 bg-surface rounded-xl flex items-center justify-center text-slate-400 hover:text-primary shadow-sm active:scale-90 transition-all"
                        >
                           <Plus className="w-4 lg:w-5 h-4 lg:h-5" />
                        </button>
                     </div>
                  </div>
                  <div className="space-y-3 lg:space-y-4">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Special Instructions</p>
                     <input 
                       value={notes}
                       onChange={(e) => setNotes(e.target.value)}
                       placeholder="E.g. Extra spicy..." 
                       className="w-full px-4 lg:px-5 py-3 lg:py-3.5 bg-slate-50 rounded-xl lg:rounded-2xl text-[11px] lg:text-xs font-bold outline-none border-2 border-transparent focus:border-primary/20 transition-all"
                     />
                  </div>
               </div>
            </div>

            {/* Action Button */}
            <div className="p-6 lg:p-10 pt-0 shrink-0">
               <button 
                 onClick={handleAddToCart}
                 className="w-full btn-primary py-4 lg:py-5 rounded-full lg:rounded-3xl flex items-center justify-center gap-3 text-xs lg:text-sm font-black uppercase tracking-widest shadow-2xl shadow-primary/30 active:scale-95 transition-all group"
               >
                  <ShoppingBag className="w-5 h-5 group-hover:animate-bounce" /> Add to Order • {formatCurrency(selectedSize.price * quantity)}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerMenu;
