import { formatCurrency } from '../../../utils/currencyUtils';
import React from 'react';
import { Heart, ChevronLeft, ShoppingBag, Star, Sparkles, ChevronRight, X, Plus } from 'lucide-react';
import { cn } from "../../../utils/cn";
import { useNavigate } from 'react-router-dom';
import { useMenu } from "../../../context/MenuContext";
import { useCustomer } from "../../../context/CustomerContext";
import { getImageUrl } from "../../../utils/imageUtils";

const CustomerFavorites = () => {
  const navigate = useNavigate();
  const { items } = useMenu();
  const { favorites, toggleFavorite, addToCart } = useCustomer();
  const favoriteItems = items.filter(item => favorites.includes(item.id));

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex items-center gap-3 px-1">
         <button onClick={() => navigate(-1)} className="p-2.5 bg-surface rounded-xl shadow-sm border border-slate-100 lg:hidden">
            <ChevronLeft className="w-5 h-5 text-text-primary" />
         </button>
         <h2 className="text-xl lg:text-2xl font-black text-text-primary uppercase tracking-tight">Your Favorites</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {favoriteItems.map(item => (
          <div key={item.id} className="card p-5 bg-surface border-none shadow-xl shadow-slate-100/50 group hover:bg-slate-50 transition-all flex flex-col h-full relative">
             <button 
               onClick={() => toggleFavorite(item.id)}
               className="absolute top-4 right-4 z-10 p-2 bg-primary text-white rounded-xl shadow-lg shadow-rose-200 active:scale-90 transition-all"
             >
                <Heart className="w-4 h-4 fill-current" />
             </button>
              <div className="h-40 overflow-hidden relative bg-slate-50 flex items-center justify-center rounded-2xl mb-4 shadow-inner">
                 {item.image && item.image.length > 2 ? (
                    <img 
                      src={getImageUrl(item.image)} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" 
                    />
                 ) : (
                    <span className="text-5xl sm:text-6xl">{getImageUrl(item.image)}</span>
                 )}
              </div>
             <div className="flex-1 space-y-1">
                <h4 className="font-black text-text-primary text-sm uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">{item.name}</h4>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</p>
             </div>
             <div className="mt-5 flex items-center justify-between">
                <p className="text-lg font-black text-text-primary tracking-tighter">{formatCurrency(item.price)}</p>
                 <button 
                   onClick={() => {
                     const defaultSize = item.sizes && item.sizes.length > 0 
                       ? item.sizes[0] 
                       : { name: 'Regular', price: item.price };
                     addToCart(item, defaultSize, 1, '');
                     navigate('/customer/cart');
                   }}
                   className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
                 >
                    <Plus className="w-5 h-5" />
                 </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerFavorites;
