import React, { useState } from 'react';
import { Settings, ChevronLeft, Globe, DollarSign, Bell, Shield, Sparkles, Moon, Sun, Trash2, CheckCircle2 } from 'lucide-react';
import { useCustomer } from "../../../context/CustomerContext";
import { useNavigate } from 'react-router-dom';
import { cn } from "../../../utils/cn";
import { getTranslation as t } from "../../../utils/translationUtils";

const CustomerSettings = () => {
  const navigate = useNavigate();
  const { systemSettings, setSystemSettings, notificationPrefs, setNotificationPrefs } = useCustomer();
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLanguageChange = (lang) => {
    setSystemSettings({ ...systemSettings, language: lang });
    showToast(`Language updated to ${lang}`);
  };

  const handleCurrencyChange = (curr) => {
    setSystemSettings({ ...systemSettings, currency: curr });
    showToast(`Currency updated to ${curr}`);
  };

  const handleThemeChange = (theme) => {
    setSystemSettings({ ...systemSettings, theme: theme });
    // Simulate updating document element theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    showToast(`Theme updated to ${theme} mode`);
  };

  const toggleNotif = (key, label) => {
    setNotificationPrefs({ ...notificationPrefs, [key]: !notificationPrefs[key] });
    showToast(`${label} settings updated`);
  };

  const handleResetSettings = () => {
    setSystemSettings({ theme: 'light', language: 'English', currency: 'USD' });
    document.documentElement.classList.remove('dark');
    showToast('Local settings reset to defaults');
  };

  return (
    <div className="space-y-6 lg:space-y-8 relative">
      {/* Toast Feedback */}
      {toast && (
        <div className="fixed top-6 right-6 z-[999] bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-black uppercase tracking-widest">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 px-1">
         <button onClick={() => navigate(-1)} className="p-2.5 bg-surface rounded-xl shadow-sm border border-slate-100 lg:hidden">
            <ChevronLeft className="w-5 h-5 text-text-primary" />
         </button>
         <h2 className="text-xl lg:text-2xl font-black text-text-primary uppercase tracking-tight">{t('Settings', systemSettings.language)}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Left Column: UI Preferences */}
         <div className="space-y-6">
            {/* Theme & Display */}
            <div className="card p-6 bg-surface border border-slate-50 shadow-xl shadow-slate-100/50 rounded-3xl space-y-4">
               <div className="flex items-center gap-3 text-primary">
                  <Sun className="w-5 h-5" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-text-primary">{t('Theme & Appearance', systemSettings.language)}</h3>
               </div>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">{t('Choose your preferred reading mode for Gila House customer portal.', systemSettings.language)}</p>
               <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={() => handleThemeChange('light')}
                    className={cn(
                      "p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all active:scale-[0.98]",
                      systemSettings.theme === 'light' ? "border-primary bg-primary/5 text-primary" : "border-transparent bg-slate-50 text-slate-400 hover:bg-slate-100"
                    )}
                  >
                     <Sun className="w-6 h-6" />
                     <span className="text-[10px] font-black uppercase tracking-widest">{t('Light Mode', systemSettings.language)}</span>
                  </button>

                  <button 
                    onClick={() => handleThemeChange('dark')}
                    className={cn(
                      "p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all active:scale-[0.98]",
                      systemSettings.theme === 'dark' ? "border-primary bg-primary/5 text-primary" : "border-transparent bg-slate-50 text-slate-400 hover:bg-slate-100"
                    )}
                  >
                     <Moon className="w-6 h-6" />
                     <span className="text-[10px] font-black uppercase tracking-widest">{t('Dark Mode', systemSettings.language)}</span>
                  </button>
               </div>
            </div>

            {/* Regional Settings */}
            <div className="card p-6 bg-surface border border-slate-50 shadow-xl shadow-slate-100/50 rounded-3xl space-y-4">
               <div className="flex items-center gap-3 text-primary">
                  <Globe className="w-5 h-5" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-text-primary">{t('Regional & Language', systemSettings.language)}</h3>
               </div>
               
               {/* Language */}
               <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">{t('Preferred Language', systemSettings.language)}</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                     {['English', 'Indonesian', 'Spanish', 'Hindi'].map(lang => (
                       <button
                         key={lang}
                         onClick={() => handleLanguageChange(lang)}
                         className={cn(
                           "py-2.5 rounded-xl border font-bold text-[10px] uppercase tracking-wider transition-all",
                           systemSettings.language === lang ? "bg-primary text-white border-primary" : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100"
                         )}
                       >
                          {lang}
                       </button>
                     ))}
                  </div>
               </div>

               {/* Currency */}
               <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">{t('Display Currency', systemSettings.language)}</span>
                  <div className="grid grid-cols-4 gap-2">
                     {['USD', 'IDR', 'EUR', 'GBP'].map(curr => (
                       <button
                         key={curr}
                         onClick={() => handleCurrencyChange(curr)}
                         className={cn(
                           "py-2.5 rounded-xl border font-bold text-[10px] uppercase tracking-wider transition-all",
                           systemSettings.currency === curr ? "bg-primary text-white border-primary" : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100"
                         )}
                       >
                          {curr}
                       </button>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         {/* Right Column: Notifications & Security */}
         <div className="space-y-6">
            {/* Notification settings */}
            <div className="card p-6 bg-surface border border-slate-50 shadow-xl shadow-slate-100/50 rounded-3xl space-y-4">
               <div className="flex items-center gap-3 text-primary">
                  <Bell className="w-5 h-5" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-text-primary">{t('Consent & Channels', systemSettings.language)}</h3>
               </div>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">{t('Toggle marketing consents and active messaging channels.', systemSettings.language)}</p>
               <div className="space-y-4 pt-2">
                  {[
                    { key: 'emailPromos', label: 'Email Campaigns', desc: 'Newsletter & promo mails' },
                    { key: 'smsNotifs', label: 'SMS Messages', desc: 'Table status & queue updates' },
                    { key: 'whatsappNotifs', label: 'WhatsApp Alerts', desc: 'Direct support & reservations' },
                    { key: 'pushNotifs', label: 'Push Notifications', desc: 'On-device notification alerts' },
                    { key: 'specialOffers', label: 'Special Offers', desc: 'Personalized exclusive discounts' },
                    { key: 'birthdayOffers', label: 'Birthday Rewards', desc: 'Annual birthday gifts' },
                    { key: 'newsletter', label: 'Newsletter', desc: 'Monthly roundups of Gila House' }
                  ].map(pref => (
                    <div key={pref.key} className="flex items-center justify-between group">
                       <div>
                          <p className="text-xs font-black text-text-primary uppercase tracking-tight">{t(pref.label, systemSettings.language)}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t(pref.desc, systemSettings.language)}</p>
                       </div>
                       <button 
                         onClick={() => toggleNotif(pref.key, pref.label)}
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
            </div>

            {/* Danger Zone */}
            <div className="card p-6 bg-surface border border-rose-50 shadow-xl shadow-rose-50/50 rounded-3xl space-y-4">
               <div className="flex items-center gap-3 text-rose-500">
                  <Shield className="w-5 h-5" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-rose-800">{t('Advanced Controls', systemSettings.language)}</h3>
               </div>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">{t('Restore your app client settings or reset themes.', systemSettings.language)}</p>
               <button 
                 onClick={handleResetSettings}
                 className="flex items-center justify-center gap-2 px-5 py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all w-full shadow-sm"
               >
                  <Trash2 className="w-4 h-4" /> {t('Reset Settings to Default', systemSettings.language)}
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default CustomerSettings;
