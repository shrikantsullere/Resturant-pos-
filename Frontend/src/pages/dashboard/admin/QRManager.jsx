import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Search, 
  Filter, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink,
  Printer,
  Table2,
  Bed,
  MoreVertical,
  Plus,
  RefreshCw,
  Sparkles,
  Smartphone,
  Eye,
  Settings
} from 'lucide-react';
import { cn } from "../../../utils/cn";
import { useHospitality } from "../../../context/HospitalityContext";
import printContent from "../../../utils/printUtil";

const QRManager = () => {
  const { rooms, tables } = useHospitality();
  const [activeTab, setActiveTab] = useState('Tables');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isChangingScanner, setIsChangingScanner] = useState(null);
  const [customQrs, setCustomQrs] = useState({});
  const fileInputRef = React.useRef(null);

  const filteredItems = (activeTab === 'Tables' ? tables : rooms).filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getQRUrl = (item) => {
    if (!item) return '';
    const baseUrl = window.location.origin;
    const param = activeTab === 'Tables' ? `table=${item.name}` : `room=${item.name}`;
    return `${baseUrl}/customer?${param}`;
  };

  const getQRImage = (item) => {
    if (!item) return '';
    if (customQrs[item.id]) return customQrs[item.id];
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(getQRUrl(item))}`;
  };

  const handleFileUpload = (e, itemId) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomQrs(prev => ({ ...prev, [itemId]: reader.result }));
        setIsChangingScanner(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrint = () => {
    printContent('premium-print-template');
  };

  const handleShare = async (item) => {
    const url = getQRUrl(item);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Smart QR - ${item.name}`,
          text: `Scan this QR to start your experience at ${item.name}`,
          url: url,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      handleCopy(url);
      alert('Link copied to clipboard! Share it with your guest.');
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">

      {/* Premium Print Template (Hidden from UI, visible only in Print) */}
      <div id="premium-print-template" className="hidden">
         <div className="qr-label-print">
            <div className="space-y-3">
               <div className="w-16 h-1 bg-slate-900 mx-auto" />
               <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">THE LUXE GRANDE</h1>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Smart Concierge</p>
            </div>

            <div className="flex flex-col items-center gap-8">
               <div className="qr-image-container">
                  <img 
                    src={getQRImage(selectedItem || {name: 'DEFAULT'})} 
                    alt="QR Code" 
                    className="qr-image" 
                  />
               </div>
               <div className="space-y-2">
                  <div className="scan-badge">Scan Me</div>
                  <h2 className="text-6xl font-black text-slate-900 uppercase tracking-tighter">{selectedItem?.name}</h2>
               </div>
            </div>

            <div className="space-y-6 w-full">
               <p className="text-[14px] font-bold leading-relaxed text-slate-600 px-4">
                  Access our digital services, room service, <br/> 
                  and instant messaging directly from your device.
               </p>
               <div className="pt-6 border-t border-slate-100 flex justify-between items-center px-4">
                  <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">V.2026.05</p>
                  <p className="text-[8px] font-black text-slate-900 uppercase tracking-widest italic font-serif">Enjoy Your Stay</p>
               </div>
            </div>
         </div>
      </div>



      {/* Header Area */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0 no-print">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
            <QrCode className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-text-primary uppercase tracking-wider">QR <span className="text-primary">Manager</span></h2>
            <p className="text-text-secondary text-sm font-bold mt-1">Generate smart experience links for guests</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group min-w-[240px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder={`Search ${activeTab.toLowerCase()}...`} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-5 py-3 bg-surface border border-slate-100 rounded-2xl outline-none shadow-sm text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all"
            />
          </div>
          <button 
            onClick={handlePrint}
            className="btn-primary h-[48px] px-6 rounded-full flex items-center gap-3 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all"
          >
             <Printer className="w-4 h-4" /> Print All QR
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-hidden no-print">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1 shrink-0">
          {['Tables', 'Rooms'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 whitespace-nowrap transition-all",
                activeTab === tab 
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/10" 
                : "bg-surface text-text-secondary border-transparent hover:bg-slate-50 shadow-sm"
              )}
            >
              <div className="flex items-center gap-2">
                 {tab === 'Tables' ? <Table2 className="w-4 h-4" /> : <Bed className="w-4 h-4" />}
                 {tab}
              </div>
            </button>
          ))}
        </div>

        {/* Grid Area */}
        <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
             {filteredItems.map((item) => (
               <div 
                 key={item.id} 
                 onClick={() => setSelectedItem(item)}
                 className={cn(
                   "card bg-surface border-2 p-5 group cursor-pointer hover:shadow-2xl hover:shadow-slate-200 transition-all active:scale-95",
                   selectedItem?.id === item.id ? "border-primary shadow-2xl shadow-primary/5" : "border-transparent"
                 )}
               >
                  <div className="flex justify-between items-start mb-6">
                     <div className={cn(
                       "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner",
                       activeTab === 'Tables' ? "bg-amber-50 text-amber-600" : "bg-indigo-50 text-primary"
                     )}>
                        {activeTab === 'Tables' ? <Table2 className="w-6 h-6" /> : <Bed className="w-6 h-6" />}
                     </div>
                     <button className="p-2 text-slate-300 hover:text-primary transition-all"><MoreVertical className="w-4 h-4" /></button>
                  </div>

                  <div className="mb-6">
                     <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">{item.name}</h3>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        {activeTab === 'Tables' ? `${item.capacity} Seater` : item.type} • {item.status}
                     </p>
                  </div>

                  <div className="relative aspect-square bg-slate-50 rounded-2xl flex flex-col items-center justify-center gap-3 group-hover:bg-slate-100 transition-all border border-slate-100/50 overflow-hidden">
                     <img 
                       src={getQRImage(item)} 
                       alt="QR Code" 
                       className="w-16 h-16 group-hover:scale-110 transition-all duration-500" 
                     />
                     <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Scan for Guest Experience</p>
                  </div>

                  <div className="mt-6 flex flex-col gap-2">
                     <button 
                       onClick={(e) => { e.stopPropagation(); setIsChangingScanner(item); }}
                       className="w-full py-3 bg-primary/5 hover:bg-primary/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-primary transition-all flex items-center justify-center gap-2 border border-primary/10"
                     >
                        <RefreshCw className="w-3.5 h-3.5" /> Change Scanner
                     </button>
                     <div className="flex items-center gap-2">
                        <button className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-600 transition-all flex items-center justify-center gap-2">
                           <Download className="w-3 h-3" /> PNG
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleCopy(getQRUrl(item)); }}
                          className="w-11 h-11 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 transition-all"
                        >
                           <Copy className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <div onClick={() => setSelectedItem(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm no-print" />
          <div id="qr-printable-area" className="relative w-full max-w-lg bg-surface rounded-[2.5rem] lg:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300">
            <div className="p-6 lg:p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 lg:w-14 h-12 lg:h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20 shrink-0">
                   <QrCode className="w-6 lg:w-7 h-6 lg:h-7" />
                </div>
                <div>
                  <h3 className="text-xl lg:text-2xl font-black text-text-primary uppercase tracking-tight">{selectedItem.name}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Smart Experience Package</p>
                </div>
              </div>
              <button onClick={() => setSelectedItem(null)} className="p-2 lg:p-3 hover:bg-surface rounded-2xl transition-all text-slate-400 hover:text-primary no-print"><Plus className="w-5 lg:w-6 h-5 lg:h-6 rotate-45" /></button>
            </div>
            
            <div className="p-6 lg:p-10 flex flex-col items-center gap-6 lg:gap-8 text-center overflow-y-auto scrollbar-hide">
               <div className="p-4 lg:p-6 bg-surface border-2 border-slate-50 rounded-[2rem] lg:rounded-[2.5rem] shadow-2xl shadow-slate-200/50 group relative shrink-0">
                  <div className="absolute inset-0 bg-primary/5 rounded-[2rem] lg:rounded-[2.5rem] scale-105 blur-2xl opacity-0 group-hover:opacity-100 transition-all no-print" />
                  <img 
                    src={getQRImage(selectedItem)} 
                    alt="QR Code" 
                    className="w-32 lg:w-48 h-32 lg:h-48 relative z-10 mx-auto" 
                  />
                  <div className="mt-4 lg:mt-6 flex items-center justify-center gap-3 text-primary relative z-10">
                     <Sparkles className="w-4 h-4 animate-pulse no-print" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Dynamic Smart QR</span>
                  </div>
               </div>

              <div className="w-full space-y-4">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0 no-print">
                    <button 
                      onClick={handlePrint}
                      className="py-3.5 lg:py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                       <Printer className="w-4 h-4" /> Print Label
                    </button>
                    <button 
                      onClick={() => handleShare(selectedItem)}
                      className="py-3.5 lg:py-4 bg-surface border border-slate-100 text-text-primary rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-sm hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                       <Share2 className="w-4 h-4" /> Send Link
                    </button>
                 </div>
              </div>

              <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest mb-4 no-print">
                Guests can scan this QR to automatically set their <br className="hidden sm:block" /> room/table context and start ordering or messaging.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Change Scanner Modal */}
      {isChangingScanner && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <div onClick={() => setIsChangingScanner(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-surface rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight">Manage Scanner</h3>
              </div>
              <button onClick={() => setIsChangingScanner(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                <Plus className="w-5 h-5 rotate-45 text-slate-400" />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-4 pt-4">
                <button 
                  onClick={() => {
                    const newQrs = {...customQrs};
                    delete newQrs[isChangingScanner.id];
                    setCustomQrs(newQrs);
                    setIsChangingScanner(null);
                  }}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <RefreshCw className="w-4 h-4" /> Reset to Default
                </button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-surface text-[9px] font-black text-slate-300 uppercase tracking-widest">or upload custom asset</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, isChangingScanner.id)}
                  />
                  <button 
                    onClick={() => fileInputRef.current.click()}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                     <Download className="w-4 h-4 rotate-180" /> Upload QR Image
                  </button>
                  <p className="text-[8px] font-bold text-slate-400 text-center uppercase tracking-widest">Supports PNG, JPG, or SVG</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRManager;
