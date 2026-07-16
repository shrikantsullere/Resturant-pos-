import { formatCurrency } from '../../../utils/currencyUtils';
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  UtensilsCrossed, 
  Star, 
  Clock, 
  ChevronRight, 
  Sparkles,
  ShoppingBag,
  History,
  Tag,
  MapPin,
  Bell,
  Heart,
  Award,
  CalendarCheck,
  ShoppingCart,
  User,
  HelpCircle,
  Activity,
  CreditCard
} from 'lucide-react';
import { cn } from "../../../utils/cn";
import { useMenu, categoryIconMap } from "@/context/MenuContext";
import { useCustomer } from "../../../context/CustomerContext";
import { useOrders } from "@/context/OrdersContext";
import { useHospitality } from "../../../context/HospitalityContext";
import { useNavigate, useLocation } from 'react-router-dom';

const CustomerHome = () => {
  const { items, categoriesList } = useMenu();
  const { favorites, toggleFavorite, profile, updateProfile } = useCustomer();
  const { orders } = useOrders();
  const { reservations } = useHospitality();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  // Handle Smart QR Routing
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tableParam = params.get('table');
    const roomParam = params.get('room');

    if (tableParam) {
      const cleanTable = tableParam.replace('T-', '');
      if (profile?.tableId !== cleanTable) {
        updateProfile({ tableId: cleanTable, diningType: 'Dine-in' });
        // Optional: show welcome toast
      }
    } else if (roomParam) {
      if (profile?.tableId !== roomParam) {
        updateProfile({ tableId: roomParam, diningType: 'Room Service' });
      }
    }
  }, [location.search]);

  const recommendedItems = items.filter(item => item.id <= 4);
  const todaysOffers = [
    { title: 'Free Dessert', desc: 'On your first order today', color: 'from-primary to-primary-hover', icon: '🍰', action: () => navigate('/customer/order-now') },
    { title: 'Happy Hours', desc: '20% off on all mocktails', color: 'from-mint-dark to-success', icon: '🍹', action: () => navigate('/customer/order-now?category=Drinks') }
  ];

  // Get most recent active order for this customer/table
  const activeOrder = orders.find(o => 
    (o.customer === (profile?.full_name || profile?.name) || o.table === `T-${profile?.tableId}`) && 
    ['Pending', 'New', 'Cooking', 'Ready'].includes(o.status)
  );

  // Get upcoming reservation
  const customerReservations = reservations.filter(res => {
    const userName = profile?.full_name || profile?.name;
    return res.guestName === userName && res.type !== 'Transport';
  });
  
  const upcomingReservation = customerReservations.find(res => 
    ['Confirmed', 'Pending'].includes(res.status)
  );

  return (
    <div className="space-y-6 lg:space-y-8 pb-20 lg:pb-0">
      {/* Header / Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center flex-wrap gap-2 mb-3">
            <span className="badge bg-primary/10 text-primary border-none px-3 py-1 font-black text-[9px] lg:text-[10px] uppercase tracking-widest leading-none">
              {profile?.diningType || 'Dine-in'} • Table {profile?.tableId || '...'}
            </span>
            <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-xl lg:text-3xl font-black text-text-primary tracking-tight leading-tight uppercase">
            Good Afternoon, <br className="xs:hidden" /><span className="text-primary">{(profile?.full_name || profile?.name || 'Guest').split(' ')[0]}!</span>
          </h1>
          <p className="text-text-secondary mt-1 lg:mt-2 text-[10px] lg:text-sm font-medium">What's on your mind today? 🍕</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 bg-surface rounded-2xl shadow-sm border border-slate-100 text-text-secondary hover:text-primary relative group">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white shadow-sm" />
          </button>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        {/* Loyalty Points */}
        <div className="card p-5 bg-surface border-none shadow-xl shadow-slate-100/50 rounded-3xl flex items-center gap-4 hover:shadow-premium-hover transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Loyalty Points</p>
            <h4 className="text-xl font-black text-text-primary tracking-tight leading-none">
              {profile?.loyalty_points || 0} <span className="text-xs font-bold text-slate-400">pts</span>
            </h4>
            <p className="text-[9px] font-black text-amber-600 uppercase tracking-wider mt-1">
              {profile?.membership_type ? profile.membership_type.toUpperCase() + " Tier" : "Regular Tier"}
            </p>
          </div>
        </div>

        {/* Active Order Status */}
        <div className="card p-5 bg-surface border-none shadow-xl shadow-slate-100/50 rounded-3xl flex items-center gap-4 hover:shadow-premium-hover transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-primary">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Order</p>
            <h4 className="text-xl font-black text-text-primary tracking-tight leading-none">
              {activeOrder ? activeOrder.status : 'No Active Order'}
            </h4>
            <p 
              onClick={() => activeOrder && navigate('/customer/orders')}
              className={cn("text-[9px] font-black uppercase tracking-wider mt-1 cursor-pointer hover:underline", activeOrder ? "text-primary" : "text-slate-400")}
            >
              {activeOrder ? `Track Order #${activeOrder.order_number}` : 'Order now'}
            </p>
          </div>
        </div>

        {/* Active Reservation */}
        <div className="card p-5 bg-surface border-none shadow-xl shadow-slate-100/50 rounded-3xl flex items-center gap-4 hover:shadow-premium-hover transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Reservation</p>
            <h4 className="text-xl font-black text-text-primary tracking-tight leading-none truncate max-w-[150px]">
              {upcomingReservation ? `Table ${upcomingReservation.targetId}` : 'No Booking'}
            </h4>
            <p 
              onClick={() => navigate('/customer/reservations')}
              className={cn("text-[9px] font-black uppercase tracking-wider mt-1 cursor-pointer hover:underline", upcomingReservation ? "text-emerald-600" : "text-slate-400")}
            >
              {upcomingReservation ? `${upcomingReservation.time.slice(0, 5)} on ${new Date(upcomingReservation.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}` : 'Book a table'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-black uppercase tracking-tight px-1">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'View Menu', desc: 'Browse the food items', icon: UtensilsCrossed, path: '/customer/order-now', color: 'bg-orange-500/10 text-orange-500' },
            { name: 'Order Now', desc: 'Place a new order', icon: ShoppingCart, path: '/customer/order-now', color: 'bg-emerald-500/10 text-emerald-500' },
            { name: 'My Orders', desc: 'Track & history', icon: History, path: '/customer/orders', color: 'bg-indigo-500/10 text-primary' },
            { name: 'Payments', desc: 'Settle invoices', icon: CreditCard, path: '/customer/payments', color: 'bg-blue-500/10 text-blue-500' },
            { name: 'Reservations', desc: 'Book a table', icon: CalendarCheck, path: '/customer/reservations', color: 'bg-amber-500/10 text-amber-500' },
            { name: 'Favorites', desc: 'Saved dishes', icon: Heart, path: '/customer/favorites', color: 'bg-rose-500/10 text-rose-500' }
          ].map((act) => (
            <div 
              key={act.name}
              onClick={() => navigate(act.path)}
              className="card group cursor-pointer border-none shadow-xl shadow-slate-100/50 p-5 bg-surface hover:bg-slate-50 transition-all active:scale-[0.98] rounded-3xl flex flex-col items-center text-center gap-3"
            >
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300", act.color)}>
                <act.icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-text-primary text-xs uppercase tracking-tight leading-tight">{act.name}</h4>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{act.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global Search */}
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search food, drinks, desserts..." 
          className="w-full pl-14 pr-6 py-4 lg:py-5 bg-surface border-2 border-slate-50 focus:border-primary focus:bg-surface rounded-2xl lg:rounded-3xl outline-none shadow-xl shadow-slate-100/50 text-sm font-bold transition-all"
        />
      </div>

      {/* Featured Promo / Today's Special Banner */}
      <div className="card p-6 lg:p-10 bg-surface border-none shadow-2xl shadow-slate-100/50 rounded-[2.5rem] lg:rounded-[3rem] relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 lg:gap-12">
            <div className="flex-1 space-y-4 lg:space-y-6 text-center md:text-left">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  <Sparkles className="w-3 h-3" /> Today's Special
               </div>
               <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-text-primary uppercase tracking-tighter leading-[1] lg:leading-[0.9]">
                  Freshly <span className="text-primary">Prepared</span> <br /> Meals for you.
               </h2>
               <p className="text-xs lg:text-sm text-slate-400 font-medium max-w-sm mx-auto md:mx-0 leading-relaxed">
                  Discover our chef's latest creations and seasonal favorites. Healthy, delicious, and made with love.
               </p>
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                  <button 
                    onClick={() => navigate('/customer/order-now')}
                    className="btn-primary px-8 py-3.5 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all"
                  >
                    Order Now
                  </button>
                  <div className="flex -space-x-3">
                     {[1, 2, 3].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs shadow-sm">
                           {i === 1 ? '🍕' : i === 2 ? '🍔' : '🥗'}
                        </div>
                     ))}
                     <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm">
                        +10
                     </div>
                  </div>
               </div>
            </div>
            <div className="w-40 h-40 sm:w-48 sm:h-48 lg:w-72 lg:h-72 bg-mint-dark/5 rounded-[2.5rem] sm:rounded-[3rem] lg:rounded-[4rem] flex items-center justify-center text-7xl sm:text-8xl lg:text-9xl shadow-inner relative group-hover:scale-105 transition-all duration-700">
               🍱
               <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-surface rounded-2xl sm:rounded-3xl shadow-xl flex items-center justify-center text-2xl sm:text-3xl animate-bounce">
                  🔥
               </div>
            </div>
         </div>
      </div>




      {/* Categories Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
           <h3 className="text-lg font-black uppercase tracking-tight">Categories</h3>
           <button onClick={() => navigate('/customer/order-now')} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View All</button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1">
          {categoriesList.filter(c => c !== 'All').map((cat) => (
            <button 
              key={cat}
              onClick={() => navigate(`/customer/order-now?category=${cat}`)}
              className="flex flex-col items-center gap-3 shrink-0 group"
            >
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-surface rounded-3xl shadow-lg border border-black/5 flex items-center justify-center text-3xl group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all active:scale-95">
                {categoryIconMap[cat.toLowerCase()] || '🍽️'}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary group-hover:text-primary">{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Offers & Banner */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {todaysOffers.map((offer) => (
            <div 
              key={offer.title} 
              onClick={offer.action}
              className={cn("p-6 rounded-[2rem] relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all bg-gradient-to-br", offer.color)}
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-surface/10 rounded-full -mr-16 -mt-16 blur-2xl" />
               <div className="relative z-10 flex items-center justify-between gap-4">
                 <div className="flex-1 min-w-0">
                   <h4 className="text-white text-lg sm:text-xl font-black uppercase tracking-tight leading-none mb-1 truncate">{offer.title}</h4>
                   <p className="text-white/80 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest line-clamp-1">{offer.desc}</p>
                 </div>
                 <div className="text-3xl sm:text-4xl shrink-0">{offer.icon}</div>
               </div>
            </div>
          ))}
       </div>

      {/* Recommended Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
           <h3 className="text-lg font-black uppercase tracking-tight">Chef's Recommendations</h3>
           <button onClick={() => navigate('/customer/order-now')} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Full Menu</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 lg:gap-4">
          {recommendedItems.map((item) => (
            <div 
              key={item.id} 
              onClick={() => navigate('/customer/order-now')}
              className="card group cursor-pointer border-none shadow-xl shadow-slate-100/50 p-4 bg-surface hover:bg-slate-50 transition-all active:scale-95 flex flex-col h-full"
            >
               <div className="h-32 lg:h-40 bg-slate-50 rounded-2xl flex items-center justify-center text-5xl mb-4 shadow-inner relative overflow-hidden">
                  {item.image}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(item.id);
                    }}
                    className={cn(
                      "absolute top-3 right-3 p-2 bg-surface rounded-xl shadow-sm transition-all",
                      favorites.includes(item.id) ? "text-primary" : "text-slate-300"
                    )}
                  >
                     <Heart className={cn("w-4 h-4", favorites.includes(item.id) && "fill-current")} />
                  </button>
               </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  <span className="text-[9px] font-black text-slate-400">4.8 (120+)</span>
                </div>
                <h4 className="font-black text-text-primary text-xs lg:text-sm uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">{item.name}</h4>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm lg:text-lg font-black text-text-primary tracking-tighter">{formatCurrency(item.price)}</p>
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                   <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerHome;
