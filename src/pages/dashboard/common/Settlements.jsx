import { formatCurrency } from '../../../utils/currencyUtils';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Receipt, 
  Search, 
  Filter, 
  X, 
  ChevronRight, 
  CreditCard, 
  History, 
  Calendar, 
  MoreVertical,
  CheckCircle2,
  Trash2,
  Bed,
  Users,
  Clock,
  Printer,
  Download,
  Wallet,
  ArrowUpRight,
  UtensilsCrossed
} from 'lucide-react';
import { cn } from "../../../utils/cn";
import { useHospitality } from "@/context/HospitalityContext";

const Settlements = () => {
  const { folios, settleFolio, addToFolio } = useHospitality();
  const [selectedFolio, setSelectedFolio] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Open');

  const filteredFolios = folios.filter(f => {
    const matchesSearch = f.guestName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          f.roomName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'All' || f.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Area */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
            <CreditCard className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-text-primary uppercase tracking-wider">Settlement Desk</h2>
            <p className="text-text-secondary text-sm font-bold mt-1">Finalize guest payments and close folios</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group min-w-[240px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search guest or room..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-5 py-3 bg-surface border border-slate-100 rounded-2xl outline-none shadow-sm text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1 shrink-0">
          {['Open', 'Settled', 'All'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 whitespace-nowrap transition-all",
                activeTab === tab 
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/10" 
                : "bg-surface text-text-secondary border-transparent hover:bg-slate-50"
              )}
            >
              {tab === 'Open' ? 'Awaiting Settlement' : tab}
            </button>
          ))}
        </div>

        {/* Folios List */}
        <div className="flex-1 overflow-hidden lg:card bg-transparent lg:bg-surface border-none lg:shadow-xl lg:shadow-slate-100/50 lg:rounded-[2.5rem]">
           <div className="h-full overflow-y-auto scrollbar-hide">
              <table className="w-full border-collapse hidden lg:table">
                 <thead>
                    <tr className="text-left bg-slate-50/50 border-b border-slate-100">
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Guest / Room</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Charges</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Balance</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                       <th className="px-8 py-5"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {filteredFolios.map((folio) => (
                      <tr key={folio.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={() => setSelectedFolio(folio)}>
                         <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-text-primary">
                                  <Bed className="w-5 h-5" />
                                </div>
                               <div>
                                  <p className="text-sm font-black text-text-primary uppercase tracking-tight">{folio.guestName}</p>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{folio.roomName}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-5 text-sm font-black text-text-primary">
                            {folio.items.length} Items
                         </td>
                         <td className="px-8 py-5">
                            <span className="text-lg font-black text-primary tracking-tighter">{formatCurrency(folio.total)}</span>
                         </td>
                         <td className="px-8 py-5">
                            <span className={cn(
                              "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                              folio.status === 'Open' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            )}>
                               {folio.status}
                            </span>
                         </td>
                         <td className="px-8 py-5 text-right">
                            <button className="px-4 py-2 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                               Details
                            </button>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>

              {/* Mobile Card View - Premium Design */}
              <div className="lg:hidden space-y-4 pb-24">
                {filteredFolios.length > 0 ? filteredFolios.map((folio) => (
                  <div 
                    key={folio.id} 
                    onClick={() => setSelectedFolio(folio)}
                    className="group bg-surface p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/30 border border-slate-50 active:scale-[0.98] transition-all relative overflow-hidden"
                  >
                    {/* Status Badge - Top Right */}
                    <div className="absolute top-6 right-6">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border shadow-sm",
                        folio.status === 'Open' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      )}>
                         {folio.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                        <Bed className="w-6 h-6" />
                      </div>
                      <div className="min-w-0 pr-16">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Guest Account</p>
                        <h4 className="text-base font-black text-text-primary uppercase tracking-tight truncate">{folio.guestName}</h4>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                       <div className="space-y-1">
                          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Room</p>
                          <p className="text-xs font-black text-text-primary uppercase">{folio.roomName}</p>
                       </div>
                       <div className="text-right space-y-1">
                          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Total Charges</p>
                          <p className="text-xs font-black text-text-primary">{folio.items.length} Items</p>
                       </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                       <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Balance Due</p>
                          <p className="text-2xl font-black text-primary tracking-tighter">{formatCurrency(folio.total)}</p>
                       </div>
                       <div className="w-12 h-12 bg-primary/5 text-primary rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                          <ChevronRight className="w-5 h-5" />
                       </div>
                    </div>
                  </div>
                )) : (
                  <div className="py-20 text-center bg-surface rounded-[3rem] border border-slate-50 shadow-sm">
                    <Receipt className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                    <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No folios found</p>
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedFolio && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 overflow-hidden">
          <div onClick={() => setSelectedFolio(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" />
          <div className="relative w-full sm:max-w-2xl bg-surface rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh] animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 self-center border border-slate-100">
            <div className="px-6 py-4 md:px-8 md:py-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 lg:w-14 h-12 lg:h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
                   <CreditCard className="w-6 lg:w-7 h-6 lg:h-7" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-2xl font-black text-text-primary uppercase tracking-tight">{selectedFolio.guestName}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Settlement Ticket #{selectedFolio.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedFolio(null)} className="p-3 hover:bg-surface rounded-2xl transition-all text-slate-400"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-5 scrollbar-hide">
                 <div className="flex justify-between items-center">
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account History</p>
                       <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.2em] ml-1 mt-0.5">Real-time hospitality ledger</p>
                    </div>
                    <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg border border-primary/10">{selectedFolio.items.length} Entries</span>
                 </div>
                 
                 {selectedFolio.items.length > 0 ? (
                   <div className="space-y-3">
                     {selectedFolio.items.map((item) => (
                       <div key={item.id} className="flex items-center justify-between p-4 lg:p-5 bg-slate-50 rounded-2xl group hover:bg-primary/5 transition-all border border-transparent hover:border-primary/10">
                          <div className="flex items-center gap-4">
                             <div className={cn(
                               "w-9 lg:w-10 h-9 lg:h-10 rounded-xl flex items-center justify-center shadow-inner",
                               item.type === 'Room' ? 'bg-indigo-100 text-primary' : 'bg-amber-100 text-amber-600'
                             )}>
                                {item.type === 'Room' ? <Bed className="w-4 h-4 lg:w-5 lg:h-5" /> : <UtensilsCrossed className="w-4 h-4 lg:w-5 lg:h-5" />}
                             </div>
                             <div>
                                <p className="text-[11px] lg:text-xs font-black text-text-primary uppercase tracking-tight">{item.description}</p>
                                <p className="text-[8px] lg:text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{item.date}</p>
                             </div>
                          </div>
                          <p className="text-xs lg:text-sm font-black text-text-primary">{formatCurrency(item.amount)}</p>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="flex flex-col items-center justify-center py-12 text-center">
                     <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                       <Receipt className="w-8 h-8" />
                     </div>
                     <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No transactions recorded yet</p>
                   </div>
                 )}
              </div>

              <div className="p-6 lg:p-8 bg-surface border-t border-slate-50 space-y-4 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
                 <div className="flex justify-between items-end px-2">
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Account Status</p>
                       <span className={cn(
                         "px-3 lg:px-4 py-1.5 rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest border shadow-sm",
                         selectedFolio.status === 'Open' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                       )}>
                          {selectedFolio.status} Account
                       </span>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Settlement Amount</p>
                       <p className="text-3xl lg:text-4xl font-black text-primary tracking-tighter">{formatCurrency(selectedFolio.total)}</p>
                    </div>
                 </div>

                 {selectedFolio.status === 'Open' ? (
                   <button 
                     onClick={() => { settleFolio(selectedFolio.id); setSelectedFolio(null); }}
                     className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3"
                   >
                     <CheckCircle2 className="w-5 h-5" /> Confirm Settlement
                   </button>
                 ) : (
                   <div className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-emerald-500/20 flex items-center justify-center gap-3">
                     <CheckCircle2 className="w-5 h-5" /> Settled & Paid
                   </div>
                 )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Settlements;
