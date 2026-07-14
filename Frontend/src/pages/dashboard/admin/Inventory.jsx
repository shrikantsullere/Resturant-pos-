import { formatCurrency } from '../../../utils/currencyUtils';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Package, 
  Search, 
  Plus, 
  X, 
  TrendingUp,
  Trash2,
  Printer
} from 'lucide-react';
import { cn } from "../../../utils/cn";
import { useHospitality } from "@/context/HospitalityContext";
import printContent from "../../../utils/printUtil";

const Inventory = () => {
  const { inventory, addInventoryItem, updateStock, deleteInventoryItem } = useHospitality();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const categories = ['All', 'Kitchen', 'Bar', 'Rooms', 'Maintenance'];

  const filteredInventory = inventory.map(item => {
    const stock = parseFloat(item.current_stock);
    const threshold = parseFloat(item.threshold);
    let status = 'In Stock';
    if (stock <= 0) status = 'Out of Stock';
    else if (stock <= threshold) status = 'Low Stock';

    return {
      ...item,
      id: item.id.toString(),
      name: item.product_name,
      stock: stock,
      minStock: threshold,
      price: parseFloat(item.unit_price),
      status: status
    };
  }).filter(item => {
    const matchesTab = activeTab === 'All' || item.category?.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch = (item.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                          String(item.id).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Stock': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Low Stock': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Out of Stock': return 'bg-rose-50 text-primary border-rose-100';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
            <Package className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-text-primary uppercase tracking-wider">Stock <span className="text-primary">Control</span></h2>
            <p className="text-text-secondary text-sm font-bold mt-1">Manage hospitality & POS inventory</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group min-w-[240px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search items..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-5 py-3 bg-surface border border-slate-100 rounded-2xl outline-none shadow-sm text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all"
            />
          </div>
          <button 
             onClick={() => printContent('printable-area')}
            className="p-3 bg-surface border border-slate-100 rounded-2xl text-slate-400 hover:text-primary transition-all shadow-sm"
          >
            <Printer className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary h-[48px] px-6 rounded-full flex items-center gap-3 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all"
          >
             <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1 shrink-0">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={cn(
                "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 whitespace-nowrap transition-all",
                activeTab === cat 
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/10" 
                : "bg-surface text-text-secondary border-transparent hover:bg-slate-50 shadow-sm"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Inventory List */}
        <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide">
           {filteredInventory.length === 0 ? (
             <div className="h-64 flex flex-col items-center justify-center text-center opacity-40">
                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-4">
                   <Package className="w-10 h-10 text-slate-200" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest">No inventory items found</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
                {filteredInventory.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="card p-6 bg-surface border-none shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:shadow-slate-200 transition-all cursor-pointer group relative overflow-hidden"
                  >
                     <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:bg-primary group-hover:text-white transition-all">
                           {item.category?.toLowerCase() === 'kitchen' ? '🍳' : 
                            item.category?.toLowerCase() === 'bar' ? '🍷' : 
                            item.category?.toLowerCase() === 'rooms' ? '🛏️' : '🔧'}
                        </div>
                        <span className={cn(
                          "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border shadow-sm",
                          getStatusColor(item.status)
                        )}>
                           {item.status}
                        </span>
                     </div>

                     <div className="relative z-10">
                        <h4 className="text-lg font-black text-text-primary uppercase tracking-tight mb-1 group-hover:text-primary transition-colors">{item.name}</h4>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.id} • {item.category}</p>
                     </div>

                     <div className="grid grid-cols-2 gap-4 my-6 relative z-10">
                        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Current Stock</p>
                           <p className="text-xl font-black text-text-primary tracking-tighter">{item.stock} <span className="text-[10px] font-bold text-slate-300 ml-1">{item.unit}</span></p>
                        </div>
                        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Min. Threshold</p>
                           <p className="text-xl font-black text-slate-300 tracking-tighter">{item.minStock} <span className="text-[10px] font-bold text-slate-200 ml-1">{item.unit}</span></p>
                        </div>
                     </div>

                     <div className="pt-6 border-t border-slate-50 flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-2">
                           <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                           <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Rate: +12%</span>
                        </div>
                        <p className="text-sm font-black text-primary">{formatCurrency(item.price)}</p>
                     </div>

                     <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:scale-150 transition-all duration-700" />
                  </div>
                ))}
             </div>
           )}
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <InventoryModal 
          onClose={() => setShowAddModal(false)}
          onSave={addInventoryItem}
          categories={categories.filter(c => c !== 'All')}
        />
      )}

      {/* Stock Update Modal */}
      {selectedItem && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
           <div onClick={() => setSelectedItem(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
           <div className="relative w-full max-w-[95%] md:max-w-md bg-surface rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] self-center animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="p-5 md:p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 shrink-0">
                 <div className="flex items-center gap-4">
                    <div className="w-12 md:w-14 h-12 md:h-14 bg-primary rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl shadow-primary/20 shrink-0">
                       <Package className="w-6 md:w-7 h-6 md:h-7" />
                    </div>
                    <div>
                       <h3 className="text-lg md:text-xl font-black text-text-primary uppercase tracking-tight truncate max-w-[150px] sm:max-w-none">{selectedItem.name}</h3>
                       <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">ID: {selectedItem.id}</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-surface rounded-2xl shadow-sm border border-transparent hover:border-slate-100 transition-all"><X className="w-5 h-5 md:w-6 md:h-6 text-slate-400" /></button>
              </div>

              <div className="p-6 md:p-8 space-y-6 text-center overflow-y-auto scrollbar-hide">
                 <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Inventory</p>
                    <div className="flex items-baseline justify-center gap-2">
                       <h4 className="text-4xl md:text-5xl font-black text-text-primary tracking-tighter">{selectedItem.stock}</h4>
                       <span className="text-lg md:text-xl font-black text-slate-300 uppercase tracking-tight">{selectedItem.unit}</span>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => { updateStock(selectedItem.id, 10); setSelectedItem(null); }}
                      className="group p-5 md:p-6 bg-emerald-50 hover:bg-emerald-500 rounded-2xl md:rounded-3xl border border-emerald-100 transition-all text-center flex flex-col items-center gap-3"
                    >
                       <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-all shadow-sm">
                          <Plus className="w-5 h-5" />
                       </div>
                       <p className="text-[10px] font-black text-emerald-700 group-hover:text-white uppercase tracking-widest">Add +10</p>
                    </button>
                    <button 
                      onClick={() => { updateStock(selectedItem.id, -10); setSelectedItem(null); }}
                      className="group p-5 md:p-6 bg-rose-50 hover:bg-primary rounded-2xl md:rounded-3xl border border-rose-100 transition-all text-center flex flex-col items-center gap-3"
                    >
                       <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-all shadow-sm">
                          <Trash2 className="w-5 h-5" />
                       </div>
                       <p className="text-[10px] font-black text-rose-700 group-hover:text-white uppercase tracking-widest">Remove -10</p>
                    </button>
                 </div>
              </div>

              <div className="p-4 md:p-6 border-t border-slate-50 grid grid-cols-2 gap-3 bg-surface shrink-0 relative z-20">
                 <button 
                   onClick={() => { deleteInventoryItem(selectedItem.id); setSelectedItem(null); }}
                   className="w-full py-3.5 bg-surface border-2 border-slate-100 text-primary rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-50 transition-all active:scale-95 text-center"
                 >
                    Delete Product
                 </button>
                 <button onClick={() => setSelectedItem(null)} className="w-full py-3.5 bg-slate-50 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all text-center">Close</button>
              </div>
           </div>
        </div>,
        document.body
      )}

      {/* Hidden Printable Inventory */}
      <div id="printable-area" className="hidden print:block printable-area">
        <div className="text-center border-b-2 border-slate-900 pb-4 mb-8">
           <h1 className="text-2xl font-black uppercase tracking-tighter">Stock Inventory Report</h1>
           <p className="text-[10px] font-bold uppercase tracking-widest mt-1">Generated: {new Date().toLocaleString()}</p>
        </div>
        <table className="w-full text-left text-[10px]">
           <thead>
             <tr className="border-b border-slate-900">
               <th className="py-2 uppercase font-black">Item ID</th>
               <th className="py-2 uppercase font-black">Product Name</th>
               <th className="py-2 uppercase font-black">Category</th>
               <th className="py-2 uppercase font-black">Stock</th>
               <th className="py-2 uppercase font-black">Unit</th>
               <th className="py-2 uppercase font-black text-right">Valuation</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
             {filteredInventory.map(item => (
               <tr key={item.id}>
                 <td className="py-2 font-bold uppercase">{item.id}</td>
                 <td className="py-2 font-black uppercase">{item.name}</td>
                 <td className="py-2 uppercase text-slate-500">{item.category}</td>
                 <td className="py-2 font-black">{item.stock}</td>
                 <td className="py-2 uppercase">{item.unit}</td>
                 <td className="py-2 text-right font-black">{formatCurrency(item.price)}</td>
               </tr>
             ))}
           </tbody>
           <tfoot>
              <tr className="border-t border-slate-900">
                 <td colSpan="5" className="py-4 font-black uppercase text-right pr-4">Total Inventory Value</td>
                 <td className="py-4 text-right font-black text-sm">{formatCurrency(filteredInventory.reduce((acc, curr) => acc + curr.price, 0))}</td>
              </tr>
           </tfoot>
        </table>
      </div>
    </div>
  );
};

const InventoryModal = ({ onClose, onSave, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Kitchen',
    stock: 0,
    unit: 'pcs',
    minStock: 10,
    price: 0
  });

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
       <div onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
       <div className="relative w-full max-w-[95%] md:max-w-xl bg-surface rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] self-center animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="px-5 py-4 md:px-8 md:py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/20 shrink-0">
             <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-primary rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-xl shrink-0">
                   <Package className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                   <h3 className="text-lg md:text-xl font-black uppercase tracking-tight leading-none">Onboard Product</h3>
                   <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 md:mt-1">Hospitality asset registration</p>
                </div>
             </div>
             <button onClick={onClose} className="p-2 md:p-2.5 hover:bg-surface rounded-xl border border-transparent hover:border-slate-100 shadow-sm group">
                <X className="w-5 h-5 text-slate-400" />
             </button>
          </div>
          
          <form 
            onSubmit={(e) => { 
              e.preventDefault(); 
              onSave({ ...formData, category: formData.category.toLowerCase() }); 
              onClose(); 
            }} 
            className="flex-1 overflow-y-auto"
          >
             <div className="p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Name</label>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g. Arabica Coffee"
                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-sm transition-all" 
                        required 
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm appearance-none focus:border-primary/20 transition-all"
                      >
                         {categories.map(c => <option key={c}>{c}</option>)}
                      </select>
                   </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 md:gap-6">
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Stock</label>
                      <input 
                        type="number" 
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-sm transition-all" 
                        required 
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit</label>
                      <input 
                        type="text" 
                        value={formData.unit}
                        onChange={(e) => setFormData({...formData, unit: e.target.value})}
                        placeholder="kg/pcs/ltr"
                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-sm transition-all" 
                        required 
                      />
                   </div>
                   <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Threshold</label>
                      <input 
                        type="number" 
                        value={formData.minStock}
                        onChange={(e) => setFormData({...formData, minStock: parseInt(e.target.value)})}
                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-sm transition-all" 
                        required 
                      />
                   </div>
                </div>

                <div className="space-y-1.5">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit Price (Rp)</label>
                   <input 
                     type="number" 
                     value={formData.price}
                     onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
                     className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-sm transition-all" 
                     required 
                   />
                </div>
             </div>

             <div className="p-4 md:p-6 border-t border-slate-50 grid grid-cols-2 gap-3 shrink-0 bg-surface">
                <button type="button" onClick={onClose} className="w-full py-3.5 border-2 border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all text-center">Cancel</button>
                <button type="submit" className="w-full btn-primary py-3.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all text-center">Add Stock</button>
             </div>
          </form>
       </div>
    </div>,
    document.body
  );
};

export default Inventory;
