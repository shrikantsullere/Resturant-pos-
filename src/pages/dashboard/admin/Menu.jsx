import { formatCurrency } from '../../../utils/currencyUtils';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  MoreVertical,
  Filter,
  Image as ImageIcon,
  ChevronRight,
  Star,
  Settings2,
  X,
  Camera,
  Layers,
  Tag,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  CookingPot,
  ArrowUpRight,
  Eye
} from 'lucide-react';
import { cn } from "../../../utils/cn";
import { getImageUrl } from "../../../utils/imageUtils";
import { useMenu } from "../../../context/MenuContext";
import api from "../../../utils/api";

const Menu = () => {
  const { items, categories: backendCategories, addItem, updateItem, deleteItem } = useMenu();
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [toast, setToast] = useState(null);

  const categories = [
    { name: 'All Items', icon: Layers },
    ...backendCategories.map(cat => ({
      name: cat.category_name,
      icon: Tag,
      id: cat.id
    }))
  ];

  // Logic Helpers
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveItem = (itemData) => {
    // Map category name to category_id
    const category = backendCategories.find(c => c.category_name === itemData.category);
    const payload = {
      item_name: itemData.name,
      description: itemData.description,
      price: itemData.price,
      category_id: category ? category.id : null,
      image: itemData.image,
      available: itemData.status,
      rating: itemData.rating,
      popular: itemData.popular
    };

    if (editingItem) {
      updateItem(editingItem.id, payload).then(res => {
        if (res.success) {
          showToast('Item updated successfully');
          setShowAddModal(false);
          setEditingItem(null);
        } else {
          showToast(res.message || 'Failed to update item', 'error');
        }
      });
    } else {
      addItem(payload).then(res => {
        if (res.success) {
          showToast('New item added to menu');
          setShowAddModal(false);
          setEditingItem(null);
        } else {
          showToast(res.message || 'Failed to add item', 'error');
        }
      });
    }
  };

  const handleDelete = (id) => {
    deleteItem(id);
    setShowDeleteConfirm(null);
    showToast('Item removed from menu', 'error');
  };

  const toggleAvailability = (id) => {
    const item = items.find(i => i.id === id);
    if (item) {
      const nextStatus = item.available === 'In Stock' ? 'Out of Stock' : 'In Stock';
      updateItem(id, { available: nextStatus });
      showToast('Availability status updated');
    }
  };

  const processedItems = items.map(item => ({
    ...item,
    name: item.item_name,
    category: item.category_name || item.category, // Handle both cases
    image: item.image || '🍽️',
    rating: item.rating || 5.0,
    status: item.status || (item.available === '1' || item.available === true ? 'In Stock' : 'Out of Stock')
  }))
    .filter(item => activeCategory === 'All Items' || item.category === activeCategory)
    .filter(item => 
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="space-y-5 flex flex-col h-full overflow-hidden relative">
      {/* Toast Feedback */}
      {toast && (
        <div 
          className={cn(
            "fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest border",
            toast.type === 'success' ? "bg-primary border-primary/20 text-white" : "bg-primary border-primary/20 text-white"
          )}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-xl lg:text-2xl font-black text-text-primary uppercase tracking-tight leading-none">Menu Catalog</h2>
          <p className="text-text-secondary mt-1 text-xs lg:text-sm font-medium">Manage dishes and availability.</p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setIsViewOnly(false); setShowAddModal(true); }}
          className="btn-primary flex items-center justify-center gap-2 py-3 lg:py-2.5 px-6 shadow-xl shadow-primary/20 text-[10px] lg:text-sm uppercase tracking-widest font-black"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add Item
        </button>
      </div>

      <div className="flex items-center gap-2 lg:gap-3 overflow-x-auto pb-2 lg:pb-4 scrollbar-hide shrink-0 -mx-1 px-1">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            className={cn(
              "px-4 lg:px-5 py-2 lg:py-2.5 rounded-xl lg:rounded-2xl text-[8px] lg:text-[9px] font-black uppercase tracking-widest flex items-center gap-2 lg:gap-2.5 border-2 whitespace-nowrap transition-all",
              activeCategory === cat.name 
                ? "bg-primary text-white border-primary shadow-xl shadow-primary/20" 
                : "bg-surface text-slate-400 border-transparent hover:border-primary/20 hover:text-primary shadow-sm"
            )}
          >
            <cat.icon className={cn("w-3.5 h-3.5 lg:w-4 lg:h-4", activeCategory === cat.name ? "text-white" : "text-slate-300")} />
            {cat.name}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 flex-1 overflow-hidden">
        {/* Main Content - Full Width */}
        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          <div className="flex items-center gap-3 lg:gap-4 shrink-0">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog..." 
                className="w-full pl-10 lg:pl-11 pr-4 lg:pr-5 py-2.5 lg:py-3.5 bg-surface border border-slate-100 rounded-xl lg:rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none shadow-sm text-[9px] lg:text-[11px] font-bold uppercase tracking-widest placeholder:text-slate-300"
              />
            </div>
            <button 
              onClick={() => showToast('Advanced filters coming soon', 'success')}
              className="p-2.5 lg:p-3.5 bg-surface border border-slate-100 rounded-xl lg:rounded-2xl hover:bg-slate-50 shadow-sm group"
            >
              <Filter className="w-4 h-4 text-slate-400 group-hover:text-primary" />
            </button>
          </div>

          <div className="card p-0 overflow-hidden flex-1 flex flex-col shadow-2xl border-none bg-surface rounded-t-[2.5rem] lg:rounded-[2.5rem]">
            <div className="flex-1 overflow-y-auto scrollbar-hide pb-20 lg:pb-0">
              {/* Desktop Table View */}
              <table className="w-full hidden md:table">
                <thead className="sticky top-0 z-10">
                  <tr className="text-left text-slate-400 text-[9px] font-black uppercase tracking-[0.25em] border-b border-slate-50 bg-slate-50/50">
                    <th className="px-8 py-5">Product Intelligence</th>
                    <th className="px-8 py-5">Category</th>
                    <th className="px-8 py-5">Financials</th>
                    <th className="px-8 py-5">Stock State</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {processedItems.length > 0 ? (
                      processedItems.map((item) => (
                        <tr 
                          key={item.id} 
                          className={cn(
                            "text-xs hover:bg-slate-50/50 group cursor-pointer",
                            item.status === 'Out of Stock' && "bg-slate-50/30"
                          )}
                          onClick={() => setSelectedItem(item)}
                        >
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg border border-slate-50">
                                {getImageUrl(item.image).length > 2 ? (
                                  <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-3xl">{getImageUrl(item.image)}</span>
                                )}
                              </div>
                              <div>
                                 <span className="font-black text-text-primary text-base tracking-tight leading-none">{item.name}</span>
                                 <p className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest flex items-center gap-2">
                                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" /> {item.rating} {item.popular ? '• Popular' : ''}
                                 </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                             <span className="badge bg-indigo-50 text-primary font-black border-none text-[8px] uppercase tracking-widest">{item.category}</span>
                          </td>
                          <td className="px-8 py-5 font-black text-text-primary text-lg tracking-tighter">{formatCurrency(item.price)}</td>
                          <td className="px-8 py-5">
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleAvailability(item.id); }}
                              className={cn(
                                "badge font-black border-2 py-1 px-3 text-[8px] uppercase tracking-widest",
                                item.status === 'In Stock' ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-100" :
                                item.status === 'Low Stock' ? "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-100" :
                                "bg-primary text-white border-rose-500 shadow-lg shadow-rose-100"
                              )}
                            >
                              {item.status}
                            </button>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setEditingItem(item); setIsViewOnly(true); setShowAddModal(true); }}
                                className="p-2.5 bg-surface text-slate-400 hover:text-primary hover:shadow-xl rounded-xl border border-slate-100"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setEditingItem(item); setIsViewOnly(false); setShowAddModal(true); }}
                                className="p-2.5 bg-surface text-slate-400 hover:text-primary hover:shadow-xl rounded-xl border border-slate-100"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(item); }}
                                className="p-2.5 bg-surface text-slate-400 hover:text-primary hover:shadow-xl rounded-xl border border-slate-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-20 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
                              <Search className="w-8 h-8 text-slate-200" />
                            </div>
                            <h4 className="text-xl font-black text-text-primary uppercase tracking-tight">No menu items found</h4>
                            <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest mt-2">Adjust your search or filter to see more results</p>
                            <button 
                              onClick={() => { setActiveCategory('All Items'); setSearchQuery(''); }}
                              className="mt-6 text-primary font-black uppercase tracking-[0.2em] text-[8px] hover:underline"
                            >
                              Reset All Filters
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4 p-4">
                {processedItems.length > 0 ? (
                  processedItems.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={cn(
                        "p-4 rounded-3xl border border-slate-100 bg-surface shadow-sm flex items-center gap-4 active:scale-95 transition-transform",
                        item.status === 'Out of Stock' && "opacity-60 bg-slate-50/50"
                      )}
                    >
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden shadow-inner shrink-0">
                        {getImageUrl(item.image).length > 2 ? (
                          <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl">{getImageUrl(item.image)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-black text-text-primary text-sm uppercase tracking-tight truncate">{item.name}</h4>
                          <p className="font-black text-primary text-sm ml-2">{formatCurrency(item.price)}</p>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.category} • <Star className="w-2.5 h-2.5 fill-yellow-500 text-yellow-500 inline mb-0.5" /> {item.rating} {item.popular ? '• Popular' : ''}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className={cn(
                            "px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest",
                            item.status === 'In Stock' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-primary"
                          )}>
                            {item.status}
                          </span>
                          <div className="flex gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setEditingItem(item); setIsViewOnly(true); setShowAddModal(true); }}
                              className="p-2 bg-slate-50 rounded-lg text-slate-400"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setEditingItem(item); setIsViewOnly(false); setShowAddModal(true); }}
                              className="p-2 bg-slate-50 rounded-lg text-slate-400"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(item); }}
                              className="p-2 bg-slate-50 rounded-lg text-rose-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-slate-200" />
                    </div>
                    <h4 className="text-lg font-black text-text-primary uppercase">No items found</h4>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

        {showAddModal && (
          <AddItemModal 
            item={editingItem} 
            isViewOnly={isViewOnly}
            onClose={() => { setShowAddModal(false); setEditingItem(null); setIsViewOnly(false); }}
            onSave={handleSaveItem}
            categories={categories.filter(c => c.name !== 'All Items')}
          />
        )}
        {showDeleteConfirm && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
           <div onClick={() => setShowDeleteConfirm(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
           <div 
             className="relative w-full max-w-sm bg-surface rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-2xl self-center animate-in fade-in slide-in-from-bottom-4 sm:zoom-in duration-300"
           >
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-rose-50 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-center uppercase tracking-tight">Confirm Removal</h3>
              <p className="text-xs sm:text-sm text-center text-slate-400 mt-2 font-medium">Are you sure you want to remove <span className="text-slate-900 font-bold">{showDeleteConfirm.name}</span>?</p>
              <div className="mt-8 flex gap-3">
                <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-3.5 sm:py-4 border-2 border-slate-100 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-slate-50">Cancel</button>
                <button onClick={() => handleDelete(showDeleteConfirm.id)} className="flex-1 py-3.5 sm:py-4 bg-primary text-white rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-xl shadow-rose-200">Delete</button>
              </div>
           </div>
        </div>,
        document.body
      )}
    </div>
  );
};

const AddItemModal = ({ item, isViewOnly, onClose, onSave, categories }) => {
  const [formData, setFormData] = useState({
    name: item?.name || item?.item_name || '',
    category: item?.category || item?.category_name || categories[0]?.name || '',
    price: item?.price || '',
    description: item?.description || '',
    status: item?.status || 'In Stock',
                          image: item?.image || '',
    rating: item?.rating || 5,
    popular: !!item?.popular
  });
  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState(item?.image || '');
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        showToast('Image size should be less than 8MB', 'error');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setPreviewUrl(base64String);
        setFormData({ ...formData, image: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Item name is required';
    if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.category) newErrors.category = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <div 
        className="relative w-full sm:max-w-[500px] bg-surface rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 self-center animate-in fade-in slide-in-from-bottom-4 sm:zoom-in duration-300 flex flex-col max-h-[95vh] sm:max-h-[90vh]"
      >
        <div className="px-5 py-5 md:px-8 md:py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/20 shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
             <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <Plus className="w-4 h-4 md:w-5 md:h-5 text-primary md:stroke-[3]" />
             </div>
             <div>
                <h3 className="text-lg md:text-xl font-black uppercase tracking-tight leading-none">
                  {isViewOnly ? 'View' : (item ? 'Edit' : 'Add')} Menu Item
                </h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5 md:mt-1 leading-none">
                  {isViewOnly ? 'Product details' : (item ? 'Modify existing entry' : 'Define new experience')}
                </p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 md:p-2.5 hover:bg-surface rounded-xl border border-transparent hover:border-slate-100 shadow-sm transition-all"><X className="w-5 h-5 text-slate-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
           <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 md:space-y-8 scrollbar-hide">
              <div className="flex flex-col sm:flex-row gap-6 md:gap-8">
                 <div className="w-24 h-24 sm:w-36 sm:h-36 bg-slate-50 rounded-[1.5rem] sm:rounded-[2.5rem] border-2 sm:border-4 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-primary shrink-0 overflow-hidden relative self-center transition-colors">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-20 disabled:cursor-default"
                      disabled={isViewOnly}
                    />
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover z-10" />
                    ) : (
                      <>
                        <Camera className="w-6 h-6 md:w-8 md:h-8 text-slate-300 group-hover:text-primary transition-colors" />
                        <span className="text-[7px] md:text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] group-hover:text-primary transition-colors">Upload Image</span>
                      </>
                    )}
                    {previewUrl && (
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity z-15 flex items-center justify-center">
                         <Camera className="w-6 h-6 text-white" />
                      </div>
                    )}
                 </div>
                 <div className="flex-1 space-y-5 md:space-y-6">
                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Title</label>
                       <input 
                         type="text" 
                         value={formData.name}
                         onChange={(e) => setFormData({...formData, name: e.target.value})}
                         placeholder="e.g. Classic Margherita" 
                         className={cn(
                           "w-full px-5 py-3.5 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none font-bold text-xs md:text-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed",
                           errors.name ? "border-rose-300 bg-rose-50/20" : "border-slate-100"
                         )}
                         disabled={isViewOnly}
                       />
                       {errors.name && <p className="text-[9px] font-bold text-primary ml-1 mt-1">{errors.name}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (Rp)</label>
                          <input 
                            type="number" 
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                            placeholder="299" 
                            className={cn(
                              "w-full px-5 py-3.5 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none font-bold text-xs md:text-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed",
                              errors.price ? "border-rose-300 bg-rose-50/20" : "border-slate-100"
                            )}
                            disabled={isViewOnly}
                          />
                          {errors.price && <p className="text-[9px] font-bold text-primary ml-1 mt-1">{errors.price}</p>}
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                          <div className="relative">
                            <select 
                              value={formData.category}
                              onChange={(e) => setFormData({...formData, category: e.target.value})}
                              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none font-bold text-xs md:text-sm appearance-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                              disabled={isViewOnly}
                            >
                               {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                            </select>
                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="space-y-1.5">
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Description</label>
                 <textarea 
                   value={formData.description}
                   onChange={(e) => setFormData({...formData, description: e.target.value})}
                   placeholder="Describe flavors and ingredients..." 
                   rows="3" 
                   className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none font-bold text-xs md:text-sm transition-all resize-y min-h-[100px] disabled:opacity-70 disabled:cursor-not-allowed"
                   disabled={isViewOnly}
                 />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Rating (0-5)</label>
                    <input 
                      type="number" 
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.rating}
                      onChange={(e) => setFormData({...formData, rating: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none font-bold text-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                      disabled={isViewOnly}
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Stock Status</label>
                    <div className="relative">
                      <select 
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none font-bold text-sm appearance-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        disabled={isViewOnly}
                      >
                         <option value="In Stock">In Stock</option>
                         <option value="Low Stock">Low Stock</option>
                         <option value="Out of Stock">Out of Stock</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.popular}
                      onChange={(e) => setFormData({...formData, popular: e.target.checked})}
                      className="sr-only peer"
                      disabled={isViewOnly}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                 </label>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mark as Popular Item</span>
              </div>
           </div>

           <div className="px-6 py-4 md:px-8 md:py-6 border-t border-slate-50 flex flex-row gap-3 md:gap-4 bg-surface shrink-0 relative z-20">
              <button type="button" onClick={onClose} className="flex-1 py-3.5 border-2 border-slate-100 rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-[10px] text-slate-400 hover:bg-slate-50 transition-all text-center">
                {isViewOnly ? 'Close' : 'Cancel'}
              </button>
              {!isViewOnly && (
                <button type="submit" disabled={uploadingImage} className="flex-1 btn-primary py-3.5 rounded-full font-black uppercase tracking-widest shadow-xl shadow-primary/20 text-[9px] md:text-[10px] active:scale-95 transition-all text-center disabled:opacity-50 disabled:cursor-not-allowed">
                  {uploadingImage ? 'Uploading...' : (item ? 'Update Entry' : 'Deploy Item')}
                </button>
              )}
           </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default Menu;
