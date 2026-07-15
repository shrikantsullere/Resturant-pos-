import React, { useState, useMemo } from 'react';
import { FileText, ChevronLeft, Search, Printer, Calendar, Clock, DollarSign } from 'lucide-react';
import { useOrders } from "../../../context/OrdersContext";
import { useCustomer } from "../../../context/CustomerContext";
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from "../../../utils/currencyUtils";
import { cn } from "../../../utils/cn";
import printContent from "../../../utils/printUtil";
import { createPortal } from 'react-dom';

const CustomerReceipts = () => {
  const navigate = useNavigate();
  const { orders } = useOrders();
  const { profile } = useCustomer();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedReceiptId, setSelectedReceiptId] = useState(null);

  // Filter orders for the customer
  const customerOrders = useMemo(() => {
    const name = profile?.full_name || profile?.name || '';
    const tableStr = profile?.tableId ? `T-${profile.tableId}` : '';
    
    return orders.filter(o => 
      (o.customer === name || (tableStr && o.table === tableStr))
    );
  }, [orders, profile]);

  const selectedReceipt = useMemo(() => 
    customerOrders.find(r => String(r.id) === String(selectedReceiptId)),
    [customerOrders, selectedReceiptId]
  );

  const filteredReceipts = useMemo(() => {
    return customerOrders.filter(r => {
      const matchSearch = String(r.order_number || r.id).toLowerCase().includes(searchQuery.toLowerCase());
      const status = (r.order_status || r.status || '').toLowerCase();
      const matchFilter = 
        activeFilter === 'All' ? true :
        activeFilter === 'Paid' ? ['completed', 'ready', 'delivered'].includes(status) :
        activeFilter === 'Pending' ? ['pending', 'new', 'cooking'].includes(status) :
        activeFilter === 'Cancelled' ? status === 'cancelled' : true;
      return matchSearch && matchFilter;
    });
  }, [customerOrders, searchQuery, activeFilter]);

  const getReceiptStatusStyle = (status = '') => {
    const s = status.toLowerCase();
    if (['completed', 'ready', 'delivered'].includes(s)) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (['pending', 'new', 'cooking'].includes(s)) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    return 'bg-rose-500/10 text-primary border-rose-500/20';
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
         <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2.5 bg-surface rounded-xl shadow-sm border border-slate-100 lg:hidden">
               <ChevronLeft className="w-5 h-5 text-text-primary" />
            </button>
            <h2 className="text-xl lg:text-2xl font-black text-text-primary uppercase tracking-tight">Receipts & Transactions</h2>
         </div>
         <div className="flex bg-surface p-1.5 rounded-2xl shadow-sm border border-slate-100 w-fit self-start lg:self-center">
            {['All', 'Paid', 'Pending', 'Cancelled'].map(filter => (
              <button 
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeFilter === filter ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:text-primary"
                )}
              >
                {filter}
              </button>
            ))}
         </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by invoice / order number..." 
          className="w-full pl-14 pr-6 py-4 bg-surface border-2 border-slate-50 focus:border-primary focus:bg-surface rounded-2xl outline-none shadow-xl shadow-slate-100/50 text-sm font-bold transition-all"
        />
      </div>

      {/* Receipts Log / List */}
      <div className="space-y-4 pb-20">
         {filteredReceipts.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-[50vh] text-center opacity-50">
              <FileText className="w-16 h-16 text-slate-200 mb-4" />
              <p className="text-sm font-black uppercase tracking-widest text-slate-400">No transactions found</p>
           </div>
         ) : (
           filteredReceipts.map((receipt) => {
             const status = (receipt.order_status || receipt.status || '').toLowerCase();
             const isPaid = ['completed', 'ready', 'delivered'].includes(status);
             const displayStatus = isPaid ? 'Paid' : status === 'cancelled' ? 'Cancelled' : 'Pending';
             
             return (
               <div key={receipt.id} className="card p-5 bg-surface border-none shadow-xl shadow-slate-100/50 hover:bg-slate-50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                     <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors shrink-0 shadow-inner">
                        <FileText className="w-6 h-6" />
                     </div>
                     <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                           <span className={cn("px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border shrink-0", getReceiptStatusStyle(status))}>
                              {displayStatus}
                           </span>
                           <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest truncate">#{receipt.order_number || receipt.id}</span>
                        </div>
                        <h4 className="font-black text-text-primary text-sm uppercase tracking-tight truncate">
                           {receipt.items && receipt.items.length > 0 
                             ? receipt.items.map(i => i.item_name || i.name).join(', ') 
                             : 'Dining Order'}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest pt-0.5">
                           <span className="flex items-center gap-1 shrink-0">
                              <Calendar className="w-3 h-3" />
                              {receipt.createdAt ? new Date(receipt.createdAt).toLocaleDateString() : 'Recent'}
                           </span>
                           <span className="flex items-center gap-1 shrink-0">
                              <Clock className="w-3 h-3" />
                              {receipt.createdAt ? new Date(receipt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                           </span>
                           <span className="flex items-center gap-1 shrink-0">
                              <DollarSign className="w-3 h-3" />
                              {receipt.payment_method || 'Online Card'}
                           </span>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-slate-50 shrink-0">
                     <div className="text-left md:text-right">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Grand Total</p>
                        <p className="text-base lg:text-lg font-black text-text-primary tracking-tighter">
                           {formatCurrency((receipt.grand_total || receipt.amount || 0).toString().replace('Rp ', ''))}
                        </p>
                     </div>
                     <button 
                       onClick={() => {
                         setSelectedReceiptId(receipt.id);
                         setTimeout(() => printContent('printable-area'), 200);
                       }}
                       className="p-3 bg-slate-50 hover:bg-primary hover:text-white text-slate-400 rounded-xl hover:shadow-lg transition-all border border-slate-100 shrink-0"
                     >
                        <Printer className="w-4 h-4" />
                     </button>
                  </div>
               </div>
             );
           })
         )}
      </div>

      {/* Invoice Modal for Printable Area */}
      {selectedReceipt && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 opacity-0 pointer-events-none">
          <div id="printable-area" className="w-full max-w-sm bg-white p-6 font-sans text-xs text-black border border-black/10">
             <div className="text-center space-y-2 border-b border-dashed border-black/20 pb-4 mb-4">
                <h3 className="text-lg font-black uppercase">Gila House</h3>
                <p className="text-[10px] text-slate-500 font-medium">Restaurant & Bar</p>
                <p className="text-[9px] text-slate-400 uppercase tracking-wider">Invoice #{selectedReceipt.order_number || selectedReceipt.id}</p>
             </div>
             
             <div className="space-y-1 border-b border-dashed border-black/20 pb-4 mb-4">
                <div className="flex justify-between">
                   <span className="text-slate-400 uppercase tracking-wider font-bold">Date:</span>
                   <span>{selectedReceipt.createdAt ? new Date(selectedReceipt.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-slate-400 uppercase tracking-wider font-bold">Time:</span>
                   <span>{selectedReceipt.createdAt ? new Date(selectedReceipt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-slate-400 uppercase tracking-wider font-bold">Payment Method:</span>
                   <span>{selectedReceipt.payment_method || 'Online Payment'}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-slate-400 uppercase tracking-wider font-bold">Status:</span>
                   <span className="font-bold uppercase">PAID</span>
                </div>
             </div>

             <div className="space-y-3 border-b border-dashed border-black/20 pb-4 mb-4">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ordered Items</div>
                {selectedReceipt.items && selectedReceipt.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                     <span>{item.item_name || item.name} x {item.quantity || 1}</span>
                     <span>{formatCurrency((item.price * (item.quantity || 1)).toString())}</span>
                  </div>
                ))}
             </div>

             <div className="space-y-1 pt-1">
                <div className="flex justify-between">
                   <span>Subtotal:</span>
                   <span>{formatCurrency((selectedReceipt.subtotal || selectedReceipt.grand_total || 0).toString().replace('Rp ', ''))}</span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-2 border-t border-dashed border-black/10">
                   <span>Grand Total:</span>
                   <span>{formatCurrency((selectedReceipt.grand_total || selectedReceipt.amount || 0).toString().replace('Rp ', ''))}</span>
                </div>
             </div>
             
             <div className="text-center text-[9px] text-slate-400 pt-6 uppercase tracking-widest">
                Thank you for dining with us!
             </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CustomerReceipts;
