import { formatCurrency } from '../../../utils/currencyUtils';
import React, { useState } from 'react';
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
import printContent from '../../../utils/printUtil';

import { useSettings } from "@/context/SettingsContext";

const GuestFolio = () => {
  const { folios, settleFolio, addToFolio } = useHospitality();
  const { settings } = useSettings();
  const [selectedFolio, setSelectedFolio] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Open');

  const filteredFolios = folios.filter(f => {
    const matchesSearch = f.guestName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          f.roomName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'All' || f.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const stats = [
    { label: 'Unpaid Folios', value: folios.filter(f => f.status === 'Open').length, icon: Wallet, color: 'text-primary', bg: 'bg-rose-50' },
    { label: 'Total Outstanding', value: `${formatCurrency(folios.filter(f => f.status === 'Open').reduce((acc, curr) => acc + curr.total, 0))}`, icon: ArrowUpRight, color: 'text-primary', bg: 'bg-indigo-50' },
    { label: 'Settled Today', value: folios.filter(f => f.status === 'Settled').length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  const handlePrintBatch = () => {
    if (filteredFolios.length === 0) {
      alert('No folios to print in the current filter (' + activeTab + ')');
      return;
    }
    printContent('print-section');
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Print Section Logic */}
      {/* Standardized Print Styles (Handled by printUtil, but kept for folio-specific layout) */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .folio-page { 
            page-break-after: always !important; 
            padding: 40px !important; 
            border-bottom: 2px dashed #eee !important; 
            margin-bottom: 40px !important; 
          }
          .folio-page:last-child { border-bottom: none !important; }
        }
      `}} />

      {/* Batch Print Template */}
      <div id="print-section" className="hidden print:block print-section">
        {filteredFolios.map((folio, idx) => (
          <div key={folio.id} className="folio-page">
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">{settings?.businessName || 'Gila House'}</h1>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">{settings?.motto || 'Premium Hospitality & Resort'}</p>
                <div className="text-[10px] font-bold text-slate-500 mt-2">
                  {settings?.address && <span>{settings.address}</span>}
                  {settings?.phone && <span className="ml-2">| {settings.phone}</span>}
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">Guest Statement</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">Invoice #{folio.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-12">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Guest Information</p>
                <p className="text-lg font-black text-slate-900 uppercase">{folio.guestName}</p>
                <p className="text-xs font-bold text-slate-500 mt-1 uppercase">Room: {folio.roomName}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Statement Details</p>
                <p className="text-sm font-black text-slate-900 uppercase">Date: {new Date().toLocaleDateString()}</p>
                <p className="text-xs font-bold text-slate-500 mt-1 uppercase">Status: {folio.status} Account</p>
              </div>
            </div>

            <table className="w-full mb-12">
              <thead>
                <tr className="border-b border-slate-900">
                  <th className="text-left py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Date</th>
                  <th className="text-left py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Description</th>
                  <th className="text-left py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Type</th>
                  <th className="text-right py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {folio.items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-4 text-[10px] font-bold text-slate-500 uppercase">{item.date}</td>
                    <td className="py-4 text-[10px] font-black text-slate-900 uppercase">{item.description}</td>
                    <td className="py-4 text-[9px] font-bold text-slate-400 uppercase">{item.type}</td>
                    <td className="py-4 text-right text-[11px] font-black text-slate-900">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-900">
                  <td colSpan="3" className="py-6 text-[10px] font-black uppercase tracking-widest text-slate-900 text-right pr-8">Grand Total (INR)</td>
                  <td className="py-6 text-right text-2xl font-black text-slate-900 tracking-tighter">{formatCurrency(folio.total)}</td>
                </tr>
              </tfoot>
            </table>

            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-50">
               <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Notes</p>
                  <p className="text-[9px] font-medium text-slate-500 leading-relaxed uppercase">Charges are inclusive of all applicable taxes. Please contact the front desk for any discrepancies.</p>
               </div>
               <div className="flex flex-col items-end justify-center text-right">
                  <div className="w-32 h-12 border-b border-slate-300 mb-2" />
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Authorized Signature</p>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Header Area */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
            <Receipt className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-text-primary uppercase tracking-wider">Guest Billing</h2>
            <p className="text-text-secondary text-sm font-bold mt-1">Manage guest folios and room charges</p>
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
          <button 
            onClick={handlePrintBatch}
            className="btn-primary h-[48px] px-6 rounded-full flex items-center gap-3 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all group"
          >
             <Printer className="w-4 h-4 group-hover:animate-bounce" />
             Print Batch
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 print:hidden">
         {stats.map((stat, i) => (
           <div key={i} className="card bg-surface border-none shadow-xl shadow-slate-100/50 p-5 flex items-center gap-4 rounded-[2rem]">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
                 <stat.icon className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                 <h3 className="text-xl font-black text-text-primary mt-0.5">{stat.value}</h3>
              </div>
           </div>
         ))}
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-hidden print:hidden">
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
              {tab}
            </button>
          ))}
        </div>

        {/* Folios List */}
        <div className="flex-1 overflow-hidden lg:card bg-transparent lg:bg-surface border-none lg:shadow-xl lg:shadow-slate-100/50 lg:rounded-[2.5rem]">
           <div className="h-full overflow-y-auto scrollbar-hide">
              {/* Desktop Table View */}
              <table className="w-full border-collapse hidden lg:table">
                 <thead>
                    <tr className="text-left bg-slate-50/50 border-b border-slate-100">
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Guest / Room</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Items</th>
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
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Room {folio.roomName} • {folio.id}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-5 text-sm font-black text-text-primary">
                            {folio.items.length} Charges
                         </td>
                         <td className="px-8 py-5">
                            <span className="text-lg font-black text-primary tracking-tighter">{formatCurrency(folio.total)}</span>
                         </td>
                         <td className="px-8 py-5">
                            <span className={cn(
                              "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                              folio.status === 'Open' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            )}>
                               {folio.status} Account
                            </span>
                         </td>
                         <td className="px-8 py-5 text-right">
                            <button 
                              className="p-2.5 bg-surface border border-slate-100 rounded-xl text-slate-300 hover:text-primary hover:border-primary transition-all shadow-sm"
                            >
                               <ChevronRight className="w-4 h-4" />
                            </button>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4 pb-20">
                {filteredFolios.map((folio) => (
                  <div 
                    key={folio.id} 
                    onClick={() => setSelectedFolio(folio)}
                    className="card bg-surface p-5 rounded-[2rem] shadow-lg shadow-slate-200/40 border-none space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-text-primary">
                          <Bed className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-text-primary uppercase tracking-tight">{folio.guestName}</p>
                          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-0.5">Room {folio.roomName}</p>
                        </div>
                      </div>
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                        folio.status === 'Open' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      )}>
                         {folio.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-y border-slate-50">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{folio.items.length} Charges</span>
                       <span className="text-lg font-black text-primary tracking-tighter">{formatCurrency(folio.total)}</span>
                    </div>

                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                       <span>{folio.id}</span>
                       <ChevronRight className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedFolio && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 print:hidden">
          <div onClick={() => setSelectedFolio(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-2xl bg-surface rounded-[2rem] lg:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in slide-in-from-bottom-10 duration-300">
            <div className="p-6 lg:p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 lg:w-14 h-12 lg:h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
                   <Receipt className="w-6 lg:w-7 h-6 lg:h-7" />
                </div>
                <div>
                  <h3 className="text-xl lg:text-2xl font-black text-text-primary uppercase tracking-tight">{selectedFolio.guestName}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Room {selectedFolio.roomName} • {selectedFolio.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 lg:gap-3">
                 <button 
                  onClick={() => printContent('single-folio-print')}
                  className="p-2 lg:p-3 hover:bg-surface rounded-2xl transition-all text-slate-400 hover:text-primary"
                 >
                    <Printer className="w-5 h-5" />
                 </button>
                 <button onClick={() => setSelectedFolio(null)} className="p-2 lg:p-3 hover:bg-surface rounded-2xl transition-all text-slate-400"><X className="w-6 h-6" /></button>
              </div>
            </div>
            
            <div className="p-6 lg:p-8 flex flex-col gap-6 lg:gap-8 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                 <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Transactions</p>
                 </div>
                 {selectedFolio.items.map((item) => (
                   <div key={item.id} className="flex items-center justify-between p-4 lg:p-5 bg-slate-50 rounded-2xl group hover:bg-primary/5 transition-all">
                      <div className="flex items-center gap-4">
                         <div className={cn(
                           "w-9 lg:w-10 h-9 lg:h-10 rounded-xl flex items-center justify-center",
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

              <div className="pt-6 border-t border-slate-100 space-y-6 shrink-0">
                 <div className="flex justify-between items-end px-2 sm:px-4">
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                       <span className={cn(
                         "px-3 lg:px-4 py-1.5 rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest border",
                         selectedFolio.status === 'Open' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                       )}>
                          {selectedFolio.status} Account
                       </span>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Outstanding</p>
                       <p className="text-3xl lg:text-4xl font-black text-primary tracking-tighter">{formatCurrency(selectedFolio.total)}</p>
                    </div>
                 </div>

                 {selectedFolio.status === 'Open' ? (
                   <div className="flex flex-col sm:flex-row gap-3">
                     <button 
                       onClick={() => {
                         const amount = prompt('Add custom charge amount (Rp):');
                         if (amount && !isNaN(amount)) {
                           const desc = prompt('Description:');
                           if(desc) addToFolio(selectedFolio.guestName, { description: desc, amount: parseFloat(amount), date: new Date().toLocaleDateString(), type: 'Misc' });
                         }
                       }}
                       className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                     >
                       Post Charge
                     </button>
                     <button 
                       onClick={() => { settleFolio(selectedFolio.id); setSelectedFolio(null); }}
                       className="flex-[2] py-4 lg:py-5 bg-primary text-white rounded-2xl lg:rounded-3xl font-black uppercase tracking-widest text-[10px] lg:text-xs shadow-2xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3"
                     >
                       <CreditCard className="w-5 h-5" /> Settle & Close
                     </button>
                   </div>
                 ) : (
                   <button 
                     className="w-full py-4 lg:py-5 bg-emerald-500 text-white rounded-2xl lg:rounded-3xl font-black uppercase tracking-widest text-[10px] lg:text-xs shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                   >
                     <CheckCircle2 className="w-5 h-5" /> Payment Received
                   </button>
                 )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Single Folio Print Template (Visible only for printing the selected folio) */}
      {selectedFolio && (
        <div id="single-folio-print" className="hidden print:block printable-area">
           <div className="folio-page p-10">
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
                <div>
                  <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">{settings?.businessName || 'Gila House'}</h1>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">{settings?.motto || 'Premium Hospitality & Resort'}</p>
                  <div className="text-[10px] font-bold text-slate-500 mt-2">
                    {settings?.address && <span>{settings.address}</span>}
                    {settings?.phone && <span className="ml-2">| {settings.phone}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">Guest Statement</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">Invoice #{selectedFolio.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-12 mb-12">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Guest Information</p>
                  <p className="text-lg font-black text-slate-900 uppercase">{selectedFolio.guestName}</p>
                  <p className="text-xs font-bold text-slate-500 mt-1 uppercase">Room: {selectedFolio.roomName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Statement Details</p>
                  <p className="text-sm font-black text-slate-900 uppercase">Date: {new Date().toLocaleDateString()}</p>
                  <p className="text-xs font-bold text-slate-500 mt-1 uppercase">Status: {selectedFolio.status} Account</p>
                </div>
              </div>

              <table className="w-full mb-12">
                <thead>
                  <tr className="border-b border-slate-900">
                    <th className="text-left py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Date</th>
                    <th className="text-left py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Description</th>
                    <th className="text-left py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Type</th>
                    <th className="text-right py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedFolio.items.map((item, i) => (
                    <tr key={i}>
                      <td className="py-4 text-[10px] font-bold text-slate-500 uppercase">{item.date}</td>
                      <td className="py-4 text-[10px] font-black text-slate-900 uppercase">{item.description}</td>
                      <td className="py-4 text-[9px] font-bold text-slate-400 uppercase">{item.type}</td>
                      <td className="py-4 text-right text-[11px] font-black text-slate-900">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-900">
                    <td colSpan="3" className="py-6 text-[10px] font-black uppercase tracking-widest text-slate-900 text-right pr-8">Grand Total (INR)</td>
                    <td className="py-6 text-right text-2xl font-black text-slate-900 tracking-tighter">{formatCurrency(selectedFolio.total)}</td>
                  </tr>
                </tfoot>
              </table>

              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-50">
                 <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Notes</p>
                    <p className="text-[9px] font-medium text-slate-500 leading-relaxed uppercase">Charges are inclusive of all applicable taxes. Please contact the front desk for any discrepancies.</p>
                 </div>
                 <div className="flex flex-col items-end justify-center text-right">
                    <div className="w-32 h-12 border-b border-slate-300 mb-2" />
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Authorized Signature</p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default GuestFolio;
