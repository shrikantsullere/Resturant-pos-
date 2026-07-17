import { useState, useEffect } from 'react';
import { 
  User, 
  ChevronLeft, 
  MapPin, 
  Phone, 
  Mail, 
  ChevronRight, 
  Settings, 
  LogOut, 
  Shield, 
  CreditCard, 
  Bell, 
  ArrowRight, 
  Star,
  X,
  Plus,
  CheckCircle2,
  AlertCircle,
  Globe,
  Trash2,
  Lock,
  Smartphone,
  Eye,
  EyeOff,
  History,
  Languages,
  DollarSign,
  Clock,
  Camera
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useNavigate } from 'react-router-dom';
import { useAuth, roles } from '@/context/AuthContext';
import { useCustomer } from '@/context/CustomerContext';
import { createPortal } from 'react-dom';
import api from '@/services/api';

const CustomerProfile = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { 
    profile, updateProfile, 
    paymentMethods, setPaymentMethods,
    addresses, setAddresses,
    notificationPrefs, setNotificationPrefs,
    systemSettings, setSystemSettings
  } = useCustomer();

  // Modals & UI State
  const [activeModal, setActiveModal] = useState(null); 
  const [toast, setToast] = useState(null);

  // Form States
  const [profileForm, setProfileForm] = useState(profile || {});
  const [newCard, setNewCard] = useState({ type: 'Visa', last4: '', expiry: '' });
  const [newAddress, setNewAddress] = useState({ label: '', address: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, error: null, success: false });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (profile) setProfileForm(profile);
  }, [profile]);

  // Handlers
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateProfile(profileForm);
    setActiveModal(null);
    showToast('Profile updated successfully!');
  };

  const handleDetailsSave = async (e) => {
    e.preventDefault();
    if (profileForm.birthday) {
      const bday = new Date(profileForm.birthday);
      const today = new Date();
      if (bday > today) {
        showToast('Birthday cannot be a future date', 'error');
        return;
      }
    }
    const result = await updateProfile(profileForm);
    if (result && result.success) {
      showToast('Profile details saved successfully!');
    } else {
      showToast(result?.message || 'Failed to save profile details', 'error');
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordStatus({ loading: true, error: null, success: false });
    try {
      await api.put('/auth/update-password', passwordForm);
      setPasswordStatus({ loading: false, error: null, success: true });
      showToast('Password updated successfully!');
      setTimeout(() => {
        setActiveModal(null);
        setPasswordStatus({ loading: false, error: null, success: false });
        setPasswordForm({ currentPassword: '', newPassword: '' });
        logout();
        navigate('/login');
      }, 1500);
    } catch (err) {
      setPasswordStatus({ 
        loading: false, 
        error: err.response?.data?.message || err.message || 'Failed to update password', 
        success: false 
      });
      showToast(err.response?.data?.message || 'Failed to update password', 'error');
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'payments', label: 'Payment Methods', icon: CreditCard, color: 'text-indigo-500 bg-indigo-50' },
    { id: 'addresses', label: 'Address Book', icon: MapPin, color: 'text-primary bg-rose-50' },
    { id: 'notifs', label: 'Notifications', icon: Bell, color: 'text-orange-500 bg-orange-50' },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield, color: 'text-emerald-500 bg-emerald-50' },
  ];

  return (
    <div className="space-y-6 lg:space-y-8 pb-24">
      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest border animate-in slide-in-from-top-4 duration-300",
          toast.type === 'success' ? "bg-primary border-primary/20 text-white" : "bg-primary border-primary/20 text-white"
        )}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 px-1">
         <button onClick={() => navigate(-1)} className="p-2.5 bg-surface rounded-xl shadow-sm border border-slate-100 lg:hidden">
            <ChevronLeft className="w-5 h-5 text-text-primary" />
         </button>
         <h2 className="text-xl lg:text-2xl font-black text-text-primary uppercase tracking-tight leading-none">Your Profile</h2>
      </div>

      {/* Profile Info Card */}
      <div className="card p-6 lg:p-10 bg-surface border-none shadow-xl shadow-slate-100/50 rounded-[2.5rem] lg:rounded-[3rem] flex flex-col items-center md:flex-row md:items-start gap-8 lg:gap-12 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
         
         <div className="relative shrink-0">
            <div className="w-24 h-24 lg:w-32 lg:h-32 bg-primary/10 rounded-[2rem] lg:rounded-[3rem] flex items-center justify-center text-primary text-4xl lg:text-5xl font-black shadow-inner border-4 border-white overflow-hidden shrink-0">
               {profile?.photo ? (
                 <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 (profile?.name || profile?.full_name || 'G')[0]
               )}
            </div>
         </div>
 
          <div className="flex-1 space-y-4 text-center md:text-left w-full relative z-10">
             <div>
                <h3 className="text-2xl lg:text-3xl font-black text-text-primary uppercase tracking-tight leading-none">
                  {profile?.name || profile?.full_name || 'Guest'}
                </h3>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-2 leading-none flex items-center justify-center md:justify-start gap-2">
                   <Star className="w-3 h-3 fill-current" /> Gold Member • Table {profile?.tableId || 'N/A'}
                </p>
             </div>
             <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2">
                <span className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100"><Mail className="w-3.5 h-3.5 text-primary" /> {profile?.email || 'N/A'}</span>
                <span className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100"><Phone className="w-3.5 h-3.5 text-primary" /> {profile?.phone || 'N/A'}</span>
             </div>
             <div className="pt-4 flex justify-center md:justify-start">
                <button 
                  onClick={() => { setProfileForm(profile); setActiveModal('edit-profile'); }}
                  className="px-8 py-2.5 bg-surface border border-slate-100 rounded-xl shadow-sm text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:border-primary/20 transition-all active:scale-95"
                >
                   Edit Profile
                </button>
             </div>
          </div>
      </div>

      {/* Customer Analytics Section */}
      <section className="space-y-4">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Customer Analytics</p>
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            <div className="card p-6 bg-surface border-none shadow-md rounded-[2rem] flex items-center gap-4">
               <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shadow-sm shrink-0">
                  <History className="w-6 h-6" />
               </div>
               <div className="text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Visit Count</span>
                  <span className="text-xl font-black text-text-primary uppercase tracking-tight block mt-0.5">{profile?.visit_count || 0}</span>
               </div>
            </div>
            <div className="card p-6 bg-surface border-none shadow-md rounded-[2rem] flex items-center gap-4">
               <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                  <DollarSign className="w-6 h-6" />
               </div>
               <div className="text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Spending</span>
                  <span className="text-xl font-black text-text-primary uppercase tracking-tight block mt-0.5">Rp {profile?.total_spending ? parseFloat(profile.total_spending).toFixed(2) : '0.00'}</span>
               </div>
            </div>
            <div className="card p-6 bg-surface border-none shadow-md rounded-[2rem] flex items-center gap-4">
               <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 shadow-sm shrink-0">
                  <Clock className="w-6 h-6" />
               </div>
               <div className="text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Average Spending</span>
                  <span className="text-xl font-black text-text-primary uppercase tracking-tight block mt-0.5">Rp {profile?.average_spending ? parseFloat(profile.average_spending).toFixed(2) : '0.00'}</span>
               </div>
            </div>
         </div>
      </section>

      {/* Customer Information (Editable fields) */}
      <section className="space-y-4">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Customer Information</p>
         <div className="card p-6 lg:p-10 bg-surface border-none shadow-xl shadow-slate-100/50 rounded-[2.5rem] lg:rounded-[3rem]">
            <form onSubmit={handleDetailsSave} className="space-y-6">
               <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
                  {/* Photo Upload */}
                  <div className="space-y-2 flex flex-col items-center">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Profile Photo</span>
                     <div className="w-24 h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-primary relative overflow-hidden group transition-all shrink-0">
                        <input 
                           type="file" 
                           accept="image/*"
                           onChange={handlePhotoChange}
                           className="absolute inset-0 opacity-0 cursor-pointer z-20"
                        />
                        {profileForm.photo ? (
                           <img src={profileForm.photo} alt="Preview" className="absolute inset-0 w-full h-full object-cover z-10" />
                        ) : (
                           <span className="text-[10px] font-bold text-slate-300 group-hover:text-primary transition-colors">Upload</span>
                        )}
                     </div>
                  </div>
                  
                  {/* Fields Grid */}
                  <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-5">
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Birthday</label>
                        <input 
                           type="date"
                           value={profileForm.birthday ? profileForm.birthday.split('T')[0] : ''}
                           onChange={(e) => setProfileForm({ ...profileForm, birthday: e.target.value })}
                           className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-xs"
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Favorite Food</label>
                        <input 
                           type="text"
                           value={profileForm.favorite_food || ''}
                           onChange={(e) => setProfileForm({ ...profileForm, favorite_food: e.target.value })}
                           placeholder="e.g. Pizza Margherita"
                           className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-xs"
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Allergies</label>
                        <input 
                           type="text"
                           value={profileForm.allergies || ''}
                           onChange={(e) => setProfileForm({ ...profileForm, allergies: e.target.value })}
                           placeholder="e.g. Peanuts, Gluten"
                           className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-xs"
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Preferred Payment</label>
                        <select 
                           value={profileForm.preferred_payment || ''}
                           onChange={(e) => setProfileForm({ ...profileForm, preferred_payment: e.target.value })}
                           className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-xs appearance-none"
                        >
                           <option value="">Select Option</option>
                           <option value="card">Card</option>
                           <option value="qr_code">QR Code</option>
                           <option value="bank_transfer">Bank Transfer</option>
                           <option value="google_pay">Google Pay</option>
                           <option value="apple_pay">Apple Pay</option>
                        </select>
                     </div>
                  </div>
               </div>
               
               {/* Marketing Consent */}
               <div className="flex items-center justify-between bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100/50">
                  <div className="text-left">
                     <span className="text-[11px] font-black uppercase tracking-tight text-text-primary block">Marketing Consent</span>
                     <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Receive exclusive deals and notifications</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                     <input 
                        type="checkbox" 
                        checked={!!profileForm.marketing_consent}
                        onChange={(e) => setProfileForm({ ...profileForm, marketing_consent: e.target.checked })}
                        className="sr-only peer" 
                     />
                     <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                  </label>
               </div>
               
               <div className="flex justify-end">
                  <button 
                     type="submit"
                     className="px-8 py-3.5 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/95 transition-all active:scale-[0.98]"
                  >
                     Save Profile Details
                  </button>
               </div>
            </form>
         </div>
      </section>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
         <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-4 flex items-center gap-2">
               <History className="w-3 h-3" /> Account Management
            </p>
            {menuItems.map(item => (
               <button 
                key={item.id} 
                onClick={() => setActiveModal(item.id)}
                className="w-full card p-4 bg-surface border-none shadow-sm hover:shadow-xl hover:bg-slate-50 transition-all group flex items-center justify-between active:scale-[0.98]"
               >
                  <div className="flex items-center gap-4">
                     <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm", item.color)}>
                        <item.icon className="w-5 h-5" />
                     </div>
                     <span className="text-[11px] font-black uppercase tracking-tight text-text-primary group-hover:text-primary transition-colors">{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
               </button>
            ))}
         </div>

         <div className="space-y-6">
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-4">Quick Shortcuts</p>
               <button 
                 onClick={() => setActiveModal('logout')}
                 className="w-full card p-5 bg-rose-50 border-none shadow-sm hover:shadow-rose-100 hover:bg-rose-100 transition-all group flex items-center justify-between active:scale-[0.98]"
               >
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center text-primary shadow-sm shrink-0">
                        <LogOut className="w-6 h-6" />
                     </div>
                     <div className="text-left">
                        <span className="text-sm font-black uppercase tracking-tight text-rose-900 leading-none block">Sign Out</span>
                        <span className="text-[9px] font-bold text-rose-400 uppercase tracking-widest mt-1.5 block">Terminate your session</span>
                     </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-rose-300 group-hover:translate-x-1 transition-transform" />
               </button>
            </div>

            <div className="p-8 bg-slate-900 text-white border-none rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-2xl" />
               <h4 className="text-lg font-black uppercase tracking-tight leading-none mb-2">Need Assistance?</h4>
               <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest leading-relaxed mb-6">Our concierge team is available 24/7 to help you with your stay.</p>
               <button 
                 onClick={() => navigate('/customer/support')} 
                 className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-all relative z-10"
               >
                  Contact Support <ArrowRight className="w-4 h-4" />
               </button>
            </div>
         </div>
      </div>

      {/* Modals */}
      {activeModal && createPortal(
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-0 sm:p-4">
          <div onClick={() => setActiveModal(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          
          {/* Edit Profile Modal */}
          {activeModal === 'edit-profile' && (
            <div className="relative w-full max-w-[95%] sm:max-w-[500px] bg-surface rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 sm:zoom-in-95 duration-300 self-end sm:self-center flex flex-col max-h-[90vh]">
               <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 shrink-0">
                  <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight">Edit Profile</h3>
                  <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-surface rounded-xl transition-all shadow-sm"><X className="w-5 h-5" /></button>
               </div>
               <form onSubmit={handleProfileSave} className="p-6 sm:p-8 space-y-5 overflow-y-auto scrollbar-hide">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      type="text" required
                      value={profileForm?.name || profileForm?.full_name || ''}
                      onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input 
                      type="email" required
                      value={profileForm?.email || ''}
                      onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                      <input 
                        type="tel" required
                        value={profileForm?.phone || ''}
                        onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preferred Language</label>
                      <select 
                        value={profileForm.language}
                        onChange={(e) => setProfileForm({...profileForm, language: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-xs appearance-none"
                      >
                         <option>English</option>
                         <option>Hindi</option>
                         <option>Spanish</option>
                         <option>French</option>
                      </select>
                    </div>
                  </div>
                  <div className="pt-2 flex gap-4">
                    <button type="button" onClick={() => setActiveModal(null)} className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px]">Cancel</button>
                    <button type="submit" className="flex-1 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/30 active:scale-[0.98] transition-all">Save Changes</button>
                  </div>
               </form>
            </div>
          )}

          {/* Payment Methods Modal */}
          {activeModal === 'payments' && (
            <div className="relative w-full max-w-[95%] sm:max-w-[500px] bg-surface rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 sm:zoom-in-95 duration-300 self-end sm:self-center flex flex-col max-h-[90vh]">
               <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-50 flex justify-between items-center bg-indigo-50/50 shrink-0">
                  <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-indigo-900">Payment Methods</h3>
                  <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-surface rounded-xl transition-all shadow-sm"><X className="w-5 h-5 text-indigo-900" /></button>
               </div>
               <div className="p-6 sm:p-8 space-y-6 overflow-y-auto scrollbar-hide">
                  <div className="space-y-3">
                     {paymentMethods.map(card => (
                       <div key={card.id} className="p-5 bg-surface border border-slate-100 rounded-2xl shadow-sm flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-8 bg-slate-900 rounded-md flex items-center justify-center text-[8px] font-bold text-white uppercase">{card.type}</div>
                             <div>
                                <p className="text-sm font-black text-text-primary leading-none">•••• •••• •••• {card.last4}</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Expires {card.expiry} {card.isDefault && <span className="text-emerald-500 ml-2">• Default</span>}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-2">
                             {!card.isDefault && (
                               <button 
                                onClick={() => setPaymentMethods(prev => prev.map(c => ({...c, isDefault: c.id === card.id})))}
                                className="p-2 text-slate-300 hover:text-emerald-500 transition-colors"
                               >
                                  <Star className="w-4 h-4" />
                               </button>
                             )}
                             <button 
                              onClick={() => setPaymentMethods(prev => prev.filter(c => c.id !== card.id))}
                              className="p-2 text-slate-300 hover:text-primary transition-colors"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                       </div>
                     ))}
                  </div>
                  
                  <div className="pt-4 border-t border-slate-50">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Add New Card</p>
                     <div className="grid grid-cols-2 gap-4 mb-4">
                        <input 
                          placeholder="Card Number" 
                          maxLength={16}
                          value={newCard.last4}
                          onChange={(e) => setNewCard({...newCard, last4: e.target.value.slice(-4)})}
                          className="w-full px-5 py-3 bg-slate-50 border border-transparent rounded-xl outline-none font-bold text-xs"
                        />
                        <input 
                          placeholder="MM/YY" 
                          maxLength={5}
                          value={newCard.expiry}
                          onChange={(e) => setNewCard({...newCard, expiry: e.target.value})}
                          className="w-full px-5 py-3 bg-slate-50 border border-transparent rounded-xl outline-none font-bold text-xs"
                        />
                     </div>
                     <button 
                      onClick={() => {
                        if (!newCard.last4 || !newCard.expiry) return showToast('Fill card details', 'error');
                        setPaymentMethods([...paymentMethods, { ...newCard, id: Date.now(), isDefault: false }]);
                        setNewCard({ type: 'Visa', last4: '', expiry: '' });
                        showToast('Card added!');
                      }}
                      className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-100"
                     >
                        Add Card Method
                     </button>
                  </div>
               </div>
            </div>
          )}

          {/* Address Book Modal */}
          {activeModal === 'addresses' && (
            <div className="relative w-full max-w-[95%] sm:max-w-[500px] bg-surface rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 sm:zoom-in-95 duration-300 self-end sm:self-center flex flex-col max-h-[90vh]">
               <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-50 flex justify-between items-center bg-rose-50/50 shrink-0">
                  <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-rose-900">Address Book</h3>
                  <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-surface rounded-xl transition-all shadow-sm"><X className="w-5 h-5 text-rose-900" /></button>
               </div>
               <div className="p-6 sm:p-8 space-y-6 overflow-y-auto scrollbar-hide">
                  <div className="space-y-3">
                     {addresses.map(addr => (
                       <div key={addr.id} className="p-5 bg-surface border border-slate-100 rounded-2xl shadow-sm flex items-start justify-between group">
                          <div className="flex items-start gap-4">
                             <div className="w-10 h-10 bg-rose-50 text-primary rounded-xl flex items-center justify-center shrink-0">
                                <MapPin className="w-5 h-5" />
                             </div>
                             <div>
                                <p className="text-xs font-black text-text-primary uppercase tracking-tight leading-none">{addr.label} {addr.isDefault && <span className="text-[8px] text-emerald-500 ml-2 font-black">• Default</span>}</p>
                                <p className="text-[10px] font-medium text-slate-400 mt-2 leading-relaxed">{addr.address}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-1">
                             <button 
                              onClick={() => setAddresses(prev => prev.filter(a => a.id !== addr.id))}
                              className="p-2 text-slate-300 hover:text-primary transition-colors"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                       </div>
                     ))}
                  </div>
                  
                  <div className="pt-4 border-t border-slate-50 space-y-4">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add New Address</p>
                     <input 
                       placeholder="Label (e.g. Home, Work)" 
                       value={newAddress.label}
                       onChange={(e) => setNewAddress({...newAddress, label: e.target.value})}
                       className="w-full px-5 py-3 bg-slate-50 border border-transparent rounded-xl outline-none font-bold text-xs"
                     />
                     <textarea 
                       placeholder="Full Address Details..." 
                       value={newAddress.address}
                       onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                       className="w-full px-5 py-3 bg-slate-50 border border-transparent rounded-xl outline-none font-bold text-xs min-h-[80px] resize-none"
                     />
                     <button 
                      onClick={() => {
                        if (!newAddress.label || !newAddress.address) return showToast('Fill address details', 'error');
                        setAddresses([...addresses, { ...newAddress, id: Date.now(), isDefault: false }]);
                        setNewAddress({ label: '', address: '' });
                        showToast('Address saved!');
                      }}
                      className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-rose-100"
                     >
                        Save New Address
                     </button>
                  </div>
               </div>
            </div>
          )}

          {/* Notifications Modal */}
          {activeModal === 'notifs' && (
            <div className="relative w-full max-w-[95%] sm:max-w-[450px] bg-surface rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 sm:zoom-in-95 duration-300 self-end sm:self-center flex flex-col max-h-[90vh]">
               <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-50 flex justify-between items-center bg-orange-50/50 shrink-0">
                  <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-orange-900">Notifications</h3>
                  <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-surface rounded-xl transition-all shadow-sm"><X className="w-5 h-5 text-orange-900" /></button>
               </div>
               <div className="p-6 sm:p-8 space-y-6 overflow-y-auto scrollbar-hide">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notification & Marketing Preferences</p>
                  <div className="space-y-4">
                     {[
                       { key: 'orders', label: 'Order Updates', desc: 'Real-time kitchen & delivery status' },
                       { key: 'reservations', label: 'Reservations', desc: 'Booking confirmations & reminders' },
                       { key: 'roomService', label: 'Room Service', desc: 'Concierge request status updates' },
                       { key: 'offers', label: 'Offers & Promos', desc: 'Personalized discounts & news' },
                       { key: 'emailPromos', label: 'Email Promotions', desc: 'Promotional campaigns via email' },
                       { key: 'smsNotifs', label: 'SMS Notifications', desc: 'Instant alerts on your phone' },
                       { key: 'whatsappNotifs', label: 'WhatsApp Updates', desc: 'Direct messages & support' },
                       { key: 'pushNotifs', label: 'Push Notifications', desc: 'On-device notification popups' },
                       { key: 'specialOffers', label: 'Special Offers', desc: 'Exclusive VIP discounts' },
                       { key: 'birthdayOffers', label: 'Birthday Offers', desc: 'Yearly birthday gifts & treats' },
                       { key: 'newsletter', label: 'Newsletter', desc: 'Monthly roundup of Gila House' }
                     ].map(pref => (
                       <div key={pref.key} className="flex items-center justify-between group">
                          <div>
                             <p className="text-xs font-black text-text-primary uppercase tracking-tight">{pref.label}</p>
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{pref.desc}</p>
                          </div>
                          <button 
                            onClick={() => setNotificationPrefs({...notificationPrefs, [pref.key]: !notificationPrefs[pref.key]})}
                            className={cn(
                              "w-12 h-6 rounded-full relative transition-all duration-300",
                              notificationPrefs[pref.key] ? "bg-primary" : "bg-slate-200"
                            )}
                          >
                             <div className={cn(
                               "absolute top-1 w-4 h-4 bg-surface rounded-full transition-all duration-300 shadow-sm",
                               notificationPrefs[pref.key] ? "left-7" : "left-1"
                             )} />
                          </button>
                       </div>
                     ))}
                  </div>
                  <button 
                    onClick={() => { setActiveModal(null); showToast('Preferences updated!'); }}
                    className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-orange-100"
                  >
                     Apply Preferences
                  </button>
               </div>
            </div>
          )}

          {/* Privacy & Security Modal */}
          {activeModal === 'privacy' && (
            <div className="relative w-full max-w-[500px] bg-surface rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 sm:zoom-in-95 duration-300 self-end sm:self-center">
               <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-emerald-50/50">
                  <h3 className="text-xl font-black uppercase tracking-tight text-emerald-900">Security Center</h3>
                  <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-surface rounded-xl transition-all shadow-sm"><X className="w-5 h-5 text-emerald-900" /></button>
               </div>
               <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
                  {/* Change Password */}
                  <div className="space-y-4">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Lock className="w-3 h-3" /> Update Password
                     </p>
                     {passwordStatus.success ? (
                        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl text-center">
                           <p className="font-bold text-sm">Password updated successfully!</p>
                           <p className="text-xs mt-1">Redirecting to login...</p>
                        </div>
                     ) : (
                        <form onSubmit={handlePasswordChange} className="space-y-3">
                           {passwordStatus.error && (
                              <div className="bg-rose-50 text-rose-500 p-3 rounded-xl text-xs font-semibold">
                                 {passwordStatus.error}
                              </div>
                           )}

                           <input 
                            type="password" 
                            required
                            minLength={6}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            placeholder="New Password" 
                            className="w-full px-5 py-3 bg-slate-50 border border-transparent rounded-xl outline-none font-bold text-xs" 
                           />
                           <button 
                            type="submit" 
                            disabled={passwordStatus.loading}
                            className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-[9px] shadow-lg shadow-emerald-100 disabled:opacity-50 flex items-center justify-center gap-2"
                           >
                              {passwordStatus.loading ? (
                                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : 'Change Password'}
                           </button>
                        </form>
                     )}
                  </div>

                  {/* 2FA */}
                  <div className="p-5 bg-slate-50 rounded-3xl flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                           <Shield className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-xs font-black text-emerald-900 uppercase tracking-tight leading-none">Two-Factor Auth</p>
                           <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest mt-1.5">Disabled • Recommended</p>
                        </div>
                     </div>
                     <button className="px-4 py-2 bg-emerald-100 text-emerald-600 rounded-lg text-[8px] font-black uppercase tracking-widest">Enable</button>
                  </div>

                  {/* Sessions */}
                  <div className="space-y-4">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Active Sessions</p>
                     <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-surface border border-slate-100 rounded-2xl">
                           <div className="flex items-center gap-4">
                              <Smartphone className="w-5 h-5 text-slate-300" />
                              <div>
                                 <p className="text-[10px] font-black text-text-primary uppercase tracking-tight">iPhone 14 Pro • Current</p>
                                 <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Mumbai, India • Active now</p>
                              </div>
                           </div>
                           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <button className="w-full py-3 text-[9px] font-black text-primary uppercase tracking-widest hover:bg-rose-50 rounded-xl transition-all">Logout all other sessions</button>
                     </div>
                  </div>
               </div>
            </div>
          )}


          {/* Logout Confirmation Modal */}
          {activeModal === 'logout' && (
            <div className="relative w-full max-w-[400px] bg-surface rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl p-8 text-center space-y-6 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 sm:zoom-in-95 duration-300 self-end sm:self-center">
               <div className="w-20 h-20 bg-rose-50 text-primary rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                  <LogOut className="w-8 h-8" />
               </div>
               <div>
                 <h3 className="text-xl font-black uppercase tracking-tight">Ready to leave?</h3>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 leading-relaxed">Are you sure you want to sign out of your account?</p>
               </div>
               <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleSignOut}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-rose-100 active:scale-[0.98] transition-all"
                  >
                    Confirm Logout
                  </button>
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-[0.98] transition-all"
                  >
                    Stay Logged In
                  </button>
               </div>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

export default CustomerProfile;
