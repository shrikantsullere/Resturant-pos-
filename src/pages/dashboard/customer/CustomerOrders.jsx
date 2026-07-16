import { formatCurrency } from '../../../utils/currencyUtils';
import { useState, useMemo } from 'react';
import { 
  History, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  UtensilsCrossed, 
  ChevronLeft,
  Search,
  RotateCcw,
  Star,
  MapPin,
  ClipboardList,
  X,
  Printer
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useOrders } from '@/context/OrdersContext';
import { useCustomer } from '@/context/CustomerContext';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import printContent from '@/utils/printUtil';
import { useSettings } from "@/context/SettingsContext";

const CustomerOrders = () => {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const { orders, cancelOrder } = useOrders();
  const { profile, addToCart } = useCustomer();
  const [activeTab, setActiveTab] = useState('Active');
  const [selectedTrackOrderId, setSelectedTrackOrderId] = useState(null);

  // Get the most up-to-date version of the selected order from the context
  const selectedTrackOrder = useMemo(() => 
    orders.find(o => String(o.id) === String(selectedTrackOrderId)),
    [orders, selectedTrackOrderId]
  );

  const filteredOrders = orders.filter(order => {
    const status = (order.order_status || order.status || '').toLowerCase();
    const isActive = ['pending', 'new', 'cooking', 'ready'].includes(status);
    return activeTab === 'Active' ? isActive : !isActive;
  });

  const getStatusColor = (status = '') => {
    const s = status.toLowerCase();
    switch(s) {
      case 'new': return 'text-blue-500 bg-blue-50 border-blue-100';
      case 'waiting payment': return 'text-orange-500 bg-orange-50 border-orange-100';
      case 'confirmed': return 'text-blue-500 bg-blue-50 border-blue-100';
      case 'preparing':
      case 'cooking': return 'text-indigo-500 bg-indigo-50 border-indigo-100';
      case 'ready': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
      case 'served':
      case 'delivered': return 'text-slate-500 bg-slate-50 border-slate-100';
      case 'cancelled': return 'text-primary bg-rose-50 border-rose-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  const handleReorder = (order) => {
    alert('Adding items from ' + order.id + ' to cart!');
    navigate('/customer/order-now');
  };

  const trackingSteps = [
    { label: 'Order Placed', status: 'confirmed', icon: ClipboardList, color: 'bg-blue-500' },
    { label: 'In Kitchen', status: 'preparing', icon: UtensilsCrossed, color: 'bg-indigo-500' },
    { label: 'Quality Check', status: 'cooking', icon: Search, color: 'bg-indigo-500' },
    { label: 'Ready', status: 'ready', icon: CheckCircle2, color: 'bg-emerald-500' }
  ];

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
         <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2.5 bg-surface rounded-xl shadow-sm border border-slate-100 lg:hidden">
               <ChevronLeft className="w-5 h-5 text-text-primary" />
            </button>
            <h2 className="text-xl lg:text-2xl font-black text-text-primary uppercase tracking-tight">Order Management</h2>
         </div>
         <div className="flex bg-surface p-1.5 rounded-2xl shadow-sm border border-slate-100 w-fit self-start lg:self-center">
            {['Active', 'History'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === tab ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:text-primary"
                )}
              >
                {tab}
              </button>
            ))}
         </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4 pb-10">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center opacity-50">
             <History className="w-16 h-16 text-slate-200 mb-4" />
             <p className="text-sm font-black uppercase tracking-widest text-slate-400">No {activeTab.toLowerCase()} orders found</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const currentStatus = (order.order_status || order.status || '').toLowerCase();
            return (
              <div key={order.id} className="card p-5 lg:p-6 bg-surface border-none shadow-xl shadow-slate-100/50 hover:bg-slate-50 transition-all group">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4 lg:gap-6">
                        <div className="w-14 h-14 lg:w-16 lg:h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform">
                          {['cooking', 'ready'].includes(currentStatus) ? '🍳' : currentStatus === 'delivered' ? '✅' : currentStatus === 'cancelled' ? '❌' : '⏳'}
                        </div>
                        <div className="space-y-1.5 flex-1 min-w-0">
                           <div className="flex flex-wrap items-center gap-2">
                              <span className={cn("px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border shrink-0", getStatusColor(currentStatus))}>
                                 {currentStatus}
                              </span>
                              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest truncate">• {order.order_number || order.id}</span>
                           </div>
                           <h4 className="text-base lg:text-lg font-black text-text-primary uppercase tracking-tight leading-tight pt-0.5 break-words line-clamp-2">
                              {order.items && order.items.length > 0 
                                ? order.items.map(i => i.item_name || i.name).join(', ') 
                                : order.itemsList 
                                  ? order.itemsList.map(i => i.name).join(', ') 
                                  : 'Food Order'}
                           </h4>
                           <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-0.5">
                              <span className="flex items-center gap-1 shrink-0">
                                 <Clock className="w-3 h-3" /> 
                                 {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (order.time || 'Recent')}
                              </span>
                              <span className="flex items-center gap-1 shrink-0">
                                 <MapPin className="w-3 h-3" /> 
                                 {order.table_code || order.table || 'N/A'}
                              </span>
                           </div>
                        </div>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-slate-50">
                       <div className="text-right">
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Order Total</p>
                          <p className="text-lg lg:text-xl font-black text-text-primary tracking-tighter">
                             {formatCurrency((order.grand_total || order.amount || 0).toString().replace('Rp ', ''))}
                          </p>
                       </div>
                       <div className="flex items-center gap-2">
                          {activeTab === 'History' ? (
                            <div className="flex items-center gap-2 w-full md:w-auto">
                               <button 
                                 onClick={() => handleReorder(order)}
                                 className="flex items-center justify-center gap-2 px-4 py-2.5 bg-surface border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm flex-1 md:flex-none"
                               >
                                  <RotateCcw className="w-3.5 h-3.5" /> Reorder
                               </button>
                               <button 
                                onClick={() => { setSelectedTrackOrderId(order.id); setTimeout(() => printContent('printable-area'), 200); }}
                                className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-primary transition-all shadow-sm border border-slate-100 shrink-0"
                               >
                                  <Printer className="w-4 h-4" />
                               </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 w-full md:w-auto">
                               {currentStatus === 'new' && (
                                 <button 
                                   onClick={() => cancelOrder(order.id)}
                                   className="px-4 py-2.5 bg-rose-50 text-primary rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm flex-1 md:flex-none"
                                 >
                                    Cancel
                                 </button>
                               )}
                                <button 
                                 onClick={() => { setSelectedTrackOrderId(order.id); setTimeout(() => printContent('printable-area'), 200); }}
                                 className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-primary transition-all shadow-sm border border-slate-100 shrink-0"
                                >
                                   <Printer className="w-4 h-4" />
                                </button>
                                <button 
                                 onClick={() => setSelectedTrackOrderId(order.id)}
                                 className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all flex-1 md:flex-none whitespace-nowrap"
                                >
                                   Track Order <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                          )}
                       </div>
                    </div>
                 </div>

                 {/* Mini Tracking Summary (Only for Active) */}
                 {activeTab === 'Active' && currentStatus !== 'cancelled' && (
                   <div className="mt-6 pt-6 border-t border-slate-50">
                      <div className="flex items-center justify-between mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                         <span>Preparation Progress</span>
                          <span className="text-primary uppercase">
                             {currentStatus === 'new' ? '20%' : 
                              currentStatus === 'pending' ? '40%' :
                              currentStatus === 'cooking' ? '75%' : 
                              currentStatus === 'ready' ? '95%' : '100%'} Completed
                          </span>
                      </div>
                      <div className="flex gap-1.5 h-2">
                         <div className={cn("flex-1 rounded-full", ['new', 'pending', 'cooking', 'ready', 'delivered'].includes(currentStatus) ? "bg-primary shadow-[0_0_10px_rgba(99,102,241,0.3)]" : "bg-slate-100")} />
                         <div className={cn("flex-1 rounded-full", ['pending', 'cooking', 'ready', 'delivered'].includes(currentStatus) ? "bg-primary shadow-[0_0_10px_rgba(99,102,241,0.3)]" : "bg-slate-100")} />
                         <div className={cn("flex-1 rounded-full", ['cooking', 'ready', 'delivered'].includes(currentStatus) ? "bg-primary shadow-[0_0_10px_rgba(99,102,241,0.3)]" : "bg-slate-100")} />
                         <div className={cn("flex-1 rounded-full", ['ready', 'delivered'].includes(currentStatus) ? "bg-primary shadow-[0_0_10px_rgba(99,102,241,0.3)]" : "bg-slate-100")} />
                      </div>
                   </div>
                 )}
              </div>
            );
          })
        )}
      </div>

      {/* Tracking Modal */}
      {selectedTrackOrder && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-0 sm:p-4">
          <div onClick={() => setSelectedTrackOrderId(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-surface rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 sm:zoom-in-95 duration-300 self-end sm:self-center max-h-[90vh] flex flex-col">
             <div className="p-5 sm:p-8 bg-slate-50 flex justify-between items-center border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-3 sm:gap-4">
                   <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
                      <Clock className="w-6 h-6 sm:w-7 sm:h-7" />
                   </div>
                   <div>
                      <h3 className="text-lg sm:text-xl font-black text-text-primary uppercase tracking-tight">Order Tracker</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Ticket #{selectedTrackOrder.order_number || selectedTrackOrder.id}</p>
                   </div>
                </div>
                <button onClick={() => setSelectedTrackOrderId(null)} className="p-2 bg-surface rounded-xl text-slate-300 hover:text-text-primary transition-all">
                   <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
             </div>

             <div className="p-6 sm:p-8 space-y-6 sm:space-y-10 overflow-y-auto scrollbar-hide">
                {/* Visual Steps */}
                <div className="relative flex justify-between items-start px-0 sm:px-2">
                   <div className="absolute left-6 right-6 top-6 h-0.5 bg-slate-100 -z-10" />
                   {trackingSteps.map((step, idx) => {
                     const orderStatus = (selectedTrackOrder.order_status || selectedTrackOrder.status || '').toLowerCase();
                     const stepStatus = step.status.toLowerCase();
                     
                     const statusPriority = { 'new': 0, 'pending': 1, 'cooking': 2, 'ready': 3, 'delivered': 4 };
                     const currentPriority = statusPriority[orderStatus] || 0;
                     const stepPriority = statusPriority[stepStatus] || 0;
                     
                     const isPast = currentPriority >= stepPriority;
                     const isCurrent = orderStatus === stepStatus && (step.label !== 'Quality Check' || orderStatus === 'cooking');

                     return (
                       <div key={idx} className="flex flex-col items-center gap-2 sm:gap-3 flex-1">
                          <div className={cn(
                            "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-4 border-white shadow-lg transition-all duration-500",
                            isPast ? step.color + " text-white" : "bg-surface text-slate-200"
                          )}>
                             <step.icon className={cn("w-4 h-4 sm:w-5 sm:h-5", isCurrent && "animate-pulse")} />
                          </div>
                          <span className={cn(
                            "text-[7px] sm:text-[8px] md:text-[9px] font-black uppercase tracking-[0.05em] sm:tracking-widest text-center leading-tight px-1",
                            isPast ? "text-text-primary" : "text-slate-300"
                          )}>{step.label}</span>
                       </div>
                     );
                   })}
                </div>

                <div className="card p-4 sm:p-6 bg-slate-50 border-none space-y-3 sm:space-y-4">
                   <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Order Items</span>
                      <span>{formatCurrency(selectedTrackOrder.grand_total || selectedTrackOrder.amount || 0)}</span>
                   </div>
                   <div className="space-y-2.5 sm:space-y-3">
                      {(selectedTrackOrder.items || selectedTrackOrder.itemsList || []).map((item, i) => (
                         <div key={i} className="flex justify-between items-center gap-4">
                            <p className="text-xs sm:text-sm font-black text-text-primary uppercase truncate flex-1">{item.item_name || item.name}</p>
                            <p className="text-[10px] sm:text-xs font-bold text-slate-400 shrink-0">x{item.quantity || 1}</p>
                         </div>
                      ))}
                   </div>
                </div>

                <div className="text-center space-y-1 sm:space-y-2">
                   <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Estimated Time</p>
                   <h4 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tighter">12-15 MINS</h4>
                </div>

                <button 
                  onClick={() => setSelectedTrackOrderId(null)}
                  className="w-full py-4 sm:py-5 bg-primary text-white rounded-2xl sm:rounded-3xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] shadow-2xl shadow-primary/30 active:scale-95 transition-all mt-4"
                >
                   Continue Shopping
                </button>
             </div>
          </div>
        </div>,
        document.body
      )}

      {/* Reward Ad */}
      <div className="card p-6 bg-gradient-to-br from-indigo-600 to-primary text-white border-none rounded-[2rem] shadow-2xl relative overflow-hidden group cursor-pointer lg:mb-4">
         <div className="absolute top-0 right-0 w-48 h-48 bg-surface/10 rounded-full -mr-24 -mt-24 blur-3xl transition-transform group-hover:scale-110" />
         <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 bg-surface/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow-xl">
               🎁
            </div>
            <div>
               <h4 className="text-lg lg:text-xl font-black uppercase tracking-tight leading-none mb-1">Earn 50 Points</h4>
               <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Rate your previous orders to unlock rewards!</p>
            </div>
            <div className="ml-auto p-3 bg-surface/10 rounded-full hover:bg-surface/20 transition-all">
               <Star className="w-5 h-5 text-yellow-300" />
            </div>
         </div>
      </div>
      {/* Hidden Printable Receipt */}
      {selectedTrackOrder && (
        <div id="printable-area" className="hidden print:block printable-area receipt-print">
          <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
            <h1 className="text-xl font-black uppercase tracking-tighter">{settings?.businessName || 'Gila House'}</h1>
            {settings?.motto && <p className="text-[8px] font-bold uppercase tracking-[0.2em] mt-1">{settings.motto}</p>}
            <div className="text-[8px] font-bold text-slate-500 mt-1 mb-2">
              {settings?.address && <span>{settings.address}</span>}
              {settings?.phone && <span className="ml-1">| {settings.phone}</span>}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-1">Customer Order Receipt</p>
          </div>
          
          <div className="flex justify-between text-[11px] font-black mb-4 uppercase">
            <div>
              <p>ORDER ID: {selectedTrackOrder.id}</p>
              <p>TABLE: {selectedTrackOrder.table_code || selectedTrackOrder.table}</p>
            </div>
            <div className="text-right">
              <p>DATE: {new Date().toLocaleDateString()}</p>
              <p>TIME: {selectedTrackOrder.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>

          <div className="border-y border-slate-900 py-4 mb-4">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-slate-300">
                  <th className="text-left py-1 uppercase">QTY</th>
                  <th className="text-left py-1 uppercase">ITEM</th>
                  <th className="text-right py-1 uppercase">PRICE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(selectedTrackOrder.items || selectedTrackOrder.itemsList || []).map((item, i) => (
                  <tr key={i}>
                    <td className="py-2 font-black">{item.quantity || 1}x</td>
                    <td className="py-2 uppercase font-black">{item.item_name || item.name}</td>
                    <td className="py-2 text-right font-black">{formatCurrency(item.unit_price || item.price || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-1 mb-6">
            <div className="flex justify-between text-sm font-black uppercase">
              <span>Total Amount</span>
              <span>{formatCurrency(selectedTrackOrder.grand_total || selectedTrackOrder.amount || 0)}</span>
            </div>
            <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
              <span>Payment Status</span>
              <span>{(selectedTrackOrder.payment_status || '').toUpperCase()}</span>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-[9px] font-black uppercase tracking-widest">Thank you for your visit!</p>
            <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Please visit again</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
