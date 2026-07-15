import React, { useState, useMemo } from 'react';
import { CreditCard, ChevronLeft, Search, Printer, Calendar, Clock, DollarSign, Wallet, FileText, CheckCircle2, AlertCircle, X, ShieldAlert, Sparkles, ArrowRight, Download, Check } from 'lucide-react';
import { useOrders } from "../../../context/OrdersContext";
import { useCustomer } from "../../../context/CustomerContext";
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from "../../../utils/currencyUtils";
import { cn } from "../../../utils/cn";
import printContent from "../../../utils/printUtil";
import { createPortal } from 'react-dom';

const CustomerPayments = () => {
  const navigate = useNavigate();
  const { orders, payOrder } = useOrders();
  const { profile } = useCustomer();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [toast, setToast] = useState(null);

  // Modals state
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [checkoutOrderId, setCheckoutOrderId] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Filter orders for this customer
  const customerOrders = useMemo(() => {
    const name = profile?.full_name || profile?.name || '';
    const tableStr = profile?.tableId ? `T-${profile.tableId}` : '';
    return orders.filter(o => 
      o.customer === name || (tableStr && o.table === tableStr)
    );
  }, [orders, profile]);

  // Calculations for Overview Cards
  const stats = useMemo(() => {
    let totalPaid = 0;
    let pendingPayments = 0;
    let refundedAmount = 0;
    let totalTransactions = 0;

    customerOrders.forEach(o => {
      const status = (o.payment_status || 'pending').toLowerCase();
      const amount = Number(o.grand_total || o.amount || 0);

      if (status === 'paid') {
        totalPaid += amount;
        totalTransactions++;
      } else if (status === 'pending') {
        pendingPayments += amount;
      } else if (status === 'refunded') {
        refundedAmount += amount;
        totalTransactions++;
      } else if (status === 'failed') {
        totalTransactions++;
      }
    });

    return { totalPaid, pendingPayments, refundedAmount, totalTransactions };
  }, [customerOrders]);

  const selectedPayment = useMemo(() => 
    customerOrders.find(o => String(o.id) === String(selectedPaymentId)),
    [customerOrders, selectedPaymentId]
  );

  const checkoutOrder = useMemo(() => 
    customerOrders.find(o => String(o.id) === String(checkoutOrderId)),
    [customerOrders, checkoutOrderId]
  );

  // Apply filters
  const filteredPayments = useMemo(() => {
    return customerOrders.filter(o => {
      const pStatus = (o.payment_status || 'pending').toLowerCase();
      const orderNo = String(o.order_number || o.id).toLowerCase();
      const txnId = `TXN-ORD-${o.id}`.toLowerCase();

      // Search Filter
      const matchesSearch = orderNo.includes(searchQuery.toLowerCase()) || txnId.includes(searchQuery.toLowerCase());

      // Status Filter
      let matchesStatus = true;
      if (statusFilter !== 'All') {
        matchesStatus = pStatus === statusFilter.toLowerCase();
      }

      // Date Filter
      let matchesDate = true;
      if (dateFilter !== 'All' && o.createdAt) {
        const orderDate = new Date(o.createdAt);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dateFilter === 'Today') {
          matchesDate = orderDate >= today;
        } else if (dateFilter === 'This Week') {
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          matchesDate = orderDate >= startOfWeek;
        } else if (dateFilter === 'This Month') {
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          matchesDate = orderDate >= startOfMonth;
        } else if (dateFilter === 'Custom' && customRange.start && customRange.end) {
          const start = new Date(customRange.start);
          const end = new Date(customRange.end);
          end.setHours(23, 59, 59, 999);
          matchesDate = orderDate >= start && orderDate <= end;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [customerOrders, searchQuery, statusFilter, dateFilter, customRange]);

  // Splits list into Active (Unpaid/Processing) and Completed (Paid/Refunded/etc.)
  const activePayments = useMemo(() => 
    filteredPayments.filter(o => (o.payment_status || 'pending').toLowerCase() === 'pending'),
    [filteredPayments]
  );

  const completedPayments = useMemo(() => 
    filteredPayments.filter(o => (o.payment_status || 'pending').toLowerCase() !== 'pending'),
    [filteredPayments]
  );

  const getStatusBadge = (status = '') => {
    const s = status.toLowerCase();
    switch(s) {
      case 'paid':
        return { label: 'Paid', class: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckCircle2 };
      case 'pending':
        return { label: 'Waiting for Payment', class: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Wallet };
      case 'processing':
        return { label: 'Processing', class: 'bg-indigo-500/10 text-primary border-primary/20', icon: Clock };
      case 'failed':
        return { label: 'Failed', class: 'bg-rose-500/10 text-primary border-rose-500/20', icon: ShieldAlert };
      case 'refunded':
        return { label: 'Refunded', class: 'bg-teal-500/10 text-teal-500 border-teal-500/20', icon: Sparkles };
      case 'cancelled':
        return { label: 'Cancelled', class: 'bg-slate-500/10 text-slate-500 border-slate-500/20', icon: X };
      default:
        return { label: status, class: 'bg-slate-50 text-slate-500 border-slate-100', icon: Clock };
    }
  };

  const handlePayNowSubmit = async () => {
    if (!selectedMethod) return;
    setIsProcessing(true);

    try {
      if (selectedMethod === 'Cashier') {
        // Keeps it pending, but updates method
        await payOrder(checkoutOrderId, 'Card at Cashier');
        showToast('Instruction sent. Please tap/swipe at Cashier!', 'success');
      } else {
        // Simulated Payment Processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        const result = await payOrder(checkoutOrderId, selectedMethod);
        if (result.success) {
          showToast('Payment successful!', 'success');
        } else {
          showToast(result.message, 'error');
        }
      }
      setCheckoutOrderId(null);
      setSelectedMethod('');
    } catch (err) {
      showToast(err.message || 'Payment processing failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 relative">
      {/* Toast Feedback */}
      {toast && (
        <div className="fixed top-6 right-6 z-[999] bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-primary" />}
          <span className="text-xs font-black uppercase tracking-widest">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
         <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2.5 bg-surface rounded-xl shadow-sm border border-slate-100 lg:hidden">
               <ChevronLeft className="w-5 h-5 text-text-primary" />
            </button>
            <h2 className="text-xl lg:text-2xl font-black text-text-primary uppercase tracking-tight">Payments Hub</h2>
         </div>
      </div>

      {/* 1. Payment Overview Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         {[
           { label: 'Total Paid', value: stats.totalPaid, color: 'text-emerald-500 bg-emerald-50' },
           { label: 'Pending Payments', value: stats.pendingPayments, color: 'text-amber-500 bg-amber-50' },
           { label: 'Refunded Amount', value: stats.refundedAmount, color: 'text-teal-500 bg-teal-50' },
           { label: 'Total Transactions', value: stats.totalTransactions, isCount: true, color: 'text-primary bg-orange-50' }
         ].map((card, idx) => (
           <div key={idx} className="card p-5 bg-surface border-none shadow-xl shadow-slate-100/50 rounded-3xl hover:shadow-premium-hover transition-all">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none block mb-2">{card.label}</span>
              <h3 className="text-xl lg:text-2xl font-black text-text-primary tracking-tight leading-none">
                 {card.isCount ? card.value : formatCurrency(card.value.toFixed(0))}
              </h3>
              <div className={cn("w-1.5 h-1.5 rounded-full mt-3", card.color.split(' ')[0])} />
           </div>
         ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col xl:flex-row gap-4 bg-surface p-4 rounded-3xl border border-slate-50 shadow-sm">
         {/* Search */}
         <div className="relative group flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order # or Transaction ID..." 
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent focus:border-primary/20 rounded-2xl outline-none text-xs font-bold transition-all"
            />
         </div>

         {/* Filters bar */}
         <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold outline-none text-slate-600 cursor-pointer"
            >
               <option value="All">All Statuses</option>
               <option value="Paid">Paid</option>
               <option value="Pending">Waiting for Payment</option>
               <option value="Refunded">Refunded</option>
               <option value="Failed">Failed</option>
            </select>

            {/* Date Filter */}
            <select 
              value={dateFilter} 
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold outline-none text-slate-600 cursor-pointer"
            >
               <option value="All">All Dates</option>
               <option value="Today">Today</option>
               <option value="This Week">This Week</option>
               <option value="This Month">This Month</option>
               <option value="Custom">Custom Range</option>
            </select>

            {dateFilter === 'Custom' && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                 <input 
                   type="date" 
                   value={customRange.start}
                   onChange={(e) => setCustomRange({...customRange, start: e.target.value})}
                   className="px-3 py-2 bg-slate-50 border rounded-xl text-[10px] font-bold outline-none" 
                 />
                 <span className="text-[10px] text-slate-300 font-bold uppercase">To</span>
                 <input 
                   type="date" 
                   value={customRange.end}
                   onChange={(e) => setCustomRange({...customRange, end: e.target.value})}
                   className="px-3 py-2 bg-slate-50 border rounded-xl text-[10px] font-bold outline-none" 
                 />
              </div>
            )}
         </div>
      </div>

      {/* 2. Active Payments (Unpaid) */}
      <div className="space-y-4">
         <h3 className="text-lg font-black uppercase tracking-tight px-1 flex items-center justify-between">
            Active Payments
            <span className="text-[10px] font-black text-slate-400 bg-slate-50 border px-3 py-1 rounded-full">{activePayments.length} Pending</span>
         </h3>

         {activePayments.length === 0 ? (
           <div className="card p-8 bg-surface border-none shadow-xl shadow-slate-100/50 rounded-3xl text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="font-black text-text-primary text-sm uppercase">All your payments are completed.</h4>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">No active payment invoices waiting for settlement.</p>
           </div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {activePayments.map(order => {
                const badge = getStatusBadge(order.payment_status);
                return (
                  <div key={order.id} className="card p-5 bg-surface border border-slate-50 shadow-xl shadow-slate-100/50 rounded-3xl flex flex-col justify-between space-y-4">
                     <div className="space-y-3">
                        <div className="flex items-center justify-between">
                           <span className={cn("px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border", badge.class)}>
                              {badge.label}
                           </span>
                           <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Order #{order.order_number || order.id}</span>
                        </div>
                        <h4 className="font-black text-text-primary uppercase text-sm tracking-tight pt-1">
                           {order.items && order.items.length > 0 ? order.items.map(i => i.item_name || i.name).join(', ') : 'Dining Order'}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest pt-1 border-t border-slate-50">
                           <span className="flex items-center gap-1 shrink-0"><Clock className="w-3.5 h-3.5" /> {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : 'Recent'}</span>
                           <span className="flex items-center gap-1 shrink-0"><Calendar className="w-3.5 h-3.5" /> {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</span>
                           <span className="flex items-center gap-1 shrink-0"><DollarSign className="w-3.5 h-3.5" /> Table {order.table_code || order.table || 'N/A'}</span>
                        </div>
                     </div>

                     <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                        <div>
                           <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Amount</span>
                           <p className="text-lg font-black text-text-primary tracking-tighter">{formatCurrency((order.grand_total || order.amount || 0).toString().replace('Rp ', ''))}</p>
                        </div>
                        <div className="flex items-center gap-2">
                           <button 
                             onClick={() => { setSelectedPaymentId(order.id); }}
                             className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-100 transition-all text-slate-500"
                           >
                              Details
                           </button>
                           <button 
                             onClick={() => setCheckoutOrderId(order.id)}
                             className="btn-premium px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center gap-1 cursor-pointer"
                           >
                              Pay Now <ArrowRight className="w-3 h-3" />
                           </button>
                        </div>
                     </div>
                  </div>
                );
              })}
           </div>
         )}
      </div>

      {/* 3. Payment History Section */}
      <div className="space-y-4">
         <h3 className="text-lg font-black uppercase tracking-tight px-1 flex items-center justify-between">
            Payment History
            <span className="text-[10px] font-black text-slate-400 bg-slate-50 border px-3 py-1 rounded-full">{completedPayments.length} Transactions</span>
         </h3>

         {completedPayments.length === 0 ? (
           <div className="card p-12 bg-surface border-none shadow-xl shadow-slate-100/50 rounded-3xl text-center space-y-3 max-w-lg mx-auto">
              <FileText className="w-16 h-16 text-slate-200 mx-auto" />
              <h4 className="font-black text-text-primary text-sm uppercase">No payment records found.</h4>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">You don't have any past transactions in Gila House.</p>
           </div>
         ) : (
           <div className="space-y-4">
              {completedPayments.map(order => {
                const badge = getStatusBadge(order.payment_status);
                const txnCode = `TXN-ORD-${order.id}`;
                return (
                  <div key={order.id} className="card p-5 bg-surface border border-slate-50 shadow-xl shadow-slate-100/50 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:bg-slate-50 transition-all">
                     <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors shrink-0 shadow-inner">
                           <FileText className="w-6 h-6" />
                        </div>
                        <div className="space-y-1.5 flex-1 min-w-0">
                           <div className="flex items-center gap-2">
                              <span className={cn("px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border shrink-0", badge.class)}>
                                 {badge.label}
                              </span>
                              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest truncate">ID: {txnCode}</span>
                           </div>
                           <h4 className="font-black text-text-primary text-sm uppercase tracking-tight truncate">
                              {order.items && order.items.length > 0 ? order.items.map(i => i.item_name || i.name).join(', ') : 'Dining Order'}
                           </h4>
                           <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest pt-0.5">
                              <span className="flex items-center gap-1 shrink-0"><Calendar className="w-3.5 h-3.5" /> {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</span>
                              <span className="flex items-center gap-1 shrink-0"><Clock className="w-3.5 h-3.5" /> {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : ''}</span>
                              <span className="flex items-center gap-1 shrink-0"><DollarSign className="w-3.5 h-3.5" /> Table {order.table_code || order.table || 'N/A'}</span>
                              <span className="flex items-center gap-1 shrink-0"><CreditCard className="w-3.5 h-3.5" /> {order.payment_method || 'Online Card'}</span>
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-slate-50 shrink-0">
                        <div className="text-left md:text-right">
                           <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Grand Total</span>
                           <p className="text-base lg:text-lg font-black text-text-primary tracking-tighter">
                              {formatCurrency((order.grand_total || order.amount || 0).toString().replace('Rp ', ''))}
                           </p>
                        </div>
                        <button 
                          onClick={() => {
                            setSelectedPaymentId(order.id);
                          }}
                          className="p-3 bg-slate-50 hover:bg-primary hover:text-white text-slate-400 rounded-xl hover:shadow-lg transition-all border border-slate-100 shrink-0 cursor-pointer"
                        >
                           <Printer className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
                );
              })}
           </div>
         )}
      </div>

      {/* Modern Mock Checkout Modal */}
      {checkoutOrder && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-0 sm:p-4">
           <div onClick={() => !isProcessing && setCheckoutOrderId(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
           <div className="relative w-full max-w-md bg-surface rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 sm:zoom-in-95 duration-300 self-end sm:self-center">
              <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                 <div>
                    <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-text-primary">Pay Invoice</h3>
                    <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 text-primary">Cashless Secure Gateways Only</p>
                 </div>
                 {!isProcessing && <button onClick={() => setCheckoutOrderId(null)} className="p-2 hover:bg-surface rounded-xl transition-all shadow-sm"><X className="w-5 h-5" /></button>}
              </div>

              <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto scrollbar-hide">
                 {isProcessing ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-6 animate-pulse">
                       <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                       <div>
                          <p className="text-sm font-black uppercase tracking-tight text-text-primary">Authorizing Settlement...</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">Connecting to secure cashless network</p>
                       </div>
                    </div>
                 ) : (
                   <>
                    <div className="bg-primary/5 p-5 rounded-[1.5rem] border border-primary/10 flex items-center justify-between">
                       <div>
                          <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Invoice Total</p>
                          <p className="text-2xl font-black text-text-primary tracking-tighter">
                             {formatCurrency((checkoutOrder.grand_total || checkoutOrder.amount || 0).toString().replace('Rp ', ''))}
                          </p>
                       </div>
                       <div className="w-12 h-12 bg-surface rounded-2xl flex items-center justify-center shadow-sm text-primary shrink-0">
                          <Wallet className="w-6 h-6" />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Cashless Method</p>
                       {[
                         { id: 'Credit Card', name: 'Credit Card', desc: 'Secure card authorization', icon: CreditCard },
                         { id: 'Debit Card', name: 'Debit Card', desc: 'Immediate direct debit', icon: CreditCard },
                         { id: 'Google Pay', name: 'Google Pay', desc: 'Fast mobile checkout', icon: Sparkles },
                         { id: 'Apple Pay', name: 'Apple Pay', desc: 'Secure iOS authentication', icon: Sparkles },
                         { id: 'Cashier', name: 'Pay by Card at Cashier', desc: 'Present card at billing desk', icon: Wallet }
                       ].map(method => (
                         <button 
                           key={method.id}
                           onClick={() => setSelectedMethod(method.id)}
                           className={cn(
                             "w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all active:scale-[0.99]",
                             selectedMethod === method.id 
                               ? "bg-primary border-primary text-white shadow-xl shadow-primary/20" 
                               : "bg-slate-50 border-transparent text-text-primary hover:border-slate-100"
                           )}
                         >
                            <div className="flex items-center gap-3 text-left">
                               <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", selectedMethod === method.id ? "bg-surface/20" : "bg-surface text-primary shadow-sm")}>
                                  <method.icon className="w-4 h-4" />
                               </div>
                               <div>
                                  <p className="text-xs font-black uppercase tracking-tight">{method.name}</p>
                                  <p className={cn("text-[8px] font-bold uppercase tracking-widest mt-0.5", selectedMethod === method.id ? "text-white/60" : "text-slate-400")}>{method.desc}</p>
                               </div>
                            </div>
                            {selectedMethod === method.id && <Check className="w-4 h-4" />}
                         </button>
                       ))}
                    </div>

                    <button 
                      disabled={!selectedMethod}
                      onClick={handlePayNowSubmit}
                      className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                       Confirm Payment <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                   </>
                 )}
              </div>
           </div>
        </div>,
        document.body
      )}

      {/* Transaction Details & Digital Receipt Modal */}
      {selectedPayment && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
           <div onClick={() => setSelectedPaymentId(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
           <div className="relative w-full max-w-md bg-surface rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] self-end sm:self-center animate-in slide-in-from-bottom-full duration-300">
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 shrink-0">
                 <div>
                    <h3 className="text-base font-black uppercase tracking-tight text-text-primary">Receipt & Transaction</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">#{selectedPayment.order_number || selectedPayment.id}</p>
                 </div>
                 <button onClick={() => setSelectedPaymentId(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X className="w-5 h-5 text-text-primary" /></button>
              </div>

              {/* Printable receipt content */}
              <div className="p-6 sm:p-8 space-y-6 overflow-y-auto scrollbar-hide flex-1">
                 <div id="printable-receipt-card" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-inner font-mono text-xs text-black">
                    <div className="text-center space-y-2 border-b border-dashed border-slate-200 pb-4 mb-4">
                       <h3 className="text-lg font-black uppercase tracking-wider">Gila House</h3>
                       <p className="text-[9px] text-slate-400 uppercase tracking-widest">Premium Restaurant & Bar</p>
                       <p className="text-[8px] text-slate-400 uppercase mt-2">Ref: TXN-ORD-{selectedPayment.id}</p>
                    </div>

                    <div className="space-y-1.5 border-b border-dashed border-slate-200 pb-4 mb-4 text-[10px]">
                       <div className="flex justify-between"><span className="text-slate-400 uppercase font-black">Customer:</span><span>{profile?.full_name || profile?.name}</span></div>
                       <div className="flex justify-between"><span className="text-slate-400 uppercase font-black">Table:</span><span>{selectedPayment.table_code || selectedPayment.table || 'N/A'}</span></div>
                       <div className="flex justify-between"><span className="text-slate-400 uppercase font-black">Gateway:</span><span>{selectedPayment.payment_method || 'Online Checkout'}</span></div>
                       <div className="flex justify-between"><span className="text-slate-400 uppercase font-black">Status:</span><span className="font-black uppercase">{selectedPayment.payment_status}</span></div>
                       <div className="flex justify-between"><span className="text-slate-400 uppercase font-black">Date & Time:</span><span>{selectedPayment.createdAt ? new Date(selectedPayment.createdAt).toLocaleString() : 'N/A'}</span></div>
                    </div>

                    <div className="space-y-2 border-b border-dashed border-slate-200 pb-4 mb-4 text-[10px]">
                       <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block mb-1">Items Summary</span>
                       {selectedPayment.items && selectedPayment.items.map((item, index) => (
                         <div key={index} className="flex justify-between">
                            <span className="truncate max-w-[200px]">{item.item_name || item.name} x {item.quantity}</span>
                            <span>{formatCurrency((item.unit_price * item.quantity).toFixed(0))}</span>
                         </div>
                       ))}
                    </div>

                    <div className="space-y-1.5 text-[10px]">
                       <div className="flex justify-between"><span className="text-slate-400">Subtotal:</span><span>{formatCurrency((selectedPayment.subtotal || selectedPayment.grand_total || 0).toString().replace('Rp ', ''))}</span></div>
                       <div className="flex justify-between"><span className="text-slate-400">Taxes (5%):</span><span>{formatCurrency((selectedPayment.tax || 0).toString().replace('Rp ', ''))}</span></div>
                       <div className="flex justify-between"><span className="text-slate-400">Service Charges:</span><span>{formatCurrency((selectedPayment.service_charge_amount || 0).toString().replace('Rp ', ''))}</span></div>
                       <div className="flex justify-between font-black text-sm border-t border-dashed border-slate-200 pt-3 mt-3 text-text-primary">
                          <span>Grand Total:</span>
                          <span>{formatCurrency((selectedPayment.grand_total || selectedPayment.amount || 0).toString().replace('Rp ', ''))}</span>
                       </div>
                    </div>
                 </div>

                 {/* Receipt Action Buttons */}
                 <div className="grid grid-cols-3 gap-3 shrink-0">
                    <button 
                      onClick={() => {
                        printContent('printable-receipt-card');
                        showToast('Printing receipt...', 'success');
                      }}
                      className="px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 flex items-center justify-center gap-1.5"
                    >
                       <Printer className="w-3.5 h-3.5" /> Print
                    </button>
                    <button 
                      onClick={() => {
                        showToast('Receipt downloaded!', 'success');
                      }}
                      className="px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 flex items-center justify-center gap-1.5"
                    >
                       <Download className="w-3.5 h-3.5" /> Download
                    </button>
                    <button 
                      onClick={() => setSelectedPaymentId(null)}
                      className="px-4 py-3.5 bg-slate-900 hover:bg-black text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5"
                    >
                       Close
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPayments;
