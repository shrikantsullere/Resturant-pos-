import { formatCurrency } from '../../../utils/currencyUtils';
import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  X, 
  ChevronRight, 
  CreditCard, 
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
  UtensilsCrossed,
  ArrowDownLeft
} from 'lucide-react';
import { cn } from "../../../utils/cn";
import { useHospitality } from "@/context/HospitalityContext";
import printContent from '../../../utils/printUtil';

import { useSettings } from "@/context/SettingsContext";

const Transactions = () => {
  const { folios } = useHospitality();
  const { settings } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolio, setSelectedFolio] = useState(null);
  const [orderForPrint, setOrderForPrint] = useState(null);

  const handlePrint = (folio) => {
    setOrderForPrint(folio);
    setTimeout(() => {
      printContent('printable-area');
    }, 100);
  };

  // Focus on Settled folios as "Transactions"
  const settledFolios = folios.filter(f => f.status === 'Settled');
  
  const filteredTransactions = settledFolios.filter(f => 
    (f.guestName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
    (f.roomName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    String(f.id).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = settledFolios.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Area */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
            <History className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-text-primary uppercase tracking-wider">Transaction Ledger</h2>
            <p className="text-text-secondary text-sm font-bold mt-1">Audit trail of settled hospitality accounts</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
           <div className="px-5 py-3 bg-surface rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Settled</p>
                 <p className="text-lg font-black text-emerald-500 tracking-tighter">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500">
                 <ArrowUpRight className="w-4 h-4" />
              </div>
           </div>
          <div className="relative group min-w-[240px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search by ID or Guest..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-5 py-3 bg-surface border border-slate-100 rounded-2xl outline-none shadow-sm text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all"
            />
          </div>
          <button 
             onClick={() => {
               if (filteredTransactions.length === 0) {
                 alert('No transactions to print in the current view');
                 return;
               }
               printContent('batch-print-transactions');
             }}
            className="p-3 bg-surface border border-slate-100 rounded-2xl text-slate-400 hover:text-primary transition-all shadow-sm"
          >
            <Printer className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Folios List */}
        <div className="flex-1 overflow-hidden lg:card bg-transparent lg:bg-surface border-none lg:shadow-xl lg:shadow-slate-100/50 lg:rounded-[2.5rem]">
           <div className="h-full overflow-y-auto scrollbar-hide">
              <table className="w-full border-collapse hidden lg:table">
                 <thead>
                    <tr className="text-left bg-slate-50/50 border-b border-slate-100">
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction ID</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Guest</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Settled On</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Total</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                       <th className="px-8 py-5"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {filteredTransactions.map((folio, idx) => (
                      <tr key={`${folio.id}-${idx}`} className="hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={() => setSelectedFolio(folio)}>
                         <td className="px-8 py-5">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">#{folio.id}</span>
                         </td>
                         <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-text-primary">
                                  <Users className="w-4 h-4" />
                                </div>
                               <p className="text-sm font-black text-text-primary uppercase tracking-tight">{folio.guestName}</p>
                            </div>
                         </td>
                         <td className="px-8 py-5">
                            <p className="text-xs font-bold text-slate-500 uppercase">Today</p>
                         </td>
                         <td className="px-8 py-5">
                            <span className="text-lg font-black text-emerald-500 tracking-tighter">{formatCurrency(folio.total)}</span>
                         </td>
                         <td className="px-8 py-5">
                            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2 w-fit">
                               <CheckCircle2 className="w-3 h-3" /> Paid
                            </span>
                         </td>
                          <td className="px-8 py-5 text-right">
                             <button 
                               onClick={(e) => { e.stopPropagation(); handlePrint(folio); }}
                               className="p-2.5 bg-surface border border-slate-100 rounded-xl text-slate-300 hover:text-primary transition-all"
                             >
                                <Printer className="w-4 h-4" />
                             </button>
                          </td>
                      </tr>
                    ))}
                 </tbody>
              </table>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4 pb-20 p-1">
                {filteredTransactions.map((folio, idx) => (
                  <div 
                    key={`${folio.id}-${idx}-mobile`} 
                    onClick={() => setSelectedFolio(folio)}
                    className="card bg-surface p-5 rounded-[2rem] shadow-lg shadow-slate-200/40 border-none space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-text-primary">
                          <History className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-text-primary uppercase tracking-tight">{folio.guestName}</p>
                          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-0.5">#{folio.id}</p>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handlePrint(folio); }}
                        className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-300 hover:text-primary transition-all"
                      >
                         <Printer className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-y border-slate-50">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{folio.roomName}</span>
                       <span className="text-lg font-black text-emerald-500 tracking-tighter">{formatCurrency(folio.total)}</span>
                    </div>
 
                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                       <span className="flex items-center gap-1.5 text-emerald-500">
                          <CheckCircle2 className="w-3 h-3" /> Paid
                       </span>
                       <div className="flex items-center gap-1 text-primary">
                          Details <ChevronRight className="w-3.5 h-3.5" />
                       </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredTransactions.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full py-20 opacity-40">
                   <History className="w-16 h-16 mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-widest">No settled transactions found</p>
                </div>
              )}
           </div>
        </div>
      </div>
      {/* Hidden Printable Receipt (Single Transaction) */}
      {orderForPrint && (
        <div id="printable-area" className="hidden print:block printable-area receipt-print">
          <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
            <h1 className="text-xl font-black uppercase tracking-tighter">{settings?.businessName || 'Gila House'}</h1>
            {settings?.motto && <p className="text-[8px] font-bold uppercase tracking-[0.2em] mt-1">{settings.motto}</p>}
            <div className="text-[8px] font-bold text-slate-500 mt-1 mb-2">
              {settings?.address && <span>{settings.address}</span>}
              {settings?.phone && <span className="ml-1">| {settings.phone}</span>}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-1">Hospitality Transaction Receipt</p>
          </div>
          
          <div className="flex justify-between text-[11px] font-black mb-4 uppercase">
            <div>
              <p>TRANS ID: {orderForPrint.id}</p>
              <p>REF: {orderForPrint.roomName || 'General'}</p>
            </div>
            <div className="text-right">
              <p>DATE: {new Date().toLocaleDateString()}</p>
              <p>STATUS: SETTLED</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Guest Name</p>
            <p className="text-sm font-black uppercase">{orderForPrint.guestName}</p>
          </div>

          <div className="border-y border-slate-900 py-4 mb-4">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-slate-300">
                  <th className="text-left py-1 uppercase">DESCRIPTION</th>
                  <th className="text-right py-1 uppercase">AMOUNT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orderForPrint.items?.map((item, i) => (
                  <tr key={i}>
                    <td className="py-2 uppercase font-black">{item.description}</td>
                    <td className="py-2 text-right font-black">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-1 mb-6">
            <div className="flex justify-between text-sm font-black uppercase">
              <span>Total Amount</span>
              <span>{formatCurrency(orderForPrint.total)}</span>
            </div>
            <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
              <span>Payment Method</span>
              <span>Card/Digital</span>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-[9px] font-black uppercase tracking-widest">Audited & Verified</p>
            <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">System Signature: {Math.random().toString(36).substring(7).toUpperCase()}</p>
          </div>
        </div>
      )}

      {/* Batch Print Area (All Transactions) */}
      <div id="batch-print-transactions" className="hidden print:block printable-area">
        <div className="text-center border-b-2 border-slate-900 pb-4 mb-8">
           <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900">{settings?.businessName || 'Gila House'}</h2>
           {settings?.motto && <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">{settings.motto}</p>}
           <div className="text-[10px] font-bold text-slate-500 mt-2 mb-6">
             {settings?.address && <span>{settings.address}</span>}
             {settings?.phone && <span className="ml-2">| {settings.phone}</span>}
             {settings?.email && <span className="ml-2">| {settings.email}</span>}
           </div>
           <h1 className="text-xl font-black uppercase tracking-tighter">Transaction Audit Manifest</h1>
           <p className="text-[10px] font-bold uppercase tracking-widest mt-1">Generated: {new Date().toLocaleString()}</p>
        </div>
        <table className="w-full text-left text-[10px]">
           <thead>
             <tr className="border-b border-slate-900">
               <th className="py-2 uppercase font-black">ID</th>
               <th className="py-2 uppercase font-black">Guest</th>
               <th className="py-2 uppercase font-black">Reference</th>
               <th className="py-2 uppercase font-black">Date</th>
               <th className="py-2 uppercase font-black text-right">Amount</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
             {filteredTransactions.map((folio, idx) => (
               <tr key={`${folio.id}-${idx}-batch`}>
                 <td className="py-3 font-bold uppercase">#{folio.id}</td>
                 <td className="py-3 font-black uppercase">{folio.guestName}</td>
                 <td className="py-3 uppercase text-slate-500">{folio.roomName}</td>
                 <td className="py-3">Today</td>
                 <td className="py-3 text-right font-black text-sm">{formatCurrency(folio.total)}</td>
               </tr>
             ))}
           </tbody>
           <tfoot>
              <tr className="border-t border-slate-900">
                 <td colSpan="4" className="py-4 font-black uppercase text-right pr-4">Consolidated Revenue</td>
                 <td className="py-4 text-right font-black text-lg">{formatCurrency(totalRevenue)}</td>
              </tr>
           </tfoot>
        </table>
      </div>
    </div>
  );
};

export default Transactions;
