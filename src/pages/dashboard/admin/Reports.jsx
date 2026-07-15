import { formatCurrency } from '../../../utils/currencyUtils';
import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Calendar, 
  PieChart, 
  ArrowRight, 
  DollarSign, 
  Users, 
  ShoppingBag, 
  Target, 
  ArrowUpRight, 
  ArrowDownRight, 
  MoreHorizontal,
  ChevronRight,
  Plus,
  RefreshCw,
  Printer,
  X,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  Star
} from 'lucide-react';
import { cn } from "../../../utils/cn";
import printContent from "../../../utils/printUtil";
import api from "../../../services/api";
import { useSettings } from "@/context/SettingsContext";

const Reports = () => {
  const { settings } = useSettings();
  const [timeRange, setTimeRange] = useState('All Time');
  const [activeChartTab, setActiveChartTab] = useState('Revenue');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('Just now');
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [toast, setToast] = useState(null);

  const [dashboardData, setDashboardData] = useState(null);
  const [reportsData, setReportsData] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async (range = timeRange) => {
    setIsRefreshing(true);
    try {
      const [statsRes, reportsRes, heatmapRes] = await Promise.all([
        api.get(`/dashboard/stats?range=${range}`),
        api.get(`/dashboard/reports?range=${range}`),
        api.get('/dashboard/heatmap')
      ]);
      setDashboardData(statsRes.data.data);
      setReportsData(reportsRes.data.data);
      setHeatmapData(heatmapRes.data.data);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (error) {
      console.error('Error fetching reports data:', error);
      showToast('Failed to load intelligence data', 'error');
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRefresh = () => {
    fetchData();
    showToast('Report data refreshed');
  };

  const handleExport = () => {
    if (!dashboardData || !reportsData) return;

    let csvRows = [];
    csvRows.push("Restaurant Intelligence Report");
    csvRows.push(`Range: ${timeRange}`);
    csvRows.push(`Exported At: ${new Date().toLocaleString()}`);
    csvRows.push("");

    // Summary Stats
    csvRows.push("SUMMARY STATISTICS");
    csvRows.push("Metric,Value");
    csvRows.push(`Total Revenue,${formatCurrency(dashboardData.stats.total_revenue)}`);
    csvRows.push(`Total Orders,${dashboardData.stats.total_orders}`);
    csvRows.push(`Pending Reservations,${dashboardData.stats.pending_reservations}`);
    csvRows.push(`Active Staff,${dashboardData.stats.active_staff}`);
    csvRows.push("");

    // Top Dishes
    csvRows.push("TOP PERFORMING DISHES");
    csvRows.push("Dish Name,Orders,Revenue");
    reportsData.topDishes.forEach(dish => {
      csvRows.push(`${dish.name},${dish.orders},${dish.revenue}`);
    });
    csvRows.push("");

    // Staff Performance
    csvRows.push("STAFF PERFORMANCE");
    csvRows.push("Staff Name,Role,Orders,Revenue");
    reportsData.staffPerformance.forEach(staff => {
      csvRows.push(`${staff.name},${staff.role},${staff.orders},${staff.revenue}`);
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `restaurant-report-${timeRange.toLowerCase().replace(' ', '-')}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Intelligence Report Exported');
  };

  const handlePrint = () => {
    printContent('printable-area');
    showToast('Print command sent');
  };

  const stats = [
    { id: 'revenue', label: 'Total Revenue', value: `${formatCurrency((dashboardData?.stats?.total_revenue || 0))}`, trend: '+14.2%', up: true, icon: DollarSign, color: 'primary', description: 'Total gross income from all channels.' },
    { id: 'orders', label: 'Total Orders', value: dashboardData?.stats?.total_orders?.toString() || '0', trend: '+8.5%', up: true, icon: ShoppingBag, color: 'orange', description: 'Total volume of processed orders.' },
    { id: 'reservations', label: 'Pending Resv', value: dashboardData?.stats?.pending_reservations?.toString() || '0', trend: 'Live', up: true, icon: Clock, color: 'purple', description: 'Upcoming guest bookings.' },
    { id: 'staff', label: 'Active Staff', value: dashboardData?.stats?.active_staff?.toString() || '0', trend: 'On Duty', up: true, icon: Users, color: 'success', description: 'Employees currently clocked in.' },
  ];

  const performanceData = useMemo(() => {
    if (!reportsData) return [];
    const staff = reportsData.staffPerformance.map(s => ({
      name: s.name,
      role: s.role,
      orders: s.orders,
      revenue: `${formatCurrency(parseFloat(s.revenue))}`,
      rating: 4.8
    }));
    const dishes = reportsData.topDishes.map(d => ({
      name: d.name,
      role: 'Top Dish',
      orders: d.orders,
      revenue: `${formatCurrency(parseFloat(d.revenue))}`,
      rating: 4.9
    }));
    return [...staff, ...dishes];
  }, [reportsData]);

  const filteredPerformance = performanceData.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categorySplit = reportsData?.categorySplit || [];
  const totalCatRevenue = categorySplit.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) || 1;

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
       <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 h-full flex flex-col overflow-hidden relative">
      {/* Toast Feedback */}
      {toast && (
        <div 
          className={cn(
            "fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest border",
            toast.type === 'success' ? "bg-primary border-primary/20 text-white" : "bg-primary border-rose-600 text-white"
          )}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-white" /> : <AlertCircle className="w-4 h-4 text-white" />}
          {toast.message}
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0 print:hidden px-1">
        <div className="space-y-1">
          <h2 className="text-2xl lg:text-3xl font-black text-text-primary uppercase tracking-tight leading-none">Intelligence</h2>
          <p className="text-text-secondary text-[9px] lg:text-sm font-medium flex items-center gap-2">
            Analytics Node • <span className="text-primary font-black uppercase tracking-widest text-[8px] lg:text-[10px]">Active {lastUpdated}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide -mx-1 px-1">
          <div className="flex bg-surface p-1 rounded-2xl border border-slate-100 shadow-sm shrink-0">
            <button 
              onClick={handleRefresh}
              className="p-2.5 hover:bg-slate-50 rounded-xl transition-all active:scale-90"
            >
              <RefreshCw className={cn("w-4 h-4 text-text-secondary", isRefreshing && "animate-spin")} />
            </button>
            <button 
              onClick={handlePrint}
              className="p-2.5 hover:bg-slate-50 rounded-xl transition-all active:scale-90"
            >
              <Printer className="w-4 h-4 text-text-secondary" />
            </button>
          </div>
          <div className="relative flex items-center bg-surface border border-slate-100 rounded-2xl shadow-sm shrink-0 hover:bg-slate-50 transition-all">
            <div className="pl-4 pr-1 flex items-center pointer-events-none">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <select
              value={timeRange}
              onChange={(e) => {
                const range = e.target.value;
                setTimeRange(range);
                fetchData(range);
                showToast(`Filter applied: ${range}`);
              }}
              className="appearance-none bg-transparent py-3 pr-10 pl-2 text-[9px] font-black uppercase tracking-widest text-text-primary outline-none cursor-pointer w-full h-full"
            >
              {['Today', 'This Week', 'This Month', 'Last Month', 'Last 90 Days', 'Financial Year', 'All Time'].map(range => (
                <option key={range} value={range} className="font-bold normal-case text-xs">{range}</option>
              ))}
            </select>
            <div className="absolute right-3 pointer-events-none text-slate-400">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <button 
            onClick={handleExport}
            className="btn-primary flex items-center gap-2 py-3 px-6 shadow-xl shadow-primary/20 text-[9px] font-black uppercase tracking-widest shrink-0"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 lg:pb-8 pr-1 lg:pr-2 scrollbar-hide space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {stats.map((stat) => (
            <div 
              onClick={() => setSelectedMetric(stat)}
              key={stat.label} 
              className="card group hover:border-primary/20 overflow-hidden relative p-4 lg:p-6 rounded-[1.5rem] lg:rounded-[2rem] bg-surface cursor-pointer border border-slate-100 shadow-sm active:scale-95 transition-all"
            >
              <div className="flex justify-between items-start mb-3 lg:mb-5">
                <p className="text-text-secondary text-[8px] lg:text-xs font-black uppercase tracking-widest leading-none">{stat.label}</p>
                <div className="text-primary opacity-60">
                  <stat.icon className="w-4 h-4 lg:w-5 lg:h-5 stroke-[2]" />
                </div>
              </div>
              <div className="flex items-end justify-between relative z-10 gap-2">
                <h3 className="text-lg lg:text-3xl font-black text-text-primary tracking-tighter uppercase leading-none">{stat.value}</h3>
                <span className={cn(
                  "px-1.5 lg:px-2.5 py-0.5 lg:py-1 rounded-lg text-[7px] lg:text-[10px] font-black flex items-center gap-0.5 lg:gap-1 shrink-0",
                  stat.up ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-primary"
                )}>
                  {stat.up ? <ArrowUpRight className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5" /> : <ArrowDownRight className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5" />}
                  {stat.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 card p-5 lg:p-8 min-h-[350px] lg:min-h-[450px] flex flex-col shadow-2xl border-none bg-surface rounded-[2rem] lg:rounded-[3rem]">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-8 gap-4">
                <div>
                   <div className="flex items-center gap-2 lg:gap-3 overflow-x-auto pb-1 scrollbar-hide">
                      {['Revenue', 'Orders', 'Guests'].map(tab => (
                        <button 
                          key={tab}
                          onClick={() => setActiveChartTab(tab)}
                          className={cn(
                            "px-3 lg:px-4 py-1.5 rounded-lg lg:rounded-xl text-[8px] lg:text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all",
                            activeChartTab === tab ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:bg-slate-50"
                          )}
                        >
                          {tab}
                        </button>
                      ))}
                   </div>
                   <p className="text-[8px] lg:text-[10px] font-black text-text-secondary mt-2 lg:mt-3 uppercase tracking-widest italic opacity-60 leading-none">Visualizing performance</p>
                </div>
                <div className="flex gap-4 lg:gap-6">
                   <div className="flex items-center gap-1.5 lg:gap-2">
                      <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-primary shadow-sm shrink-0" />
                      <span className="text-[7px] lg:text-[9px] font-black uppercase tracking-widest text-text-secondary whitespace-nowrap">Current</span>
                   </div>
                   <div className="flex items-center gap-1.5 lg:gap-2">
                      <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-slate-100 shrink-0" />
                      <span className="text-[7px] lg:text-[9px] font-black uppercase tracking-widest text-text-secondary whitespace-nowrap">Benchmark</span>
                   </div>
                </div>
             </div>
             
             <div className="flex-1 flex items-end gap-2 lg:gap-3 px-1 lg:px-4 pb-2 lg:pb-4 h-48 lg:h-64">
                {(() => {
                  let chartData = [];
                  let maxValue = 1;
                  let colorClass = "bg-primary";
                  
                  if (activeChartTab === 'Revenue') {
                    chartData = dashboardData?.charts?.monthlyRevenue || [];
                    maxValue = dashboardData?.stats?.total_revenue || 1;
                    colorClass = "bg-primary";
                  } else if (activeChartTab === 'Orders') {
                    chartData = dashboardData?.charts?.monthlyOrders || [];
                    maxValue = dashboardData?.stats?.total_orders || 1;
                    colorClass = "bg-orange-400";
                  } else if (activeChartTab === 'Guests') {
                    chartData = dashboardData?.charts?.monthlyGuests || [];
                    maxValue = Math.max(...(chartData.map(d => parseFloat(d.count) || 0)), 1);
                    colorClass = "bg-indigo-400";
                  }

                  return chartData.map((d, i) => {
                    const value = activeChartTab === 'Revenue' ? parseFloat(d.revenue || 0) : parseFloat(d.count || 0);
                    const percentage = Math.min((value / maxValue) * 100, 100) || 0;

                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 lg:gap-3 group h-full justify-end">
                         <div className="w-full relative h-full flex flex-col justify-end">
                            <div 
                              style={{ height: '100%' }}
                              className="w-full bg-slate-50 rounded-lg lg:rounded-2xl group-hover:bg-slate-100"
                            />
                            <div 
                              style={{ height: `${percentage}%` }}
                              className={`absolute bottom-0 w-full rounded-lg lg:rounded-2xl shadow-lg ${colorClass}`}
                            />
                         </div>
                         <span className="text-[7px] lg:text-[10px] font-black text-slate-300 group-hover:text-text-primary uppercase tracking-widest">{d.month}</span>
                      </div>
                    );
                  });
                })()}
             </div>
          </div>

          <div className="card p-6 lg:p-8 min-h-[350px] lg:min-h-[450px] flex flex-col shadow-2xl border-none bg-surface rounded-[2rem] lg:rounded-[3rem] relative overflow-hidden">
             <div className="flex justify-between items-start mb-4 lg:mb-6">
                <div>
                   <h4 className="text-base lg:text-lg font-black text-text-primary uppercase tracking-tight">Category Split</h4>
                   <p className="text-[8px] lg:text-[9px] font-black text-text-secondary uppercase tracking-widest mt-1">Top segments</p>
                </div>
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-orange-50 rounded-lg lg:rounded-xl flex items-center justify-center text-orange-500">
                   <PieChart className="w-4 h-4 lg:w-5 lg:h-5" />
                </div>
             </div>
             
             <div className="flex-1 flex items-center justify-center relative my-2 lg:my-4">
                <div className="w-36 h-36 lg:w-48 lg:h-48 rounded-full border-[12px] lg:border-[18px] border-slate-50 relative flex items-center justify-center shadow-inner">
                   <div className="absolute inset-0 rounded-full border-[12px] lg:border-[18px] border-primary border-t-transparent border-r-transparent rotate-45" />
                   <div className="absolute inset-0 rounded-full border-[12px] lg:border-[18px] border-orange-400 border-b-transparent border-l-transparent -rotate-12 opacity-80" />
                   <div className="text-center bg-surface w-20 h-20 lg:w-24 lg:h-24 rounded-full flex flex-col items-center justify-center shadow-xl">
                      <p className="text-2xl lg:text-3xl font-black text-text-primary tracking-tighter">84%</p>
                      <p className="text-[7px] lg:text-[8px] font-black text-text-secondary uppercase tracking-widest">Growth</p>
                   </div>
                </div>
             </div>

             <div className="space-y-3 lg:space-y-4 mt-4 lg:mt-6">
                {categorySplit.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between group cursor-pointer">
                     <div className="flex items-center gap-2 lg:gap-3">
                        <div className={cn("w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full shadow-sm", idx === 0 ? 'bg-primary' : 'bg-orange-400')} />
                        <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-text-secondary group-hover:text-text-primary">{item.name}</span>
                     </div>
                     <span className="text-[10px] lg:text-xs font-black text-text-primary tracking-tight">{((parseFloat(item.revenue) / totalCatRevenue) * 100).toFixed(0)}%</span>
                  </div>
                ))}
             </div>
          </div>
         </div>

         {/* Payment Method Breakdown */}
         <div className="card p-6 lg:p-8 flex flex-col shadow-2xl border-none bg-surface rounded-[2rem] lg:rounded-[3rem] relative overflow-hidden">
           <div className="flex justify-between items-start mb-4 lg:mb-6">
             <div>
               <h4 className="text-base lg:text-lg font-black text-text-primary uppercase tracking-tight">Payment Methods</h4>
               <p className="text-[8px] lg:text-[9px] font-black text-text-secondary uppercase tracking-widest mt-1">Revenue by collection channel</p>
             </div>
             <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary/10 rounded-lg lg:rounded-xl flex items-center justify-center text-primary">
               <BarChart3 className="w-4 h-4 lg:w-5 lg:h-5" />
             </div>
           </div>
           {(() => {
             const paymentData = reportsData?.paymentMethodBreakdown || [];
             const totalPay = paymentData.reduce((acc, p) => acc + parseFloat(p.revenue || 0), 0) || 1;
             const cfgMap = {
               cash:          { label: 'Cash',     bar: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50' },
               card:          { label: 'Card',     bar: 'bg-blue-500',    text: 'text-blue-600',    bg: 'bg-blue-50' },
               qr_code:       { label: 'QR Code',  bar: 'bg-primary',     text: 'text-primary',     bg: 'bg-primary/10' },
               bank_transfer: { label: 'Bank',     bar: 'bg-violet-500',  text: 'text-violet-600',  bg: 'bg-violet-50' },
               upi:           { label: 'UPI',      bar: 'bg-amber-500',   text: 'text-amber-600',   bg: 'bg-amber-50' },
             };
             if (paymentData.length === 0) return (
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center py-6">No transactions recorded yet</p>
             );
             return (
               <div className="space-y-3 lg:space-y-4">
                 {paymentData.map((p, idx) => {
                   const cfg = cfgMap[p.method] || { label: p.method, bar: 'bg-slate-400', text: 'text-slate-600', bg: 'bg-slate-50' };
                   const pct = Math.round((parseFloat(p.revenue) / totalPay) * 100);
                   return (
                     <div key={idx} className="space-y-1.5">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${cfg.text} ${cfg.bg}`}>{cfg.label}</span>
                           <span className="text-[8px] font-black text-slate-400 uppercase">{p.count} txn</span>
                         </div>
                         <div className="text-right">
                           <span className="text-[10px] font-black text-text-primary">&#8377;{parseFloat(p.revenue).toLocaleString()}</span>
                           <span className="text-[8px] font-bold text-slate-400 ml-1">({pct}%)</span>
                         </div>
                       </div>
                       <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                         <div className={`h-full rounded-full transition-all ${cfg.bar}`} style={{ width: `${pct}%` }} />
                       </div>
                     </div>
                   );
                 })}
               </div>
             );
           })()}
         </div>

        <div className="card p-0 overflow-hidden shadow-2xl border-none bg-surface rounded-[2rem] lg:rounded-[3rem]">
           <div className="px-5 py-5 lg:px-8 lg:py-6 border-b border-slate-50 flex flex-col lg:flex-row justify-between lg:items-center gap-4 bg-slate-50/20">
              <div>
                <h4 className="text-lg lg:text-xl font-black text-text-primary uppercase tracking-tight leading-none">Intelligence Logs</h4>
                <p className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5 leading-none">Cross-sectional performance analysis</p>
              </div>
              <div className="relative group w-full lg:w-72">
                 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary" />
                 <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search logs..." 
                  className="w-full pl-10 pr-4 py-2.5 lg:py-3 bg-surface border border-slate-100 rounded-xl lg:rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none shadow-sm text-[9px] lg:text-[10px] font-bold uppercase tracking-widest"
                 />
              </div>
           </div>
           
           <div className="hidden lg:block overflow-x-auto scrollbar-hide">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="text-left text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] bg-slate-50/50">
                    <th className="px-10 py-5">Domain</th>
                    <th className="px-10 py-5">Role</th>
                    <th className="px-10 py-5">Units</th>
                    <th className="px-10 py-5">Yield</th>
                    <th className="px-10 py-5 text-right">Service</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredPerformance.length > 0 ? filteredPerformance.map((row, idx) => (
                    <tr 
                      key={idx} 
                      className="text-xs font-bold hover:bg-slate-50/50 group cursor-pointer active:bg-slate-50 transition-colors"
                    >
                      <td className="px-10 py-5">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center text-xs font-black shadow-lg shadow-primary/20 shrink-0">
                               {row.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-text-primary text-sm font-black tracking-tight truncate max-w-[150px]">{row.name}</span>
                         </div>
                      </td>
                      <td className="px-10 py-5">
                         <span className="badge bg-indigo-50 text-primary border-none text-[8px] uppercase tracking-widest">{row.role}</span>
                      </td>
                      <td className="px-10 py-5 text-text-primary font-black">{row.orders}</td>
                      <td className="px-10 py-5 text-primary font-black">{row.revenue}</td>
                      <td className="px-10 py-5 text-right">
                         <div className="flex items-center justify-end gap-1 text-yellow-600 font-black">
                            <Star className="w-3.5 h-3.5 fill-current" /> {row.rating}
                         </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="py-20 text-center">
                         <div className="flex flex-col items-center">
                            <AlertCircle className="w-10 h-10 text-slate-200 mb-4" />
                            <h5 className="text-lg font-black text-text-primary uppercase">No records found</h5>
                         </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
           </div>

           {/* Mobile Log View */}
           <div className="lg:hidden p-4 space-y-3">
              {filteredPerformance.length > 0 ? filteredPerformance.map((row, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-all">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center text-[10px] font-black text-primary shadow-sm border border-slate-100">
                         {row.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                         <p className="text-xs font-black text-text-primary uppercase tracking-tight">{row.name}</p>
                         <p className="text-[8px] font-black text-primary uppercase tracking-widest mt-0.5">{row.role}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-xs font-black text-text-primary">{row.revenue}</p>
                      <div className="flex items-center justify-end gap-1 text-yellow-600 text-[9px] font-black mt-0.5">
                         <Star className="w-2.5 h-2.5 fill-current" /> {row.rating}
                      </div>
                   </div>
                </div>
              )) : (
                 <div className="py-12 text-center">
                   <AlertCircle className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No intelligence records</p>
                 </div>
              )}
           </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:gap-6 pb-10">
           <div className="card !bg-primary text-white p-6 lg:p-10 overflow-hidden relative group rounded-[2rem] lg:rounded-[3rem] shadow-2xl shadow-primary/20 active:scale-[0.98] transition-all border-none">
              <div className="relative z-10">
                <h5 className="text-lg lg:text-xl font-black mb-1 uppercase tracking-tight">Revenue Pulse</h5>
                <p className="text-white/60 text-[7px] lg:text-[9px] font-black uppercase tracking-widest mb-6 lg:mb-10 leading-none">Target: Rp 15.0L</p>
                <div className="flex items-end justify-between mb-4">
                   <div className="flex flex-col">
                      <span className="text-[7px] lg:text-[9px] font-black text-white/60 uppercase tracking-widest mb-1 leading-none">Velocity</span>
                      <span className="text-3xl lg:text-5xl font-black text-white tracking-tighter leading-none">82<span className="text-sm lg:text-lg ml-0.5">%</span></span>
                   </div>
                   <div className="flex flex-col items-end">
                      <span className="text-[7px] lg:text-[9px] font-black text-white/60 uppercase tracking-widest mb-1.5 leading-none">Gap</span>
                      <span className="text-base lg:text-xl font-black text-white/80 leading-none">Rp 2.7L</span>
                   </div>
                </div>
                <div className="h-3 lg:h-4 bg-surface/20 rounded-full overflow-hidden mb-2 shadow-inner">
                   <div 
                     style={{ width: '82%' }}
                     className="h-full bg-surface shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-all duration-1000"
                   />
                </div>
              </div>
              <Target className="absolute -bottom-8 lg:-bottom-10 -right-8 lg:-right-10 w-32 lg:w-44 h-32 lg:h-44 text-white opacity-10" />
           </div>


        </div>
      </div>

      {/* Detail Drawer */}
      {selectedMetric && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 lg:p-6">
          <div onClick={() => setSelectedMetric(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-[200]" />
          <div 
            className="relative w-full max-w-[95%] md:max-w-[520px] max-h-[90vh] bg-surface shadow-2xl z-[201] flex flex-col rounded-[2rem] md:rounded-[2.5rem] overflow-hidden self-center"
          >
             <div className="px-5 py-4 md:px-6 md:py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 shrink-0">
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className={cn("p-3 lg:p-4 rounded-xl lg:rounded-2xl text-white shadow-xl shrink-0", selectedMetric.color === 'primary' ? 'bg-primary' : 'bg-orange-500')}>
                     <selectedMetric.icon className="w-5 lg:w-6 h-5 lg:h-6" />
                  </div>
                  <div>
                     <h3 className="text-lg lg:text-2xl font-black uppercase tracking-tight leading-none">{selectedMetric.label}</h3>
                     <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 lg:mt-1 leading-none">Deep Dive Analysis</p>
                  </div>
                </div>
                <button onClick={() => setSelectedMetric(null)} className="p-2 lg:p-3 hover:bg-surface rounded-xl lg:rounded-2xl shadow-sm border border-transparent hover:border-slate-100"><X className="w-6 lg:w-7 h-6 lg:h-7 text-slate-400" /></button>
             </div>

             <div className="flex-1 overflow-y-auto px-5 py-6 lg:px-6 lg:py-8 space-y-8 lg:space-y-10 scrollbar-hide">
                <div className="p-5 lg:p-6 bg-slate-50 rounded-[2rem] lg:rounded-[3rem] border border-slate-100 relative overflow-hidden">
                   <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 lg:mb-4">Definition</p>
                   <p className="text-xs lg:text-sm font-bold text-text-secondary leading-relaxed italic">"{selectedMetric.description}"</p>
                   <Zap className="absolute -bottom-8 lg:-bottom-10 -right-8 lg:-right-10 w-32 lg:w-40 h-32 lg:h-40 text-primary opacity-5" />
                </div>

                <div className="space-y-4 lg:space-y-6">
                   <h4 className="text-[9px] lg:text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 lg:ml-2">Distribution</h4>
                   <div className="space-y-4 lg:space-y-4">
                      {[
                        { name: 'Dine-in Revenue', val: 'Rp 7.2L', pct: 65, color: 'bg-primary' },
                        { name: 'Takeaway Revenue', val: 'Rp 3.1L', pct: 25, color: 'bg-orange-400' },
                        { name: 'Delivery Revenue', val: 'Rp 1.1L', pct: 10, color: 'bg-indigo-300' },
                      ].map((item, i) => (
                        <div key={i} className="space-y-1.5 lg:space-y-2 group">
                           <div className="flex justify-between items-end">
                              <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-text-secondary group-hover:text-primary">{item.name}</span>
                              <span className="text-xs lg:text-sm font-black text-text-primary">{item.val}</span>
                           </div>
                           <div className="h-1.5 lg:h-2 bg-slate-50 rounded-full overflow-hidden shadow-inner">
                              <div 
                                style={{ width: `${item.pct}%` }}
                                className={cn("h-full rounded-full", item.color)}
                              />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="p-5 lg:p-6 bg-primary rounded-[2rem] lg:rounded-[3rem] text-white shadow-2xl relative group overflow-hidden">
                   <div className="relative z-10">
                      <p className="text-white/40 text-[8px] lg:text-[10px] font-black uppercase tracking-widest mb-1.5 lg:mb-2">Benchmarking</p>
                      <h4 className="text-xl lg:text-3xl font-black tracking-tighter uppercase mb-4 lg:mb-6 leading-none">Delta Delta</h4>
                      <div className="grid grid-cols-2 gap-6 lg:gap-8">
                         <div>
                            <p className="text-[7px] lg:text-[8px] font-black text-white/40 uppercase tracking-widest mb-1 lg:mb-1.5">Ratio</p>
                            <p className="text-xl lg:text-2xl font-black text-white tracking-tighter">+12.4%</p>
                         </div>
                         <div>
                            <p className="text-[7px] lg:text-[8px] font-black text-white/40 uppercase tracking-widest mb-1 lg:mb-1.5">Vector</p>
                            <p className="text-xl lg:text-2xl font-black text-emerald-500 tracking-tighter uppercase">Optimal</p>
                         </div>
                      </div>
                   </div>
                   <BarChart3 className="absolute -bottom-8 lg:-bottom-10 -right-8 lg:-right-10 w-32 lg:w-44 h-32 lg:h-44 text-primary opacity-5" />
                </div>
             </div>

             <div className="px-5 py-5 lg:px-6 lg:py-6 border-t border-slate-50 bg-slate-50/20 shrink-0">
                <button onClick={() => setSelectedMetric(null)} className="w-full py-3.5 lg:py-4.5 bg-primary text-white rounded-xl lg:rounded-2xl font-black text-[9px] lg:text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20">Close Intelligence</button>
             </div>
          </div>
        </div>
      )}



      {/* Heatmap Modal */}
      {showHeatmap && (
        <div className="fixed inset-0 z-[550] flex items-center justify-center p-4 lg:p-6">
           <div onClick={() => setShowHeatmap(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" />
           <div 
             className="relative w-full max-w-[95%] md:max-w-4xl bg-surface rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] self-center"
           >
              <div className="p-6 lg:p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 shrink-0">
                 <div className="flex items-center gap-3 lg:gap-4">
                    <div className="p-2.5 lg:p-3 bg-indigo-50 text-primary rounded-xl shrink-0">
                       <Clock className="w-5 lg:w-6 h-5 lg:h-6" />
                    </div>
                    <div>
                       <h3 className="text-lg lg:text-xl font-black uppercase tracking-tight leading-none">Traffic Heatmap</h3>
                       <p className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5 lg:mt-0.5 leading-none">Real-time occupancy & density</p>
                    </div>
                 </div>
                 <button onClick={() => setShowHeatmap(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                    <X className="w-6 h-6 text-slate-400" />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-hide">
                 <div className="mb-10 overflow-x-auto pb-4 scrollbar-hide">
                    <div className="min-w-[800px]">
                       <div className="grid grid-cols-[repeat(24,1fr)] gap-1 mb-8">
                          {/* Hours markers */}
                          <div className="grid grid-cols-[repeat(24,1fr)] gap-1 mb-4 px-2">
                             <div className="col-span-[6] flex justify-start"><span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">12 AM</span></div>
                             <div className="col-span-[6] flex justify-start"><span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">6 AM</span></div>
                             <div className="col-span-[6] flex justify-start"><span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">12 PM</span></div>
                             <div className="col-span-[5] flex justify-start"><span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">6 PM</span></div>
                             <div className="col-span-[1] flex justify-end"><span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">11 PM</span></div>
                          </div>
                          
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                            <React.Fragment key={day}>
                               <div className="col-span-[2] flex items-center">
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{day.substring(0, 3)}</span>
                                </div>
                               <div className="col-span-[22] grid grid-cols-[repeat(24,1fr)] gap-1 h-8 sm:h-10">
                                  {Array.from({ length: 24 }).map((_, i) => {
                                     const hourData = heatmapData?.find(h => h.day === day && h.hour === i);
                                     const orders = hourData ? parseInt(hourData.orders) : 0;
                                     
                                     let intensity = "bg-slate-50";
                                     if (orders > 10) intensity = "bg-primary";
                                     else if (orders > 5) intensity = "bg-primary/60";
                                     else if (orders > 0) intensity = "bg-primary/20";
                                     
                                     return (
                                       <div 
                                         key={i} 
                                         className={cn(
                                           "relative group/cell rounded-sm sm:rounded-md transition-all cursor-crosshair",
                                           intensity
                                         )}
                                       >
                                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover/cell:opacity-100 pointer-events-none transition-all z-10 whitespace-nowrap border border-white/10 shadow-2xl">
                                             {i % 12 || 12} {i >= 12 ? 'PM' : 'AM'} • {orders} Orders
                                          </div>
                                       </div>
                                     );
                                  })}
                               </div>
                            </React.Fragment>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100/50">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Busiest Day</p>
                       <h5 className="text-xl font-black text-primary uppercase tracking-tight">Saturday</h5>
                       <p className="text-[10px] font-medium text-text-secondary mt-1">Average 240+ covers</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100/50">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Wait Time Avg</p>
                       <h5 className="text-xl font-black text-orange-500 uppercase tracking-tight">12 Minutes</h5>
                       <p className="text-[10px] font-medium text-text-secondary mt-1">During peak dinner hours</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100/50 sm:col-span-2 lg:col-span-1">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Optimal Staffing</p>
                       <h5 className="text-xl font-black text-emerald-500 uppercase tracking-tight">Level 4</h5>
                       <p className="text-[10px] font-medium text-text-secondary mt-1">All stations fully active</p>
                    </div>
                 </div>
              </div>

              <div className="p-6 lg:p-8 border-t border-slate-50 bg-slate-50/30 shrink-0">
                 <button onClick={() => setShowHeatmap(false)} className="w-full py-4 bg-primary text-white rounded-xl lg:rounded-2xl font-black text-[9px] lg:text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20">Close Heatmap View</button>
              </div>
           </div>
        </div>
      )}



      {/* Hidden Printable Report */}
      <div id="printable-area" className="hidden print:block printable-area">
        <div className="text-center border-b-2 border-slate-900 pb-6 mb-8">
           <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900">{settings?.businessName || 'Gila House'}</h2>
           {settings?.motto && <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">{settings.motto}</p>}
           <div className="text-xs font-bold text-slate-500 mt-2 mb-6">
             {settings?.address && <span>{settings.address}</span>}
             {settings?.phone && <span className="ml-2">| {settings.phone}</span>}
             {settings?.email && <span className="ml-2">| {settings.email}</span>}
           </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Business Intelligence Report</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 mt-2">Filter: {timeRange}</p>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-12">
          {stats.map(stat => (
            <div key={stat.id} className="p-6 border border-slate-200 rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{stat.label}</p>
              <h2 className="text-2xl font-black text-slate-900">{stat.value}</h2>
              <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase">Trend: {stat.trend}</p>
            </div>
          ))}
        </div>

        <div className="mb-12">
          <h3 className="text-sm font-black uppercase tracking-widest mb-6 border-b border-slate-200 pb-2">Yield Performance Logs</h3>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-900">
                <th className="py-4 uppercase font-black">Domain</th>
                <th className="py-4 uppercase font-black">Role</th>
                <th className="py-4 uppercase font-black">Units</th>
                <th className="py-4 uppercase font-black">Yield</th>
                <th className="py-4 uppercase font-black text-right">Service</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {performanceData.map((row, i) => (
                <tr key={i}>
                  <td className="py-4 font-black uppercase">{row.name}</td>
                  <td className="py-4 font-bold uppercase text-slate-500">{row.role}</td>
                  <td className="py-4 font-black">{row.orders}</td>
                  <td className="py-4 font-black text-primary">{row.revenue}</td>
                  <td className="py-4 text-right font-black">{row.rating} ★</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-20 flex justify-between items-center pt-8 border-t border-slate-200">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Report Generated</p>
            <p className="text-xs font-bold text-slate-900 uppercase">{new Date().toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Signature</p>
            <p className="text-xs font-bold text-slate-900 uppercase italic">{settings?.businessName || 'Gila House'} Analytics Hub</p>
          </div>
        </div>
      </div>
    </div>

  );
};

export default Reports;
