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
  CheckCircle2,
  X,
  MapPin,
  Home
} from 'lucide-react';
import { cn } from "../../../utils/cn";
import { useNavigate } from 'react-router-dom';
import { useCustomer } from "../../../context/CustomerContext";
import { useOrders } from "@/context/OrdersContext";
import { getImageUrl } from "../../../utils/imageUtils";
import XenditPaymentModal from '../../../components/payment/XenditPaymentModal';
import { paymentApi } from '../../../services/payment.api';

const CustomerCart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateCartQuantity, clearCart, profile, createSupportRequest } = useCustomer();
  const { addOrder } = useOrders();
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationType, setLocationType] = useState(profile?.diningType === 'Room Service' ? 'room' : 'table');
  const [locationValue, setLocationValue] = useState(profile?.tableId && profile.tableId !== '-' ? profile.tableId : '');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Online');
  
  // Payment Modal States
  const [paymentModalProps, setPaymentModalProps] = useState({
    isOpen: false,
    invoiceUrl: null,
    paymentState: 'waiting',
    orderId: null
  });
  const [pollingInterval, setPollingInterval] = useState(null);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05; // 5% GST
  const serviceCharge = cartItems.length > 0 ? 25 : 0;
  const total = subtotal + tax + serviceCharge;

  const handlePlaceOrderClick = () => {
    if (cartItems.length === 0) return;
    setShowLocationModal(true);
  };

  const handleConfirmAndPlaceOrder = async () => {
    if (locationType !== 'bungkus' && !locationValue) {
      alert(`Please enter your ${locationType === 'room' ? 'Room' : 'Table'} number.`);
      return;
    }
    
    setIsOrdering(true);
    
    try {
      const extraData = {
        userId: profile?.id,
        tableId: locationType === 'bungkus' ? null : Number(locationValue),
        type: locationType === 'room' ? 'delivery' : locationType === 'bungkus' ? 'takeaway' : 'dine-in',
        total: total,
        tax: tax,
        serviceFee: serviceCharge,
        paymentStatus: 'pending',
        paymentMethod: selectedPaymentMethod === 'Online' ? 'Online Payment' : 'Card at Cashier'
      };
      
      const createdOrder = await addOrder(cartItems, extraData);
      
      if (selectedPaymentMethod === 'Online') {
        const orderIdStr = String(createdOrder?.id || createdOrder?.order_id || createdOrder?.insertId);
        
        // Open modal in loading state
        setShowLocationModal(false);
        setPaymentModalProps(prev => ({ ...prev, isOpen: true, paymentState: 'loading', orderId: orderIdStr }));

        const invoiceRes = await paymentApi.createInvoice({
          bookingId: orderIdStr,
          guestName: profile?.name || 'Walk-in Guest',
          email: profile?.email || 'guest@gilahouse.com',
          phone: profile?.phone || '0000000000',
          amount: total,
          description: `Online Order ${orderIdStr}`
        });

        if (invoiceRes.success && invoiceRes.invoiceUrl) {
          setPaymentModalProps(prev => ({
            ...prev,
            invoiceUrl: invoiceRes.invoiceUrl,
            paymentState: 'waiting'
          }));

          // Start Polling
          const interval = setInterval(async () => {
            try {
              const statusResponse = await paymentApi.getPaymentStatus(orderIdStr);
              if (statusResponse.data && statusResponse.data.status === 'PAID') {
                clearInterval(interval);
                setPaymentModalProps(prev => ({ ...prev, paymentState: 'success' }));
                clearCart();
              }
            } catch (err) {}
          }, 3000);
          setPollingInterval(interval);
        } else {
           alert('Failed to generate payment link. Proceeding to dashboard.');
           navigate('/customer/payments');
        }
        setIsOrdering(false);
      } else {
        clearCart();
        setIsOrdering(false);
        setShowLocationModal(false);
        setOrderSuccess(true);
        setTimeout(() => navigate('/customer/payments'), 2000);
      }
    } catch (error) {
      console.error('Order placement failed:', error);
      alert('Failed to place order. Please try again.');
      setIsOrdering(false);
    }
  };

  const closePaymentModal = () => {
    if (pollingInterval) clearInterval(pollingInterval);
    setPaymentModalProps(prev => ({ ...prev, isOpen: false }));
    navigate('/customer/payments');
  };

  React.useEffect(() => {
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [pollingInterval]);

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
        <h2 className="text-3xl font-black text-text-primary uppercase tracking-tight">
          {selectedPaymentMethod === 'Cashier' ? 'Order Placed!' : 'Bill Generated!'}
        </h2>
        <p className="text-slate-400 font-medium mt-2 max-w-[280px] leading-relaxed">
          {selectedPaymentMethod === 'Cashier' ? 'Please proceed to the cashier counter to complete your payment.' : 'Please complete your payment. Redirecting...'}
        </p>
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
             onClick={handlePlaceOrderClick}
             disabled={isOrdering}
             className="w-full btn-primary py-4 lg:py-5 rounded-full lg:rounded-3xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest shadow-2xl shadow-primary/30 active:scale-95 transition-all group disabled:opacity-50"
           >
              {isOrdering ? 'Generating Bill...' : 'Proceed to Payment'} 
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
      
      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => !isOrdering && setShowLocationModal(false)} />
          <div className="relative w-full max-w-md bg-surface border-none shadow-2xl shadow-primary/10 rounded-[2.5rem] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-300 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-8 pb-6 flex justify-between items-start">
               <div>
                 <h3 className="text-xl font-black text-text-primary uppercase tracking-tight flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-primary" /> Delivery Details
                 </h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Where should we send your order?</p>
               </div>
               <button 
                 onClick={() => setShowLocationModal(false)}
                 disabled={isOrdering}
                 className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-all shadow-sm disabled:opacity-50"
               >
                 <X className="w-5 h-5" />
               </button>
            </div>
            
            <div className="p-8 pt-0 space-y-6 overflow-y-auto scrollbar-hide">
              {/* Toggle Buttons */}
              <div className="flex bg-slate-50 p-1.5 rounded-2xl shadow-inner border border-slate-100/50">
                <button 
                  onClick={() => {
                    setLocationType('room');
                    setLocationValue(profile?.tableId && profile.tableId !== '-' ? profile.tableId : '');
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    locationType === 'room' ? "bg-primary text-white shadow-xl shadow-primary/30 scale-[1.02]" : "text-slate-400 hover:text-primary hover:bg-white/50"
                  )}
                >
                  <Home className="w-4 h-4" /> Room Service
                </button>
                <button 
                  onClick={() => {
                    setLocationType('table');
                    setLocationValue(profile?.tableId && profile.tableId !== '-' ? profile.tableId : '');
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    locationType === 'table' ? "bg-primary text-white shadow-xl shadow-primary/30 scale-[1.02]" : "text-slate-400 hover:text-primary hover:bg-white/50"
                  )}
                >
                  <MapPin className="w-4 h-4" /> Dine-in
                </button>
                <button 
                  onClick={() => {
                    setLocationType('bungkus');
                    setLocationValue('Takeaway');
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    locationType === 'bungkus' ? "bg-primary text-white shadow-xl shadow-primary/30 scale-[1.02]" : "text-slate-400 hover:text-primary hover:bg-white/50"
                  )}
                >
                  <ShoppingBag className="w-4 h-4" /> Bungkus
                </button>
              </div>
              
              {/* Input Field */}
              {locationType !== 'bungkus' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                  <label className="text-xs font-black text-text-primary uppercase tracking-widest ml-1">
                    {locationType === 'room' ? 'Room Number' : 'Table Number'} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                     <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                        {locationType === 'room' ? <Home className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                     </div>
                     <input 
                       type="text"
                       value={locationValue}
                       onChange={(e) => setLocationValue(e.target.value)}
                       placeholder={locationType === 'room' ? "Enter your room number (e.g. 101)" : "Enter your table number (e.g. 5)"}
                       className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 focus:border-primary focus:bg-white rounded-2xl outline-none text-sm font-black text-text-primary transition-all shadow-inner group-hover:border-primary/50"
                     />
                  </div>
                </div>
              )}

              {/* Payment Method Selection */}
              <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="text-xs font-black text-text-primary uppercase tracking-widest ml-1">
                  Payment Method <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setSelectedPaymentMethod('Online')}
                    className={cn(
                      "p-3 rounded-2xl border-2 text-left flex flex-col gap-1 transition-all group relative overflow-hidden",
                      selectedPaymentMethod === 'Online' ? "bg-primary border-primary text-white shadow-xl shadow-primary/20" : "bg-slate-50 border-transparent text-text-primary hover:border-primary/20"
                    )}
                  >
                    {selectedPaymentMethod === 'Online' && (
                      <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl" />
                    )}
                    <CreditCard className={cn("w-5 h-5", selectedPaymentMethod === 'Online' ? "text-white" : "text-primary")} />
                    <span className="text-[11px] font-black uppercase tracking-tight mt-1 relative z-10">Online Payment</span>
                  </button>

                  <button 
                    onClick={() => setSelectedPaymentMethod('Cashier')}
                    className={cn(
                      "p-3 rounded-2xl border-2 text-left flex flex-col gap-1 transition-all group relative overflow-hidden",
                      selectedPaymentMethod === 'Cashier' ? "bg-primary border-primary text-white shadow-xl shadow-primary/20" : "bg-slate-50 border-transparent text-text-primary hover:border-primary/20"
                    )}
                  >
                    {selectedPaymentMethod === 'Cashier' && (
                      <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl" />
                    )}
                    <span className="text-xl leading-none block mb-0.5" role="img" aria-label="card">💳</span>
                    <span className="text-[11px] font-black uppercase tracking-tight mt-1 relative z-10">Card at Cashier</span>
                  </button>
                </div>
              </div>

              {/* Info Box */}
              <div className="p-5 bg-amber-50 border-2 border-dashed border-amber-200 rounded-2xl flex items-start gap-4 group hover:bg-amber-100/50 transition-colors">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                   <Info className="w-5 h-5 text-amber-500" />
                </div>
                <div className="mt-0.5">
                   <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1">Payment Required</h4>
                   <p className="text-[10px] font-bold text-amber-700/80 uppercase tracking-wider leading-relaxed">
                     After placing the order, you will be redirected to complete your payment. The kitchen will begin preparation once payment is confirmed.
                   </p>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                onClick={handleConfirmAndPlaceOrder}
                disabled={isOrdering || (locationType !== 'bungkus' && !locationValue)}
                className="w-full btn-primary py-5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-primary/30 active:scale-95 transition-all group disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isOrdering ? (
                  'Processing...'
                ) : (
                  <>
                    Confirm & Checkout <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Xendit Payment Modal */}
      <XenditPaymentModal
        isOpen={paymentModalProps.isOpen}
        onClose={closePaymentModal}
        invoiceUrl={paymentModalProps.invoiceUrl}
        paymentState={paymentModalProps.paymentState}
        amount={total}
      />
    </div>
  );
};

export default CustomerCart;
