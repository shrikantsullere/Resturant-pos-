import React, { useState, useEffect } from 'react';
import { Award, ChevronLeft, Gift, Sparkles, AlertCircle, Calendar, Star, Send } from 'lucide-react';
import { useCustomer } from "../../../context/CustomerContext";
import { useNavigate } from 'react-router-dom';
import { cn } from "../../../utils/cn";
import api from "../../../services/api";
import { createPortal } from 'react-dom';

const CustomerRewards = () => {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useCustomer();
  const [toast, setToast] = useState(null);
  const [redeemSuccess, setRedeemSuccess] = useState(null);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loyaltyPoints = profile?.loyalty_points || 0;
  const currentTier = profile?.membership_type || 'regular';

  // Define tier details
  const tiers = {
    regular: { name: 'Regular', next: 'Silver', nextPoints: 100, color: 'text-slate-400 bg-slate-50 border-slate-200' },
    silver: { name: 'Silver', next: 'Gold', nextPoints: 300, color: 'text-slate-600 bg-slate-50 border-slate-200' },
    gold: { name: 'Gold', next: 'Platinum', nextPoints: 1000, color: 'text-amber-500 bg-amber-50 border-amber-200' },
    platinum: { name: 'Platinum', next: 'None', nextPoints: 0, color: 'text-primary bg-orange-50 border-orange-200' }
  };

  const currentTierInfo = tiers[currentTier.toLowerCase()] || tiers.regular;
  const progressPercent = currentTierInfo.nextPoints > 0 
    ? Math.min(100, (loyaltyPoints / currentTierInfo.nextPoints) * 100)
    : 100;

  const [coupons, setCoupons] = useState([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(true);
  const [happyHourTimeLeft, setHappyHourTimeLeft] = useState(null);

  useEffect(() => {
    let expiry = localStorage.getItem('gila_house_happyhour_expiry');
    if (!expiry) {
      expiry = String(Date.now() + 120 * 1000);
      localStorage.setItem('gila_house_happyhour_expiry', expiry);
    }

    const calculateTimeLeft = () => {
      const diff = parseInt(expiry) - Date.now();
      return Math.max(0, Math.floor(diff / 1000));
    };

    setHappyHourTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const left = calculateTimeLeft();
      setHappyHourTimeLeft(left);
      if (left <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await api.get('/coupons');
      if (response.data.success) {
        // Filter only active coupons
        setCoupons(response.data.data.filter(c => c.is_active));
      }
    } catch (err) {
      console.error('Failed to fetch coupons:', err);
    } finally {
      setIsLoadingCoupons(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleRedeemReward = async (reward) => {
    if (isRedeeming) return;
    setIsRedeeming(true);
    try {
      const response = await api.post('/customer/redeem', {
        rewardTitle: reward.title,
        pointsCost: reward.points
      });
      if (response.data.success) {
        const data = response.data.data;
        setRedeemSuccess({
          couponCode: data.couponCode,
          rewardTitle: reward.title
        });
        await refreshProfile();
        await fetchCoupons();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to redeem reward');
    } finally {
      setIsRedeeming(false);
    }
  };

  const redeemableRewards = [
    { title: 'Free Signature Mojito', points: 50, icon: '🍹' },
    { title: 'Free Molten Lava Cake', points: 80, icon: '🍰' },
    { title: 'Rp 50.000 Discount Voucher', points: 150, icon: '💵' },
    { title: 'Free Premium Pizza', points: 250, icon: '🍕' }
  ];

  return (
    <div className="space-y-6 lg:space-y-8 relative">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[999] bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-black uppercase tracking-widest">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 px-1">
         <button onClick={() => navigate(-1)} className="p-2.5 bg-surface rounded-xl shadow-sm border border-slate-100 lg:hidden">
            <ChevronLeft className="w-5 h-5 text-text-primary" />
         </button>
         <h2 className="text-xl lg:text-2xl font-black text-text-primary uppercase tracking-tight">Loyalty & Rewards</h2>
      </div>

      {/* Tier Progress Card */}
      <div className="card p-6 lg:p-8 bg-surface border-none shadow-xl shadow-slate-100/50 rounded-3xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4 flex-1">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                     <Award className="w-6 h-6" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Your Membership</p>
                     <h3 className="text-2xl font-black text-text-primary uppercase tracking-tight leading-none">{currentTierInfo.name} Tier</h3>
                  </div>
               </div>
               
               {currentTierInfo.nextPoints > 0 ? (
                 <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                       <span>Progress to {currentTierInfo.next}</span>
                       <span className="text-primary font-black">{loyaltyPoints} / {currentTierInfo.nextPoints} Points</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50 shadow-inner">
                       <div className="h-full bg-gradient-to-r from-orange-400 to-primary rounded-full transition-all duration-1000 shadow-sm" style={{ width: `${progressPercent}%` }} />
                    </div>
                 </div>
               ) : (
                 <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">🏆 You have reached the highest tier!</p>
               )}
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center shrink-0 min-w-[150px] shadow-inner">
               <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Total Points</span>
               <h2 className="text-4xl font-black text-text-primary tracking-tighter mt-1">{loyaltyPoints}</h2>
               <span className="text-primary font-black uppercase text-[9px] tracking-widest block mt-2">Gila Points</span>
            </div>
         </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Coupons */}
         <div className="space-y-4">
            <h3 className="text-lg font-black uppercase tracking-tight px-1">Your Coupons & Offers</h3>
            {isLoadingCoupons ? (
                <div className="card p-8 bg-surface border-none shadow-xl shadow-slate-100/50 rounded-3xl text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading offers...</p>
                </div>
              ) : coupons.length === 0 ? (
                <div className="card p-8 bg-surface border-none shadow-xl shadow-slate-100/50 rounded-3xl text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No active offers right now.</p>
                </div>
              ) : (
               <div className="space-y-4">
                {coupons.filter(c => c.code !== 'HAPPYHOUR' || (happyHourTimeLeft !== null && happyHourTimeLeft > 0)).map(coupon => {
                  const isFlat = coupon.discount_type === 'flat';
                  const discountText = isFlat ? `₹${parseFloat(coupon.discount_value)} OFF` : `${parseFloat(coupon.discount_value)}% OFF`;
                  const minOrder = parseFloat(coupon.min_order_amount) > 0 ? ` on orders above ₹${parseFloat(coupon.min_order_amount)}` : '';
                  const maxDiscount = (!isFlat && parseFloat(coupon.max_discount_amount) > 0) ? ` (Max ₹${parseFloat(coupon.max_discount_amount)})` : '';
                  
                  const isHappyHour = coupon.code === 'HAPPYHOUR';
                  const formattedTimeLeft = isHappyHour && happyHourTimeLeft !== null
                    ? `${Math.floor(happyHourTimeLeft / 60)}m ${happyHourTimeLeft % 60}s`
                    : null;
                  
                  return (
                  <div key={coupon.code} className="card p-5 bg-surface border-none shadow-xl shadow-slate-100/50 rounded-3xl flex items-center justify-between gap-4 group">
                     <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                           <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black rounded uppercase tracking-widest">{isFlat ? 'FLAT DISCOUNT' : 'PERCENTAGE'}</span>
                           <span className={cn(
                             "text-[9px] font-black uppercase tracking-widest flex items-center gap-1",
                             isHappyHour ? "text-rose-500 bg-rose-50 px-2 py-0.5 rounded border border-rose-100/50" : "text-slate-300"
                           )}>
                             {isHappyHour ? `Expires in ${formattedTimeLeft}` : 'Active'}
                           </span>
                        </div>
                       <h4 className="font-black text-text-primary uppercase tracking-tight">{discountText}</h4>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Valid{minOrder}{maxDiscount}</p>
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(coupon.code);
                        showToast(`Copied code: ${coupon.code}`);
                      }}
                      className="px-4 py-2.5 bg-slate-50 hover:bg-primary hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-100 transition-all flex items-center gap-1.5 shrink-0"
                    >
                       Copy <span className="font-black text-primary group-hover:text-white">{coupon.code}</span>
                    </button>
                 </div>
                 );
               })}
               </div>
              )}
         </div>

         {/* Redeemable Rewards */}
         <div className="space-y-4">
            <h3 className="text-lg font-black uppercase tracking-tight px-1">Redeem Rewards</h3>
            <div className="space-y-4">
               {redeemableRewards.map(reward => {
                 const canRedeem = loyaltyPoints >= reward.points;
                 return (
                   <div key={reward.title} className="card p-5 bg-surface border-none shadow-xl shadow-slate-100/50 rounded-3xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl shadow-inner shrink-0">
                            {reward.icon}
                         </div>
                         <div>
                            <h4 className="font-black text-text-primary uppercase tracking-tight text-sm leading-tight">{reward.title}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Cost: {reward.points} Points</p>
                         </div>
                      </div>
                      <button 
                        disabled={!canRedeem || isRedeeming}
                        onClick={() => handleRedeemReward(reward)}
                        className={cn(
                          "px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                          canRedeem 
                            ? "bg-primary text-white shadow-lg shadow-primary/20 active:scale-95 cursor-pointer" 
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        )}
                      >
                         Redeem
                      </button>
                   </div>
                 );
               })}
            </div>
         </div>
      </div>

      {/* Referral bonus */}
      <div className="card p-6 bg-surface border-none shadow-xl shadow-slate-100/50 rounded-3xl text-center max-w-xl mx-auto space-y-4">
         <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-500 flex items-center justify-center mx-auto shadow-sm">
            <Gift className="w-6 h-6" />
         </div>
         <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">Refer A Friend</h3>
         <p className="text-xs text-slate-400 font-medium max-w-md mx-auto leading-relaxed">
            Invite your friends to dine at Gila House. You both get <span className="text-primary font-black">50 Reward Points</span> once they complete their first booking.
         </p>
         <button 
           onClick={() => showToast('Referral link copied!')}
           className="btn-premium px-8 py-3.5 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/10 flex items-center justify-center gap-2 mx-auto"
         >
            Share Invitation Link <Send className="w-3.5 h-3.5" />
         </button>
      </div>
      {/* Redeem Success Modal */}
      {redeemSuccess && createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div 
            onClick={() => setRedeemSuccess(null)} 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
          />
          <div className="relative w-full max-w-sm bg-surface rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-amber-50 rounded-[2rem] flex items-center justify-center text-amber-500 mb-6 shadow-inner">
               <Gift className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">Reward Redeemed!</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 max-w-[250px] leading-relaxed">
              Your points have been deducted. Use the promo code below at checkout:
            </p>
            <div className="mt-6 w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between gap-4">
               <span className="font-black text-text-primary tracking-widest text-sm uppercase">{redeemSuccess.couponCode}</span>
               <button 
                 onClick={() => {
                   navigator.clipboard.writeText(redeemSuccess.couponCode);
                   showToast(`Copied code: ${redeemSuccess.couponCode}`);
                 }}
                 className="px-3.5 py-2 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:scale-105 active:scale-95 transition-all"
               >
                 Copy
               </button>
            </div>
            <button 
              onClick={() => setRedeemSuccess(null)}
              className="mt-8 w-full py-4 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Done
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CustomerRewards;
