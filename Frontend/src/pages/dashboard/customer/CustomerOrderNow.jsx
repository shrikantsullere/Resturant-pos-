import { formatCurrency } from '../../../utils/currencyUtils';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, 
  ChevronLeft, 
  Heart, 
  Plus, 
  Star, 
  Sparkles,
  UtensilsCrossed,
  X,
  Minus,
  Check,
  ShoppingBag,
  Trash2,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { cn } from "../../../utils/cn";
import { useMenu } from "../../../context/MenuContext";
import { useCustomer } from "../../../context/CustomerContext";
import { useOrders } from "../../../context/OrdersContext";
import { useHospitality } from "../../../context/HospitalityContext";
import { useLocation, useNavigate } from 'react-router-dom';
import { getImageUrl } from "../../../utils/imageUtils";

const CartSummary = ({ 
  isMobile = false, 
  cartItems, 
  clearCart, 
  removeFromCart, 
  updateCartQuantity, 
  subtotal, 
  tax, 
  serviceCharge, 
  total, 
  onCheckout 
}) => (
  <div className="flex flex-col h-full bg-surface p-5 lg:p-6">
     <div className="flex items-center justify-between mb-4 lg:mb-6 shrink-0">
        <div>
          <h3 className="text-lg lg:text-xl font-black text-text-primary uppercase tracking-tight flex items-center gap-2 lg:gap-3">
             <ShoppingBag className="w-5 h-5 lg:w-6 lg:h-6 text-primary" /> Your Cart
          </h3>
          <span className="text-[9px] lg:text-[10px] font-black text-primary bg-primary/5 px-2.5 lg:px-3 py-1 rounded-lg uppercase tracking-widest mt-1.5 lg:mt-2 inline-block">{cartItems.length} Items</span>
        </div>
        {cartItems.length > 0 && (
          <button 
            onClick={clearCart}
            className="p-2 text-slate-300 hover:text-primary transition-colors"
            title="Clear Cart"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
     </div>

     {cartItems.length === 0 ? (
       <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-100 rounded-[2rem]">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
             <ShoppingBag className="w-8 h-8 text-slate-200" />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cart is empty</p>
       </div>
     ) : (
       <>
         <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4 mb-6 pr-1">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 p-3 bg-slate-50 rounded-2xl group relative border border-transparent hover:border-primary/10 transition-all">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-surface rounded-xl flex items-center justify-center overflow-hidden shadow-sm shrink-0 relative">
                     {getImageUrl(item.image).length > 2 && !getImageUrl(item.image).includes('🍽️') ? (
                        <>
                           <img src={getImageUrl(item.image)} alt="" className="absolute inset-0 w-full h-full object-cover blur-md opacity-30 scale-150" />
                           <img src={getImageUrl(item.image)} alt={item.name} className="relative z-10 w-full h-full object-contain p-1" />
                        </>
                     ) : (
                        <span className="text-2xl">{getImageUrl(item.image)}</span>
                     )}
                  </div>
                 <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                       <div className="flex justify-between items-start gap-2">
                          <h4 className="text-[11px] font-black text-text-primary uppercase truncate flex-1">{item.name}</h4>
                          <button onClick={() => removeFromCart(item.id)} className="p-1 text-slate-300 hover:text-primary transition-colors shrink-0">
                             <Trash2 className="w-3.5 h-3.5" />
                          </button>
                       </div>
                       <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[8px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-md uppercase tracking-widest">{item.size}</span>
                       </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                       <p className="text-xs font-black text-text-primary tracking-tighter">{formatCurrency(item.price * item.quantity)}</p>
                       <div className="flex items-center gap-3 bg-surface px-2 py-1.5 rounded-xl shadow-sm border border-slate-100">
                          <button onClick={() => updateCartQuantity(item.id, -1)} className="text-slate-400 hover:text-primary transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                          <span className="text-[10px] font-black w-3 text-center">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.id, 1)} className="text-slate-400 hover:text-primary transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                       </div>
                    </div>
                 </div>
              </div>
            ))}
         </div>

         <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="space-y-2">
               <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-text-primary font-black">{formatCurrency(subtotal.toFixed(0))}</span>
               </div>
               <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>GST (5%)</span>
                  <span className="text-emerald-500 font-black">{formatCurrency(tax.toFixed(0))}</span>
               </div>
               <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>Service Fee</span>
                  <span className="text-text-primary font-black">{formatCurrency(serviceCharge)}</span>
               </div>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
               <span className="text-xs font-black text-text-primary uppercase tracking-tight">Total Payable</span>
               <span className="text-2xl font-black text-primary tracking-tighter">{formatCurrency(total.toFixed(0))}</span>
            </div>
            <button 
              onClick={onCheckout}
              className="w-full btn-primary py-4 rounded-full flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all group"
            >
              Checkout <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
         </div>
       </>
     )}
  </div>
);

const CustomerOrderNow = () => {
  const { items, categoriesList } = useMenu();
  const { 
    cartItems, addToCart, removeFromCart, updateCartQuantity, clearCart, 
    favorites, toggleFavorite, profile, appliedCoupon 
  } = useCustomer();
  const { addOrder } = useOrders();
  const { reservations, addToFolio } = useHospitality();
  const location = useLocation();
  const navigate = useNavigate();

  // Check for active room service eligibility
  const activeStay = reservations.find(r => r.guestName === profile.name && r.status === 'Checked In');
  const isRoomService = !!activeStay;
  
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || 'All';

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);

  // Modal State for Customization
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  const filteredItems = items.filter(item => {
    const itemName = item.name || item.item_name || '';
    const itemDesc = item.description || '';
    const matchesCategory = activeCategory === 'All' || activeCategory === 'All Items' || item.category === activeCategory || item.category_name === activeCategory;
    const matchesSearch = itemName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          itemDesc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleToggleFavorite = (id, e) => {
    e.stopPropagation();
    toggleFavorite(id);
  };

  const openItemModal = (item) => {
    setSelectedItem(item);
    setSelectedSize(item.sizes ? item.sizes[0] : { name: 'Regular', price: item.price });
    setQuantity(1);
    setNotes('');
    setShowItemModal(true);
  };

  const handleAddToCartAction = () => {
    if (!selectedSize) {
      alert('Please select a size first');
      return;
    }
    addToCart(selectedItem, selectedSize, quantity, notes);
    setShowItemModal(false);
  };


  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05;
  const serviceCharge = cartItems.length > 0 ? 25 : 0;
  const total = subtotal + tax + serviceCharge;

  const handleFinalPlaceOrder = async (method) => {
    setPaymentProcessing(true);
    
    try {
      const extraData = {
        userId: profile?.id,
        tableId: isRoomService ? activeStay.targetId : (profile?.tableId !== '-' ? profile?.tableId : null),
        type: isRoomService ? 'Room Service' : profile?.diningType,
        total: total,
        tax: tax,
        serviceFee: serviceCharge,
        paymentStatus: method === 'Pay at Counter' ? 'pending' : 'paid',
        paymentMethod: method
      };
      
      const placedOrder = await addOrder(cartItems, extraData);
      
      if (isRoomService && profile?.name) {
        await addToFolio(profile.name, {
          description: `Room Service: Order ${placedOrder.id || 'N/A'}`,
          amount: total,
          date: new Date().toLocaleDateString(),
          type: 'Food'
        });
      }

      setPaymentProcessing(false);
      setShowPaymentModal(false);
      setShowMobileCart(false);
      clearCart();
      navigate('/customer/orders');
    } catch (error) {
      console.error('Order placement failed:', error);
      alert('Failed to place order. Please try again.');
      setPaymentProcessing(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] lg:h-full relative pb-24 lg:pb-0">
      <div className="flex flex-col gap-6 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
           <div className="shrink-0">
              <h2 className="text-2xl lg:text-3xl font-black text-text-primary uppercase tracking-tight leading-none italic">Order <span className="text-primary">Now</span></h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 bg-slate-100 w-fit px-2 py-1 rounded-md">{profile.diningType} • Table {profile.tableId}</p>
           </div>
           <div className="flex-1 max-w-lg relative group w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food items..." 
                className="w-full pl-11 pr-5 py-3 lg:py-3.5 bg-surface border border-slate-100 rounded-2xl outline-none shadow-sm text-xs font-bold focus:ring-4 focus:ring-primary/5 transition-all"
              />
           </div>
        </div>

        {/* Categories Scroller - Fixed Sticky Top to match Layout Header */}
      <div className="sticky top-16 lg:top-0 z-[110] bg-background/95 backdrop-blur-md -mx-4 px-4 py-3 lg:py-4 border-b border-slate-100">
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide shrink-0">
          {categoriesList.map((cat) => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-5 lg:px-6 py-2 lg:py-2.5 rounded-xl lg:rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 active:scale-95",
                activeCategory === cat 
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105" 
                  : "bg-surface text-text-secondary border-transparent hover:bg-slate-50 hover:border-slate-100"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1">
        {/* Main Menu Grid */}
        <div className="w-full space-y-6 lg:space-y-8">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 lg:gap-6 pb-20">
            {filteredItems.map((item) => (
              <div 
                  key={item.id} 
                  onClick={() => openItemModal(item)}
                  className="card group cursor-pointer border-none shadow-xl shadow-slate-100/50 p-4 lg:p-5 bg-surface hover:bg-slate-50 transition-all active:scale-95 flex flex-col relative overflow-hidden aspect-[1/1.1] sm:aspect-[1/1.2]"
                >
                    <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
                       <div className="w-3.5 h-3.5 border-2 border-white rounded-sm flex items-center justify-center bg-surface shadow-sm">
                         <div className={cn("w-1.5 h-1.5 rounded-full", item.id % 2 === 0 ? "bg-primary" : "bg-emerald-500")} />
                       </div>
                       {!!item.popular && (
                         <div className="bg-primary text-white text-[7px] font-black uppercase px-2 py-0.5 rounded-full shadow-lg shadow-primary/20 flex items-center gap-1">
                            <Sparkles className="w-2 h-2" /> Popular
                         </div>
                       )}
                    </div>
                    <div className="flex-1 min-h-0 bg-slate-50 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center mb-4 shadow-inner relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
                       {item.image && item.image.length > 2 ? (
                          <img src={getImageUrl(item.image)} alt={item.name} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x400/f8fafc/94a3b8?text=Food' }} className="absolute inset-0 w-full h-full object-cover" />
                       ) : (
                          <span className="text-5xl sm:text-6xl">{getImageUrl(item.image)}</span>
                       )}
                    </div>
                    <div className="space-y-1 mb-2">
                      <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1">
                             <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                             <span className="text-[10px] font-black text-text-primary">{item.rating || '4.8'}</span>
                             <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">(120+ Reviews)</span>
                          </div>
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{item.category}</span>
                       </div>
                       <h4 className="font-black text-slate-900 text-xs lg:text-sm uppercase tracking-tight leading-tight group-hover:text-primary transition-colors mb-1 break-words">
                          {item.name || item.item_name || "Unnamed Item"}
                       </h4>
                       <p className="text-[10px] font-medium text-slate-500 line-clamp-3 leading-relaxed min-h-[30px]">
                          {item.description || "Freshly prepared with premium ingredients."}
                       </p>
                   </div>
                   <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between shrink-0">
                       <p className="text-lg lg:text-xl font-black text-text-primary tracking-tighter">{formatCurrency(item.price)}</p>
                       <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => handleToggleFavorite(item.id, e)}
                            className={cn(
                              "w-9 h-9 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center transition-all active:scale-95",
                              favorites.includes(item.id) ? "bg-primary text-white shadow-lg shadow-rose-200" : "bg-slate-100 text-slate-400 hover:text-primary"
                            )}
                          >
                             <Heart className={cn("w-4 h-4", favorites.includes(item.id) && "fill-current")} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); openItemModal(item); }}
                            className="w-9 h-9 lg:w-10 lg:h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                          >
                             <Plus className="w-5 h-5" />
                          </button>
                       </div>
                    </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Cart Toggle & Slide-up removed - now in Header */}




      {/* Customization Modal */}
      {showItemModal && selectedItem && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-0 sm:p-4">
          <div onClick={() => setShowItemModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-surface rounded-t-[2.5rem] sm:rounded-[2.5rem] lg:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] animate-in fade-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 sm:zoom-in-95 duration-300 self-end sm:self-center">
             <div className="relative h-40 sm:h-48 lg:h-56 bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                {selectedItem.image && selectedItem.image.length > 2 ? (
                   <>
                      <img src={getImageUrl(selectedItem.image)} alt={selectedItem.name} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x400/f8fafc/94a3b8?text=Food' }} className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-15" />
                   </>
                ) : (
                   <span className="text-5xl lg:text-7xl">{getImageUrl(selectedItem.image)}</span>
                )}
                <button onClick={() => setShowItemModal(false)} className="absolute top-4 lg:top-6 right-4 lg:right-6 p-2 lg:p-3 bg-surface/80 backdrop-blur-md rounded-2xl text-slate-400 hover:text-primary shadow-xl transition-all z-30">
                   <X className="w-5 h-5 lg:w-6 lg:h-6" />
                </button>
             </div>
             <div className="p-5 sm:p-8 lg:p-10 space-y-6 lg:space-y-8 overflow-y-auto scrollbar-hide">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3 sm:gap-4">
                   <div>
                      <div className="flex items-center gap-2 mb-2">
                         <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest rounded-md">{selectedItem.category || selectedItem.category_name}</span>
                         <div className="flex items-center gap-1 text-[9px] font-black text-yellow-500 uppercase">
                            <Star className="w-3 h-3 fill-current" /> 4.8 Ratings
                         </div>
                      </div>
                      <h3 className="text-xl lg:text-2xl font-black text-text-primary uppercase tracking-tight leading-tight">{selectedItem.name || selectedItem.item_name}</h3>
                   </div>
                   <div className="sm:text-right shrink-0">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Total</p>
                      <p className="text-xl lg:text-2xl font-black text-primary tracking-tighter">{formatCurrency(selectedSize?.price * quantity)}</p>
                   </div>
                </div>

                {selectedItem.sizes && (
                  <div className="space-y-4">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Choose Size</p>
                     <div className="flex flex-wrap gap-3">
                        {selectedItem.sizes.map(size => (
                          <button 
                            key={size.name}
                            onClick={() => setSelectedSize(size)}
                            className={cn(
                              "flex-1 min-w-[100px] px-4 py-3.5 sm:py-3 rounded-2xl border-2 transition-all text-center",
                              selectedSize?.name === size.name 
                              ? "bg-primary/5 border-primary text-primary" 
                              : "bg-surface border-slate-100 text-slate-400"
                            )}
                          >
                             <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{size.name}</p>
                             <p className="text-xs font-bold">{formatCurrency(size.price)}</p>
                          </button>
                        ))}
                     </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quantity</p>
                      <div className="flex items-center gap-6 p-2 bg-slate-50 rounded-2xl w-fit">
                         <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center text-slate-400 hover:text-primary shadow-sm"><Minus className="w-4 h-4" /></button>
                         <span className="text-lg font-black text-text-primary">{quantity}</span>
                         <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center text-slate-400 hover:text-primary shadow-sm"><Plus className="w-4 h-4" /></button>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Special Instructions</p>
                      <input 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any requests?" 
                        className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl text-xs font-bold outline-none border-2 border-transparent focus:border-primary/20"
                      />
                   </div>
                </div>

                <button 
                  onClick={handleAddToCartAction}
                  className="w-full btn-primary py-4 lg:py-5 rounded-full lg:rounded-3xl flex items-center justify-center gap-3 text-[10px] sm:text-[11px] lg:text-sm font-black uppercase tracking-[0.1em] shadow-2xl shadow-primary/30 active:scale-95 transition-all shrink-0"
                >
                   <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> Add to Order
                </button>
             </div>
          </div>
        </div>,
        document.body
      )}

      {/* Payment Modal */}
      {showPaymentModal && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-0 sm:p-4">
           <div onClick={() => !paymentProcessing && setShowPaymentModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
           <div className="relative w-full max-w-md bg-surface rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 sm:zoom-in-95 duration-300 self-end sm:self-center">
              <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                 <div>
                    <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight">Complete Payment</h3>
                    <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 text-primary">Secure Transaction Gateway</p>
                 </div>
                 {!paymentProcessing && <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-surface rounded-xl transition-all shadow-sm"><X className="w-5 h-5" /></button>}
              </div>

              <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto scrollbar-hide">
                 {paymentProcessing ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                       <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                       <div>
                          <p className="text-sm font-black uppercase tracking-tight">Processing Payment...</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">Please do not refresh or close the page</p>
                       </div>
                    </div>
                 ) : (
                   <>
                    <div className="bg-primary/5 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-primary/10 flex items-center justify-between">
                       <div>
                          <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Total Amount</p>
                          <p className="text-2xl sm:text-3xl font-black text-text-primary tracking-tighter">{formatCurrency(total.toFixed(0))}</p>
                       </div>
                       <div className="w-12 h-12 bg-surface rounded-2xl flex items-center justify-center shadow-sm text-primary">
                          <ShoppingBag className="w-6 h-6" />
                       </div>
                    </div>

                    <div className="space-y-3">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Payment Method</p>
                       
                       <button 
                         onClick={() => setSelectedPaymentMethod('UPI')}
                         className={cn(
                           "w-full p-4 sm:p-5 rounded-2xl border-2 flex items-center justify-between transition-all group",
                           selectedPaymentMethod === 'UPI' ? "bg-primary border-primary text-white shadow-xl shadow-primary/20" : "bg-slate-50 border-transparent text-text-primary hover:border-primary/20"
                         )}
                       >
                          <div className="flex items-center gap-4">
                             <div className={cn("w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center", selectedPaymentMethod === 'UPI' ? "bg-surface/20" : "bg-surface shadow-sm text-primary")}>
                                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                             </div>
                             <div className="text-left">
                                <p className="text-[11px] sm:text-xs font-black uppercase tracking-tight">UPI / QR Code</p>
                                <p className={cn("text-[8px] font-bold uppercase tracking-widest mt-0.5", selectedPaymentMethod === 'UPI' ? "text-white/60" : "text-slate-400")}>Instant settlement</p>
                             </div>
                          </div>
                          {selectedPaymentMethod === 'UPI' && <Check className="w-4 h-4 sm:w-5 sm:h-5" />}
                       </button>

                       <button 
                         onClick={() => setSelectedPaymentMethod('Card')}
                         className={cn(
                           "w-full p-4 sm:p-5 rounded-2xl border-2 flex items-center justify-between transition-all group",
                           selectedPaymentMethod === 'Card' ? "bg-primary border-primary text-white shadow-xl shadow-primary/20" : "bg-slate-50 border-transparent text-text-primary hover:border-primary/20"
                         )}
                       >
                          <div className="flex items-center gap-4">
                             <div className={cn("w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center", selectedPaymentMethod === 'Card' ? "bg-surface/20" : "bg-surface shadow-sm text-primary")}>
                                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                             </div>
                             <div className="text-left">
                                <p className="text-[11px] sm:text-xs font-black uppercase tracking-tight">Credit / Debit Card</p>
                                <p className={cn("text-[8px] font-bold uppercase tracking-widest mt-0.5", selectedPaymentMethod === 'Card' ? "text-white/60" : "text-slate-400")}>Safe & Secure</p>
                             </div>
                          </div>
                          {selectedPaymentMethod === 'Card' && <Check className="w-4 h-4 sm:w-5 sm:h-5" />}
                       </button>

                       <button 
                         onClick={() => setSelectedPaymentMethod('Pay at Counter')}
                         className={cn(
                           "w-full p-4 sm:p-5 rounded-2xl border-2 flex items-center justify-between transition-all group",
                           selectedPaymentMethod === 'Pay at Counter' ? "bg-primary border-primary text-white shadow-xl shadow-primary/20" : "bg-slate-50 border-transparent text-text-primary hover:border-primary/20"
                         )}
                       >
                          <div className="flex items-center gap-4">
                             <div className={cn("w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center", selectedPaymentMethod === 'Pay at Counter' ? "bg-surface/20" : "bg-surface shadow-sm text-primary")}>
                                <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5" />
                             </div>
                             <div className="text-left">
                                <p className="text-[11px] sm:text-xs font-black uppercase tracking-tight">Pay at Counter</p>
                                <p className={cn("text-[8px] font-bold uppercase tracking-widest mt-0.5", selectedPaymentMethod === 'Pay at Counter' ? "text-white/60" : "text-slate-400")}>Cash or Physical terminal</p>
                             </div>
                          </div>
                          {selectedPaymentMethod === 'Pay at Counter' && <Check className="w-4 h-4 sm:w-5 sm:h-5" />}
                       </button>
                    </div>

                    <button 
                      disabled={!selectedPaymentMethod}
                      onClick={() => handleFinalPlaceOrder(selectedPaymentMethod)}
                      className="w-full py-4 sm:py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-900/20 active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4"
                    >
                       {selectedPaymentMethod === 'Pay at Counter' ? 'Confirm Order' : 'Pay & Place Order'}
                       <ArrowRight className="w-4 h-4" />
                    </button>
                   </>
                 )}
              </div>
           </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CustomerOrderNow;
