const fs = require('fs');

let content = fs.readFileSync('src/pages/dashboard/admin/Settings.jsx', 'utf-8');

// Normalize line endings to \n for easier regex
content = content.replace(/\r\n/g, '\n');

// 1. Imports
if (!content.includes('Ticket')) {
  content = content.replace("Layout\n} from 'lucide-react';", "Layout,\n  Ticket,\n  X\n} from 'lucide-react';");
}

// 2. State variables
if (!content.includes('showAddCouponModal')) {
  const state_vars = `  // Coupons State
  const [coupons, setCoupons] = useState([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_amount: '0',
    max_discount_amount: ''
  });

  // Centralized Settings State`;
  content = content.replace("  // Centralized Settings State", state_vars);
}

// 3. useEffect
if (!content.includes('fetchCoupons()')) {
  const use_effect_code = `  useEffect(() => {
    fetchSettings();
    fetchCoupons();
  }, []);`;
  content = content.replace("  useEffect(() => {\n    fetchSettings();\n  }, []);", use_effect_code);
}

// 4. Functions
if (!content.includes('handleToggleCoupon')) {
  const functions_code = `  const fetchCoupons = async () => {
    setIsLoadingCoupons(true);
    try {
      const response = await api.get('/coupons');
      if (response.data.success) {
        setCoupons(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch coupons:', err);
    } finally {
      setIsLoadingCoupons(false);
    }
  };

  const handleToggleCoupon = async (id, currentStatus) => {
    try {
      const response = await api.put(\`/coupons/\${id}\`, { is_active: !currentStatus });
      if (response.data.success) {
        showToast('Coupon status updated');
        fetchCoupons();
      }
    } catch (err) {
      showToast('Failed to update coupon', 'error');
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const response = await api.delete(\`/coupons/\${id}\`);
      if (response.data.success) {
        showToast('Coupon deleted');
        fetchCoupons();
      }
    } catch (err) {
      showToast('Failed to delete coupon', 'error');
    }
  };

  const handleCreateCoupon = async () => {
    if (!newCoupon.code || !newCoupon.discount_value) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    try {
      const response = await api.post('/coupons', {
        ...newCoupon,
        code: newCoupon.code.toUpperCase()
      });
      if (response.data.success) {
        showToast('Coupon created successfully');
        setShowAddCouponModal(false);
        setNewCoupon({ code: '', discount_type: 'percentage', discount_value: '', min_order_amount: '0', max_discount_amount: '' });
        fetchCoupons();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create coupon', 'error');
    }
  };

  const fetchSettings = async () => {`;
  content = content.replace("  const fetchSettings = async () => {", functions_code);
}

// 5. Tab
if (!content.includes("id: 'Coupons'")) {
  content = content.replace(/\{\s*id:\s*'Printer',\s*icon:\s*Printer,\s*label:\s*'Printers'\s*\},[\s\n]*\];/, `    { id: 'Printer', icon: Printer, label: 'Printers' },
    { id: 'Coupons', icon: Ticket, label: 'Promotions' },
  ];`);
}

// 6 & 7. UI and Modal
if (!content.includes('showAddCouponModal &&')) {
  const ui_code = `              )}
              {activeTab === 'Coupons' && (
                <div className="space-y-6 lg:space-y-8 pb-20">
                   <div className="card p-6 lg:p-10 bg-surface rounded-[2rem] lg:rounded-[3rem] shadow-2xl border-none">
                      <div className="flex justify-between items-start mb-8 lg:mb-10">
                         <div>
                            <h3 className="text-lg lg:text-xl font-black uppercase tracking-tight leading-none">Promotions & Coupons</h3>
                            <p className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5 leading-none">Manage discount codes</p>
                         </div>
                         <button 
                            onClick={() => setShowAddCouponModal(true)}
                            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-colors"
                         >
                            <Plus className="w-4 h-4" /> Add Coupon
                         </button>
                      </div>
                      
                      {isLoadingCoupons ? (
                        <div className="text-center py-10 text-slate-400 font-black text-xs uppercase tracking-widest">Loading coupons...</div>
                      ) : coupons.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 font-black text-xs uppercase tracking-widest">No coupons found.</div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {coupons.map(coupon => (
                            <div key={coupon.id} className={cn("p-5 rounded-2xl border transition-all", coupon.is_active ? "bg-emerald-50/50 border-emerald-100" : "bg-slate-50 border-slate-200 opacity-75")}>
                               <div className="flex justify-between items-start mb-4">
                                  <div className="px-3 py-1 bg-surface border rounded-lg text-xs font-black tracking-widest text-primary">{coupon.code}</div>
                                  <div className="flex gap-2">
                                     <button onClick={() => handleToggleCoupon(coupon.id, coupon.is_active)} className={cn("px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest", coupon.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500")}>
                                        {coupon.is_active ? 'Active' : 'Inactive'}
                                     </button>
                                     <button onClick={() => handleDeleteCoupon(coupon.id)} className="p-1 text-rose-400 hover:bg-rose-50 rounded">
                                        <AlertCircle className="w-4 h-4" />
                                     </button>
                                  </div>
                               </div>
                               <div className="space-y-1">
                                  <h4 className="text-sm font-black uppercase tracking-tight text-text-primary">
                                    {coupon.discount_type === 'flat' ? \`₹\${parseFloat(coupon.discount_value)} OFF\` : \`\${parseFloat(coupon.discount_value)}% OFF\`}
                                  </h4>
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    Min Order: ₹{parseFloat(coupon.min_order_amount)}
                                    {coupon.discount_type === 'percentage' && coupon.max_discount_amount && \` | Max: ₹\${parseFloat(coupon.max_discount_amount)}\`}
                                  </p>
                               </div>
                            </div>
                          ))}
                        </div>
                      )}
                   </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Add Coupon Modal */}
        {showAddCouponModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddCouponModal(false)} />
            <div className="relative w-full max-w-md bg-surface border-none shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col">
              <div className="p-8 pb-6 flex justify-between items-start">
                 <div>
                   <h3 className="text-xl font-black text-text-primary uppercase tracking-tight flex items-center gap-3">
                      <Ticket className="w-6 h-6 text-primary" /> New Coupon
                   </h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Create a discount code</p>
                 </div>
                 <button onClick={() => setShowAddCouponModal(false)} className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-primary transition-all">
                   <X className="w-5 h-5" />
                 </button>
              </div>
              
              <div className="p-8 pt-0 space-y-4">
                 <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Coupon Code *</label>
                    <input 
                      type="text" 
                      value={newCoupon.code}
                      onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl mt-1 outline-none font-bold uppercase tracking-widest focus:border-primary border-2 border-transparent"
                      placeholder="e.g. SUMMER20"
                    />
                 </div>
                 <div className="flex gap-4">
                   <div className="flex-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Discount Type</label>
                      <select 
                        value={newCoupon.discount_type}
                        onChange={(e) => setNewCoupon({...newCoupon, discount_type: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl mt-1 outline-none font-bold uppercase text-xs focus:border-primary border-2 border-transparent"
                      >
                         <option value="percentage">Percentage (%)</option>
                         <option value="flat">Flat Amount (₹)</option>
                      </select>
                   </div>
                   <div className="flex-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Discount Value *</label>
                      <input 
                        type="number" 
                        value={newCoupon.discount_value}
                        onChange={(e) => setNewCoupon({...newCoupon, discount_value: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl mt-1 outline-none font-bold focus:border-primary border-2 border-transparent"
                        placeholder="e.g. 20"
                      />
                   </div>
                 </div>
                 <div className="flex gap-4">
                   <div className="flex-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Min Order Amount</label>
                      <input 
                        type="number" 
                        value={newCoupon.min_order_amount}
                        onChange={(e) => setNewCoupon({...newCoupon, min_order_amount: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl mt-1 outline-none font-bold focus:border-primary border-2 border-transparent"
                        placeholder="e.g. 500"
                      />
                   </div>
                   {newCoupon.discount_type === 'percentage' && (
                     <div className="flex-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Max Discount</label>
                        <input 
                          type="number" 
                          value={newCoupon.max_discount_amount}
                          onChange={(e) => setNewCoupon({...newCoupon, max_discount_amount: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 rounded-xl mt-1 outline-none font-bold focus:border-primary border-2 border-transparent"
                          placeholder="e.g. 100"
                        />
                     </div>
                   )}
                 </div>
                 <button 
                   onClick={handleCreateCoupon}
                   className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all mt-4"
                 >
                   Create Coupon
                 </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
};`;
  content = content.replace(/ {14}\)}\n\n {12}\}<\/div>\n {10}\}<\/div>\n {8}\}<\/div>\n {6}\}<\/div>\n {4}\);\n\};/, ui_code);
}

fs.writeFileSync('src/pages/dashboard/admin/Settings.jsx', content);
