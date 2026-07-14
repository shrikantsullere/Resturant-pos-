import { formatCurrency } from '../../../utils/currencyUtils';
import React, { useState } from 'react';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ChevronLeft, 
  CreditCard, 
  Ticket,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Info,
  UtensilsCrossed,
  CheckCircle2
} from 'lucide-react';
import { cn } from "../../../utils/cn";
import { useNavigate } from 'react-router-dom';
import { useCustomer } from "../../../context/CustomerContext";
import { useOrders } from "../../../context/OrdersContext";
import { getImageUrl } from "../../../utils/imageUtils";

const CustomerCart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateCartQuantity, clearCart, profile, createSupportRequest } = useCustomer();
  const { addOrder } = useOrders();
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05; // 5% GST
  const serviceCharge = cartItems.length > 0 ? 25 : 0;
  const total = subtotal + tax + serviceCharge;

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    
    setIsOrdering(true);
    
    try {
      const extraData = {
        userId: profile?.id,
        tableId: profile?.tableId !== '-' ? profile?.tableId : null,
        type: profile?.diningType || 'dine-in',
        total: total,
        tax: tax,
        serviceFee: serviceCharge,
        paymentStatus: 'pending'
      };
      
      await addOrder(cartItems, extraData);
      
      clearCart();
      setIsOrdering(false);
      setOrderSuccess(true);
      
      // Navigate after success message
      setTimeout(() => navigate('/customer/orders'), 2000);
    } catch (error) {
      console.error('Order placement failed:', error);
      alert('Failed to place order. Please try again.');
      setIsOrdering(false);
    }
  };

  const handleCallWaiter = () => {
    createSupportRequest('Assistance', 'Guest requested assistance at table.');
    alert('Waiter notified! Someone will be with you shortly.');
  };

  if (orderSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center px-6 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-500 text-white rounded-[2.5rem] flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/20">
           <CheckCircle2 className="w-12 h-12 animate-bounce" />
        </div>
        <h2 className="text-3xl font-black text-text-primary uppercase tracking-tight">Order Placed!</h2>
        <p className="text-slate-400 font-medium mt-2 max-w-[280px] leading-relaxed">Your delicious meal is being prepared with love. Redirecting to tracker...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center px-6">
        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner">
           <ShoppingBag className="w-10 h-10 text-slate-200" />
        </div>
        <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight">Your cart is empty</h2>
        <p className="text-slate-400 font-medium mt-2 max-w-[250px] leading-relaxed">Looks like you haven't added anything to your cart yet.</p>
        <button 
          onClick={() => navigate('/customer/order-now')}
          className="mt-8 btn-primary px-10 py-4 rounded-full font-black uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all"
        >
           Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full gap-8">
      {/* Left Side: Cart Items */}
      <div className="flex-1 space-y-6 overflow-y-auto scrollbar-hide pb-20 lg:pb-10">
        <div className="flex items-center justify-between px-1">
           <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="p-2.5 bg-surface rounded-xl shadow-sm border border-slate-100 lg:hidden">
                 <ChevronLeft className="w-5 h-5 text-text-primary" />
              </button>
              <h2 className="text-xl lg:text-2xl font-black text-text-primary uppercase tracking-tight">Review Order</h2>
           </div>
           <p className="text-[10px] font-black text-primary uppercase tracking-widest px-3 py-1 bg-primary/5 rounded-lg">{cartItems.length} Items</p>
        </div>

        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="card p-4 lg:p-5 bg-surface border-none shadow-xl shadow-slate-100/50 flex gap-4 lg:gap-6 group transition-all hover:bg-slate-50">
               <div className="w-20 h-20 lg:w-24 lg:h-24 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-105 transition-transform overflow-hidden">
                  {item.image && item.image.length > 2 ? (
                    <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{getImageUrl(item.image)}</span>
                  )}
               </div>
               <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                       <h4 className="font-black text-text-primary text-sm lg:text-base uppercase tracking-tight leading-none mb-1 group-hover:text-primary transition-colors">{item.name}</h4>
                       <button 
                         onClick={() => removeFromCart(item.id)}
                         className="p-1.5 text-slate-300 hover:text-primary transition-colors"
                       >
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.size}</span>
                       {item.notes && (
                         <div className="flex items-center gap-1 text-[8px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            <Sparkles className="w-2.5 h-2.5" />
                            {item.notes}
                         </div>
                       )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                     <p className="font-black text-text-primary text-sm lg:text-lg tracking-tighter">{formatCurrency(item.price)}</p>
                     <div className="flex items-center gap-4 p-1.5 bg-surface border border-slate-100 rounded-xl shadow-sm">
                        <button 
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-primary active:scale-90"
                        >
                           <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-black text-text-primary w-2 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-primary active:scale-90"
                        >
                           <Plus className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          ))}
        </div>

        {/* Coupon Section */}
        <div className="card p-5 lg:p-6 bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-[2rem] flex items-center justify-between group cursor-pointer active:scale-[0.98] transition-all">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-surface rounded-xl shadow-sm flex items-center justify-center text-emerald-500">
                 <Ticket className="w-6 h-6" />
              </div>
              <div>
                 <h4 className="text-sm font-black text-emerald-900 uppercase tracking-tight leading-none">Apply Coupon</h4>
                 <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Unlock better deals!</p>
              </div>
           </div>
           <ChevronRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Right Side: Summary Card */}
      <div className="w-full lg:w-96 space-y-6">
        <div className="card p-6 lg:p-8 bg-surface border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] lg:rounded-[3rem] flex flex-col gap-8">
           <div>
              <h3 className="text-xl font-black text-text-primary uppercase tracking-tight mb-6 flex items-center gap-3">
                 <CreditCard className="w-6 h-6 text-primary" /> Bill Summary
              </h3>
              
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-xs lg:text-sm font-bold text-slate-400 uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span className="text-text-primary font-black">{formatCurrency(subtotal.toFixed(0))}</span>
                 </div>
                 <div className="flex justify-between items-center text-xs lg:text-sm font-bold text-slate-400 uppercase tracking-widest">
                    <span>GST (5%)</span>
                    <span className="text-emerald-500 font-black">{formatCurrency(tax.toFixed(0))}</span>
                 </div>
                 <div className="flex justify-between items-center text-xs lg:text-sm font-bold text-slate-400 uppercase tracking-widest">
                    <span>Service Fee</span>
                    <span className="text-text-primary font-black">{formatCurrency(serviceCharge)}</span>
                 </div>
                 <div className="h-px bg-slate-50 my-2" />
                 <div className="flex justify-between items-center">
                    <span className="text-sm lg:text-base font-black text-text-primary uppercase tracking-tight">Grand Total</span>
                    <span className="text-xl lg:text-3xl font-black text-primary tracking-tighter">{formatCurrency(total.toFixed(0))}</span>
                 </div>
              </div>
           </div>

           <div className="p-4 bg-slate-50 rounded-2xl flex items-start gap-3">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">By placing this order, you agree to our terms of service and payment policies.</p>
           </div>

           <button 
             onClick={handlePlaceOrder}
             disabled={isOrdering}
             className="w-full btn-primary py-4 lg:py-5 rounded-full lg:rounded-3xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest shadow-2xl shadow-primary/30 active:scale-95 transition-all group disabled:opacity-50"
           >
              {isOrdering ? 'Placing Order...' : 'Place Order'} 
              {!isOrdering && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
           </button>
        </div>

        {/* Need Help Card */}
        <div className="card p-6 bg-slate-900 text-white border-none rounded-[2rem] shadow-xl relative overflow-hidden group cursor-pointer" onClick={handleCallWaiter}>
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-2xl" />
           <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 bg-surface/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                 <UtensilsCrossed className="w-6 h-6" />
              </div>
              <div>
                 <h4 className="text-sm font-black uppercase tracking-tight leading-none">Call Waiter</h4>
                 <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">Assistance at {profile.diningType === 'Room Service' ? `Room ${profile.tableId}` : `Table ${profile.tableId}`}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerCart;
