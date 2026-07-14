import { formatCurrency } from '../../../utils/currencyUtils';
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Clock, 
  CheckCircle2, 
  Timer,
  ChevronRight,
  X,
  Printer,
  Download,
  Calendar,
  ChevronLeft,
  ShoppingBag,
  ExternalLink,
  MapPin,
  CreditCard,
  Sparkles,
  History,
  ChefHat,
  Utensils,
  User
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { cn } from "../../../utils/cn";
import { useOrders } from "@/context/OrdersContext";
import { useToast } from "@/context/ToastContext";
import { useSettings } from "@/context/SettingsContext";
import printContent from '../../../utils/printUtil';

const Orders = () => {
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Clock, 
  CheckCircle2, 
  Timer,
  ChevronRight,
  X,
  Printer,
  Download,
  Calendar,
  ChevronLeft,
  ShoppingBag,
  ExternalLink,
  MapPin,
  CreditCard,
  Sparkles,
  History,
  ChefHat,
  Utensils,
  User
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { cn } from "../../../utils/cn";
import { useOrders } from "../../../context/OrdersContext";
import { useToast } from "../../../context/ToastContext";
import { useSettings } from "../../../context/SettingsContext";
import printContent from '../../../utils/printUtil';
import api from '../../../services/api';

const Orders = () => {
  const { orders, updateOrderStatus, deleteOrder } = useOrders();
  const { showToast } = useToast();
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [auditData, setAuditData] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Sync selectedOrder with orders context to reflect status updates
  React.useEffect(() => {
    if (selectedOrder) {
      const updated = orders.find(o => o.id === selectedOrder.id);
      if (updated) setSelectedOrder(updated);
    }
  }, [orders]);

  const handlePrint = (order) => {
    setSelectedOrder(order);
    setTimeout(() => {
      printContent('printable-area');
    }, 100);
  };

  const handleFullAudit = async () => {
    setShowAuditLog(true);
    setLoadingAudit(true);
    try {
      const response = await api.get(`/orders/${selectedOrder.id}/audit`);
      setAuditData(response.data.data);
    } catch (err) {
      console.error('Failed to fetch audit log', err);
    } finally {
      setLoadingAudit(false);
    }
  };

  const getOrderHistory = () => {
    if (loadingAudit) return [];
    
    return auditData.map(log => {
      let icon = ShoppingBag;
      let color = 'text-slate-500';
      let bg = 'bg-slate-50';

      const actionLower = (log.action || '').toLowerCase();
      if (actionLower.includes('ticket')) { icon = ShoppingBag; color = 'text-primary'; bg = 'bg-indigo-50'; }
      else if (actionLower.includes('kitchen')) { icon = ChefHat; color = 'text-orange-500'; bg = 'bg-orange-50'; }
      else if (actionLower.includes('start') || actionLower.includes('cooking')) { icon = ChefHat; color = 'text-indigo-500'; bg = 'bg-indigo-50'; }
      else if (actionLower.includes('ready')) { icon = CheckCircle2; color = 'text-emerald-500'; bg = 'bg-emerald-50'; }
      else if (actionLower.includes('deliver')) { icon = CheckCircle2; color = 'text-slate-500'; bg = 'bg-slate-50'; }
      else if (actionLower.includes('void') || actionLower.includes('cancel')) { icon = X; color = 'text-primary'; bg = 'bg-rose-50'; }

      return {
        action: log.action,
        time: new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
        user: log.user_name || 'System',
        icon, color, bg
      };
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Pending': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Cooking': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'Ready': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Delivered': return 'bg-slate-50 text-slate-500 border-slate-100';
      default: return 'bg-slate-50 text-text-secondary border-border';
    }
  };

  const processedOrders = orders
    .filter(o => {
      const status = (o.order_status || o.status || '').toLowerCase();
      const activeTabLower = activeTab.toLowerCase();
      const isMatchingTab = activeTab === 'All' || status === activeTabLower;
      
      const orderTypeLower = (o.order_type || o.type || '').toLowerCase();
      const isMatchingType = typeFilter === 'All' || 
          (typeFilter === 'Dine-in' && orderTypeLower.includes('dine')) ||
          (typeFilter === 'Room Service' && (orderTypeLower.includes('room') || orderTypeLower.includes('delivery'))) ||
          (typeFilter === 'Bungkus (Takeaway)' && (orderTypeLower.includes('bungkus') || orderTypeLower.includes('takeaway')));
      
      const orderIdStr = (o.order_number || o.id || "").toString();
      const custNameStr = (o.customer_name || o.guest_name || o.full_name || o.customer || "").toString();
      
      const isMatchingSearch = orderIdStr.toLowerCase().includes(searchQuery.toLowerCase()) || 
                               custNameStr.toLowerCase().includes(searchQuery.toLowerCase());
      return isMatchingTab && isMatchingType && isMatchingSearch;
    });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(processedOrders.length / itemsPerPage) || 1;
  
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, typeFilter]);

  const paginatedOrders = processedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 relative h-full flex flex-col overflow-hidden bg-background">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0 px-1">
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-text-primary uppercase tracking-tight leading-none">Orders</h2>
            <p className="text-text-secondary mt-2 text-[10px] md:text-sm font-medium leading-none italic">Manage order lifecycle and audits.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="relative group w-full sm:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find ticket..." 
                className="w-full pl-10 pr-4 py-3.5 bg-surface border border-slate-100 rounded-xl lg:rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-primary/10 outline-none shadow-sm"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3.5 bg-surface border border-slate-100 rounded-xl lg:rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none shadow-sm cursor-pointer hover:border-primary/20 transition-colors"
            >
              <option value="All">All Types</option>
              <option value="Dine-in">Dine-in</option>
              <option value="Room Service">Room Service</option>
              <option value="Bungkus (Takeaway)">Bungkus</option>
            </select>
          </div>
        </div>

        {/* Modern Tab System */}
        <div className="flex gap-2 lg:gap-2.5 overflow-x-auto pb-2 scrollbar-hide shrink-0 px-1">
          {['All', 'New', 'Pending', 'Cooking', 'Ready', 'Delivered'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-5 lg:px-6 py-2 lg:py-2.5 rounded-lg lg:rounded-xl text-[8px] lg:text-[9px] font-black uppercase tracking-widest border-2 transition-all shrink-0",
                activeTab === tab 
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                  : "bg-surface text-text-secondary border-transparent hover:border-primary/20"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Responsive Order Display */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Desktop Table */}
          <div className="hidden md:block card p-0 overflow-hidden flex-1 shadow-2xl shadow-slate-200/50 border-none bg-surface rounded-[2.5rem]">
            <div className="h-full overflow-y-auto scrollbar-hide">
              <table className="w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="text-left text-text-secondary text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-50 bg-slate-50/50">
                    <th className="px-8 py-5">Ticket</th>
                    <th className="px-8 py-5">Customer / Table</th>
                    <th className="px-8 py-5">Type</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      className="text-sm hover:bg-slate-50 group cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center shadow-lg border border-slate-50">
                              <ShoppingBag className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                              <span className="font-black text-text-primary text-base tracking-tight">{order.order_number || order.id}</span>
                              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">
                                {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : (order.time || 'Recent')}
                              </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <p className="font-black text-text-primary text-sm leading-tight">{order.customer_name || order.guest_name || order.full_name || order.customer || 'Guest'}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5">
                          {order.table_code || order.table || 'WALK-IN'}
                        </p>
                      </td>
                      <td className="px-8 py-5">
                        <div className={cn(
                          "badge font-black uppercase tracking-wider border text-[8px] px-2 py-1",
                          (order.order_type || order.type || '').toLowerCase() === 'dine-in' ? "bg-indigo-50 text-primary border-indigo-100" : 
                          (order.order_type || order.type || '').toLowerCase() === 'takeaway' ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                        )}>
                          {order.order_type || order.type}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={cn("badge font-black border py-1 px-2 text-[8px] uppercase", getStatusStyle(order.order_status || order.status))}>
                          {order.order_status || order.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 font-black text-text-primary text-base tracking-tight">
                            {formatCurrency((order.grand_total || order.amount || 0))}
                            <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-primary" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide pb-10">
            {paginatedOrders.map((order) => (
              <div 
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="bg-surface p-5 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-50 flex flex-col gap-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-primary">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-lg tracking-tight">{order.id}</h4>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{order.time}</p>
                      </div>
                  </div>
                  <span className={cn("badge font-black border py-1 px-3 text-[8px] rounded-lg", getStatusStyle(order.status))}>
                      {order.status}
                  </span>
                </div>
                <div className="flex justify-between items-end border-t border-slate-50 pt-4">
                  <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer</p>
                      <p className="font-black text-sm text-text-primary">{order.customer}</p>
                  </div>
                  <div className="text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Settlement</p>
                      <p className="font-black text-lg text-primary tracking-tighter">{order.amount}</p>
                  </div>
                </div>
              </div>
            ))}

            {paginatedOrders.length === 0 && (
               <div className="flex-1 flex flex-col items-center justify-center p-20 opacity-40">
                  <ShoppingBag className="w-16 h-16 mb-4 text-slate-200" />
                  <p className="text-xs font-black uppercase tracking-widest">No matching orders found</p>
               </div>
            )}
          </div>
        </div>
          
        {/* Footer */}
        <div className="px-6 md:px-10 py-6 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between bg-slate-50/30 gap-6 shrink-0 mt-4 md:mt-0">
          <div className="flex items-center gap-4 md:gap-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Displaying <span className="text-text-primary">{paginatedOrders.length}</span> of <span className="text-text-primary">{processedOrders.length}</span> entries</p>
              <div className="h-4 w-[2px] bg-slate-200 hidden md:block" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hidden md:block">Total Log <span className="text-text-primary">{orders.length}</span></p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="flex-1 md:flex-none h-12 md:w-12 bg-surface border-2 border-slate-100 rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed group"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="flex-1 md:flex-none h-12 md:w-12 bg-surface border-2 border-slate-100 rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed group"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Side Audit Panel */}
      {createPortal(
        <>
          {selectedOrder && (
            <div className="fixed inset-0 z-[500] flex items-center justify-center p-0 sm:p-6">
              <div 
                onClick={() => setSelectedOrder(null)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
               <div 
                className="relative w-full max-w-[95%] md:max-w-[520px] max-h-[90vh] bg-surface shadow-2xl z-[501] flex flex-col rounded-[2rem] md:rounded-[2.5rem] overflow-hidden self-center"
              >
                 <div className="px-5 py-4 md:px-6 md:py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 shrink-0">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-primary rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-xl relative group">
                        <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-black tracking-tight uppercase leading-none">Order Audit</h3>
                      <p className="text-text-secondary font-black uppercase tracking-widest text-[8px] md:text-[9px] mt-1 flex items-center gap-2">
                          {selectedOrder.order_number || selectedOrder.id} <span className="w-1 h-1 rounded-full bg-slate-200" /> {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleTimeString() : (selectedOrder.time || 'Recent')}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedOrder(null)} 
                    className="p-2 md:p-3 hover:bg-surface rounded-xl md:rounded-2xl border border-transparent hover:border-slate-100 shadow-sm group"
                  >
                    <X className="w-5 h-5 md:w-6 md:h-6 text-text-secondary" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10 scrollbar-hide">
                    <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col gap-8 relative overflow-hidden">
                      <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-surface rounded-2xl flex items-center justify-center text-2xl font-black shadow-xl border border-slate-50 text-primary uppercase">
                                {(selectedOrder.customer_name || selectedOrder.guest_name || selectedOrder.full_name || selectedOrder.customer || 'G').charAt(0)}
                            </div>
                            <div>
                                <h4 className="text-xl font-black tracking-tight leading-none">
                                  {selectedOrder.customer_name || selectedOrder.guest_name || selectedOrder.full_name || selectedOrder.customer || 'Guest'}
                                </h4>
                                <p className="text-[10px] font-black text-text-secondary flex items-center gap-2 mt-2 uppercase tracking-widest">
                                  <MapPin className="w-3 h-3 text-primary" /> {selectedOrder.order_type || selectedOrder.type || 'N/A'}
                                </p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <select 
                              value={(selectedOrder.order_status || selectedOrder.status || 'New').toLowerCase()}
                              onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                              className={cn(
                                "badge px-4 py-1.5 font-black uppercase tracking-widest border-2 text-[8px] rounded-xl shadow-sm outline-none cursor-pointer appearance-none text-center relative z-[300]", 
                                getStatusStyle(selectedOrder.order_status || selectedOrder.status)
                              )}
                            >
                                {['new', 'pending', 'cooking', 'ready', 'delivered', 'cancelled'].map(s => (
                                  <option key={s} value={s} className="bg-surface text-text-primary capitalize">{s}</option>
                                ))}
                            </select>
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white relative z-10">
                         <div className="p-5 bg-surface/60 rounded-2xl shadow-sm border border-white">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Settlement</p>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-primary">
                                  <CreditCard className="w-4 h-4" />
                                </div>
                                <p className="text-xs font-black text-text-primary uppercase tracking-tight">{selectedOrder.payment_status || selectedOrder.payment || 'CREDIT'}</p>
                            </div>
                          </div>
                         <div className="p-5 bg-surface/60 rounded-2xl shadow-sm border border-white">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Priority</p>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                                  <Timer className="w-4 h-4" />
                                </div>
                                <p className="text-xs font-black text-text-primary uppercase tracking-tight">Standard</p>
                            </div>
                          </div>
                      </div>
                      <Sparkles className="absolute -bottom-10 -right-10 w-44 h-44 text-primary opacity-[0.05] -rotate-12" />
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between px-2">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Kitchen Token List</h4>
                          <span className="text-[9px] font-black text-primary px-3 py-1 bg-indigo-50 rounded-full tracking-widest">{(selectedOrder.items?.length || selectedOrder.itemsList?.length || 0)} ITEMS</span>
                      </div>
                      <div className="space-y-4">
                          {(selectedOrder.items || selectedOrder.itemsList || []).map((item, i) => (
                            <div 
                              key={i} 
                              className="flex justify-between items-center group p-4 bg-slate-50/50 hover:bg-slate-50 rounded-[1.5rem] border border-transparent hover:border-slate-100 shadow-sm"
                            >
                              <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-surface rounded-2xl flex items-center justify-center font-black text-base border border-slate-50 shadow-sm text-primary">
                                    {item.quantity}<span className="text-[10px] ml-0.5">x</span>
                                  </div>
                                  <div>
                                    <p className="font-black text-text-primary text-sm leading-none transition-colors">{item.item_name || item.name}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-1.5">
                                        <Sparkles className="w-2.5 h-2.5 opacity-40" /> Unit: {formatCurrency(item.unit_price || item.price)} {item.size && `• ${item.size}`}
                                    </p>
                                  </div>
                              </div>
                              <p className="font-black text-text-primary text-lg tracking-tighter">{formatCurrency((item.total_price || (item.price * item.quantity) || 0))}</p>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="p-6 bg-primary rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                      <div className="space-y-4 relative z-10">
                          <div className="flex justify-between text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                            <span>Subtotal Gross</span>
                            <span className="text-white">{formatCurrency((parseFloat((selectedOrder.grand_total || selectedOrder.amount || 0)) / 1.05).toFixed(2))}</span>
                          </div>
                          <div className="flex justify-between text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                            <span>Govt Tax (GST 5%)</span>
                            <span className="text-white">{formatCurrency((parseFloat((selectedOrder.grand_total || selectedOrder.amount || 0)) - (parseFloat((selectedOrder.grand_total || selectedOrder.amount || 0)) / 1.05)).toFixed(2))}</span>
                          </div>
                          <div className="pt-8 mt-4 border-t border-primary/20 flex justify-between items-end">
                            <div>
                                <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.3em] mb-2">Net Settlement</p>
                                <div className="flex items-baseline gap-2">
                                  <h4 className="text-4xl font-black text-white tracking-tighter">{formatCurrency((selectedOrder.grand_total || selectedOrder.amount || 0))}</h4>
                                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">INR</span>
                                </div>
                            </div>
                            <div className="badge bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 font-black px-5 py-2 rounded-xl shadow-lg text-[10px] uppercase tracking-widest">
                                PAID
                            </div>
                          </div>
                      </div>
                      <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-[80px]" />
                    </div>
                  </div>

                  <div className="px-5 py-5 md:px-6 md:py-6 border-t border-slate-50 flex flex-col sm:flex-row gap-3 md:gap-4 bg-surface shrink-0 relative z-20">
                    <button 
                      onClick={() => handlePrint(selectedOrder)}
                      className="flex-1 py-3.5 md:py-4 border-2 border-slate-100 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 shadow-sm no-print"
                    >
                      <Printer className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
                      Print Receipt
                    </button>
                    <button 
                      onClick={handleFullAudit}
                      className="flex-1 btn-primary py-3.5 md:py-4 rounded-xl md:rounded-full flex items-center justify-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary/30"
                    >
                      <ExternalLink className="w-4 h-4 md:w-5 md:h-5" /> Full Audit
                    </button>
                  </div>
                </div>
              </div>
            )}
        </>,
        document.body
      )}
      {/* Audit Log Modal */}
      {showAuditLog && selectedOrder && createPortal(
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <div 
            onClick={() => setShowAuditLog(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <div 
             className="relative w-full max-w-[95%] md:max-w-lg bg-surface rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] self-center"
          >
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
                     <History className="w-6 h-6" />
                  </div>
                  <div>
                     <h3 className="text-xl font-black tracking-tight uppercase">Full Audit Trail</h3>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Ticket {selectedOrder.id}</p>
                  </div>
               </div>
               <button onClick={() => setShowAuditLog(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                  <X className="w-6 h-6 text-slate-300" />
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
               <div className="relative space-y-8 before:absolute before:left-[23px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100 before:border-r before:border-dashed before:border-slate-200">
                  {loadingAudit ? (
                    <div className="text-center py-4 text-xs font-bold text-slate-400 animate-pulse">Loading Audit Trail...</div>
                  ) : getOrderHistory().length === 0 ? (
                    <div className="text-center py-4 text-xs font-bold text-slate-400">No audit logs found.</div>
                onClick={() => setShowAuditLog(false)}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
               >
                 Close Audit View
               </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Hidden Printable Receipt */}
      {selectedOrder && (
        <div id="printable-area" className="hidden print:block printable-area receipt-print active-print">
          <div className="text-center space-y-1 mb-4">
            <h1 className="text-2xl font-black uppercase tracking-tight">{settings?.businessName || 'Gila House'}</h1>
            <p className="text-[10px] font-bold">{settings?.address || 'Main Branch'}</p>
            <p className="text-[10px] font-bold">Ph: {settings?.phone || '+91 12345 67890'}</p>
          </div>
          
          <div className="flex justify-between text-[10px] font-bold mb-4">
            <div>
              <p>ORDER: {selectedOrder.order_number || selectedOrder.id}</p>
              <p>TABLE: {selectedOrder.table_code || selectedOrder.table || 'WALK-IN'}</p>
              <p>DATE: {new Date().toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p>TIME: {new Date().toLocaleTimeString()}</p>
              <p>STATUS: {selectedOrder.status}</p>
            </div>
          </div>

          <table className="w-full text-[10px] mb-4">
            <thead>
              <tr className="border-b border-slate-300">
                <th className="text-left py-2">ITEM</th>
                <th className="text-center py-2">QTY</th>
                <th className="text-right py-2">PRICE</th>
              </tr>
            </thead>
            <tbody>
              {selectedOrder.itemsList?.map((item, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-2 uppercase font-medium">{item.name}</td>
                  <td className="py-2 text-center">{item.quantity}</td>
                  <td className="py-2 text-right">{formatCurrency(item.price)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="py-4 font-black uppercase text-right pr-4">Total Amount</td>
                <td className="py-4 text-right font-black text-sm">{formatCurrency((selectedOrder.grand_total || selectedOrder.amount || 0))}</td>
              </tr>
            </tfoot>
          </table>

          <div className="text-center pt-4 border-t border-slate-200">
            <p className="text-[9px] font-black uppercase tracking-widest">Thank you for dining with us!</p>
            <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Visit again soon • {settings?.businessName || 'Gila House'} Systems</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
