import React, { useState } from 'react';
import { 
  Clock, 
  Plus, 
  ChefHat, 
  CheckCircle2, 
  Timer, 
  AlertCircle,
  Play,
  Check,
  ChevronRight,
  Utensils,
  CookingPot,
  Bell,
  Search, 
  Sparkles, 
  Zap, 
  MoreVertical,
  Eye,
  ExternalLink,
  ShoppingBag,
  Printer,
  X
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { cn } from "../../../utils/cn";
import { useOrders } from "../../../context/OrdersContext";
import { useToast } from "../../../context/ToastContext";
import { useSettings } from "../../../context/SettingsContext";
import printContent from '../../../utils/printUtil';

const Kitchen = () => {
  const { orders, updateOrderStatus, cancelOrder, toggleItemComplete, updateOrderPriority, resetOrders } = useOrders();
  const { showToast } = useToast();
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState('Active');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(3);
  const [dropdownOrderId, setDropdownOrderId] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [transferringOrderId, setTransferringOrderId] = useState(null);
  const [orderForKOT, setOrderForKOT] = useState(null);

  const handlePrintKOT = (order) => {
    setOrderForKOT(order);
    setTimeout(() => {
      printContent('printable-area');
    }, 100);
  };

  const updateStatus = (id, newStatus) => {
    updateOrderStatus(id, newStatus);
  };

  const togglePriority = (id) => {
    // Priority logic could be an API call
    showToast('Priority updated', 'info');
  };

  const handleCancelOrder = (id) => {
    if (confirm('Are you sure you want to cancel this ticket?')) {
      cancelOrder(id);
    }
    setDropdownOrderId(null);
  };

  const handleToggleItem = (orderId, itemIndex) => {
    toggleItemComplete(orderId, itemIndex);
  };

  const handleResetOrders = () => {
    if (confirm('This will reset all orders to default for demo purposes. Continue?')) {
      resetOrders();
    }
  };

  const getStatusConfig = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'new':
      case 'pending': return { border: 'border-orange-200', bg: 'bg-orange-50/30', accent: 'bg-orange-500', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' };
      case 'cooking': 
      case 'preparing': return { border: 'border-primary/20', bg: 'bg-indigo-50/30', accent: 'bg-primary', text: 'text-primary', badge: 'bg-indigo-100 text-primary' };
      case 'ready': return { border: 'border-emerald-200', bg: 'bg-emerald-50/30', accent: 'bg-emerald-500', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' };
      default: return { border: 'border-border', bg: 'bg-slate-50', accent: 'bg-slate-400', text: 'text-slate-700', badge: 'bg-slate-100 text-slate-700' };
    }
  };

  const filteredOrders = orders.filter(o => {
    const status = (o.order_status || 'new').toLowerCase();
    const matchesTab = activeTab === 'Active' 
      ? ['new', 'pending', 'cooking', 'preparing'].includes(status) 
      : status === 'ready';
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = (o.order_number || '').toLowerCase().includes(searchLower) || 
                          (o.table_code || '').toLowerCase().includes(searchLower);
    
    return matchesTab && matchesSearch;
  });

  const stats = {
    queue: orders.filter(o => ['new', 'pending', 'cooking'].includes(o.order_status)).length,
    ready: orders.filter(o => o.order_status === 'ready').length
  };

  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden" onClick={() => setDropdownOrderId(null)}>
      {/* KDS Header Area */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 lg:gap-4">
           <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary rounded-xl lg:rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/30 relative shrink-0">
              <ChefHat className="w-5 h-5 lg:w-6 lg:h-6 lg:stroke-[2.5]" />
              {stats.queue > 0 && <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-white" />}
           </div>
           <div>
              <h2 className="text-xl lg:text-2xl font-black tracking-tight text-text-primary uppercase tracking-[0.05em] leading-none">Kitchen Control</h2>
              <p className="text-text-secondary mt-1 font-bold flex items-center gap-1.5 text-[10px] lg:text-sm">
                 <Zap className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-warning" /> High Efficiency
              </p>
           </div>
        </div>

        <div className="flex items-center gap-3 lg:gap-4 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1 min-w-0">
           {/* Metric Cards */}
           <div className="card p-3 lg:p-4 flex flex-col justify-between w-28 sm:w-32 lg:w-40 h-20 lg:h-24 bg-surface border border-slate-100 shadow-sm group shrink-0">
              <div className="flex justify-between items-start">
                 <p className="text-[7px] lg:text-[8px] uppercase font-bold text-slate-400 tracking-[0.2em]">Active</p>
                 <Timer className="w-3 h-3 lg:w-4 lg:h-4 text-primary opacity-40" />
              </div>
              <p className="text-sm sm:text-base lg:text-lg font-black text-text-primary tracking-tighter">{stats.queue}<span className="text-[9px] lg:text-[10px] font-bold text-slate-300 ml-0.5 uppercase">tickets</span></p>
           </div>
           
           <div className="card p-3 lg:p-4 flex flex-col justify-between w-28 sm:w-32 lg:w-40 h-20 lg:h-24 bg-surface border border-slate-100 shadow-sm group shrink-0">
              <div className="flex justify-between items-start">
                 <p className="text-[7px] lg:text-[8px] uppercase font-bold text-slate-400 tracking-[0.2em]">Ready</p>
                 <Utensils className="w-3 h-3 lg:w-4 lg:h-4 text-emerald-600 opacity-40" />
              </div>
              <p className="text-sm sm:text-base lg:text-lg font-black text-emerald-600 tracking-tighter uppercase">{stats.ready}</p>
           </div>

           <div className="h-10 w-[1px] bg-slate-200 mx-1" />

           <button 
             onClick={(e) => {
               e.stopPropagation();
               if(notifications > 0) {
                 setNotifications(0);
                 showToast('Notifications cleared!', 'info');
               }
             }}
             className="p-2.5 bg-surface border border-border rounded-xl shadow-sm text-text-secondary hover:text-primary relative group"
           >
              <Bell className="w-5 h-5" />
              {notifications > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white shadow-sm" />}
           </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shrink-0 mb-2">
         <div className="flex bg-surface p-0.5 rounded-xl lg:rounded-2xl border border-slate-100 shadow-sm gap-1">
            {['Active', 'Ready'].map(tab => (
              <button 
                key={tab}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab(tab);
                }}
                className={cn(
                  "flex-1 sm:flex-none px-4 lg:px-6 py-2 lg:py-2.5 rounded-lg lg:rounded-xl text-[8px] lg:text-[9px] font-bold uppercase tracking-[0.2em] transition-all",
                  activeTab === tab ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-text-secondary hover:bg-slate-50"
                )}
              >
                {tab} Feed
              </button>
            ))}
         </div>
         <div className="relative w-full sm:w-64 lg:w-80 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find ticket..."
              className="w-full pl-10 pr-4 py-3 lg:py-3.5 bg-surface border border-slate-100 rounded-xl lg:rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none text-[9px] lg:text-[10px] font-bold uppercase tracking-widest placeholder:text-slate-300 shadow-sm"
            />
         </div>
      </div>

      {/* Tickets Scrollable Area */}
      <div className="flex-1 overflow-y-auto pr-1 lg:pr-2 scrollbar-hide">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4 gap-4 lg:gap-5 pb-20 lg:pb-10">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              const config = getStatusConfig(order.order_status);
              return (
                <div 
                  key={order.id} 
                  className={cn(
                    "w-full card flex flex-col p-0 border-2 shadow-xl shadow-slate-200/50 overflow-hidden group/card relative rounded-[1.5rem] h-fit",
                    config.border, config.bg
                  )}
                >
                  {/* Status Light */}
                  <div className={cn("h-2 w-full", config.accent)} />
                  
                  {/* Ticket Header */}
                    <div className="p-3 lg:p-3.5 border-b border-inherit relative bg-surface/40">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                             <h3 className="text-xl lg:text-2xl font-black text-text-primary tracking-tighter">#{order.order_number}</h3>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[8px] lg:text-[10px] font-black text-white px-2 py-0.5 lg:px-2.5 lg:py-1 bg-primary rounded lg:rounded-lg shadow-md shadow-primary/20">{order.table_code || 'Takeaway'}</span>
                            <div className="h-3 w-[1px] bg-slate-300" />
                            <span className="text-[8px] lg:text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em] truncate max-w-[60px]">{order.order_type}</span>
                          </div>
                        </div>
                      <div className="flex flex-col items-end gap-1.5 relative">
                         <span className={cn("badge px-2.5 py-0.5 shadow-sm text-[8px]", config.badge)}>
                           {order.order_status}
                         </span>
                         <button 
                           onClick={(e) => {
                             e.stopPropagation();
                             setDropdownOrderId(dropdownOrderId === order.id ? null : order.id);
                           }}
                           className="p-1.5 bg-surface rounded-lg border border-border shadow-sm hover:border-primary/30"
                         >
                            <MoreVertical className="w-3.5 h-3.5 text-slate-300" />
                         </button>

                         {/* Ticket Settings Dropdown */}
                         {dropdownOrderId === order.id && (
                           <div 
                             className="absolute right-0 top-full mt-2 w-48 bg-surface rounded-2xl shadow-2xl border border-slate-100 z-50 p-2 overflow-hidden"
                             onClick={(e) => e.stopPropagation()}
                           >
                             <button onClick={() => { setViewingOrder(order); setDropdownOrderId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 rounded-xl text-left">
                               <Eye className="w-3.5 h-3.5" /> View Details
                             </button>
                             <button onClick={() => { handlePrintKOT(order); setDropdownOrderId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 rounded-xl text-left">
                               <Printer className="w-3.5 h-3.5 text-primary" /> Print KOT
                             </button>
                             <div className="h-[1px] bg-slate-50 my-1 mx-2" />
                             <button onClick={() => handleCancelOrder(order.id)} className="w-full flex items-center gap-3 px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest text-primary hover:bg-rose-50 rounded-xl text-left">
                               <AlertCircle className="w-3.5 h-3.5" /> Cancel Ticket
                             </button>
                           </div>
                         )}
                      </div>
                    </div>
                    
                    {/* Timer Bar */}
                    <div className="mt-4 flex items-center justify-between gap-4">
                       <div className="flex items-center gap-2 px-3 py-1.5 bg-surface rounded-lg border border-border shadow-sm shrink-0">
                          <Clock className={cn("w-3.5 h-3.5", (order.order_status === 'new' || order.order_status === 'pending') ? 'text-orange-500' : 'text-primary')} />
                          <span className="text-[9px] font-bold text-text-primary uppercase tracking-widest">{order.time}</span>
                       </div>
                        <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                           <div 
                              style={{ width: order.order_status === 'cooking' ? '65%' : '15%' }}
                              className={cn("h-full rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]", config.accent)} 
                           />
                        </div>
                    </div>
                  </div>

                  {/* Order List - Limited View */}
                  <div className="flex-1 p-4 space-y-3 overflow-y-auto min-h-[180px] max-h-[220px] scrollbar-hide">
                    {(order.items?.slice(0, 3) || []).map((item, idx) => {
                      const isCompleted = item.kitchen_status === 'ready';
                      return (
                        <div 
                          key={idx} 
                          className="flex gap-3 group/item relative"
                        >
                          <div className={cn(
                            "w-8 h-8 border-2 rounded-lg flex items-center justify-center font-black text-xs shrink-0 shadow-sm",
                            isCompleted ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-surface border-slate-50 text-text-primary group-hover/item:border-primary/20"
                          )}>
                            {item.quantity}
                          </div>
                          <div className="flex-1 pt-0.5 min-w-0">
                            <p className={cn(
                              "text-[11px] font-bold leading-tight truncate",
                              isCompleted ? "text-slate-300 line-through" : "text-text-primary group-hover/item:text-primary"
                            )}>{item.item_name}</p>
                          </div>
                          <button 
                             onClick={() => handleToggleItem(order.id, idx)}
                             className={cn(
                               "w-6 h-6 rounded-lg border flex items-center justify-center shadow-sm shrink-0",
                               isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : "bg-surface border-slate-100 text-slate-200 hover:text-emerald-500 hover:border-emerald-500"
                             )}
                           >
                            <Check className="w-3 h-3 stroke-[3]" />
                          </button>
                        </div>
                      );
                    })}
                    {order.items?.length > 3 && (
                      <button 
                        onClick={() => setViewingOrder(order)}
                        className="w-full py-2 bg-slate-50 rounded-xl text-[8px] font-black uppercase tracking-widest text-slate-400 hover:bg-indigo-50 hover:text-primary transition-all flex items-center justify-center gap-2"
                      >
                         <Plus className="w-3 h-3" /> {order.items.length - 3} more items
                      </button>
                    )}
                  </div>

                  {/* Action Footer */}
                  <div className="p-4 bg-surface border-t border-inherit">
                    {order.order_status === 'new' || order.order_status === 'pending' ? (
                      <button 
                        onClick={() => updateStatus(order.id, 'cooking')}
                        className="w-full py-3.5 bg-primary text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-dark flex items-center justify-center gap-3 group/btn"
                      >
                        <Play className="w-4 h-4 fill-current" /> 
                        Start Work
                      </button>
                    ) : (
                      <button 
                        onClick={() => updateStatus(order.id, 'ready')}
                        className="w-full py-3.5 bg-emerald-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-emerald-400/20 hover:bg-emerald-700 flex items-center justify-center gap-3 group/btn"
                      >
                        <CheckCircle2 className="w-4 h-4" /> 
                        Dispatch
                      </button>
                    )}
                  </div>
                  
                  {/* Visual Decor */}
                  <CookingPot className="absolute -bottom-6 -left-6 w-32 h-32 text-black/5 -rotate-12 pointer-events-none" />
                </div>
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center text-center py-20 lg:py-32 px-6">
               <div className="w-40 h-40 bg-slate-50 rounded-[3rem] shadow-inner flex items-center justify-center mb-10 relative">
                  <Sparkles className="w-20 h-20 text-slate-200" />
                  <ChefHat className="absolute w-10 h-10 text-primary opacity-20 -top-2 -right-2 rotate-12" />
               </div>
               <h4 className="text-2xl font-black text-text-primary tracking-tight">Station Clear</h4>
               <p className="text-text-secondary text-sm font-medium mt-3 max-w-sm leading-relaxed">
                  Great work! No pending tickets at the moment. Take a breather.
               </p>
                <button 
                  onClick={handleResetOrders}
                  className="mt-8 btn-secondary py-3 px-8 border font-bold uppercase tracking-widest text-[10px]"
                >
                  Refresh Station
                </button>
            </div>
          )}
        </div>
      </div>

      {/* View Details Modal */}
      {viewingOrder && createPortal(
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
          <div 
            onClick={() => setViewingOrder(null)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <div 
            className="relative w-full sm:max-w-[520px] max-h-[90vh] sm:max-h-[85vh] bg-surface rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden self-end sm:self-center"
          >
            <div className="px-5 py-4 lg:px-6 lg:py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary rounded-xl lg:rounded-2xl flex items-center justify-center text-white shrink-0">
                  <ShoppingBag className="w-5 h-5 lg:w-6 lg:h-6" />
                </div>
                <div>
                  <h3 className="text-lg lg:text-xl font-black uppercase tracking-tight leading-none">Ticket Breakdown</h3>
                  <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">#{viewingOrder.id} • {viewingOrder.time}</p>
                </div>
              </div>
              <button onClick={() => setViewingOrder(null)} className="p-2 lg:p-3 hover:bg-slate-100 rounded-xl">
                <X className="w-5 h-5 lg:w-6 lg:h-6 text-slate-400" />
              </button>
            </div>
            <div className="px-6 py-8 space-y-6">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">
                <span>Ordered Item</span>
                <span>Quantity</span>
              </div>
              <div className="space-y-3">
                {viewingOrder.items?.map((item, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center border border-slate-100">
                    <div>
                       <p className="font-black text-slate-900 text-sm">{item.item_name}</p>
                       {item.notes && <p className="text-[10px] text-primary font-bold mt-1 uppercase italic">"{item.notes}"</p>}
                    </div>
                    <span className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center font-black border border-slate-100 text-primary">{item.quantity}x</span>
                  </div>
                ))}
              </div>
              <div className="pt-6 border-t border-slate-50">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Table Context</p>
                  <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{viewingOrder.table}</p>
                </div>
              </div>
            </div>
            <div className="px-5 py-5 lg:px-6 lg:py-6 bg-slate-50 border-t border-slate-100 shrink-0 flex gap-3">
              <button 
                onClick={() => handlePrintKOT(viewingOrder)}
                className="flex-1 py-3.5 lg:py-4 bg-surface border border-slate-200 text-slate-600 rounded-xl lg:rounded-2xl font-black uppercase tracking-widest text-[9px] lg:text-[10px] shadow-sm flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print KOT
              </button>
              <button onClick={() => setViewingOrder(null)} className="flex-1 py-3.5 lg:py-4 bg-primary text-white rounded-xl lg:rounded-2xl font-black uppercase tracking-widest text-[9px] lg:text-[10px] shadow-xl shadow-primary/20">
                Close Audit View
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Transfer Station Modal */}
      {transferringOrderId && createPortal(
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
          <div 
            onClick={() => setTransferringOrderId(null)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <div 
            className="relative w-full max-w-sm bg-surface rounded-t-[2.5rem] lg:rounded-[2.5rem] shadow-2xl p-6 lg:p-8 self-end lg:self-center"
          >
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-indigo-50 text-primary rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                <ExternalLink className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">Transfer Ticket</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">Select destination station for ticket #{transferringOrderId}</p>
            </div>
            <div className="mt-8 space-y-3">
              {['Main Bar', 'Pastry Station', 'Grill Section', 'Dispatch Area'].map(station => (
                <button 
                  key={station}
                  onClick={() => {
                    showToast(`Ticket #${transferringOrderId} transferred to ${station}`, 'success');
                    setOrders(prev => prev.filter(o => o.id !== transferringOrderId));
                    setTransferringOrderId(null);
                  }}
                  className="w-full p-4 text-left bg-slate-50 hover:bg-primary hover:text-white rounded-2xl font-black uppercase tracking-widest text-[9px] group flex items-center justify-between"
                >
                  {station}
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>
            <button 
              onClick={() => setTransferringOrderId(null)}
              className="mt-6 w-full py-4 text-slate-400 font-black uppercase tracking-widest text-[9px] hover:text-slate-600"
            >
              Cancel Transfer
            </button>
          </div>
        </div>,
        document.body
      )}
      {/* Hidden Printable KOT */}
      {orderForKOT && (
        <div id="printable-area" className="hidden print:block printable-area receipt-print">
          <div className="text-center border-b-2 border-slate-900 pb-2 mb-4">
            <h1 className="text-xl font-black uppercase tracking-tighter">{settings?.businessName || 'Gila House'}</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-1">{settings?.motto || 'Premium Hospitality & Resort'}</p>
            <div className="text-[10px] font-bold text-slate-500 mt-1 mb-2">
              {settings?.address && <span>{settings.address}</span>}
              {settings?.phone && <span className="ml-1">| {settings.phone}</span>}
            </div>
            <h1 className="text-xl font-black uppercase tracking-tighter mt-4">KITCHEN TICKET</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest">ORDER #{orderForKOT.id}</p>
          </div>
          
          <div className="flex justify-between text-[11px] font-black mb-4 uppercase">
            <div>
              <p>TABLE: {orderForKOT.table}</p>
              <p>TYPE: {orderForKOT.type}</p>
            </div>
            <div className="text-right">
              <p>TIME: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <p className={orderForKOT.priority === 'high' ? 'text-primary' : ''}>PRIORITY: {orderForKOT.priority}</p>
            </div>
          </div>

          <div className="border-y border-slate-900 py-4 mb-4">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-slate-300">
                  <th className="text-left py-1 uppercase">QTY</th>
                  <th className="text-left py-1 uppercase">ITEM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orderForKOT.items?.map((item, i) => (
                  <tr key={i}>
                    <td className="py-2 font-black text-lg">{item.quantity}x</td>
                    <td className="py-2">
                      <p className="font-black uppercase">{item.item_name}</p>
                      {item.notes && <p className="text-[10px] italic font-bold text-primary mt-1">*** {item.notes} ***</p>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-6 pt-4 border-t-2 border-dashed border-slate-900">
            <p className="text-[9px] font-black uppercase tracking-widest">{settings?.businessName || 'Gila House'} Kitchen Display System</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Kitchen;
