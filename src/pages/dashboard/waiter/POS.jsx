import { formatCurrency } from '../../../utils/currencyUtils';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus,
  ChefHat,
  CreditCard,
  History,
  Tag,
  Clock,
  MoreVertical,
  X,
  ChevronRight,
  Receipt,
  Users,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Printer,
  Bed,
  QrCode,
  Filter
} from 'lucide-react';
import { cn } from "../../../utils/cn";
import { getImageUrl } from "../../../utils/imageUtils";
import { useAuth } from "@/context/AuthContext";
import { useMenu, categoryIconMap } from "@/context/MenuContext";
import { useHospitality } from "@/context/HospitalityContext";
import { useOrders } from "@/context/OrdersContext";
import { useSettings } from "@/context/SettingsContext";
import { paymentApi } from "../../../services/payment.api";
import { QRCodeSVG } from "qrcode.react";
import printContent from '../../../utils/printUtil';

const MenuItemImage = ({ image, category, alt, className }) => {
  const [error, setError] = useState(false);
  const emoji = categoryIconMap[String(category || '').toLowerCase().trim()] || '🍽️';

  if (error || !image || getImageUrl(image).length <= 2) {
    return (
      <div className="w-full h-full flex items-center justify-center text-4xl lg:text-5xl bg-slate-50 text-slate-400 select-none">
        {image && getImageUrl(image).length <= 2 ? getImageUrl(image) : emoji}
      </div>
    );
  }

  return (
    <img 
      src={getImageUrl(image)} 
      alt={alt} 
      onError={() => setError(true)}
      className={className} 
    />
  );
};

const POS = () => {
  const { user } = useAuth();
  const { items, categoriesList, loading: menuLoading, addItem } = useMenu();
  const { rooms, reservations, addToFolio, tables = [] } = useHospitality();
  const { orders, addOrder } = useOrders();
  const { settings } = useSettings();

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('pos-cart');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to load cart', e);
      return [];
    }
  });

  // Persist cart changes
  React.useEffect(() => {
    localStorage.setItem('pos-cart', JSON.stringify(cart));
  }, [cart]);

  const [activeCategory, setActiveCategory] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderType, setOrderType] = useState('dine-in');
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [toast, setToast] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItemIcon, setNewItemIcon] = useState('🍽️');
  const [selectedImage, setSelectedImage] = useState(null);
  const [newItemCategory, setNewItemCategory] = useState('');
  const [discount, setDiscount] = useState(0);
  const [serviceChargePercent, setServiceChargePercent] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('QR Code');
  const [paymentState, setPaymentState] = useState('idle'); // idle, waiting, success
  const [invoiceUrl, setInvoiceUrl] = useState('');
  const [pollingInterval, setPollingInterval] = useState(null);
  const [selectedItemForSize, setSelectedItemForSize] = useState(null);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [selectedGuestId, setSelectedGuestId] = useState('');
  const [orderForReceipt, setOrderForReceipt] = useState(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const discountAmount = Math.round(subtotal * (discount / 100));
  const gst = Math.round((subtotal - discountAmount) * 0.05);
  const serviceChargeAmount = Math.round(subtotal * (serviceChargePercent / 100));
  const total = subtotal - discountAmount + gst + serviceChargeAmount;

  // Sync cart info with MainLayout header
  React.useEffect(() => {
    const count = cart.reduce((acc, item) => acc + item.qty, 0);
    window.dispatchEvent(new CustomEvent('pos-cart-updated', { 
      detail: { count, total } 
    }));
  }, [cart, total]);

  if (menuLoading && items.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Menu...</p>
        </div>
      </div>
    );
  }

  const orderHistory = orders.map(o => ({
    id: o.order_number,
    time: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    items: 0, // Simplified for now
    total: o.grand_total,
    status: o.order_status
  })).slice(0, 5);

  const addToCart = (item, selectedSize = null) => {
    console.log('addToCart called for item:', item, 'selectedSize:', selectedSize);
    // If item has sizes and none is selected, open size selection modal
    const hasSizes = item.sizes && Array.isArray(item.sizes) && item.sizes.length > 0;
    if (hasSizes && !selectedSize) {
      console.log('Item has sizes, opening selection modal');
      setSelectedItemForSize(item);
      return;
    }

    const itemPrice = parseFloat(selectedSize ? selectedSize.price : item.price) || 0;
    const itemName = selectedSize ? `${item.item_name || item.name} (${selectedSize.name})` : (item.item_name || item.name);
    const cartId = selectedSize ? `${item.id}-${selectedSize.name}` : `${item.id}`;
    
    console.log('Adding details:', { cartId, itemName, itemPrice });

    setCart(prev => {
      const safePrev = Array.isArray(prev) ? prev : [];
      console.log('Current cart state before update:', safePrev);
      const existing = safePrev.find(i => i.cartId === cartId);
      if (existing) {
        console.log('Item exists in cart, incrementing qty');
        return safePrev.map(i => i.cartId === cartId ? { ...i, qty: i.qty + 1 } : i);
      }
      console.log('Adding new item to cart');
      return [...safePrev, { ...item, cartId, name: itemName, price: itemPrice, qty: 1, note: '' }];
    });
    
    if (selectedItemForSize) setSelectedItemForSize(null);
  };

  const removeFromCart = (cartId) => {
    setCart(prev => prev.filter(i => i.cartId !== cartId));
  };

  const updateQty = (cartId, delta) => {
    setCart(prev => prev.map(i => {
      if (i.cartId === cartId) {
        const newQty = Math.max(1, i.qty + delta);
        return { ...i, qty: newQty };
      }
      return i;
    }));
  };

  const updateNote = (cartId, note) => {
    setCart(prev => prev.map(i => i.cartId === cartId ? { ...i, note } : i));
    setEditingNote(null);
  };

  // Calculation functions moved up


  const showToastMessage = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddItem = async (newItem) => {
    try {
      const result = await addItem(newItem);
      if (result && result.success === false) {
        showToastMessage(result.message || 'Failed to add item', 'error');
        return;
      }
      setShowAddItemModal(false);
      setSelectedImage(null);
      setNewItemIcon('🍽️');
      setNewItemCategory('');
      showToastMessage('Item added to POS menu successfully!');
    } catch (error) {
      showToastMessage('Failed to add item. Please try again.', 'error');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB Limit
        showToastMessage('Image size must be less than 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setNewItemIcon(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateAutoIcon = (category) => {
    const normalized = category.toLowerCase().trim().replace(/s$/, '');
    const mappedIcon = categoryIconMap[normalized];
    if (mappedIcon) {
      setNewItemIcon(mappedIcon);
    } else {
      const partialMatch = Object.keys(categoryIconMap).find(key => normalized.includes(key));
      setNewItemIcon(partialMatch ? categoryIconMap[partialMatch] : '🍽️');
    }
  };

  const handleKDS = async () => {
    setIsProcessing(true);
    try {
      await addOrder(cart, {
        type: orderType === 'bungkus' ? 'takeaway' : orderType === 'room' ? 'room service' : 'dine-in',
        tableId: selectedTable || null,
        roomId: selectedRoom || null,
        total: total,
        discount: discountAmount,
        tax: gst,
        serviceChargePercent: serviceChargePercent,
        serviceChargeAmount: serviceChargeAmount,
        paymentStatus: 'pending'
      });
      showToastMessage('Order sent to Kitchen successfully!');
      setCart([]);
      setDiscount(0);
      setServiceChargePercent(0);
    } catch (err) {
      showToastMessage('Failed to send order to Kitchen', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalPayment = async () => {
    if (paymentMethod === 'Room Service' && !selectedGuestId) {
      showToastMessage('Please select a guest for Room Service', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const extraData = {
        type: orderType === 'bungkus' ? 'takeaway' : orderType === 'room' ? 'room service' : 'dine-in',
        tableId: selectedTable || null,
        roomId: selectedRoom || null,
        subtotal: subtotal,
        total: total,
        discount: discountAmount,
        discountPercent: discount,
        tax: gst,
        serviceChargePercent: serviceChargePercent,
        serviceChargeAmount: serviceChargeAmount,
        paymentStatus: 'paid',
        paymentMethod: paymentMethod,
        customerId: selectedGuestId || null
      };

      if (paymentMethod === 'Room Service') {
        const result = await addOrder(cart, extraData);
        
        if (paymentMethod === 'Room Service') {
          addToFolio(selectedGuestId, {
            description: `Room Service Order`,
            amount: total,
            date: new Date().toLocaleDateString(),
            type: 'Food'
          });
        }

        setOrderForReceipt({ ...extraData, itemsList: cart.map(i => ({ name: i.item_name || i.name, quantity: i.qty, price: i.price })), id: result.id });
        setTimeout(() => { printContent('printable-area'); }, 500);
        setCart([]);
        setDiscount(0);
        setServiceChargePercent(0);
        setSelectedGuestId('');
        setShowPaymentModal(false);
        showToastMessage(paymentMethod === 'Room Service' ? 'Charge added to guest folio!' : 'Payment Successful!');
        setIsProcessing(false);
      } else {
        // Digital Payments via Xendit
        const bookingId = `POS_${Date.now()}`;
        
        let response;
        if (paymentMethod === 'QR Code') {
           response = await paymentApi.createQrCode({
             bookingId: bookingId,
             amount: total,
             description: `POS QR Order ${bookingId}`
           });
        } else {
           response = await paymentApi.createInvoice({
             bookingId: bookingId,
             guestName: "Walk-in Customer",
             email: "guest@gilahouse.com", // Dummy email
             phone: "0000000000",
             amount: total,
             description: `POS Order ${bookingId}`,
             paymentMethods: paymentMethod === 'Card' ? ['CREDIT_CARD'] : undefined
           });
        }

        if (response.success) {
          setInvoiceUrl(response.invoiceUrl);
          setPaymentState('waiting');
          setIsProcessing(false);

          // Start polling
          const interval = setInterval(async () => {
            try {
              const statusResponse = await paymentApi.getPaymentStatus(bookingId);
              if (statusResponse.data && statusResponse.data.status === 'PAID') {
                clearInterval(interval);
                setPaymentState('success');
                
                // Finalize Order
                const result = await addOrder(cart, extraData);
                setOrderForReceipt({ ...extraData, itemsList: cart.map(i => ({ name: i.item_name || i.name, quantity: i.qty, price: i.price })), id: result.id });
                setTimeout(() => { printContent('printable-area'); }, 500);
                setCart([]);
                setDiscount(0);
                setServiceChargePercent(0);
                setSelectedGuestId('');
                setPaymentState('idle');
                setShowPaymentModal(false);
                showToastMessage('Digital Payment Successful!');
              }
            } catch (err) {
              // Ignore polling errors
            }
          }, 3000);
          setPollingInterval(interval);
        }
      }
    } catch (err) {
      showToastMessage('Order failed', 'error');
      setIsProcessing(false);
    }
  };

  const handleClosePaymentModal = () => {
    if (isProcessing) return;
    if (pollingInterval) clearInterval(pollingInterval);
    setPaymentState('idle');
    setInvoiceUrl('');
    setShowPaymentModal(false);
  };

  const handlePrintOnly = () => {
    const currentOrder = {
      customer: paymentMethod === 'Room Service' ? 'Guest' : 'Walk-in',
      type: orderType === 'bungkus' ? 'Bungkus (Takeaway)' : orderType === 'room' ? 'Room Service' : 'Dine-in',
      table: orderType === 'room' ? `Room ${selectedRoom}` : orderType === 'dine-in' ? `Table ${selectedTable}` : '-',
      amount: `${formatCurrency(total)}`,
      items: cart.reduce((acc, i) => acc + i.qty, 0),
      itemsList: cart.map(i => ({ name: i.item_name || i.name, quantity: i.qty, price: i.price })),
      payment: paymentMethod,
      status: 'Pro-forma',
      serviceChargePercent: serviceChargePercent,
      serviceChargeAmount: serviceChargeAmount,
      discount: discount,
      discountAmount: discountAmount,
      tax: gst
    };
    setOrderForReceipt(currentOrder);
    setTimeout(() => {
      printContent('printable-area');
    }, 500);
  };

  const filteredItems = items.filter(item => {
    const isAll = ['all', 'all items'].includes(activeCategory?.trim().toLowerCase());
    const itemCategory = (item.category_name || item.category || '').trim().toLowerCase();
    const matchesCategory = isAll || itemCategory === activeCategory?.trim().toLowerCase();
    const itemName = item.item_name || item.name;
    const matchesSearch = itemName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 h-full overflow-hidden relative">
      {/* Toast Feedback */}
      {toast && (
        <div 
          className={cn(
            "fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest border text-white",
            toast.type === 'success' ? "bg-primary border-primary/20" : "bg-primary-hover border-primary/20"
          )}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-white" /> : <AlertCircle className="w-4 h-4 text-white" />}
          {toast.message}
        </div>
      )}
      {/* Menu Area */}
      <div className="flex-1 flex flex-col gap-4 lg:gap-6 overflow-hidden">
        {/* Search & Action Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between shrink-0 gap-3 md:gap-4">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-4 lg:left-5 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-text-secondary group-focus-within:text-primary" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..." 
              className="w-full pl-10 lg:pl-12 pr-4 lg:pr-5 py-3 lg:py-3.5 bg-surface border border-slate-100 rounded-xl lg:rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/30 outline-none shadow-sm font-bold text-[10px] lg:text-[11px] uppercase tracking-widest placeholder:text-slate-300"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
              <button 
                onClick={() => setShowAddItemModal(true)}
                className="flex-1 md:flex-none p-3 lg:p-4 bg-primary text-white rounded-xl lg:rounded-2xl hover:bg-primary-hover shadow-xl shadow-primary/20 group flex items-center justify-center gap-2 lg:gap-3 transition-all active:scale-95"
              >
                 <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
                 <span className="md:hidden lg:inline text-[9px] font-black uppercase tracking-widest">Add Item POS</span>
              </button>
              <button 
                onClick={() => setShowHistory(true)}
                className="flex-1 md:flex-none p-3 lg:p-4 bg-surface border border-slate-100 rounded-xl lg:rounded-2xl hover:border-primary/20 hover:bg-slate-50 shadow-sm group flex items-center justify-center gap-2 lg:gap-3 transition-all active:scale-95"
              >
                 <History className="w-4 h-4 lg:w-5 lg:h-5 text-text-secondary group-hover:text-primary" />
                 <span className="md:hidden text-[9px] font-black uppercase tracking-widest text-text-secondary group-hover:text-primary">Order History</span>
              </button>
          </div>
        </div>

        <div className="sticky top-14 z-[110] bg-background flex items-center justify-between gap-3 border-b border-slate-100 py-3.5 -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex-1 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 shrink-0 px-1">
              {categoriesList.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-4 lg:px-5 py-2 lg:py-2.5 rounded-lg lg:rounded-xl text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.15em] whitespace-nowrap border-2 transition-all active:scale-95",
                    activeCategory === cat 
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                      : "bg-surface text-text-secondary border-black/5 hover:border-primary/20 hover:bg-primary-light"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Button */}
          <div className="relative shrink-0 pr-1">
            <button 
              type="button"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="p-2 bg-surface border border-slate-100 hover:border-primary/20 hover:bg-primary-light rounded-lg lg:rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 group active:scale-95"
            >
               <Filter className="w-3.5 h-3.5 text-text-secondary group-hover:text-primary transition-colors" />
               <span className="hidden sm:inline text-[8px] font-black uppercase tracking-widest text-text-secondary group-hover:text-primary">Filter</span>
            </button>
            
            {/* Dropdown Menu */}
            {showFilterDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowFilterDropdown(false)} />
                <div className="absolute right-0 mt-2.5 w-48 bg-surface rounded-2xl shadow-xl border border-slate-100/50 py-2.5 z-[200] animate-in fade-in slide-in-from-top-3 duration-200">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 pb-2 border-b border-slate-50 text-left">Select Category</p>
                  <div className="max-h-60 overflow-y-auto scrollbar-hide py-1">
                    {categoriesList.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setActiveCategory(cat);
                          setShowFilterDropdown(false);
                        }}
                        className={cn(
                          "w-full text-left px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider hover:bg-primary-light transition-all flex items-center justify-between",
                          activeCategory === cat ? "text-primary bg-primary/5" : "text-text-secondary"
                        )}
                      >
                        <span>{cat}</span>
                        {activeCategory === cat && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Menu Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 lg:gap-6 items-start pr-1 pb-32 lg:pb-12 scrollbar-hide">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <div 
                key={item.id} 
                onClick={() => { console.log('POS card clicked for item:', item.id); addToCart(item); }}
                className="card group cursor-pointer border-2 border-transparent hover:border-primary/20 p-3 lg:p-5 flex flex-col relative overflow-hidden bg-gradient-to-br from-surface to-slate-50/30 h-[340px] lg:h-[400px] transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95"
              >
                {/* Image Section */}
                <div className="relative -mx-3 -mt-3 lg:-mx-5 lg:-mt-5 mb-4 aspect-square overflow-hidden bg-surface border-b border-slate-50 group-hover:border-primary/10 transition-colors">
                    <MenuItemImage 
                      image={item.image} 
                      category={item.category_name || item.category} 
                      alt={item.item_name || item.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute top-3 left-3 lg:top-4 lg:left-4">
                       <span className="badge bg-surface/90 backdrop-blur-md text-slate-400 border-none shadow-sm text-[7px] lg:text-[8px] py-1 px-2 font-black uppercase tracking-widest">
                          {item.category_name || item.category}
                       </span>
                    </div>
                    <div className="absolute top-3 right-3 lg:top-4 lg:right-4 flex flex-col items-end gap-1">
                      <span className="badge bg-emerald-500/90 backdrop-blur-md text-white border-none shadow-lg text-[7px] lg:text-[9px] py-1 px-2 font-black uppercase tracking-widest">
                         READY
                      </span>
                   </div>
                </div>

                <div className="relative z-10 mb-3 flex-1 flex flex-col min-h-[40px] lg:min-h-[50px]">
                  <h4 className="font-black text-slate-900 text-[11px] lg:text-sm leading-tight group-hover:text-primary uppercase tracking-tight mb-1 break-words">
                    {item.item_name || item.name || "Unnamed Item"}
                  </h4>
                  <p className="text-slate-500 text-[9px] lg:text-[10px] font-medium leading-relaxed line-clamp-4 lg:line-clamp-5">
                    {item.description || "Freshly prepared with premium ingredients."}
                  </p>
                </div>

                <div className="mt-auto pt-2 lg:pt-3 border-t border-slate-50 flex items-center justify-between relative z-10 shrink-0">
                  <div className="flex flex-col">
                     <span className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Price</span>
                     <p className="text-sm lg:text-xl font-black text-text-primary tracking-tighter leading-none">{formatCurrency(item.price)}</p>
                  </div>
                  <div 
                    className="w-7 h-7 lg:w-10 lg:h-10 bg-primary text-white rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:bg-primary-dark transition-colors"
                  >
                    <Plus className="w-4 h-4 lg:w-5 lg:h-5 lg:stroke-[3]" />
                  </div>
                </div>
                
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
               <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner">
                  <Search className="w-8 h-8 text-slate-200" />
               </div>
               <h4 className="text-xl font-black text-text-primary uppercase tracking-tight">No Items Found</h4>
               <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest mt-2">No products available in this category</p>
               <button 
                 onClick={() => { setActiveCategory('All Items'); setSearchQuery(''); }}
                 className="mt-6 text-primary font-black uppercase tracking-[0.2em] text-[8px] hover:underline transition-all"
               >
                 Show All Products
               </button>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isMobileCartOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[300] lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileCartOpen(false)}
        />
      )}

      {/* Cart & Billing Section */}
      <div className={cn(
        "fixed inset-x-0 bottom-0 lg:relative lg:inset-auto z-[400] transition-transform duration-300 lg:translate-y-0 shadow-2xl lg:shadow-none",
        "w-full lg:w-[320px] xl:w-[380px] flex flex-col shrink-0 h-[85vh] lg:h-full",
        isMobileCartOpen ? "translate-y-0" : "translate-y-full lg:translate-y-0",
        cart.length === 0 ? "opacity-95" : "opacity-100"
      )}>
        <div className="card flex-1 flex flex-col p-0 overflow-hidden border border-black/5 bg-surface rounded-t-[2.5rem] lg:rounded-[2rem]">
          {/* Mobile Close Handle */}
          <div className="lg:hidden flex justify-center py-2 shrink-0" onClick={() => setIsMobileCartOpen(false)}>
            <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
          </div>
          {/* Cart Header */}
          <div className="pl-5 pr-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white shrink-0 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
            
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                 <div 
                   className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-2xl relative shrink-0"
                 >
                    <ShoppingCart className="w-6 h-6" />
                    {cart.length > 0 && (
                      <div 
                        className="absolute -top-1 -right-1 w-5 h-5 bg-primary border-2 border-white rounded-full flex items-center justify-center text-[9px] font-black shadow-lg"
                      >
                        {cart.reduce((acc, item) => acc + item.qty, 0)}
                      </div>
                    )}
                 </div>
                 <div className="min-w-0">
                    <h3 className="font-black text-xl tracking-tighter uppercase leading-none whitespace-nowrap">Active Cart</h3>
                    <div className="flex items-center gap-1.5 mt-1.5">
                       <span className="w-1 h-1 rounded-full bg-primary" />
                       <p className="text-text-secondary text-[8px] font-black uppercase tracking-[0.2em] opacity-60 truncate">#ORD-202605</p>
                    </div>
                 </div>
              </div>
              
              <button 
                onClick={() => {
                  if(cart.length > 0 && confirm('Clear all items from cart?')) setCart([]);
                }}
                className={cn(
                  "p-2.5 rounded-xl border border-transparent group/trash shrink-0",
                  cart.length > 0 ? "text-slate-400 hover:text-primary" : "text-slate-200 cursor-not-allowed"
                )}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Order Type & Location Filters */}
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 shrink-0 space-y-3">
             <div className="flex bg-slate-200/50 p-1 rounded-xl">
                <button 
                  onClick={() => setOrderType('dine-in')}
                  className={cn("flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all", orderType === 'dine-in' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-text-primary")}
                >
                  Dine-in
                </button>
                <button 
                  onClick={() => setOrderType('room')}
                  className={cn("flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all", orderType === 'room' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-text-primary")}
                >
                  Room
                </button>
                <button 
                  onClick={() => { setOrderType('bungkus'); setSelectedTable(''); setSelectedRoom(''); }}
                  className={cn("flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all", orderType === 'bungkus' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-text-primary")}
                >
                  Bungkus
                </button>
             </div>
             
             {orderType === 'dine-in' && (
               <select 
                 value={selectedTable}
                 onChange={(e) => setSelectedTable(e.target.value)}
                 className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none text-xs font-bold focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
               >
                 <option value="">Select Table...</option>
                 {tables.map(t => (
                   <option key={t.id} value={t.id}>{t.table_code || `Table ${t.id}`}</option>
                 ))}
               </select>
             )}

             {orderType === 'room' && (
               <select 
                 value={selectedRoom}
                 onChange={(e) => setSelectedRoom(e.target.value)}
                 className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none text-xs font-bold focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
               >
                 <option value="">Select Room...</option>
                 {rooms?.map(r => (
                   <option key={r.id} value={r.id}>{r.room_name || r.room_code || `Room ${r.id}`}</option>
                 ))}
               </select>
             )}
          </div>


          {/* Cart Items Scroll */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-5 space-y-4 scrollbar-hide">
            {cart.length > 0 ? (
              cart.map(item => (
                  <div 
                    key={item.cartId} 
                    className="flex flex-col gap-3 group bg-slate-50/30 p-2.5 rounded-2xl hover:bg-slate-50"
                  >
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-surface rounded-2xl flex items-center justify-center overflow-hidden text-2xl shrink-0 shadow-sm">
                        {getImageUrl(item.image).length > 2 ? (
                          <img src={getImageUrl(item.image)} alt={item.item_name || item.name} className="w-full h-full object-cover" />
                        ) : (
                          getImageUrl(item.image)
                        )}
                     </div>
                     <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-text-primary text-sm truncate leading-tight">{item.item_name || item.name}</h5>
                        <p className="text-xs text-primary font-black mt-0.5 tracking-tight">{formatCurrency(item.price)}</p>
                     </div>
                     <div className="flex items-center gap-1.5 bg-surface p-1 rounded-xl border border-slate-100 shadow-sm">
                        <button onClick={() => updateQty(item.cartId, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 rounded-lg text-text-secondary hover:text-primary">
                           <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center text-xs font-black text-text-primary">{item.qty}</span>
                        <button onClick={() => updateQty(item.cartId, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 rounded-lg text-text-secondary hover:text-primary">
                           <Plus className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                     <button 
                       onClick={() => setEditingNote(item.cartId)}
                       className={cn(
                         "flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest",
                         item.note ? "bg-indigo-50 text-primary border border-primary/20" : "bg-surface text-slate-400 border border-slate-100 hover:bg-slate-100"
                       )}
                     >
                        <MessageSquare className="w-3 h-3" />
                        {item.note || 'Add Special Instruction'}
                     </button>
                     <button onClick={() => removeFromCart(item.cartId)} className="p-2 text-slate-300 hover:text-primary hover:bg-red-50 rounded-lg">
                        <X className="w-4 h-4" />
                     </button>
                  </div>

                  {editingNote === item.cartId && (
                    <div className="overflow-hidden">
                      <div className="pt-2 flex flex-col gap-2">
                         <textarea 
                           autoFocus
                           onBlur={(e) => updateNote(item.cartId, e.target.value)}
                           defaultValue={item.note}
                           placeholder="e.g. Extra spicy, No onions..."
                           className="w-full p-4 bg-surface border-2 border-primary/20 rounded-2xl outline-none text-xs font-bold text-text-primary placeholder:text-slate-300 min-h-[80px] shadow-inner"
                         />
                         <button onClick={() => setEditingNote(null)} className="btn-primary py-2 text-[8px] uppercase tracking-widest">Save Note</button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-12 opacity-40">
                <ShoppingCart className="w-10 h-10 text-slate-300 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Cart is empty</p>
              </div>
            )}
          </div>

          {/* Billing Summary Panel */}
          <div className="p-5 lg:p-6 bg-gradient-to-br from-primary to-primary-hover text-white rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(229,139,67,0.15)]">
            <div className="space-y-2.5 mb-4">
              <div className="flex justify-between items-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                <span>Subtotal</span>
                <span className="text-white">{formatCurrency(subtotal)}</span>
              </div>
              
              <div className="flex justify-between items-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                <span>Tax (GST 5%)</span>
                <span className="text-white">{formatCurrency(gst)}</span>
              </div>

              {/* Discount Selector */}
              <div className="py-2">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-3 h-3 text-white/40" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Apply Discount</span>
                </div>
                <div className="flex gap-2">
                  {[0, 5, 10, 15, 20].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDiscount(d)}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all border",
                        discount === d 
                          ? "bg-surface text-primary border-white" 
                          : "bg-surface/5 text-white border-white/10 hover:bg-surface/10"
                      )}
                    >
                      {d}%
                    </button>
                  ))}
                </div>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-emerald-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                  <span>Discount ({discount}%)</span>
                  <span>- {formatCurrency(discountAmount)}</span>
                </div>
              )}

              {/* Service Charge Selector */}
              <div className="py-2 border-t border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-3 h-3 text-white/40" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Service Charge</span>
                </div>
                <div className="flex gap-2">
                  {[
                    { label: 'No Charge', value: 0 },
                    { label: '+5%', value: 5 },
                    { label: '+10%', value: 10 },
                    { label: '+30%', value: 30 }
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setServiceChargePercent(opt.value)}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg text-[8px] font-bold transition-all border whitespace-nowrap",
                        serviceChargePercent === opt.value 
                          ? "bg-surface text-primary border-white shadow-sm" 
                          : "bg-surface/5 text-white border-white/10 hover:bg-surface/10"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              {serviceChargePercent > 0 && (
                <div className="flex justify-between items-center text-amber-300 text-[10px] font-bold uppercase tracking-[0.2em]">
                  <span>Service Charge ({serviceChargePercent}%)</span>
                  <span>+ {formatCurrency(serviceChargeAmount)}</span>
                </div>
              )}
              <div className="pt-4 mt-2 border-t border-white/10 flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em] mb-1.5">Grand Total</span>
                  <div className="flex items-baseline gap-2">
                     <h4 className="text-3xl lg:text-4xl font-black text-white tracking-tighter">{formatCurrency(total)}</h4>
                     <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">INR</span>
                  </div>
                </div>
                <div className="p-3 bg-surface/10 rounded-2xl border border-white/20">
                   <Users className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                disabled={cart.length === 0 || isProcessing}
                onClick={handleKDS}
                className="flex flex-col items-center justify-center gap-2 py-4 bg-surface/10 border-2 border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-surface/20 hover:border-white/20 disabled:opacity-50 transition-all group active:scale-95"
              >
                <ChefHat className={cn("w-5 h-5 text-white")} /> 
                {isProcessing ? 'Sending...' : 'Send to KDS'}
              </button>
              <button 
                onClick={() => setShowPaymentModal(true)}
                disabled={cart.length === 0 || isProcessing}
                className="flex flex-col items-center justify-center gap-2 py-4 bg-surface text-primary rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-black/10 hover:bg-slate-50 disabled:opacity-50 transition-all group active:scale-95"
              >
                <CreditCard className="w-5 h-5" /> 
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Cart Toggle */}
      {/* Floating cart bar removed - now in Header */}

      {/* History Modal */}
      {showHistory && (
         <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <div onClick={() => setShowHistory(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-[95%] md:max-w-[560px] max-h-[90vh] bg-surface rounded-[2rem] md:rounded-[2.5rem] overflow-hidden flex flex-col self-center">
             <div className="px-5 py-4 md:px-6 md:py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 shrink-0">
                <div>
                  <h3 className="text-lg md:text-2xl font-black tracking-tight uppercase">Order History</h3>
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Today's Transactions</p>
                </div>
                <button onClick={() => setShowHistory(false)} className="p-2 md:p-3 hover:bg-surface rounded-xl md:rounded-2xl transition-all shadow-sm"><X className="w-5 h-5 md:w-6 md:h-6" /></button>
             </div>
             <div className="px-5 md:px-6 py-6 space-y-4 overflow-y-auto scrollbar-hide">
                {orderHistory.map(order => (
                  <div key={order.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between hover:bg-surface transition-all cursor-pointer group">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center shadow-sm"><Receipt className="w-5 h-5 text-primary" /></div>
                        <div>
                           <h5 className="font-bold text-sm text-text-primary">{order.id}</h5>
                           <p className="text-[10px] font-bold text-slate-400">{order.time} • {order.items} Items</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="font-black text-sm text-text-primary">{formatCurrency(order.total)}</p>
                        <span className={cn("text-[8px] font-black uppercase px-2 py-0.5 rounded-full", order.status === 'Completed' ? "bg-emerald-50 text-emerald-600" : "bg-primary/10 text-primary")}>{order.status}</span>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}

      {/* Compact & Interactive Payment Modal */}
      {showPaymentModal && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 overflow-hidden">
          <div 
            onClick={handleClosePaymentModal} 
            className="absolute inset-0 bg-slate-900/60" 
          />
           <div 
            className="relative w-full max-w-[95%] md:max-w-[560px] bg-surface rounded-[2rem] md:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] border border-white/20 self-center"
          >
            {/* Header */}
            <div className="px-5 py-5 sm:px-6 sm:py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 shrink-0">
              <div className="flex items-center gap-3 sm:gap-5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl">
                  <Receipt className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-2xl font-black text-text-primary tracking-tight uppercase leading-none">Final Settlement</h3>
                  <p className="text-[8px] sm:text-[10px] text-text-secondary font-black uppercase tracking-[0.2em] mt-1 opacity-60">Invoice #POS-2026-X49</p>
                </div>
              </div>
              <button 
                onClick={handleClosePaymentModal} 
                className="p-2 sm:p-3 hover:bg-surface rounded-xl sm:rounded-2xl border border-transparent hover:border-slate-100 shadow-sm"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-text-secondary" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 scrollbar-hide">
              {paymentState === 'idle' ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="p-5 sm:p-6 bg-primary rounded-[1.25rem] sm:rounded-[1.5rem] flex flex-col items-center text-center shadow-xl border border-white/20">
                        <p className="text-[8px] sm:text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mb-1 sm:mb-2">Amount Due</p>
                        <h4 className="text-2xl sm:text-3xl font-black text-white tracking-tighter">{formatCurrency(total)}</h4>
                        <div className="mt-2 sm:mt-3 px-2 py-0.5 bg-surface/20 text-white rounded-full text-[6px] sm:text-[7px] font-black uppercase tracking-widest">Tax Included</div>
                     </div>
                     <div className="p-5 sm:p-6 bg-slate-50 rounded-[1.25rem] sm:rounded-[1.5rem] border-2 border-slate-100 flex flex-col items-center text-center">
                        <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1 sm:mb-2">Cart Summary</p>
                        <h4 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tighter">{cart.reduce((a, b) => a + b.qty, 0)}</h4>
                        <p className="mt-1 text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-widest">Items Count</p>
                     </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[9px] font-black text-text-secondary uppercase tracking-[0.3em] px-1">Payment Method</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
                      {[

                        { name: 'Card', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { name: 'QR Code', icon: QrCode, color: 'text-primary', bg: 'bg-primary-light' },
                        { name: 'Bank Transfer', icon: Receipt, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                      ].map((method) => (
                        <button 
                          onClick={() => setPaymentMethod(method.name)}
                          key={method.name} 
                          className={cn(
                            "relative p-3 lg:p-5 rounded-xl lg:rounded-[1.5rem] border-2 flex flex-col items-center justify-center gap-2 lg:gap-3 transition-all overflow-hidden active:scale-95", 
                            paymentMethod === method.name 
                              ? "border-primary bg-indigo-50/30 shadow-md" 
                              : "border-slate-50 bg-slate-50/50 hover:border-primary/20 hover:bg-surface"
                          )}
                        >
                          <div className={cn("w-9 h-9 lg:w-12 lg:h-12 rounded-lg lg:rounded-2xl flex items-center justify-center shadow-sm shrink-0", method.bg)}>
                            <method.icon className={cn("w-4 h-4 lg:w-6 lg:h-6 stroke-[2.5]", method.color)} />
                          </div>
                          <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.1em] text-center">{method.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {paymentMethod === 'Room Service' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <h4 className="text-[9px] font-black text-text-secondary uppercase tracking-[0.3em] px-1">Select Active Guest</h4>
                      <div className="space-y-2">
                        <select 
                          value={selectedGuestId}
                          onChange={(e) => setSelectedGuestId(e.target.value)}
                          className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm appearance-none focus:border-primary/20"
                        >
                          <option value="">Select Guest (In-House Only)</option>
                          {reservations
                            .filter(r => r.status === 'Checked In')
                            .map(res => (
                              <option key={res.id} value={res.guest_id}>
                                {res.guestName} • {res.targetId}
                              </option>
                            ))}
                        </select>
                        {reservations.filter(r => r.status === 'Checked In').length === 0 && (
                          <p className="text-[10px] font-bold text-primary uppercase tracking-widest px-1">
                            No checked-in guests found
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <p className="text-center text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em] pt-4">
                     Secure 256-bit Encrypted Transaction
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-6 py-4">
                   <div className="p-4 bg-white rounded-3xl shadow-sm border-2 border-slate-100">
                      {paymentMethod === 'QR Code' ? (
                        <QRCodeSVG value={invoiceUrl} size={200} />
                      ) : (
                        <div className="w-[200px] h-[200px] flex items-center justify-center bg-slate-50 rounded-2xl">
                           <CreditCard className="w-16 h-16 text-primary opacity-50" />
                        </div>
                      )}
                   </div>
                   <div className="text-center space-y-2">
                      <h4 className="text-xl font-black uppercase text-text-primary">Waiting for Payment</h4>
                      <p className="text-xs font-bold text-text-secondary">Please ask the customer to complete the payment.</p>
                      
                      {paymentMethod !== 'QR Code' && (
                         <button 
                           onClick={() => window.open(invoiceUrl, '_blank')}
                           className="mt-4 px-6 py-2 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/30"
                         >
                           Open Payment Link
                         </button>
                      )}
                   </div>
                   <div className="flex items-center gap-2 mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <div className="w-4 h-4 border-2 border-slate-300 border-t-primary rounded-full animate-spin" />
                      Awaiting confirmation...
                   </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Area */}
            <div className="px-5 py-5 lg:px-6 lg:py-6 border-t border-slate-50 bg-surface shrink-0">
              <div className="grid grid-cols-2 gap-4">
                <button 
                  disabled={isProcessing}
                  onClick={handlePrintOnly}
                  className="w-full py-4 bg-slate-50 text-slate-400 hover:text-primary border border-slate-100 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                   <Printer className="w-4 h-4" /> Print Invoice
                </button>
                <button 
                  disabled={isProcessing || paymentState !== 'idle'}
                  onClick={handleFinalPayment}
                  className={cn(
                    "w-full py-4 shadow-xl rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all active:scale-95",
                    (isProcessing || paymentState !== 'idle')
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                      : "btn-primary shadow-primary/20"
                  )}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isProcessing ? 'Processing...' : paymentState !== 'idle' ? 'Awaiting Payment' : 'Pay & Settle'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Add Item Modal */}
      {showAddItemModal && createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 overflow-hidden">
          <div onClick={() => setShowAddItemModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
           <div className="relative w-full sm:max-w-[500px] bg-surface rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh] self-center border border-slate-100">
            <div className="px-5 py-4 md:px-8 md:py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/20 shrink-0">
               <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-14 md:h-14 bg-primary rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-xl shrink-0">
                     <Plus className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                     <h3 className="text-lg md:text-xl font-black uppercase tracking-tight leading-none">New POS Item</h3>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5 md:mt-1">POS Inventory Creation</p>
                  </div>
               </div>
               <button onClick={() => setShowAddItemModal(false)} className="p-2 md:p-2.5 hover:bg-surface rounded-xl border border-transparent hover:border-slate-100 shadow-sm group">
                  <X className="w-5 h-5 text-slate-400" />
               </button>
            </div>
            
            <form 
              className="flex-1 overflow-y-auto flex flex-col"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const name = (formData.get('name') || '').trim();
                const description = (formData.get('description') || '').trim();
                const category = newItemCategory.trim();
                const priceRaw = formData.get('price');
                const price = parseFloat(priceRaw);
                const image = newItemIcon;
                const ratingRaw = formData.get('rating');
                const rating = ratingRaw ? parseFloat(ratingRaw) : 0;
                
                if (!name) {
                  showToastMessage('Item name is required', 'error');
                  return;
                }
                if (!category) {
                  showToastMessage('Category is required', 'error');
                  return;
                }
                if (isNaN(price) || price <= 0) {
                  showToastMessage('Please enter a valid price', 'error');
                  return;
                }
                if (rating < 0 || rating > 5) {
                  showToastMessage('Rating must be between 0 and 5', 'error');
                  return;
                }
                
                handleAddItem({ name, category, price, image, description, rating });
              }}
            >
               <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Item Name *</label>
                        <input name="name" type="text" placeholder="e.g. Garlic Bread" className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-sm transition-all" required />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Category *</label>
                        <select 
                           name="category" 
                           value={newItemCategory}
                           onChange={(e) => {
                              setNewItemCategory(e.target.value);
                              updateAutoIcon(e.target.value);
                           }}
                           className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-sm transition-all cursor-pointer" 
                           required 
                        >
                           <option value="">Select Category *</option>
                           {categoriesList
                             .filter(c => c !== 'All Items' && c !== 'All')
                             .map(c => (
                               <option key={c} value={c}>{c}</option>
                             ))
                           }
                        </select>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (Rp) *</label>
                        <input name="price" type="number" step="0.01" placeholder="99.00" className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-sm transition-all" required />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Item Image / Icon</label>
                        <div className="flex items-center gap-3">
                           <div className="w-12 h-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden text-xl shadow-inner shrink-0">
                              {selectedImage ? (
                                <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-2xl">{newItemIcon}</span>
                              )}
                           </div>
                           <div className="flex-1 relative group/upload">
                              <input 
                                 type="file" 
                                 accept="image/*"
                                 onChange={handleImageChange}
                                 className="absolute inset-0 opacity-0 cursor-pointer z-10"
                              />
                              <div className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2 group-hover/upload:border-primary/20 group-hover/upload:bg-surface transition-all">
                                 <Plus className="w-4 h-4" /> Upload
                              </div>
                           </div>
                           {selectedImage && (
                             <button 
                               type="button"
                               onClick={() => { setSelectedImage(null); setNewItemIcon('🍽️'); }}
                               className="p-2.5 bg-rose-50 text-primary hover:bg-rose-100 rounded-xl transition-all"
                             >
                                <X className="w-4 h-4" />
                             </button>
                           )}
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Rating (0-5)</label>
                        <input name="rating" type="number" step="0.1" min="0" max="5" placeholder="e.g. 4.5" className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-sm transition-all" />
                     </div>
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                     <textarea name="description" placeholder="Describe the item ingredients or details..." className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-sm min-h-[100px] md:min-h-[120px] resize-none transition-all" />
                  </div>
               </div>

               <div className="p-6 md:p-8 border-t border-slate-50 flex flex-col sm:flex-row gap-3 md:gap-4 bg-surface shrink-0 relative z-20">
                  <button type="button" onClick={() => setShowAddItemModal(false)} className="flex-1 py-4 border-2 border-slate-100 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 shadow-sm transition-all text-slate-400">
                     Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary py-4 rounded-full flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary/30 active:scale-95 transition-all">
                     Create POS Item
                  </button>
               </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Size Selection Modal */}
      {selectedItemForSize && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <div 
            onClick={() => setSelectedItemForSize(null)} 
            className="absolute inset-0 bg-slate-900/60" 
          />
          <div 
            className="relative w-full max-w-[95%] md:max-w-[440px] bg-surface rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 self-center"
          >
            <div className="px-8 py-8 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-5xl mb-6 shadow-inner">
                {getImageUrl(selectedItemForSize.image)}
              </div>
              <h3 className="text-2xl font-black text-text-primary tracking-tight uppercase leading-tight">
                {selectedItemForSize.item_name || selectedItemForSize.name}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2 mb-8">Select Item Size</p>
              
              <div className="w-full space-y-3">
                {selectedItemForSize.sizes.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => addToCart(selectedItemForSize, size)}
                    className="w-full flex items-center justify-between p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl hover:border-primary/30 hover:bg-indigo-50/30 transition-all group"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-black text-text-primary uppercase tracking-wider">{size.name}</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Custom Portion</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-primary">{formatCurrency(size.price)}</span>
                      <div className="w-8 h-8 bg-surface rounded-lg flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setSelectedItemForSize(null)}
                className="mt-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] hover:text-primary"
              >
                Cancel Selection
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Hidden Printable Receipt - 80mm Thermal Style */}
      {orderForReceipt && (
        <div id="printable-area" className="hidden print:block printable-area receipt-print active-print">
          <div className="text-center space-y-1 mb-4">
            <h1 className="text-2xl font-black uppercase tracking-tight">{settings?.businessName || 'Gila House'}</h1>
            <p className="text-[10px] font-bold">{settings?.address || 'Main Branch'}</p>
            <p className="text-[10px] font-bold">Ph: {settings?.phone || '+91 12345 67890'}</p>
            <p className="text-[10px] font-bold">{settings?.email}</p>
          </div>
          
          <div className="border-b-2 border-dashed border-slate-900 my-4"></div>
          
          <div className="space-y-1.5 text-[11px] font-bold uppercase">
            <div className="flex justify-between">
              <span>Bill No:</span>
              <span className="font-black">{orderForReceipt.id ? String(orderForReceipt.id).split('-').pop() : `INV${Math.floor(Math.random()*1000)}`}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{user?.name || 'Admin'}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span>{orderForReceipt.customer || 'Walk-in'}</span>
            </div>
          </div>

          <div className="border-b-2 border-dashed border-slate-900 my-4"></div>

          <table className="w-full text-[11px] font-bold uppercase mb-4">
            <thead>
              <tr className="border-b-2 border-slate-900">
                <th className="text-left py-2">Item Description</th>
                <th className="text-center py-2 px-2">Qty</th>
                <th className="text-right py-2">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dashed divide-slate-200">
              {orderForReceipt.itemsList?.map((item, i) => (
                <tr key={i}>
                  <td className="py-3 pr-2 leading-tight">{item.name}</td>
                  <td className="py-3 text-center px-2">{item.quantity}</td>
                  <td className="py-3 text-right">{item.price.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t-2 border-dashed border-slate-900 pt-4 space-y-2">
            <div className="flex justify-between text-[11px] font-bold uppercase">
              <span>Subtotal:</span>
              <span>{(orderForReceipt.subtotal !== undefined ? orderForReceipt.subtotal : subtotal).toLocaleString()}</span>
            </div>
            {((orderForReceipt.discountPercent !== undefined ? orderForReceipt.discountPercent : discount) > 0) && (
              <div className="flex justify-between text-[11px] font-bold uppercase text-slate-500">
                <span>Discount ({(orderForReceipt.discountPercent !== undefined ? orderForReceipt.discountPercent : discount)}%):</span>
                <span>-{(orderForReceipt.discount !== undefined ? orderForReceipt.discount : discountAmount).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-[11px] font-bold uppercase">
              <span>Tax (GST 5%):</span>
              <span>{(orderForReceipt.tax !== undefined ? orderForReceipt.tax : gst).toLocaleString()}</span>
            </div>
            {((orderForReceipt.serviceChargePercent !== undefined ? orderForReceipt.serviceChargePercent : serviceChargePercent) > 0) && (
              <div className="flex justify-between text-[11px] font-bold uppercase">
                <span>Service Charge ({(orderForReceipt.serviceChargePercent !== undefined ? orderForReceipt.serviceChargePercent : serviceChargePercent)}%):</span>
                <span>+{(orderForReceipt.serviceChargeAmount !== undefined ? orderForReceipt.serviceChargeAmount : serviceChargeAmount).toLocaleString()}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-slate-900">
              <span className="text-lg font-black uppercase tracking-tighter">Grand Total:</span>
              <span className="text-xl font-black tracking-tighter">Rs.{(orderForReceipt.total !== undefined ? orderForReceipt.total : total).toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-8 space-y-1.5 text-[11px] font-bold uppercase">
            <div className="flex justify-between">
              <span>Payment Mode:</span>
              <span>{orderForReceipt.payment || 'ONLINE'}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Items:</span>
              <span>{orderForReceipt.itemsList?.length || 0}</span>
            </div>
          </div>

          <div className="text-center pt-12 space-y-2">
            <p className="text-sm font-black uppercase tracking-[0.2em]">*** THANK YOU ***</p>
            <p className="text-[10px] font-bold uppercase tracking-widest">Visit Again!</p>
            <p className="text-[8px] font-black text-slate-400 mt-8 uppercase tracking-tighter">Powered by {settings?.businessName || 'Gila House'} POS</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
