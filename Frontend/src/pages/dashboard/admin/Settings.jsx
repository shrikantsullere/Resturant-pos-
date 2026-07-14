import { formatCurrency } from '../../../utils/currencyUtils';
import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Store, 
  Bell, 
  Receipt, 
  Printer, 
  Save,
  RotateCcw,
  Search,
  CheckCircle2,
  AlertCircle,
  Mail,
  Smartphone,
  Zap,
  Activity,
  Cpu,
  LogOut,
  Globe,
  Clock,
  Plus,
  ShieldCheck,
  Layout
} from 'lucide-react';
import { cn } from "../../../utils/cn";
import api from "../../../services/api";

const Settings = () => {
  const [activeTab, setActiveTab] = useState('General');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState('Last saved: Today at 2:30 PM');
  const [toast, setToast] = useState(null);

  // Centralized Settings State
  const [settings, setSettings] = useState({
    businessName: 'Gila House',
    email: 'gilahouse@resturnt.com',
    phone: '+91 12345 67890',
    address: 'Indonesia',
    currency: 'IDR (Rp)',
    timezone: '(GMT+05:30) India Standard Time',
    taxRate: '18',
    serviceCharge: '5',
    invoicePrefix: 'INV-',
    notifyEmail: true,
    notifySMS: false,
    orderAlerts: true,
    kitchenAlerts: true,
    printerIp: '192.168.1.105',
    printerConnected: true,
    themeColor: localStorage.getItem('pos-theme') || 'indigo',
    motto: 'Serving Excellence Since 2024',
    operatingHours: {
      Monday: { open: '09:00', close: '23:00', active: true },
      Tuesday: { open: '09:00', close: '23:00', active: true },
      Wednesday: { open: '09:00', close: '23:00', active: true },
      Thursday: { open: '09:00', close: '23:00', active: true },
      Friday: { open: '09:00', close: '23:00', active: true },
      Saturday: { open: '10:00', close: '23:59', active: true },
      Sunday: { open: '10:00', close: '22:00', active: true },
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      if (response.data.success) {
        const data = response.data.data;
        setSettings(prev => ({
          ...prev,
          ...data
        }));
        if (data.themeColor) {
          applyTheme(data.themeColor);
        }
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      showToast('Failed to load settings', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await api.patch('/settings', settings);
      if (response.data.success) {
        setLastSaved(`Last saved: Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
        showToast('Settings updated successfully');
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      showToast('Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    if (window.confirm('Are you sure you want to discard all changes?')) {
      fetchSettings();
      showToast('Changes discarded', 'info');
    }
  };

  const testPrinter = () => {
    showToast('Test print sent to ' + settings.printerIp);
  };

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    showToast(`${key.replace(/([A-Z])/g, ' $1')} updated`);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleTimeChange = (day, field, value) => {
    setSettings(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: { ...prev.operatingHours[day], [field]: value }
      }
    }));
  };

  const toggleDay = (day) => {
    const newState = !settings.operatingHours[day].active;
    setSettings(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: { ...prev.operatingHours[day], active: newState }
      }
    }));
    showToast(`${day} service ${newState ? 'enabled' : 'disabled'}`);
  };

  const applyTheme = (colorId) => {
    const themes = {
      orange: { primary: '#EF8E4B', dark: '#F2994A', light: '#FFF5EE' },
      indigo: { primary: '#EF8E4B', dark: '#F2994A', light: '#FFF5EE' },
      rose: { primary: '#EF8E4B', dark: '#F2994A', light: '#FFF5EE' },
      emerald: { primary: '#EF8E4B', dark: '#F2994A', light: '#FFF5EE' },
      purple: { primary: '#EF8E4B', dark: '#F2994A', light: '#FFF5EE' }
    };

    const theme = themes[colorId] || themes.orange;
    if (theme) {
      document.documentElement.style.setProperty('--color-primary', theme.primary);
      document.documentElement.style.setProperty('--color-primary-dark', theme.dark);
      document.documentElement.style.setProperty('--color-primary-light', theme.light);
      localStorage.setItem('pos-theme', colorId);
    }
  };

  const handleColorSelect = (colorId) => {
    applyTheme(colorId);
    setSettings(prev => ({ ...prev, themeColor: colorId }));
    showToast(`${colorId.charAt(0).toUpperCase() + colorId.slice(1)} theme applied`);
  };

  const simulateLogoUpload = () => {
    showToast('Logo updated successfully');
  };

  const tabs = [
    { id: 'General', icon: SettingsIcon, label: 'General' },
    { id: 'Restaurant', icon: Store, label: 'Restaurant' },
    { id: 'Billing', icon: Receipt, label: 'Billing' },
    { id: 'Printer', icon: Printer, label: 'Printers' },

  ];

  const filteredTabs = tabs.filter(tab => 
    tab.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 h-full flex flex-col overflow-hidden relative">
      {/* Toast Feedback */}
      {toast && (
        <div 
          className={cn(
            "fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest border",
            toast.type === 'success' ? "bg-primary border-primary/20 text-white" : "bg-primary border-primary/20 text-white"
          )}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-white" /> : <AlertCircle className="w-4 h-4 text-white" />}
          {toast.message}
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0 print:hidden px-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black text-text-primary uppercase tracking-tight leading-none">Settings</h2>
          <p className="text-text-secondary mt-2 text-[10px] lg:text-sm font-medium flex items-center gap-2 italic leading-none">
            Global Configuration â€¢ <span className="text-slate-400 font-bold">{lastSaved}</span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <button 
            onClick={handleDiscard}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 lg:px-6 py-3.5 bg-surface border border-border rounded-xl lg:rounded-2xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 shadow-sm whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4" /> Discard
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2.5 py-3.5 px-6 lg:px-8 shadow-xl shadow-indigo-100 disabled:opacity-50 whitespace-nowrap text-[9px] lg:text-[10px] uppercase font-black"
          >
            {isSaving ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Saving...' : 'Commit Changes'}
          </button>
        </div>
      </div>

      {/* Mobile Navigation - Horizontal Scroll */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide">
         {tabs.map(tab => (
           <button 
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={cn(
               "flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all shrink-0",
               activeTab === tab.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-surface text-slate-400 border border-slate-100"
             )}
           >
             <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-white" : "text-slate-300")} />
             {tab.label}
           </button>
         ))}
      </div>

      <div className="flex-1 flex overflow-hidden lg:gap-8 px-4 min-w-0">
        {/* Navigation Sidebar (Desktop) */}
        <div className="w-64 shrink-0 space-y-6 hidden lg:block">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find setting..." 
                className="w-full pl-11 pr-5 py-3.5 bg-surface border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none shadow-sm text-[10px] font-bold uppercase tracking-widest"
              />
           </div>

           <div className="space-y-1.5">
              {filteredTabs.map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === tab.id ? "bg-primary text-white shadow-xl shadow-primary/20 scale-105" : "text-slate-400 hover:bg-slate-50 hover:text-text-primary"
                  )}
                >
                  <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "text-white" : "text-slate-300")} />
                  {tab.label}
                </button>
              ))}
           </div>

           <div className="pt-10 space-y-4">
              <div className="p-6 bg-primary rounded-[2.5rem] text-white relative overflow-hidden shadow-xl shadow-primary/10">
                 <div className="relative z-10">
                    <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">System Health</p>
                    <h5 className="text-sm font-black uppercase">v4.2.0-Stable</h5>
                    <div className="flex items-center gap-2 mt-3">
                       <div className="w-2 h-2 rounded-full bg-primary" />
                       <span className="text-[9px] font-bold text-white/60">All nodes online</span>
                    </div>
                 </div>
                 <Activity className="absolute -bottom-6 -right-6 w-20 h-20 text-white opacity-10" />
              </div>
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
           <div className="space-y-8 pb-10">
              {activeTab === 'General' && (
                <div className="space-y-6 lg:space-y-8">
                   <div className="card p-6 lg:p-10 bg-surface rounded-[2rem] lg:rounded-[3rem] shadow-2xl border-none">
                      <h3 className="text-lg lg:text-xl font-black uppercase tracking-tight mb-6 lg:mb-8 leading-none">Business Identity</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
                         <div className="space-y-2">
                            <label className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Restaurant Name</label>
                            <input name="businessName" value={settings.businessName} onChange={handleInputChange} className="w-full px-5 lg:px-6 py-3 lg:py-4 bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-surface rounded-xl lg:rounded-2xl outline-none text-xs lg:text-sm font-bold" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Admin Email</label>
                            <input name="email" value={settings.email} onChange={handleInputChange} className="w-full px-5 lg:px-6 py-3 lg:py-4 bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-surface rounded-xl lg:rounded-2xl outline-none text-xs lg:text-sm font-bold" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contact Phone</label>
                            <input name="phone" value={settings.phone} onChange={handleInputChange} className="w-full px-5 lg:px-6 py-3 lg:py-4 bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-surface rounded-xl lg:rounded-2xl outline-none text-xs lg:text-sm font-bold" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Regional Currency</label>
                            <select name="currency" value={settings.currency} onChange={handleInputChange} className="w-full px-5 lg:px-6 py-3 lg:py-4 bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-surface rounded-xl lg:rounded-2xl outline-none text-xs lg:text-sm font-bold appearance-none">
                               <option>INR (â‚¹)</option>
                               <option>USD ($)</option>
                               <option>GBP (Â£)</option>
                               <option>EUR (â‚¬)</option>
                            </select>
                         </div>
                      </div>
                      <div className="mt-6 lg:mt-8 space-y-2">
                         <label className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Physical Address</label>
                         <textarea name="address" value={settings.address} onChange={handleInputChange} rows="3" className="w-full px-5 lg:px-6 py-3 lg:py-4 bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-surface rounded-xl lg:rounded-2xl outline-none text-xs lg:text-sm font-bold resize-none" />
                      </div>
                   </div>

                </div>
              )}
              {activeTab === 'Restaurant' && (
                <div className="space-y-6 lg:space-y-8">
                   <div className="card p-6 lg:p-10 bg-surface rounded-[2rem] lg:rounded-[3rem] shadow-2xl border-none">
                      <div className="flex justify-between items-start mb-6 lg:mb-10">
                         <div>
                            <h3 className="text-lg lg:text-xl font-black uppercase tracking-tight leading-none">Operating Hours</h3>
                            <p className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5 leading-none">Manage service availability</p>
                         </div>
                         <div className="p-3 lg:p-4 bg-orange-50 text-orange-600 rounded-xl lg:rounded-2xl shrink-0">
                            <Clock className="w-5 lg:w-7 h-5 lg:h-7" />
                         </div>
                      </div>
                      
                      <div className="space-y-3 lg:space-y-6">
                         {Object.entries(settings.operatingHours).map(([day, schedule]) => (
                            <div key={day} className={cn(
                              "flex flex-col sm:flex-row sm:items-center justify-between p-4 lg:p-5 rounded-xl lg:rounded-2xl gap-4",
                              schedule.active ? "bg-slate-50" : "bg-slate-50 opacity-50 grayscale"
                            )}>
                               <div className="flex items-center gap-4 lg:gap-6 w-full sm:w-auto">
                                  <div className="p-2 lg:p-3 bg-surface rounded-lg lg:rounded-xl text-primary font-black text-[8px] lg:text-[10px] uppercase shadow-sm shrink-0">{day.slice(0,3)}</div>
                                  <span className={cn("text-xs lg:text-sm font-black uppercase tracking-tight truncate", schedule.active ? "text-text-primary" : "text-slate-400")}>{day}</span>
                                </div>
                               <div className="flex items-center justify-between sm:justify-end gap-4 lg:gap-6 w-full sm:w-auto">
                                  <div className="flex flex-col sm:flex-row gap-2 lg:gap-4 flex-1 sm:flex-none">
                                     <div className="flex items-center gap-2 justify-end sm:justify-start">
                                        <span className="text-[7px] lg:text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">Open</span>
                                        <input 
                                          type="time" 
                                          value={schedule.open} 
                                          onChange={(e) => handleTimeChange(day, 'open', e.target.value)}
                                          disabled={!schedule.active}
                                          className="bg-surface border-none rounded-lg px-2 lg:px-3 py-1.5 text-[10px] lg:text-xs font-bold outline-none disabled:cursor-not-allowed w-20 lg:w-24 shrink-0" 
                                        />
                                     </div>
                                     <div className="flex items-center gap-2 justify-end sm:justify-start">
                                        <span className="text-[7px] lg:text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">Close</span>
                                        <input 
                                          type="time" 
                                          value={schedule.close} 
                                          onChange={(e) => handleTimeChange(day, 'close', e.target.value)}
                                          disabled={!schedule.active}
                                          className="bg-surface border-none rounded-lg px-2 lg:px-3 py-1.5 text-[10px] lg:text-xs font-bold outline-none disabled:cursor-not-allowed w-20 lg:w-24 shrink-0" 
                                        />
                                     </div>
                                  </div>
                                  <div 
                                    onClick={() => toggleDay(day)}
                                    className={cn(
                                      "w-10 lg:w-10 h-5 lg:h-5 rounded-full relative p-1 shadow-inner cursor-pointer shrink-0 transition-colors",
                                      schedule.active ? "bg-primary" : "bg-slate-300"
                                    )}
                                  >
                                     <div 
                                       className={cn("w-3 h-3 bg-surface rounded-full transition-transform", schedule.active ? "translate-x-5" : "translate-x-0")} 
                                     />
                                  </div>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                    <div className="card p-6 lg:p-10 bg-surface rounded-[2rem] lg:rounded-[3rem] shadow-2xl border-none relative overflow-hidden">
                      <h3 className="text-lg lg:text-xl font-black uppercase tracking-tight mb-6 lg:mb-8 leading-none">Identity</h3>
                      <div className="w-full space-y-5 lg:space-y-6">
                            <div className="space-y-3 lg:space-y-4">
                               <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 leading-none">Accent Theme</p>
                               <div className="flex flex-wrap gap-3 lg:gap-4">
                                  {[
                                    { id: 'indigo', class: 'bg-primary' },
                                    { id: 'rose', class: 'bg-primary' },
                                    { id: 'emerald', class: 'bg-emerald-500' },
                                    { id: 'orange', class: 'bg-orange-500' },
                                    { id: 'purple', class: 'bg-purple-600' }
                                  ].map(color => (
                                    <div 
                                      key={color.id} 
                                      onClick={() => handleColorSelect(color.id)}
                                      className={cn(
                                        "w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl shadow-lg relative cursor-pointer active:scale-90 transition-all",
                                        color.class,
                                        settings.themeColor === color.id && "ring-4 ring-white ring-inset border-2 border-slate-900 shadow-primary/40"
                                      )} 
                                    >
                                       {settings.themeColor === color.id && (
                                          <div className="absolute inset-0 flex items-center justify-center">
                                             <CheckCircle2 className="w-4 lg:w-5 h-4 lg:h-5 text-white" />
                                          </div>
                                       )}
                                    </div>
                                  ))}
                               </div>
                            </div>
                            <div className="space-y-2">
                               <label className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tagline</label>
                               <input 
                                 name="motto"
                                 value={settings.motto} 
                                 onChange={handleInputChange}
                                 className="w-full px-5 lg:px-6 py-3 lg:py-4 bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-surface rounded-xl lg:rounded-2xl outline-none text-xs lg:text-sm font-bold" 
                               />
                            </div>
                      </div>
                   </div>
                </div>
              )}
              {activeTab === 'Billing' && (
                <div className="space-y-6 lg:space-y-8">
                   <div className="card p-6 lg:p-10 bg-surface rounded-[2rem] lg:rounded-[3rem] shadow-2xl border-none">
                      <div className="flex justify-between items-start mb-8 lg:mb-10">
                         <div>
                            <h3 className="text-lg lg:text-xl font-black uppercase tracking-tight leading-none">Fiscal Rules</h3>
                            <p className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5 leading-none">Configure parameters</p>
                         </div>
                         <div className="p-3 lg:p-4 bg-emerald-50 text-emerald-600 rounded-xl lg:rounded-2xl shrink-0">
                            <Receipt className="w-5 lg:w-7 h-5 lg:h-7" />
                         </div>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
                         <div className="space-y-3 lg:space-y-4">
                            <div className="flex items-center justify-between">
                               <label className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">GST Rate</label>
                               <span className="text-xs lg:text-sm font-black text-primary leading-none">{settings.taxRate}%</span>
                            </div>
                            <input type="range" name="taxRate" min="0" max="30" value={settings.taxRate} onChange={handleInputChange} className="w-full h-1.5 lg:h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary" />
                            <div className="flex justify-between text-[7px] lg:text-[8px] font-black text-slate-300 uppercase leading-none">
                               <span>0%</span>
                               <span>15%</span>
                               <span>30%</span>
                             </div>
                         </div>

                         <div className="space-y-3 lg:space-y-4">
                            <div className="flex items-center justify-between">
                               <label className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">Service</label>
                               <span className="text-xs lg:text-sm font-black text-primary leading-none">{settings.serviceCharge}%</span>
                            </div>
                            <input type="range" name="serviceCharge" min="0" max="20" value={settings.serviceCharge} onChange={handleInputChange} className="w-full h-1.5 lg:h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary" />
                            <div className="flex justify-between text-[7px] lg:text-[8px] font-black text-slate-300 uppercase leading-none">
                               <span>0%</span>
                               <span>10%</span>
                               <span>20%</span>
                             </div>
                         </div>
                      </div>

                      <div className="mt-8 lg:mt-10 p-5 lg:p-8 bg-slate-50 rounded-[1.5rem] lg:rounded-[2.5rem] border border-slate-100">
                         <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                            <div className="flex-1 space-y-2">
                               <label className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 leading-none">Invoice Prefix</label>
                               <input name="invoicePrefix" value={settings.invoicePrefix} onChange={handleInputChange} className="w-full px-5 lg:px-6 py-2.5 lg:py-3 bg-surface border border-slate-200 rounded-lg lg:rounded-xl outline-none text-xs lg:text-sm font-bold focus:border-primary" />
                            </div>
                            <div className="flex-1 space-y-3 lg:space-y-4">
                               <p className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 leading-none">Preview</p>
                               <div className="p-3 lg:p-4 bg-surface rounded-lg lg:rounded-xl border border-slate-100 flex items-center justify-between">
                                  <span className="text-[10px] lg:text-xs font-bold text-slate-400">{settings.invoicePrefix}2024-0001</span>
                                  <CheckCircle2 className="w-3 lg:w-4 h-3 lg:w-4 text-emerald-500" />
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              )}
              {activeTab === 'Printer' && (
                <div className="space-y-6 lg:space-y-8">
                   <div className="card p-6 lg:p-10 bg-surface rounded-[2rem] lg:rounded-[3rem] shadow-2xl border-none">
                      <div className="flex justify-between items-start mb-8 lg:mb-10">
                         <div>
                            <h3 className="text-lg lg:text-xl font-black uppercase tracking-tight leading-none">Printer Hub</h3>
                            <p className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5 leading-none">Thermal & KDS nodes</p>
                         </div>
                         <div className={cn("px-3 lg:px-4 py-1.5 rounded-full text-[7px] lg:text-[9px] font-black uppercase tracking-widest shadow-lg shrink-0", settings.printerConnected ? "bg-emerald-50 text-emerald-600 shadow-emerald-100" : "bg-rose-50 text-primary shadow-rose-100")}>
                            {settings.printerConnected ? 'Online' : 'Off'}
                         </div>
                      </div>

                      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                         <div className="flex-1 space-y-4">
                            <div className="p-5 lg:p-8 bg-slate-50 rounded-[1.5rem] lg:rounded-[2.5rem] border border-slate-100 space-y-6">
                               <div className="space-y-2">
                                  <label className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 leading-none">Node IP</label>
                                  <input name="printerIp" value={settings.printerIp} onChange={handleInputChange} className="w-full px-5 lg:px-6 py-3 lg:py-4 bg-surface border border-slate-200 rounded-xl outline-none text-xs lg:text-sm font-black text-primary focus:border-primary shadow-sm" />
                               </div>
                               <button onClick={testPrinter} className="w-full py-3.5 lg:py-4 bg-surface border-2 border-slate-100 text-[8px] lg:text-[10px] font-black uppercase tracking-widest rounded-xl lg:rounded-2xl hover:bg-primary hover:text-white hover:border-primary flex items-center justify-center gap-2 lg:gap-3 transition-colors active:scale-[0.98]">
                                  <Zap className="w-4 h-4" /> Execute Test
                               </button>
                            </div>
                         </div>
                         <div className="flex-1 grid grid-cols-1 gap-4">
                            <div className="p-4 lg:p-6 bg-indigo-50 border border-primary/10 rounded-xl lg:rounded-[2rem] flex items-center justify-between group cursor-pointer active:scale-[0.98] transition-all" onClick={() => toggleSetting('printerConnected')}>
                               <div className="flex items-center gap-3 lg:gap-4 shrink-0">
                                  <div className="p-2.5 lg:p-3 bg-surface rounded-lg lg:rounded-xl shadow-sm text-primary shrink-0"><Printer className="w-4 lg:w-5 h-4 lg:h-5" /></div>
                                  <p className="text-[10px] lg:text-[11px] font-black uppercase tracking-tight leading-none truncate">Main Billing</p>
                               </div>
                               <div className={cn("w-2 lg:w-2.5 h-2 lg:h-2.5 rounded-full shadow-lg shrink-0 transition-colors", settings.printerConnected ? "bg-emerald-500 shadow-emerald-200" : "bg-slate-300")} />
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    );
};

export default Settings;
