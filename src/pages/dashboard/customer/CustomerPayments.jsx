import React, { useState, useMemo, useEffect } from 'react';
import { 
  CreditCard, 
  ChevronLeft, 
  Search, 
  Printer, 
  Calendar, 
  Clock, 
  DollarSign, 
  Wallet, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ShieldAlert, 
  Sparkles, 
  ArrowRight, 
  Download, 
  Check, 
  RefreshCw, 
  Eye, 
  Bell, 
  ArrowUpRight, 
  Ban,
  Receipt,
  MapPin
} from 'lucide-react';
import { useOrders } from "../../../context/OrdersContext";
import { useCustomer } from "../../../context/CustomerContext";
import { useNotifications } from "../../../context/NotificationContext";
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from "../../../utils/currencyUtils";
import { cn } from "../../../utils/cn";
import printContent from "../../../utils/printUtil";
import { createPortal } from 'react-dom';
import XenditPaymentModal from '../../../components/payment/XenditPaymentModal';
import { paymentApi } from '../../../services/payment.api';

const CustomerPayments = () => {
  const navigate = useNavigate();
  const { orders, payOrder, refreshOrders } = useOrders();
  const { profile } = useCustomer();
  const { addNotification } = useNotifications();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  
  // Modals & simulation state
  const [toast, setToast] = useState(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [checkoutOrderId, setCheckoutOrderId] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Payment Modal States
  const [paymentModalProps, setPaymentModalProps] = useState({
    isOpen: false,
    invoiceUrl: null,
    paymentState: 'waiting',
    orderId: null
  });
  const [pollingInterval, setPollingInterval] = useState(null);

  // Local notifications storage
  const [localNotifications, setLocalNotifications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('gila_house_payment_notifs') || '[]');
    } catch(e) {
      return [];
    }
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addLocalNotification = (title, message, type = 'info') => {
    const newNotif = {
      id: Date.now(),
      title,
      message,
      type,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString()
    };
    setLocalNotifications(prev => {
      const updated = [newNotif, ...prev].slice(0, 25);
      localStorage.setItem('gila_house_payment_notifs', JSON.stringify(updated));
      return updated;
    });

    // Also dispatch to global notification context
    try {
      addNotification({
        type: 'Payment',
        title: title,
        message: message,
        targetRole: 'CUSTOMER'
      });
    } catch (e) {
      console.warn('Failed to add global notification:', e);
    }
  };

  useEffect(() => {
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [pollingInterval]);

  // Map orders
  const mappedOrders = useMemo(() => {
    return orders.map(o => {
      
      let status = o.payment_status || 'pending';
      if (status.toLowerCase() === 'paid') {
        status = 'Paid';
      } else {
        status = status.charAt(0).toUpperCase() + status.slice(1);
      }
      
      const method = o.payment_method || 'Credit Card';
      const receiptNo = `REC-GH-${String(o.id).padStart(5, '0')}`;
      const txnId = `TXN-REF-${String(o.id).padStart(5, '0')}`;
      const paymentTime = o.updatedAt || o.createdAt || new Date().toISOString();

      const subtotalVal = Number(o.subtotal || o.grand_total || 0);
      const taxVal = Number(o.tax || subtotalVal * 0.05);
      const serviceVal = Number(o.service_charge_amount || o.serviceChargeAmount || 0);
      const discountVal = Number(o.discount || 0);
      const grandTotalVal = Number(o.grand_total || o.amount || (subtotalVal + taxVal + serviceVal - discountVal));

      return {
        ...o,
        payment_status: status,
        payment_method: method,
        receipt_number: receiptNo,
        transaction_id: txnId,
        payment_time: paymentTime,
        subtotal: subtotalVal,
        tax: taxVal,
        service_charge_amount: serviceVal,
        discount: discountVal,
        grand_total: grandTotalVal,
        refund_info: null
      };
    });
  }, [orders]);

  // Calculations for Overview Cards
  const stats = useMemo(() => {
    let totalPaid = 0;
    let pendingPayments = 0;
    let refundedAmount = 0;
    let totalTransactions = 0;

    mappedOrders.forEach(o => {
      const status = o.payment_status.toLowerCase();
      const amount = Number(o.grand_total || 0);

      if (status === 'paid') {
        totalPaid += amount;
        totalTransactions++;
      } else if (
        status === 'pending' || 
        status === 'waiting for payment' || 
        status === 'processing' || 
        status === 'waiting_payment' || 
        status === 'waiting for card payment'
      ) {
        pendingPayments += amount;
      } else if (status === 'refunded') {
        refundedAmount += Number(o.refund_info?.refund_amount || amount);
        totalTransactions++;
      } else {
        totalTransactions++;
      }
    });

    return { totalPaid, pendingPayments, refundedAmount, totalTransactions };
  }, [mappedOrders]);

  const selectedPayment = useMemo(() => 
    mappedOrders.find(o => String(o.id) === String(selectedPaymentId)),
    [mappedOrders, selectedPaymentId]
  );

  const checkoutOrder = useMemo(() => 
    mappedOrders.find(o => String(o.id) === String(checkoutOrderId)),
    [mappedOrders, checkoutOrderId]
  );

  // Apply search & filter queries
  const filteredPayments = useMemo(() => {
    return mappedOrders.filter(o => {
      const pStatus = o.payment_status.toLowerCase();
      const pMethod = o.payment_method.toLowerCase();
      const orderNo = String(o.order_number || o.id).toLowerCase();
      const txnId = o.transaction_id.toLowerCase();
      const receiptNo = o.receipt_number.toLowerCase();

      // Search Filter
      const matchesSearch = 
        orderNo.includes(searchQuery.toLowerCase()) || 
        txnId.includes(searchQuery.toLowerCase()) ||
        receiptNo.includes(searchQuery.toLowerCase());

      // Status Filter
      let matchesStatus = true;
      if (statusFilter !== 'All') {
        matchesStatus = pStatus === statusFilter.toLowerCase();
      }

      // Method Filter
      let matchesMethod = true;
      if (methodFilter !== 'All') {
        matchesMethod = pMethod === methodFilter.toLowerCase();
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

      return matchesSearch && matchesStatus && matchesMethod && matchesDate;
    });
  }, [mappedOrders, searchQuery, statusFilter, methodFilter, dateFilter, customRange]);

  // Split list into Active (Unpaid/Processing/Cashier pending) and Completed (Paid/Refunded/Failed/etc.)
  const activePayments = useMemo(() => 
    filteredPayments.filter(o => {
      const status = o.payment_status.toLowerCase();
      return (
        status === 'pending' || 
        status === 'waiting for payment' || 
        status === 'processing' ||
        status === 'waiting for card payment'
      );
    }),
    [filteredPayments]
  );

  const completedPayments = useMemo(() => 
    filteredPayments.filter(o => {
      const status = o.payment_status.toLowerCase();
      return (
        status !== 'pending' && 
        status !== 'waiting for payment' && 
        status !== 'processing' &&
        status !== 'waiting for card payment'
      );
    }),
    [filteredPayments]
  );

  const getStatusBadge = (status = '') => {
    const s = status.toLowerCase();
    switch(s) {
      case 'paid':
        return { label: 'Paid', class: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckCircle2 };
      case 'pending':
        return { label: 'Pending', class: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Wallet };
      case 'waiting for payment':
      case 'waiting_payment':
        return { label: 'Waiting for Payment', class: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Clock };
      case 'waiting for card payment':
        return { label: 'Waiting for Card Payment', class: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Clock };
      case 'processing':
        return { label: 'Processing', class: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: RefreshCw };
      case 'failed':
        return { label: 'Failed', class: 'bg-rose-500/10 text-rose-500 border-rose-500/20', icon: ShieldAlert };
      case 'cancelled':
        return { label: 'Cancelled', class: 'bg-slate-500/10 text-slate-500 border-slate-500/20', icon: X };
      case 'expired':
        return { label: 'Expired', class: 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20', icon: AlertCircle };
      case 'refunded':
        return { label: 'Refunded', class: 'bg-purple-500/10 text-purple-500 border-purple-500/20', icon: Sparkles };
      default:
        return { label: status, class: 'bg-slate-50 text-slate-500 border-slate-100', icon: Clock };
    }
  };

  const handlePayNowSubmit = async () => {
    if (!selectedMethod) return;
    setIsProcessing(true);

    try {
      if (selectedMethod === 'Cashier') {
        addLocalNotification(
          'Payment Pending',
          `Order #${checkoutOrderId} is pending cashier confirmation. Please proceed to the cashier counter.`,
          'pending'
        );
        showToast('Instruction sent. Please tap/swipe at Cashier!', 'success');
        setCheckoutOrderId(null);
        setSelectedMethod('');
        setIsProcessing(false);
      } else {
        // Online cashless payment via Xendit
        const orderIdStr = String(checkoutOrderId);
        setCheckoutOrderId(null);
        
        setPaymentModalProps(prev => ({ ...prev, isOpen: true, paymentState: 'loading', orderId: orderIdStr }));

        const invoiceRes = await paymentApi.createInvoice({
          bookingId: orderIdStr,
          guestName: profile?.name || 'Walk-in Guest',
          email: profile?.email || 'guest@gilahouse.com',
          phone: profile?.phone || '0000000000',
          amount: checkoutOrder?.grand_total || 0,
          description: `Online Order ${orderIdStr}`
        });

        if (invoiceRes.success && invoiceRes.invoiceUrl) {
          setPaymentModalProps(prev => ({
            ...prev,
            invoiceUrl: invoiceRes.invoiceUrl,
            paymentState: 'waiting'
          }));

          const interval = setInterval(async () => {
            try {
              const statusResponse = await paymentApi.getPaymentStatus(orderIdStr);
              if (statusResponse.data && statusResponse.data.status === 'PAID') {
                clearInterval(interval);
                setPaymentModalProps(prev => ({ ...prev, paymentState: 'success' }));
                refreshOrders();
              }
            } catch (err) {}
          }, 3000);
          setPollingInterval(interval);
        } else {
          showToast('Failed to generate payment link.', 'error');
          setPaymentModalProps(prev => ({ ...prev, isOpen: false }));
        }
        setIsProcessing(false);
      }
    } catch (err) {
      showToast(err.message || 'Payment processing failed', 'error');
      setIsProcessing(false);
      setPaymentModalProps(prev => ({ ...prev, isOpen: false }));
    }
  };

  const closePaymentModal = () => {
    if (pollingInterval) clearInterval(pollingInterval);
    setPaymentModalProps(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="space-y-6 lg:space-y-8 relative pb-12">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 right-6 z-[999] bg-slate-900/95 backdrop-blur text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 animate-in fade-in slide-in-from-top-4 duration-300">
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
          <span className="text-xs font-black uppercase tracking-widest">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
         <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
               <button onClick={() => navigate(-1)} className="p-2.5 bg-surface rounded-xl shadow-sm border border-slate-100 lg:hidden">
                  <ChevronLeft className="w-5 h-5 text-text-primary" />
               </button>
               <h2 className="text-xl lg:text-2xl font-black text-text-primary uppercase tracking-tight">Payments Hub</h2>
            </div>
         </div>
      </div>

      {/* Overview stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         {[
           { label: 'Total Paid', value: stats.totalPaid, color: 'text-emerald-500 bg-emerald-50' },
           { label: 'Pending Payments', value: stats.pendingPayments, color: 'text-amber-500 bg-amber-50' },
           { label: 'Refunded Amount', value: stats.refundedAmount, color: 'text-purple-500 bg-purple-50' },
           { label: 'Total Transactions', value: stats.totalTransactions, isCount: true, color: 'text-blue-500 bg-blue-50' }
         ].map((card, idx) => (
           <div key={idx} className="card p-5 bg-surface border-none shadow-xl shadow-slate-100/50 rounded-3xl hover:shadow-premium-hover transition-all">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none block mb-2">{card.label}</span>
              <h3 className="text-xl lg:text-2xl font-black text-text-primary tracking-tighter leading-none">
                 {card.isCount ? card.value : formatCurrency(card.value)}
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
              placeholder="Search by Order #, Receipt #, or Transaction ID..." 
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent focus:border-primary/20 rounded-2xl outline-none text-xs font-bold transition-all text-text-primary"
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
               <option value="Pending">Pending</option>
               <option value="Waiting for Card Payment">Waiting for Card Payment</option>
               <option value="Processing">Processing</option>
               <option value="Refunded">Refunded</option>
               <option value="Failed">Failed</option>
               <option value="Cancelled">Cancelled</option>
               <option value="Expired">Expired</option>
            </select>

            {/* Method Filter */}
            <select 
              value={methodFilter} 
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold outline-none text-slate-600 cursor-pointer"
            >
               <option value="All">All Payment Methods</option>
               <option value="Credit Card">Credit Card</option>
               <option value="Debit Card">Debit Card</option>
               <option value="Card at Cashier">Card at Cashier</option>
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
                   className="px-3 py-2 bg-slate-50 border rounded-xl text-[10px] font-bold outline-none text-text-primary" 
                 />
                 <span className="text-[10px] text-slate-300 font-bold uppercase">To</span>
                 <input 
                   type="date" 
                   value={customRange.end}
                   onChange={(e) => setCustomRange({...customRange, end: e.target.value})}
                   className="px-3 py-2 bg-slate-50 border rounded-xl text-[10px] font-bold outline-none text-text-primary" 
                 />
              </div>
            )}
         </div>
      </div>

      {/* Active Payments Section */}
      <div className="space-y-4">
         <h3 className="text-lg font-black uppercase tracking-tight px-1 flex items-center justify-between">
            Active Payments
            <span className="text-[10px] font-black text-slate-400 bg-slate-50 border px-3 py-1 rounded-full">{activePayments.length} Pending</span>
         </h3>

         {activePayments.length === 0 ? (
            <div className="card p-8 bg-surface border-none shadow-xl shadow-slate-100/50 rounded-3xl text-center space-y-3">
               <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
               <h4 className="font-black text-text-primary text-sm uppercase">All your payments are completed.</h4>
               <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">No active payment invoices waiting for settlement.</p>
            </div>
         ) : (
            <div className="bg-surface rounded-3xl shadow-xl shadow-slate-100/50 border border-slate-50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest min-w-[800px]">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 w-1/4">Order Details</th>
                      <th className="px-6 py-4">Table</th>
                      <th className="px-6 py-4">Time</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {activePayments.map(order => {
                      const badge = getStatusBadge(order.payment_status);
                      const isCashier = order.payment_method === 'Card at Cashier';
                      return (
                        <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4 align-middle">
                            <span className="font-black text-text-primary uppercase text-sm tracking-tight block">
                              Order #{order.order_number || order.id}
                            </span>
                            <span className="text-[9px] text-slate-400 mt-1 block max-w-[200px] truncate">
                              {order.items && order.items.length > 0 ? order.items.map(i => i.item_name || i.name).join(', ') : 'Dining Order'}
                            </span>
                            {isCashier && (
                               <p className="text-[8px] font-black text-amber-500 flex items-center gap-1 mt-2 bg-amber-50 w-fit px-2 py-0.5 rounded-lg border border-amber-100">
                                 <Clock className="w-3 h-3" /> Waiting for Cashier tap
                               </p>
                            )}
                          </td>
                          <td className="px-6 py-4 align-middle">
                            <span className="flex items-center gap-1 text-slate-400 font-black">
                              <MapPin className="w-3.5 h-3.5" /> 
                              {((order.order_type || '').toLowerCase() === 'takeaway' || (order.order_type || '').toLowerCase() === 'bungkus' || (order.order_type || '').toLowerCase() === 'bungkus (takeaway)') ? 'Bungkus' : 
                               (order.order_type || '').toLowerCase() === 'room service' ? `Room ${order.table_code || order.table || ''}` : 
                               (order.table_code || order.table || 'N/A')}
                            </span>
                          </td>
                          <td className="px-6 py-4 align-middle space-y-1">
                            <span className="flex items-center gap-1 text-slate-400"><Calendar className="w-3.5 h-3.5" /> {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</span>
                            <span className="flex items-center gap-1 text-slate-400"><Clock className="w-3.5 h-3.5" /> {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : 'Recent'}</span>
                          </td>
                          <td className="px-6 py-4 align-middle">
                            <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border inline-flex items-center gap-1", badge.class)}>
                              <badge.icon className="w-3 h-3" /> {badge.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 align-middle text-right">
                            <span className="text-base font-black text-text-primary tracking-tighter block">{formatCurrency(order.grand_total)}</span>
                          </td>
                          <td className="px-6 py-4 align-middle text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => setSelectedPaymentId(order.id)}
                                className="px-3 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-[9px] font-black text-slate-500 border border-slate-100 transition-all flex items-center justify-center"
                                title="Details"
                              >
                                Details
                              </button>
                              <button 
                                onClick={() => setCheckoutOrderId(order.id)}
                                className="px-3 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-[9px] font-black text-slate-500 border border-slate-100 transition-all flex items-center justify-center"
                                title="Change Method"
                              >
                                Method
                              </button>
                              <button 
                                onClick={() => setCheckoutOrderId(order.id)}
                                className="btn-premium px-4 py-2.5 rounded-xl text-[9px] font-black shadow-lg shadow-primary/20 flex items-center gap-1"
                              >
                                Pay Now <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
         )}
      </div>

      {/* Main Grid: Payment History & Notification Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Payment History */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-black uppercase tracking-tight px-1 flex items-center justify-between">
              Payment History
              <span className="text-[10px] font-black text-slate-400 bg-slate-50 border px-3 py-1 rounded-full">{completedPayments.length} Transactions</span>
          </h3>

          {completedPayments.length === 0 ? (
            <div className="card p-12 bg-surface border-none shadow-xl shadow-slate-100/50 rounded-3xl text-center space-y-3">
               <FileText className="w-16 h-16 text-slate-200 mx-auto" />
               <h4 className="font-black text-text-primary text-sm uppercase">No payment records found.</h4>
               <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">You don't have any past transactions in Gila House.</p>
            </div>
          ) : (
            <div className="space-y-4">
               {completedPayments.map(order => {
                 const badge = getStatusBadge(order.payment_status);
                 return (
                   <div key={order.id} className="card p-5 bg-surface border border-slate-50 shadow-xl shadow-slate-100/50 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:bg-slate-50 transition-all">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                         <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors shrink-0 shadow-inner">
                            <FileText className="w-6 h-6" />
                         </div>
                         <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                               <span className={cn("px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border shrink-0 flex items-center gap-1", badge.class)}>
                                  <badge.icon className="w-3 h-3" /> {badge.label}
                               </span>
                               <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest truncate">ID: {order.transaction_id}</span>
                            </div>
                            <h4 className="font-black text-text-primary text-sm uppercase tracking-tight truncate">
                               {order.items && order.items.length > 0 ? order.items.map(i => i.item_name || i.name).join(', ') : 'Dining Order'}
                            </h4>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest pt-0.5">
                               <span className="flex items-center gap-1 shrink-0"><Calendar className="w-3.5 h-3.5" /> {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</span>
                               <span className="flex items-center gap-1 shrink-0"><Clock className="w-3.5 h-3.5" /> {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : ''}</span>
                               <span className="flex items-center gap-1 shrink-0">
                                  <MapPin className="w-3.5 h-3.5" /> 
                                  {((order.order_type || '').toLowerCase() === 'takeaway' || (order.order_type || '').toLowerCase() === 'bungkus' || (order.order_type || '').toLowerCase() === 'bungkus (takeaway)') ? 'Bungkus' : 
                                   (order.order_type || '').toLowerCase() === 'room service' ? `Room ${order.table_code || order.table || ''}` : 
                                   (order.table_code || order.table || 'N/A')}
                               </span>
                               <span className="flex items-center gap-1 shrink-0"><CreditCard className="w-3.5 h-3.5" /> {order.payment_method}</span>
                            </div>
                         </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-slate-50 shrink-0">
                         <div className="text-left md:text-right">
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Grand Total</span>
                            <p className="text-base lg:text-lg font-black text-text-primary tracking-tighter">
                               {formatCurrency(order.grand_total)}
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

        {/* Notifications Alert Feed */}
        <div className="space-y-4">
          <h3 className="text-lg font-black uppercase tracking-tight px-1 flex items-center justify-between">
              Payment Alerts Log
              <Bell className="w-4 h-4 text-slate-400" />
          </h3>
          
          <div className="card p-5 bg-surface border border-slate-50 shadow-xl shadow-slate-100/50 rounded-3xl space-y-4 max-h-[500px] overflow-y-auto scrollbar-hide">
            {localNotifications.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Bell className="w-8 h-8 text-slate-200 mx-auto" />
                <p className="text-[10px] text-slate-400 uppercase font-black">No alerts logged yet.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {localNotifications.map(alert => (
                  <div key={alert.id} className="flex gap-3 items-start border-b border-slate-50 pb-3 last:border-b-0 last:pb-0">
                    <div className={cn(
                      "w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-sm mt-0.5",
                      alert.type === 'success' ? "bg-emerald-50 text-emerald-500" :
                      alert.type === 'error' ? "bg-rose-50 text-rose-500" :
                      alert.type === 'pending' ? "bg-amber-50 text-amber-500" :
                      alert.type === 'refund' ? "bg-purple-50 text-purple-500" : "bg-blue-50 text-blue-500"
                    )}>
                      {alert.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                       alert.type === 'error' ? <ShieldAlert className="w-3.5 h-3.5" /> :
                       alert.type === 'pending' ? <Clock className="w-3.5 h-3.5" /> :
                       alert.type === 'refund' ? <Sparkles className="w-3.5 h-3.5" /> : <InfoSymbol className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase text-text-primary leading-tight">{alert.title}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-0.5 leading-relaxed">{alert.message}</p>
                      <span className="text-[8px] text-slate-300 font-bold uppercase mt-1 block">{alert.date} {alert.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pay Invoice Checkout Modal */}
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
                              {formatCurrency(checkoutOrder.grand_total)}
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
           <div onClick={() => { setSelectedPaymentId(null); setShowRefundForm(false); }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
           <div className="relative w-full max-w-md bg-surface rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] self-end sm:self-center animate-in slide-in-from-bottom-full duration-300">
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 shrink-0">
                 <div>
                    <h3 className="text-base font-black uppercase tracking-tight text-text-primary">Receipt & Transaction</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">#{selectedPayment.order_number || selectedPayment.id}</p>
                 </div>
                 <button onClick={() => { setSelectedPaymentId(null); setShowRefundForm(false); }} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X className="w-5 h-5 text-text-primary" /></button>
              </div>

              {/* Printable receipt content */}
              <div className="p-6 sm:p-8 space-y-6 overflow-y-auto scrollbar-hide flex-1">
                 <div id="printable-receipt-card" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-inner font-mono text-xs text-black space-y-4">
                    <div className="text-center space-y-2 border-b border-dashed border-slate-200 pb-4">
                       <h3 className="text-lg font-black uppercase tracking-wider">Gila House</h3>
                       <p className="text-[9px] text-slate-400 uppercase tracking-widest">Premium Restaurant & Bar</p>
                       <p className="text-[8px] text-slate-400 uppercase mt-2">Ref: {selectedPayment.transaction_id}</p>
                       <p className="text-[8px] text-slate-400 uppercase">Receipt: {selectedPayment.receipt_number}</p>
                    </div>

                    <div className="space-y-1.5 border-b border-dashed border-slate-200 pb-4 text-[10px]">
                       <div className="flex justify-between"><span className="text-slate-400 uppercase font-black">Customer:</span><span>{profile?.full_name || profile?.name || 'Dining Guest'}</span></div>
                       <div className="flex justify-between"><span className="text-slate-400 uppercase font-black">Table:</span><span>{selectedPayment.table_code || selectedPayment.table || 'N/A'}</span></div>
                       <div className="flex justify-between"><span className="text-slate-400 uppercase font-black">Gateway:</span><span>{selectedPayment.payment_method}</span></div>
                       <div className="flex justify-between"><span className="text-slate-400 uppercase font-black">Status:</span><span className="font-black uppercase">{selectedPayment.payment_status}</span></div>
                       <div className="flex justify-between"><span className="text-slate-400 uppercase font-black">Date & Time:</span><span>{selectedPayment.createdAt ? new Date(selectedPayment.createdAt).toLocaleString() : 'N/A'}</span></div>
                       {selectedPayment.payment_time && (
                         <div className="flex justify-between"><span className="text-slate-400 uppercase font-black">Payment Time:</span><span>{new Date(selectedPayment.payment_time).toLocaleString()}</span></div>
                       )}
                    </div>

                    <div className="space-y-2 border-b border-dashed border-slate-200 pb-4 text-[10px]">
                       <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block mb-1">Items Summary</span>
                       {selectedPayment.items && selectedPayment.items.map((item, index) => (
                          <div key={index} className="flex justify-between">
                             <span className="truncate max-w-[200px]">{item.item_name || item.name} x {item.quantity}</span>
                             <span>{formatCurrency(item.unit_price * item.quantity)}</span>
                          </div>
                       ))}
                    </div>

                    <div className="space-y-1.5 text-[10px]">
                       <div className="flex justify-between"><span className="text-slate-400">Subtotal:</span><span>{formatCurrency(selectedPayment.subtotal)}</span></div>
                       <div className="flex justify-between"><span className="text-slate-400">Taxes (5%):</span><span>{formatCurrency(selectedPayment.tax)}</span></div>
                       <div className="flex justify-between"><span className="text-slate-400">Service Charges:</span><span>{formatCurrency(selectedPayment.service_charge_amount)}</span></div>
                       {selectedPayment.discount > 0 && (
                         <div className="flex justify-between text-rose-500"><span className="font-bold">Discount:</span><span>-{formatCurrency(selectedPayment.discount)}</span></div>
                       )}
                       <div className="flex justify-between font-black text-sm border-t border-dashed border-slate-200 pt-3 mt-3 text-text-primary">
                          <span>Grand Total:</span>
                          <span>{formatCurrency(selectedPayment.grand_total)}</span>
                       </div>
                    </div>

                    {/* Refund info inside printable container */}
                    {selectedPayment.payment_status.toLowerCase() === 'refunded' && selectedPayment.refund_info && (
                      <div className="border-t border-dashed border-slate-200 pt-4 space-y-1.5 text-[9px] text-purple-700 bg-purple-50/50 p-3 rounded-xl">
                        <p className="font-black uppercase text-[10px] tracking-wider text-purple-900 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Refund Settled</p>
                        <div className="flex justify-between"><span>Refunded Amt:</span><span>{formatCurrency(selectedPayment.refund_info.refund_amount)}</span></div>
                        <div className="flex justify-between"><span>Refund Date:</span><span>{selectedPayment.refund_info.refund_date}</span></div>
                        <div className="flex justify-between"><span>Refund Status:</span><span className="font-bold uppercase">{selectedPayment.refund_info.refund_status}</span></div>
                        <div className="flex justify-between"><span>Refund Reason:</span><span className="italic">"{selectedPayment.refund_info.refund_reason}"</span></div>
                      </div>
                    )}
                 </div>



                 {/* Actions Footer */}
                 <div className="grid grid-cols-3 gap-3 shrink-0">
                    <button 
                      onClick={() => {
                        printContent('printable-receipt-card');
                        showToast('Printing receipt...', 'success');
                      }}
                      className="px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                       <Printer className="w-3.5 h-3.5" /> Print
                    </button>
                    <button 
                      onClick={() => {
                        showToast('Receipt downloaded!', 'success');
                        addLocalNotification('Receipt Generated', `Downloaded receipt copy ${selectedPayment.receipt_number}.`, 'info');
                      }}
                      className="px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                       <Download className="w-3.5 h-3.5" /> Download
                    </button>
                    <button 
                      onClick={() => { setSelectedPaymentId(null); setShowRefundForm(false); }}
                      className="px-4 py-3.5 bg-slate-900 hover:bg-black text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                       Close
                    </button>
                 </div>
              </div>
           </div>
        </div>,
        document.body
      )}
      {/* Xendit Payment Modal */}
      <XenditPaymentModal
        isOpen={paymentModalProps.isOpen}
        onClose={closePaymentModal}
        invoiceUrl={paymentModalProps.invoiceUrl}
        paymentState={paymentModalProps.paymentState}
        amount={checkoutOrder?.grand_total || 0}
      />
    </div>
  );
};

// Internal subcomponents/icons to prevent compilation warnings
const InfoSymbol = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
  </svg>
);

export default CustomerPayments;
