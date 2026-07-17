import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ShoppingCart, Search, Plus, Minus, X, Receipt, CheckCircle2, Smartphone, CreditCard, Nfc } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMenu, categoryIconMap } from '../../context/MenuContext';
import { paymentApi } from '../../services/payment.api';
import { QRCodeSVG } from 'qrcode.react';
import { getImageUrl } from '../../utils/imageUtils';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { processNativeWalletPayment, isMobileDevice } from '../../utils/nativePayment';

const GuestMenu = () => {
  const { items, categoriesList } = useMenu();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('All Items');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [cart, setCart] = useState([]);
  
  // Payment States
  const [paymentState, setPaymentState] = useState('idle'); // idle, waiting, success
  const [invoiceUrl, setInvoiceUrl] = useState('');
  const [pollingInterval, setPollingInterval] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');

  const filteredMenu = activeTab === 'All Items' 
    ? items 
    : items.filter(item => (item.category_name || item.category) === activeTab);

  const addToCart = (item) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
    showToast('Added to cart');
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(0, i.qty + delta);
        return { ...i, qty: newQty };
      }
      return i;
    }).filter(i => i.qty > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const submitOrder = async (isPaid = false, explicitMethod = null) => {
    try {
      const tax = cartTotal * 0.11; // 11% Tax
      const orderPayload = {
        orderData: {
          order_number: `GST-${Date.now()}`,
          order_type: 'dine-in',
          subtotal: cartTotal,
          tax: tax,
          discount: 0,
          serviceChargePercent: 0,
          grand_total: cartTotal + tax,
          payment_status: isPaid ? 'paid' : 'pending',
          payment_method: isPaid ? (explicitMethod || paymentMethod) : null,
          order_status: 'pending'
        },
        items: cart.map(item => ({
          menu_item_id: item.id,
          quantity: item.qty,
          unit_price: item.price,
          total_price: item.price * item.qty
        }))
      };

      await api.post('/orders/guest', orderPayload);
      showToast(isPaid ? 'Payment Successful! Order placed.' : 'Order sent to Kitchen!');
      setCart([]);
      setIsCartOpen(false);
      setIsPayModalOpen(false);
      setPaymentState('idle');
      if (pollingInterval) clearInterval(pollingInterval);
    } catch (err) {
      console.error(err);
      showToast('Failed to place order', 'error');
    }
  };

  const handleOnlinePayment = async (method) => {
    try {
      const tax = cartTotal * 0.11;
      
      const bookingId = `GST_${Date.now()}`;
      let response;
      if (method === 'QR Code') {
        response = await paymentApi.createQrCode({
          bookingId,
          amount: cartTotal + tax,
          description: `Guest Online Order ${bookingId}`
        });
      } else {
        response = await paymentApi.createInvoice({
          bookingId,
          guestName: "Guest Walk-in",
          email: "guest@gilahouse.com",
          amount: cartTotal + tax,
          description: `Guest Online Order ${bookingId}`
        });
      }

      if (response.success) {
        setInvoiceUrl(response.invoiceUrl);
        setPaymentState('waiting');
        setPaymentMethod(method);

        // Polling
        const interval = setInterval(async () => {
          try {
            const statusResponse = await paymentApi.getPaymentStatus(bookingId);
            if (statusResponse.data && statusResponse.data.status === 'PAID') {
              clearInterval(interval);
              setPaymentState('success');
              await submitOrder(true);
            }
          } catch (err) {}
        }, 3000);
        setPollingInterval(interval);
      }
    } catch (err) {
      showToast(err.message || 'Payment initiation failed', 'error');
    }
  };

  useEffect(() => {
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [pollingInterval]);

  useEffect(() => {
    const pendingItem = localStorage.getItem('pending_order_item');
    if (pendingItem && items && items.length > 0) {
      try {
        const item = JSON.parse(pendingItem);
        const menuItem = items.find(i => i.id === item.id) || item;
        
        setCart(prev => {
          const exists = prev.find(i => i.id === menuItem.id);
          if (exists) {
            return prev;
          }
          return [...prev, { ...menuItem, qty: 1 }];
        });
        
        setIsCartOpen(true);
        showToast(`Added ${menuItem.name} to your order!`);
        localStorage.removeItem('pending_order_item');
      } catch (err) {
        console.error('Failed to parse pending item:', err);
      }
    }
  }, [items]);

  return (
    <div className="min-h-screen bg-[#e0f7f3]/50 font-sans pb-32 relative">
      {/* Header */}
      <header className="bg-surface px-4 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-sm border-b border-gray-50">
        <div className="flex items-center gap-3">
          <Link to="/guest-app" className="text-slate-400 hover:text-slate-800 transition-colors">
            <ChevronLeft size={20} strokeWidth={3} />
          </Link>
          <h1 className="text-lg font-black text-slate-800 tracking-tight">Menu</h1>
        </div>

        {/* Welcome Toast */}
        <div className="hidden sm:flex items-center gap-2 bg-surface border border-gray-100 px-3 py-1.5 rounded-full shadow-md shadow-gray-100">
          <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[8px]">
            ✓
          </div>
          <span className="text-[9px] font-bold text-slate-600 tracking-tight">Welcome, MANUEL! 🎉</span>
        </div>

        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative w-9 h-9 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center"
        >
          <ShoppingCart size={18} />
          {cartItemsCount > 0 && <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-black">{cartItemsCount}</span>}
        </button>
      </header>

      <main className="max-w-md md:max-w-3xl mx-auto px-4 pt-4">
        {/* Categories Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
          {categoriesList?.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab 
                ? 'bg-orange-500 text-white shadow-md shadow-orange-100' 
                : 'bg-surface text-gray-400 hover:bg-gray-50'
              }`}
            >
              {tab} {categoryIconMap?.[tab.toLowerCase()] || ''}
            </button>
          ))}
        </div>

        {/* Product List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-10">
          <AnimatePresence mode="popLayout">
            {filteredMenu?.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="bg-surface rounded-2xl p-3 flex items-center gap-3 shadow-sm border border-gray-50 hover:border-orange-100 transition-all group"
              >
                {/* Icon/Image Box */}
                <div className="w-16 h-16 bg-orange-50/50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                  {item.image_url ? (
                     <img src={getImageUrl(item.image_url)} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                     categoryIconMap[(item.category_name || item.category)?.toLowerCase()] || '🍽️'
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-[13px] font-black text-slate-800 mb-0.5">{item.name}</h3>
                  <p className="text-[9px] text-gray-400 font-medium leading-tight mb-2 line-clamp-3">
                    {item.description || item.desc || ''}
                  </p>
                  <p className="text-[13px] font-black text-orange-500 tracking-tight">
                    Rp {Number(item.price).toLocaleString()}
                  </p>
                </div>

                {/* Add Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(item);
                  }}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm shadow-orange-100 hover:bg-orange-600 transition-all active:scale-95"
                >
                  Add
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {(!filteredMenu || filteredMenu.length === 0) && (
            <div className="py-20 text-center md:col-span-2">
               <p className="text-gray-300 font-bold text-sm uppercase tracking-widest">No items found in this category</p>
            </div>
          )}
        </div>
      </main>

      {/* Floating Checkout Bar */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-md md:max-w-3xl">
         <button 
           onClick={() => setIsCartOpen(true)}
           className="w-full bg-slate-900 text-white p-5 rounded-[2rem] shadow-2xl flex items-center justify-between group overflow-hidden relative"
         >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-400 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
            <div className="relative z-10 flex items-center gap-4">
               <div className="w-10 h-10 bg-surface/20 rounded-xl flex items-center justify-center">
                  <ShoppingCart size={20} />
               </div>
               <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{cartItemsCount} Items</p>
                  <p className="text-sm font-black">View Order</p>
               </div>
            </div>
            <div className="relative z-10 text-right">
               <p className="text-xs font-black opacity-60">Total</p>
               <p className="text-lg font-black tracking-tight">Rp {cartTotal.toLocaleString()}</p>
            </div>
         </button>
      </div>

      {/* Cart Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="relative bg-surface w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]"
            >
              <div className="p-6 md:p-8 overflow-y-auto no-scrollbar flex-1">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">Your Order</h2>
                  <button onClick={() => setIsCartOpen(false)} className="p-2 bg-gray-50 text-gray-400 hover:text-slate-800 rounded-xl transition-colors">
                    <X size={20} />
                  </button>
                </div>

                {/* Cart Items */}
                <div className="space-y-6 mb-8 max-h-[30vh] overflow-y-auto no-scrollbar">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-xl overflow-hidden shrink-0">
                           {item.image_url ? <img src={getImageUrl(item.image_url)} alt={item.name} className="w-full h-full object-cover" /> : (categoryIconMap[(item.category_name || item.category)?.toLowerCase()] || '🍽️')}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-800">{item.name}</h4>
                          <p className="text-[10px] font-bold text-gray-400 tracking-tight">Rp {Number(item.price).toLocaleString()} × {item.qty}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full">
                          <button onClick={() => updateQty(item.id, -1)} className="text-gray-300 hover:text-red-500 transition-colors">
                            <Minus size={14} />
                          </button>
                          <span className="text-xs font-black">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="text-orange-500">
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="text-sm font-black text-orange-500 tracking-tight">Rp {(item.price * item.qty).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                  {cart.length === 0 && <p className="text-center text-gray-400 font-bold text-xs py-4 uppercase tracking-widest">Cart is empty</p>}
                </div>

                {/* Special Notes */}
                <div className="mb-8">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Special notes (optional)</label>
                  <textarea 
                    rows="2" 
                    placeholder="Allergies, preferences, delivery time..." 
                    className="w-full px-6 py-4 bg-gray-50/50 rounded-2xl border border-gray-100 text-[13px] font-bold placeholder:text-gray-200 outline-none focus:border-orange-500 transition-all resize-none"
                  />
                </div>

                {/* Total */}
                <div className="bg-orange-50 p-5 rounded-2xl flex items-center justify-between mb-8 border border-orange-100/50">
                  <span className="text-sm font-black text-slate-800">Total (inc 11% tax)</span>
                  <span className="text-xl font-black text-orange-500 tracking-tighter">Rp {(cartTotal * 1.11).toLocaleString()}</span>
                </div>

                {/* Payment Methods */}
                <div className="space-y-3">
                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-2">How would you like to pay?</p>
                  
                  <button 
                    onClick={() => {
                      if (cart.length === 0) return showToast("Cart is empty", "error");
                      setIsCartOpen(false);
                      setIsPayModalOpen(true);
                    }}
                    className="w-full p-4 rounded-2xl border-2 border-orange-100 bg-orange-50/20 hover:bg-orange-50 flex items-center gap-4 transition-all text-left"
                  >
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-100">
                      <Receipt size={20} />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-black text-slate-800">Pay Now Online</h4>
                      <p className="text-[9px] font-bold text-gray-400 tracking-tight">Card, transfer, QRIS — order confirmed after payment</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => {
                       if (cart.length === 0) return showToast("Cart is empty", "error");
                       submitOrder(false);
                    }}
                    className="w-full p-4 rounded-2xl border-2 border-amber-100 bg-amber-50/10 hover:bg-amber-50 flex items-center gap-4 transition-all text-left">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-100">
                      <ShoppingCart size={20} />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-black text-slate-800">Pay at Restaurant</h4>
                      <p className="text-[9px] font-bold text-gray-400 tracking-tight">Card or transfer when you collect — order sent immediately</p>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pay Online Modal */}
      <AnimatePresence>
        {isPayModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPayModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="relative bg-surface w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]"
            >
              <div className="p-6 md:p-8 overflow-y-auto no-scrollbar flex-1">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">Pay Online</h2>
                  <button onClick={() => setIsPayModalOpen(false)} className="p-2 bg-gray-50 text-gray-400 hover:text-slate-800 rounded-xl transition-colors">
                    <X size={20} />
                  </button>
                </div>

                {/* Amount Due Card */}
                <div className="bg-orange-50/50 p-6 rounded-[1.5rem] flex items-center justify-between mb-6 border border-orange-100/30">
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Order Summary</p>
                    <p className="text-sm font-black text-slate-800">Amount due</p>
                  </div>
                  <span className="text-2xl font-black text-orange-500 tracking-tighter">Rp {(cartTotal * 1.11).toLocaleString()}</span>
                </div>

                {/* Timer */}
                <div className="flex items-center justify-center gap-2 mb-8">
                  <div className="w-4 h-4 text-gray-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <p className="text-[11px] font-medium text-gray-500">
                    Pay within <span className="text-orange-500 font-black">14:59</span> or the order expires
                  </p>
                </div>

                {/* Payment Options */}
                {paymentState === 'waiting' && invoiceUrl ? (
                  <>
                    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl border-2 border-slate-100">
                      {paymentMethod === 'QR Code' ? (
                        <QRCodeSVG value={invoiceUrl} size={200} />
                      ) : (
                        <div className="w-[200px] h-[200px] flex items-center justify-center bg-slate-50 rounded-2xl">
                           <CreditCard className="w-16 h-16 text-primary opacity-50" />
                        </div>
                      )}
                    </div>
                    <div className="text-center space-y-2 mt-6">
                      <h3 className="text-xl font-black uppercase text-slate-800">Waiting for Payment</h3>
                      <p className="text-xs font-bold text-slate-500">
                        {paymentMethod === 'QR Code'
                          ? 'Scan this QR code with your payment app' 
                          : 'Please complete the payment in the opened tab'}
                      </p>
                      {paymentMethod !== 'QR Code' && (
                         <button 
                           onClick={() => window.open(invoiceUrl, '_blank')}
                           className="bg-orange-500 text-white px-6 py-2 rounded-xl text-xs font-black uppercase"
                         >
                           Open Payment Page
                         </button>
                      )}
                    </div>
                  </>
                ) : paymentState === 'success' ? (
                  <div className="flex flex-col items-center justify-center space-y-4 py-12">
                     <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 size={40} />
                     </div>
                     <h3 className="text-xl font-black text-slate-800">Payment Successful!</h3>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your order is being prepared</p>
                     <button onClick={() => setIsPayModalOpen(false)} className="mt-8 bg-slate-900 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800">Close</button>
                  </div>
                ) : (
                <div className="space-y-4">
                  <button onClick={() => handleOnlinePayment('Card')} className="w-full p-4 rounded-[1.5rem] border-2 border-orange-100 bg-orange-50/20 hover:bg-orange-50 flex items-center gap-4 transition-all text-left">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-100">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </div>
                    <div>
                      <h4 className="text-[13px] font-black text-slate-800">Pay Online</h4>
                      <p className="text-[9px] font-bold text-gray-400 tracking-tight">Credit card, bank transfer, e-wallet</p>
                    </div>
                  </button>

                  <button onClick={() => handleOnlinePayment('QR Code')} className="w-full p-4 rounded-[1.5rem] border-2 border-emerald-100 bg-emerald-50/10 hover:bg-emerald-50 flex items-center gap-4 transition-all text-left">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100 p-2">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><rect x="7" y="7" width="3" height="3"/><rect x="14" y="7" width="3" height="3"/><rect x="7" y="14" width="3" height="3"/><path d="M14 14h3v3h-3z"/></svg>
                    </div>
                    <div>
                      <h4 className="text-[13px] font-black text-slate-800">QRIS</h4>
                      <p className="text-[9px] font-bold text-gray-400 tracking-tight">Scan with any banking or e-wallet app</p>
                    </div>
                  </button>

                  <button onClick={() => handleOnlinePayment('Google Pay')} className="w-full p-4 rounded-[1.5rem] border-2 border-teal-100 bg-teal-50/20 hover:bg-teal-50 flex items-center gap-4 transition-all text-left">
                    <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-100 p-2">
                       <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-black text-slate-800">Google Pay</h4>
                      <p className="text-[9px] font-bold text-gray-400 tracking-tight">Fast checkout via GPay</p>
                    </div>
                  </button>

                  <button onClick={() => handleOnlinePayment('Apple Pay')} className="w-full p-4 rounded-[1.5rem] border-2 border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center gap-4 transition-all text-left">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-300 p-2">
                       <Nfc className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-black text-slate-800">Apple Pay</h4>
                      <p className="text-[9px] font-bold text-gray-400 tracking-tight">Fast checkout via Apple Wallet</p>
                    </div>
                  </button>
                </div>
                )}

                {/* Pay Later */}
                <div className="mt-8 text-center">
                  <button onClick={() => setIsPayModalOpen(false)} className="text-[10px] font-bold text-gray-300 hover:text-slate-400 transition-colors uppercase tracking-widest">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GuestMenu;
