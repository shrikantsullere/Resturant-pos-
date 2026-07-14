import { formatCurrency } from '../../../utils/currencyUtils';
import React from 'react';
import { Heart, ChevronLeft, ShoppingBag, Star, Sparkles, ChevronRight, X } from 'lucide-react';
import { cn } from "../../../utils/cn";
import { useNavigate } from 'react-router-dom';
import { useMenu } from "../../../context/MenuContext";
import { useCustomer } from "../../../context/CustomerContext";
import { getImageUrl } from "../../../utils/imageUtils";

const CustomerFavorites = () => {
  const navigate = useNavigate();
  const { items } = useMenu();
  const { favorites, toggleFavorite } = useCustomer();
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
             <div className="h-40 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 shadow-inner group-hover:scale-105 transition-transform relative overflow-hidden">
                {item.image && item.image.length > 2 ? (
                   <>
                      <img src={getImageUrl(item.image)} alt="" className="absolute inset-0 w-full h-full object-cover blur-xl opacity-20 scale-150" />
                      <img src={getImageUrl(item.image)} alt={item.name} className="relative z-10 w-full h-full object-contain p-4 lg:p-6" />
                   </>
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
                  onClick={() => navigate('/customer/order-now')}
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

const Plus = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-0h6m-6 0H6" /></svg>;

export default CustomerFavorites;
