import { formatCurrency } from '../../../utils/currencyUtils';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  ChevronRight,
  Calendar,
  Filter,
  X,
  Download,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileText,
  Plus,
  Sparkles,
  Bed,
  Table2,
  MessageSquare,
  Activity,
  Heart,
  PieChart,
  BarChart3,
  CookingPot,
  Package,
  CreditCard,
  History
} from 'lucide-react';
import { cn } from "../../../utils/cn";
import { useAuth, roles } from "@/context/AuthContext";
import { useMenu, categoryIconMap } from "@/context/MenuContext";
import { useOrders } from "@/context/OrdersContext";
import { useHospitality } from "@/context/HospitalityContext";
import { useCommunication } from "@/context/CommunicationContext";
import { useNotifications } from "@/context/NotificationContext";

import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import api from "../../../services/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { categoriesList, addItem, refreshMenu } = useMenu();
  const { orders, refreshOrders } = useOrders();
  const { rooms, tables, reservations, activityLog, folios, inventory, staff, refreshData } = useHospitality();
  const { activeChats } = useCommunication();
  const { notifications, refreshNotifications } = useNotifications();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItemIcon, setNewItemIcon] = useState('🍽️');
  const [selectedImage, setSelectedImage] = useState(null);
  const [newItemCategory, setNewItemCategory] = useState('');
  const [toast, setToast] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [revenueViewMode, setRevenueViewMode] = useState('Weekly');
  const [showActivityModal, setShowActivityModal] = useState(false);

  const fetchStats = async () => {
    setIsRefreshing(true);
    try {
      const response = await api.get('/dashboard/stats');
      setDashboardData(response.data.data);
      if (refreshData) await refreshData();
      if (refreshOrders) await refreshOrders();
      if (refreshMenu) await refreshMenu();
      if (refreshNotifications) await refreshNotifications();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const isChef = user?.role_name === 'chef';

  let stats = [];
  if (dashboardData) {
    if (isChef) {
      const lowStockCount = inventory.filter(item => parseFloat(item.current_stock) <= parseFloat(item.threshold)).length;
      stats = [
        { id: 'pending', name: 'Pending Orders', value: dashboardData.stats?.pending_orders?.toString() || '0', icon: Clock, change: 'Urgent', isUp: false, color: 'bg-orange-50 text-orange-600' },
        { id: 'cooking', name: 'Cooking Orders', value: dashboardData.stats?.cooking_orders?.toString() || '0', icon: CookingPot, change: 'Active', isUp: true, color: 'bg-indigo-50 text-primary' },
        { id: 'ready', name: 'Ready Orders', value: dashboardData.stats?.ready_orders?.toString() || '0', icon: CheckCircle2, change: 'Completed', isUp: true, color: 'bg-emerald-50 text-emerald-600' },
        { id: 'stock', name: 'Low Stock Alerts', value: lowStockCount.toString(), icon: Package, change: 'Status', isUp: false, color: 'bg-orange-50 text-orange-600' },
      ];
    } else {
      const activeStaffCount = staff.filter(s => s.status?.toLowerCase() === 'active').length;
      stats = [
        { id: 'revenue', name: 'Total Revenue', value: `${formatCurrency((dashboardData.stats?.total_revenue || 0))}`, icon: TrendingUp, change: 'Live', isUp: true, color: 'bg-primary/10 text-primary' },
        { id: 'orders', name: 'Total Orders', value: dashboardData.stats?.total_orders?.toString() || '0', icon: ShoppingBag, change: 'Live', isUp: true, color: 'bg-mint-dark/20 text-success' },
        { id: 'tables', name: 'Table Status', value: `${tables.filter(t => t.status?.toLowerCase() === 'occupied').length}/${tables.length}`, icon: Table2, change: 'Occupied', isUp: true, color: 'bg-primary-hover/20 text-primary' },
        { id: 'staff', name: 'Active Staff', value: activeStaffCount.toString(), icon: Users, change: 'On Duty', isUp: true, color: 'bg-primary/10 text-primary' },
      ];
    }
  }

  const currentRevenueData = dashboardData?.charts?.monthlyRevenue?.map(d => ({
    label: d.month,
    value: parseFloat(d.revenue)
  })) || [
    { label: 'Mon', value: 0 },
    { label: 'Tue', value: 0 },
    { label: 'Wed', value: 0 },
    { label: 'Thu', value: 0 },
    { label: 'Fri', value: 0 },
    { label: 'Sat', value: 0 },
    { label: 'Sun', value: 0 },
  ];

  const maxRevenue = Math.max(...currentRevenueData.map(d => d.value), 1);
  const totalRestaurantRevenue = dashboardData?.stats?.total_revenue || 0;
  const totalRoomRevenue = 0; // To be implemented with room stats
  const totalRevenue = totalRestaurantRevenue + totalRoomRevenue;
  const activeChatsCount = activeChats.length;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const showToastMessage = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddItem = (newItem) => {
    addItem(newItem);
    setShowAddItemModal(false);
    setSelectedImage(null);
    setNewItemIcon('🍽️');
    setNewItemCategory('');
    showToastMessage('Item added to POS menu successfully');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB Limit
        showToastMessage('Image size must be less than 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setNewItemIcon(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateAutoIcon = (category) => {
    const normalized = category.toLowerCase().trim().replace(/s$/, '');
    const mappedIcon = categoryIconMap[normalized];
    if (mappedIcon) {
      setNewItemIcon(mappedIcon);
    } else {
      const partialMatch = Object.keys(categoryIconMap).find(key => normalized.includes(key));
      setNewItemIcon(partialMatch ? categoryIconMap[partialMatch] : '🍽️');
    }
  };

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6 relative pb-10">
      {/* Toast Feedback */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 bg-primary text-white rounded-2xl shadow-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest border border-primary/20">
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
             <span className="text-[10px] font-black text-primary uppercase tracking-widest">System Live • {isChef ? 'Kitchen Online' : 'All Modules Active'}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-text-primary tracking-tight uppercase">
            {isChef ? 'Kitchen' : 'Command'} <span className="text-primary">{isChef ? 'Ops Center' : 'Center'}</span>
          </h1>
          <p className="text-text-secondary text-xs lg:text-sm font-medium mt-1">
            {isChef ? 'Real-time kitchen throughput & stock monitoring' : 'Executive overview of hospitality & POS operations'}
          </p>
        </div>
        <div className="flex items-center gap-3">
           {!isChef && (
             <button onClick={() => setShowAddItemModal(true)} className="btn-primary h-11 px-6 rounded-xl flex items-center gap-3 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all">
                <Plus className="w-4 h-4" /> Add Item POS
             </button>
           )}
           <button 
             onClick={fetchStats} 
             disabled={isRefreshing}
             className="p-3 bg-surface rounded-xl border border-slate-100 text-slate-400 hover:text-primary transition-all shadow-sm disabled:opacity-50"
           >
             <RefreshCw className={cn("w-5 h-5", isRefreshing && "animate-spin")} />
           </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.id} className="card p-5 bg-surface border-none shadow-xl shadow-slate-100/50 group hover:shadow-2xl hover:shadow-slate-200 transition-all cursor-pointer overflow-hidden relative">
             <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-all duration-700" />
             <div className="flex justify-between items-start mb-6">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner", stat.color)}>
                   <stat.icon className={cn("w-6 h-6 stroke-[2]", stat.id === 'cooking' && "animate-spin-slow")} />
                </div>
                <div className={cn(
                  "px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                  stat.isUp ? "text-emerald-500 bg-emerald-50" : "text-primary bg-primary/5"
                )}>
                   {stat.change}
                </div>
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.name}</p>
                <h3 className="text-2xl font-black text-text-primary tracking-tighter mt-1">{stat.value}</h3>
             </div>
          </div>
        ))}
      </div>

      {/* Main Operations Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Live Status Section */}
        <div className="xl:col-span-2 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rooms & Tables Status Grid */}
              <div className="card p-6 bg-surface border-none shadow-xl shadow-slate-100/50">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                       <Bed className="w-4 h-4 text-primary" /> Rooms Status
                    </h3>
                 </div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 lg:gap-3">
                    {rooms.map(room => (
                      <div 
                        key={room.id}
                        title={`${room.room_name}: ${room.room_status}`}
                        className={cn(
                          "aspect-square rounded-lg flex items-center justify-center text-[9px] lg:text-[10px] font-black transition-all",
                          room.room_status?.toLowerCase() === 'available' ? "bg-mint-dark/20 text-success" :
                          room.room_status?.toLowerCase() === 'occupied' ? "bg-primary text-white shadow-lg shadow-primary/20" :
                          "bg-primary-hover/20 text-primary"
                        )}
                      >
                         {room.room_code?.slice(-3)}
                      </div>
                    ))}
                 </div>
                 <div className="mt-6 flex flex-wrap gap-4 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-500" />
                       <span className="text-[8px] font-black uppercase text-slate-400">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-primary" />
                       <span className="text-[8px] font-black uppercase text-slate-400">Occupied</span>
                    </div>
                 </div>
              </div>

              <div className="card p-6 bg-surface border-none shadow-xl shadow-slate-100/50">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                       <Table2 className="w-4 h-4 text-orange-500" /> Tables Status
                    </h3>
                    <button 
                      onClick={() => navigate(`/${user?.role_name?.toLowerCase() || 'admin'}/tables`)}
                      className="text-[10px] font-black text-primary uppercase tracking-widest hover:scale-105 transition-all"
                    >
                      Manage
                    </button>
                 </div>
                 <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 lg:gap-3">
                    {tables.length > 0 ? tables.map(table => (
                      <div 
                        key={table.id}
                        className={cn(
                          "aspect-square rounded-xl flex items-center justify-center text-[10px] lg:text-[11px] font-black transition-all border-2",
                          table.status?.toLowerCase() === 'available' ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                          table.status?.toLowerCase() === 'occupied' ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" :
                          "bg-orange-50 border-orange-100 text-primary"
                        )}
                      >
                         {table.table_name?.replace('T-', '') || table.id}
                      </div>
                    )) : (
                      <div className="col-span-full py-8 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                         No Tables Registered
                      </div>
                    )}
                 </div>
              </div>
           </div>

           {/* Live Revenue Chart (Simple CSS implementation) */}
           <div className="card p-6 lg:p-8 bg-surface border-none shadow-xl shadow-slate-100/50 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                 <div>
                    <h3 className="text-lg font-black uppercase tracking-tight">Revenue Trends</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Daily Hospitality Income Breakdown</p>
                 </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setRevenueViewMode('Weekly')}
                      className={cn(
                        "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                        revenueViewMode === 'Weekly' ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                      )}
                    >
                      Weekly
                    </button>
                    <button 
                      onClick={() => setRevenueViewMode('Monthly')}
                      className={cn(
                        "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                        revenueViewMode === 'Monthly' ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                      )}
                    >
                      Monthly
                    </button>
                  </div>
              </div>
              <div className="h-48 flex items-end gap-3 lg:gap-6 px-2 lg:px-4 overflow-x-auto scrollbar-hide">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={revenueViewMode}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex items-end gap-3 lg:gap-6 h-full"
                  >
                    {currentRevenueData.map((data, i) => (
                      <div key={i} className="min-w-[32px] flex-1 flex flex-col items-center gap-3 group h-full">
                          <div className="w-full relative h-full flex items-end">
                            <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${(data.value / maxRevenue) * 100}%` }}
                              className="w-full bg-primary rounded-xl relative min-h-[4px]"
                            >
                                <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-primary text-[8px] font-black whitespace-nowrap">
                                  {formatCurrency(data.value)}
                                </div>
                            </motion.div>
                          </div>
                          <motion.span 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + (i * 0.05) }}
                            className="text-[8px] font-black text-slate-300 uppercase tracking-widest whitespace-nowrap"
                          >
                            {data.label}
                          </motion.span>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
           </div>

           {/* Recent Activity Section */}
           <div className="card p-6 bg-surface border-none shadow-xl shadow-slate-100/50">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" /> Live Operational Log
                 </h3>
                 <button 
                   onClick={() => setShowActivityModal(true)}
                   className="p-2 text-slate-300 hover:text-primary transition-all hover:bg-slate-50 rounded-xl"
                   title="View Full Log"
                 >
                   <MoreVertical className="w-4 h-4" />
                 </button>
              </div>
              <div className="space-y-3">
                 {activityLog.length === 0 ? (
                   <div className="text-center py-6">
                     <Activity className="w-8 h-8 text-slate-100 mx-auto mb-2" />
                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No activity yet. Place an order to see logs.</p>
                   </div>
                 ) : activityLog.slice(0, 5).map((log, idx) => {
                   const typeConfig = {
                     order: { dot: 'bg-primary', bg: 'bg-primary/10', label: 'ORDER' },
                     table: { dot: 'bg-emerald-500', bg: 'bg-emerald-50', label: 'TABLE' },
                     reservation: { dot: 'bg-amber-500', bg: 'bg-amber-50', label: 'RESERVATION' },
                     payment: { dot: 'bg-indigo-500', bg: 'bg-indigo-50', label: 'PAYMENT' },
                     staff: { dot: 'bg-slate-400', bg: 'bg-slate-50', label: 'STAFF' },
                     system: { dot: 'bg-slate-300', bg: 'bg-slate-50', label: 'SYSTEM' },
                     info: { dot: 'bg-primary', bg: 'bg-primary/10', label: 'INFO' },
                     success: { dot: 'bg-emerald-500', bg: 'bg-emerald-50', label: 'OK' },
                     error: { dot: 'bg-rose-500', bg: 'bg-rose-50', label: 'ERROR' },
                   };
                   const cfg = typeConfig[log.type] || typeConfig.system;
                   return (
                     <div key={log.id || idx} className="flex items-start gap-3 group py-1">
                        <div className={cn('w-2 h-2 rounded-full shrink-0 mt-1.5', cfg.dot)} />
                        <p className="flex-1 text-xs font-bold text-text-primary leading-snug">{log.message}</p>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest shrink-0 mt-0.5">{log.time}</span>
                     </div>
                   );
                 })}
              </div>
              {activityLog.length > 5 && (
                <button
                  onClick={() => setShowActivityModal(true)}
                  className="mt-4 w-full text-center text-[9px] font-black text-primary uppercase tracking-widest hover:underline"
                >
                  View all {activityLog.length} events
                </button>
              )}
           </div>
        </div>

        {/* Right Column: Operational Stats & Alerts */}
        <div className="space-y-6">
           {/* Quick Stats Grid */}
           <div className="grid grid-cols-2 gap-4">
              <div className="card p-5 bg-gradient-to-br from-primary to-primary-hover text-white border-none shadow-xl shadow-primary/30">
                 <MessageSquare className="w-6 h-6 mb-4 opacity-50" />
                 <h4 className="text-2xl font-black">{activeChatsCount}</h4>
                 <p className="text-[9px] font-black uppercase tracking-widest opacity-80">Guest Chats</p>
              </div>
              <div className="card p-5 bg-gradient-to-br from-primary-hover to-primary text-white border-none shadow-xl shadow-primary/30">
                 <AlertCircle className="w-6 h-6 mb-4 opacity-50" />
                 <h4 className="text-2xl font-black">{unreadNotifications}</h4>
                 <p className="text-[9px] font-black uppercase tracking-widest opacity-80">Pending Alerts</p>
              </div>
           </div>

           {/* Revenue Source Breakdown */}
           <div className="card p-6 bg-surface border-none shadow-xl shadow-slate-100/50">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Revenue Mix</h3>
              <div className="space-y-5">
                 {[
                   { name: 'Restaurant', val: totalRestaurantRevenue, max: totalRevenue, color: 'bg-primary' },
                   { name: 'Rooms', val: totalRoomRevenue, max: totalRevenue, color: 'bg-emerald-500' },
                   { name: 'Services', val: 0, max: totalRevenue || 1, color: 'bg-amber-500' }
                 ].map((src, i) => (
                   <div key={i}>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                         <span>{src.name}</span>
                         <span className="text-text-primary">{formatCurrency(src.val)}</span>
                      </div>
                      <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                         <div 
                           className={cn("h-full rounded-full transition-all duration-1000", src.color)} 
                           style={{ width: `${(src.val / src.max) * 100}%` }} 
                         />
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Recent Orders List */}
           <div className="card p-6 bg-surface border-none shadow-xl shadow-slate-100/50">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-sm font-black uppercase tracking-widest">Recent Orders</h3>
                 <button 
                   onClick={() => navigate(`/${user?.role_name?.toLowerCase() || 'admin'}/orders`)}
                   className="text-[9px] font-black text-primary uppercase tracking-widest hover:scale-105 transition-all"
                 >
                   Full Feed
                 </button>
              </div>
              <div className="space-y-4">
                 {recentOrders.map(order => (
                   <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-surface rounded-xl flex items-center justify-center text-[10px] font-black shadow-sm">
                            {order.order_number?.slice(-2)}
                         </div>
                         <div>
                            <p className="text-[11px] font-black text-text-primary uppercase leading-none">{order.order_number}</p>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">{order.table_name || 'Walk-in'}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black text-text-primary">{formatCurrency(parseFloat(order.grand_total))}</p>
                         <span className={cn(
                           "text-[7px] font-black uppercase tracking-[0.2em]",
                           order.order_status?.toLowerCase() === 'ready' ? "text-emerald-500" : "text-amber-500"
                         )}>{order.order_status}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Add Item Modal (Preserved Functionality) */}
      {showAddItemModal && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 overflow-hidden">
          <div onClick={() => setShowAddItemModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
           <div className="relative w-full sm:max-w-[500px] bg-surface rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh] self-center border border-slate-100">
            <div className="px-5 py-4 md:px-8 md:py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/20 shrink-0">
               <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-14 md:h-14 bg-primary rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-xl shrink-0">
                     <Plus className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                     <h3 className="text-lg md:text-xl font-black uppercase tracking-tight leading-none">New POS Item</h3>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5 md:mt-1">POS Inventory Creation</p>
                  </div>
               </div>
               <button onClick={() => setShowAddItemModal(false)} className="p-2 md:p-2.5 hover:bg-surface rounded-xl border border-transparent hover:border-slate-100 shadow-sm group">
                  <X className="w-5 h-5 text-slate-400" />
               </button>
            </div>
            
            <form 
              className="flex-1 overflow-y-auto"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const name = formData.get('name');
                const category = newItemCategory;
                const price = parseFloat(formData.get('price'));
                const image = newItemIcon;
                const rating = parseFloat(formData.get('rating')) || 0;
                
                if (!name || !category || isNaN(price) || price <= 0 || isNaN(rating) || rating < 0 || rating > 5) {
                  showToastMessage('Please fill all required fields correctly (Rating max 5)', 'error');
                  return;
                }
                
                handleAddItem({ name, category, price, image, description, rating });
              }}
            >
               <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-hide">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Item Name *</label>
                        <input name="name" type="text" placeholder="e.g. Garlic Bread" className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-sm transition-all" required />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Category *</label>
                        <input 
                           name="category" 
                           type="text" 
                           list="categories" 
                           value={newItemCategory}
                           onChange={(e) => {
                              setNewItemCategory(e.target.value);
                              updateAutoIcon(e.target.value);
                           }}
                           placeholder="e.g. Sides" 
                           className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-sm transition-all" 
                           required 
                        />
                        <datalist id="categories">
                           {categoriesList.filter(c => c !== 'All').map(c => <option key={c} value={c} />)}
                        </datalist>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (Rp) *</label>
                        <input name="price" type="number" step="0.01" placeholder="99.00" className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-sm transition-all" required />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Item Image / Icon</label>
                        <div className="flex items-center gap-3">
                           <div className="w-12 h-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden text-xl shadow-inner shrink-0">
                              {selectedImage ? (
                                <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-2xl">{newItemIcon}</span>
                              )}
                           </div>
                           <div className="flex-1 relative group/upload">
                              <input 
                                 type="file" 
                                 accept="image/*"
                                 onChange={handleImageChange}
                                 className="absolute inset-0 opacity-0 cursor-pointer z-10"
                              />
                              <div className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2 group-hover/upload:border-primary/20 group-hover/upload:bg-surface transition-all">
                                 <Plus className="w-4 h-4" /> Upload
                              </div>
                           </div>
                           {selectedImage && (
                             <button 
                               type="button"
                               onClick={() => { setSelectedImage(null); setNewItemIcon('🍽️'); }}
                               className="p-2.5 bg-rose-50 text-primary hover:bg-rose-100 rounded-xl transition-all"
                             >
                                <X className="w-4 h-4" />
                             </button>
                           )}
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Rating (0-5)</label>
                        <input name="rating" type="number" step="0.1" min="0" max="5" placeholder="e.g. 4.5" className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-sm transition-all" />
                     </div>
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                     <textarea name="description" placeholder="Describe the item ingredients or details..." className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-sm min-h-[100px] md:min-h-[120px] resize-none transition-all" />
                  </div>
               </div>

               <div className="p-6 md:p-8 border-t border-slate-50 flex flex-col sm:flex-row gap-3 md:gap-4 bg-surface shrink-0 relative z-20">
                  <button type="button" onClick={() => setShowAddItemModal(false)} className="flex-1 py-4 border-2 border-slate-100 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 shadow-sm transition-all text-slate-400">
                     Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary py-4 rounded-full flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary/30 active:scale-95 transition-all">
                     Create POS Item
                  </button>
               </div>
            </form>
          </div>
        </div>,
        document.body
      )}
      {/* Activity Log Full History Modal */}
      {showActivityModal && createPortal(
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-4">
          <div 
            onClick={() => setShowActivityModal(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-lg bg-surface rounded-[2rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden z-[701]">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight uppercase">Operational Log</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{activityLog.length} total events</p>
                </div>
              </div>
              <button onClick={() => setShowActivityModal(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                <X className="w-6 h-6 text-slate-300" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-2 scrollbar-hide">
              {activityLog.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-slate-100 mx-auto mb-3" />
                  <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">No activity recorded yet</p>
                  <p className="text-[10px] text-slate-300 mt-1">Place an order or update a table to see live events</p>
                </div>
              ) : activityLog.map((log, idx) => {
                const typeConfig = {
                  order: { dot: 'bg-primary', badge: 'bg-primary/10 text-primary', label: 'ORDER' },
                  table: { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-600', label: 'TABLE' },
                  reservation: { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-600', label: 'RESERVATION' },
                  payment: { dot: 'bg-indigo-500', badge: 'bg-indigo-50 text-indigo-600', label: 'PAYMENT' },
                  staff: { dot: 'bg-slate-400', badge: 'bg-slate-50 text-slate-500', label: 'STAFF' },
                  system: { dot: 'bg-slate-300', badge: 'bg-slate-50 text-slate-400', label: 'SYSTEM' },
                  info: { dot: 'bg-primary', badge: 'bg-primary/10 text-primary', label: 'INFO' },
                  success: { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-600', label: 'OK' },
                  error: { dot: 'bg-rose-500', badge: 'bg-rose-50 text-rose-600', label: 'ERROR' },
                };
                const cfg = typeConfig[log.type] || typeConfig.system;
                return (
                  <div key={log.id || idx} className="flex items-start gap-4 p-3 bg-slate-50/60 rounded-2xl hover:bg-slate-50 transition-all">
                    <div className={cn('w-2 h-2 rounded-full shrink-0 mt-2', cfg.dot)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-text-primary leading-snug">{log.message}</p>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">{log.time}</p>
                    </div>
                    <span className={cn('text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg shrink-0', cfg.badge)}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 shrink-0">
              <button
                onClick={() => setShowActivityModal(false)}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Close Log
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Dashboard;


