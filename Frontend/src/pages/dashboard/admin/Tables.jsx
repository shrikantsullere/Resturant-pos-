import { formatCurrency } from '../../../utils/currencyUtils';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Users,
  Clock,
  Plus,
  ChefHat,
  Receipt,
  Search,
  Filter,
  X,
  ChevronRight,
  CreditCard,
  History,
  Calendar,
  MoreVertical,
  UtensilsCrossed,
  Sparkles,
  QrCode,
  Building
} from 'lucide-react';
import { cn } from "../../../utils/cn";
import { useHospitality } from "../../../context/HospitalityContext";
import { useOrders } from "../../../context/OrdersContext";
import { useToast } from "../../../context/ToastContext";
import { useMenu } from "../../../context/MenuContext";
import { useSettings } from "../../../context/SettingsContext";
import { paymentApi } from "../../../services/payment.api";
import { QRCodeSVG } from "qrcode.react";
import printContent from "../../../utils/printUtil";

const Tables = () => {
  const { tables, addTable, updateTableStatus, deleteTable } = useHospitality();
  const { addOrder } = useOrders();
  const { items: menuItems = [] } = useMenu();
  const { showToast } = useToast();
  const { settings } = useSettings();
  const [selectedTable, setSelectedTable] = useState(null);
  const [showBilling, setShowBilling] = useState(false);
  const [showAddTable, setShowAddTable] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAddItems, setShowAddItems] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFloor, setActiveFloor] = useState('Ground Floor');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentState, setPaymentState] = useState('idle'); // idle, waiting, success
  const [invoiceUrl, setInvoiceUrl] = useState('');
  const [pollingInterval, setPollingInterval] = useState(null);

  const [newTableData, setNewTableData] = useState({ name: '', capacity: 4, floor: 'Ground Floor' });
  const [guestCount, setGuestCount] = useState(2);

  const floors = ['Ground Floor', 'Rooftop', 'Indoor VIP'];

  const [historyData] = useState([
    { id: 1, table: 'T-02', customer: 'John Doe', total: 'Rp 1,240', time: '10:30 AM', status: 'Paid' },
    { id: 2, table: 'T-05', customer: 'Jane Smith', total: 'Rp 850', time: '11:15 AM', status: 'Paid' },
    { id: 3, table: 'T-01', customer: 'Walk-in', total: 'Rp 420', time: '12:00 PM', status: 'Refunded' },
  ]);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'available': return { color: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', accent: 'emerald' };
      case 'occupied': return { color: 'bg-primary', bg: 'bg-rose-50', text: 'text-primary', border: 'border-rose-100', accent: 'rose' };
      case 'reserved': return { color: 'bg-primary', bg: 'bg-indigo-50', text: 'text-primary', border: 'border-indigo-100', accent: 'indigo' };
      default: return { color: 'bg-slate-300', bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-100', accent: 'slate' };
    }
  };

  const getTableData = (table) => ({
    ...table,
    name: table.table_code || table.table_number || table.name || `T-${table.id}`,
    floor: table.zone_name || 'Ground Floor',
    orders: table.orders || [],
    total: table.total || 0,
    time: table.reservation_time || table.time || (table.status === 'occupied' ? '35 mins' : null),
    reservedBy: table.reserved_by || table.reservedBy || 'Guest',
    customerName: table.customer_name || 'Walk-in'
  });

  const processedTables = tables.map(getTableData);

  const liveTable = selectedTable ? (processedTables.find(t => t.id === selectedTable.id) || selectedTable) : null;
  const liveTableSubtotal = liveTable?.orders?.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0) || 0;

  const handleOpenSession = (table) => {
    updateTableStatus(table.id, 'occupied');
    setSelectedTable(prev => ({ ...prev, status: 'occupied', guests: guestCount }));
  };

  const handleMarkArrived = (table) => {
    updateTableStatus(table.id, 'occupied');
  };

  const handleCancelBooking = (table) => {
    updateTableStatus(table.id, 'available');
  };

  const handleFinalize = async () => {
    if (!liveTable) return;
    const paymentAmount = Math.round(liveTableSubtotal * 1.05);

    if (paymentMethod === 'Cash' || paymentMethod === 'Bank (Manual)') {
      setIsProcessing(true);
      // Trigger print
      printContent('bill-printable-area');

      setTimeout(() => {
        updateTableStatus(liveTable.id, 'available', { orders: [], total: 0, paymentMethod });
        setIsProcessing(false);
        setShowBilling(false);
        setSelectedTable(null);
        showToast("Table settled and receipt printed!", "success");
      }, 1500);
    } else {
      // Xendit Digital Payments (QR Code, Card, Bank VA)
      setIsProcessing(true);
      const bookingId = `TBL_${liveTable.id}_${Date.now()}`;
      
      try {
        let response;
        if (paymentMethod === 'QR Code') {
          response = await paymentApi.createQrCode({
            bookingId: bookingId,
            amount: paymentAmount,
            description: `QR Payment for Table ${liveTable.name}`
          });
        } else {
          const upiPaymentPayload = {
            amount: paymentAmount,
            description: `Payment for Table ${liveTable.name}`,
            email: settings?.email || "guest@gilahouse.com", // Fallback email
            contact: settings?.phone || "9999999999", // Fallback contact
          };
          response = await paymentApi.createInvoice({
            bookingId: bookingId,
            guestName: liveTable.customerName || "Walk-in Guest",
            ...upiPaymentPayload
          });
        }

        if (response.success) {
          setInvoiceUrl(response.invoiceUrl);
          setPaymentState('waiting');
          setIsProcessing(false);
          
          // Start Polling
          const interval = setInterval(async () => {
            try {
              const statusResponse = await paymentApi.getPaymentStatus(bookingId);
              if (statusResponse.data && statusResponse.data.status === 'PAID') {
                clearInterval(interval);
                setPaymentState('success');
                
                // Finalize Table
                printContent('bill-printable-area');
                setTimeout(() => {
                  updateTableStatus(liveTable.id, 'available', { orders: [], total: 0, paymentMethod });
                  setShowBilling(false);
                  setPaymentState('idle');
                  setSelectedTable(null);
                  showToast("Digital Payment Successful!", "success");
                }, 1500);
              }
            } catch (err) {
              // Ignore 404s while waiting
            }
          }, 3000);
          setPollingInterval(interval);
        }
      } catch (error) {
        showToast("Failed to initiate digital payment", "error");
        setIsProcessing(false);
      }
    }
  };

  // Cleanup polling if modal is closed manually
  const handleCloseBilling = () => {
    if (isProcessing) return;
    if (pollingInterval) clearInterval(pollingInterval);
    setPaymentState('idle');
    setInvoiceUrl('');
    setShowBilling(false);
  };

  const handleSendToKitchen = () => {
    if (!liveTable || liveTable.orders.length === 0) {
      showToast("Please add items to the table first!", "warning");
      return;
    }

    const pendingItems = liveTable.orders.filter(item => item.status === 'pending');
    if (pendingItems.length === 0) {
      showToast("All items already sent to kitchen!", "info");
      return;
    }

    const orderData = {
      orderData: {
        order_number: `ORD-TBL-${liveTable.name}-${Date.now()}`,
        order_type: 'dine-in',
        table_id: liveTable.id,
        subtotal: pendingItems.reduce((acc, i) => acc + i.price, 0),
        tax: Math.round(pendingItems.reduce((acc, i) => acc + i.price, 0) * 0.05),
        grand_total: Math.round(pendingItems.reduce((acc, i) => acc + i.price, 0) * 1.05),
        order_status: 'pending'
      },
      items: pendingItems.map(i => ({
        menu_item_id: i.menu_item_id || 1,
        quantity: 1,
        unit_price: i.price,
        total_price: i.price
      }))
    };

    addOrder(orderData);

    // Update table items status
    const updatedOrders = liveTable.orders.map(i => ({ ...i, status: 'kitchen' }));
    updateTableStatus(liveTable.id, 'occupied', { orders: updatedOrders, total: liveTableSubtotal });

    showToast(`Sent ${pendingItems.length} items to Kitchen!`, "success");
    setSelectedTable(null);
  };

  const handleCreateTable = (e) => {
    e.preventDefault();
    addTable({
      name: newTableData.name,
      capacity: parseInt(newTableData.capacity),
      floor: newTableData.floor
    });
    setShowAddTable(false);
    setNewTableData({ name: '', capacity: 4, floor: activeFloor });
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4 lg:gap-6 relative">
      {/* Floor View Main Area */}
      <div className="flex-1 space-y-5 lg:space-y-6 overflow-y-auto pr-0 lg:pr-4 scrollbar-hide">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
          <div>
            <h2 className="text-xl lg:text-2xl font-black tracking-tight text-text-primary uppercase tracking-[0.05em]">Floor Management</h2>
            <p className="text-text-secondary mt-1 text-xs lg:text-sm font-medium">Coordinate your restaurant seating in real-time.</p>
          </div>
          <div className="flex flex-wrap gap-2 lg:gap-4">
            {['available', 'occupied', 'reserved'].map(status => {
              const config = getStatusConfig(status);
              return (
                <div key={status} className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[8px] lg:text-[9px] font-bold uppercase tracking-widest", config.bg, config.text, config.border)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full shadow-sm", config.color)}></span>
                  {status}
                </div>
              );
            })}
          </div>
        </div>

        {/* Floor Selection & Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide -mx-1 px-1">
            {floors.map(floor => (
              <button
                key={floor}
                onClick={() => setActiveFloor(floor)}
                className={cn(
                  "px-4 lg:px-6 py-2 rounded-lg lg:rounded-xl text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.15em] border-2 whitespace-nowrap transition-all",
                  activeFloor === floor
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                    : "bg-surface text-text-secondary border-transparent hover:border-primary/20 hover:bg-indigo-50/30"
                )}
              >
                {floor}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowHistory(true)}
              className="p-3 lg:p-2.5 bg-surface border border-border rounded-xl shadow-sm text-text-secondary hover:text-primary flex-1 sm:flex-none flex justify-center items-center"
            >
              <History className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowAddTable(true)}
              className="btn-primary py-3 px-5 lg:px-6 text-[10px] lg:text-xs flex-[3] sm:flex-none whitespace-nowrap uppercase tracking-widest font-black"
            >
              Add New Table
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-5 pb-20 lg:pb-0">
          {processedTables.filter(t => t.floor === activeFloor).map((table) => {
            const config = getStatusConfig(table.status);
            const isSelected = selectedTable?.id === table.id;
            const tableSubtotal = table.orders?.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0) || 0;

            return (
              <div
                key={table.id}
                onClick={() => setSelectedTable(table)}
                className={cn(
                  "card cursor-pointer relative overflow-hidden group border-2 bg-gradient-to-br from-white to-slate-50/50 p-4 lg:p-5",
                  isSelected ? "border-primary shadow-2xl shadow-primary/10" : "border-transparent"
                )}
              >
                <div className={cn("absolute top-0 left-0 w-full h-1", config.color)}></div>
                <div className="flex justify-between items-start mb-3 lg:mb-6">
                  <div className="flex items-center gap-2 lg:gap-2.5">
                    <span className={cn("w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full shadow-sm", config.color)}></span>
                    <span className="text-base lg:text-xl font-black text-text-primary tracking-tighter uppercase leading-none">{table.name}</span>
                  </div>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 lg:px-2 lg:py-1 bg-surface border border-slate-100 rounded-lg text-text-secondary font-bold text-[7px] lg:text-[9px] shadow-sm uppercase tracking-widest shrink-0">
                    <Users className="w-2.5 h-2.5 lg:w-3 lg:h-3" /> {table.capacity}
                  </div>
                </div>

                {table.status === 'occupied' ? (
                  <div className="space-y-3 lg:space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[8px] lg:text-[9px] font-bold text-primary uppercase tracking-widest bg-rose-50 w-fit px-1.5 py-0.5 rounded-md">
                        <Clock className="w-3 h-3" />
                        {table.time}
                      </div>
                      <span className="text-[10px] font-black text-text-primary uppercase truncate max-w-[80px]">{table.customerName}</span>
                    </div>
                    <div className="space-y-1">
                      {table.orders.length > 0 ? (
                        table.orders.slice(0, 2).map((order, i) => (
                          <p key={i} className="text-[10px] lg:text-[11px] font-bold text-text-primary truncate">{order.name}</p>
                        ))
                      ) : (
                        <p className="text-[10px] lg:text-[11px] font-bold text-slate-300 italic">No items yet</p>
                      )}
                      {table.orders.length > 2 && (
                        <p className="text-[7px] lg:text-[8px] font-bold text-primary uppercase tracking-widest">+ {table.orders.length - 2} Items</p>
                      )}
                    </div>
                    <div className="pt-2 lg:pt-3 border-t border-dashed border-slate-200 flex items-center justify-between">
                      <span className="text-[7px] lg:text-[9px] font-bold text-slate-400 uppercase tracking-widest">Bill</span>
                      <span className="text-xs lg:text-base font-black text-primary">{formatCurrency(Math.round(tableSubtotal * 1.05))}</span>
                    </div>
                  </div>
                ) : table.status === 'reserved' ? (
                  <div className="mt-4 lg:mt-8">
                    <div className="p-3 lg:p-4 bg-indigo-50/50 rounded-xl lg:rounded-2xl border-2 border-indigo-100/50 relative overflow-hidden">
                      <p className="text-[8px] lg:text-[9px] font-black text-primary uppercase tracking-[0.2em] lg:tracking-[0.25em]">Reserved @ {table.time}</p>
                      <p className="text-xs lg:text-sm font-black text-text-primary mt-1.5 lg:mt-2 truncate">{table.reservedBy}</p>
                      <Calendar className="absolute -bottom-2 -right-2 w-8 lg:w-12 h-8 lg:h-12 text-primary/10 -rotate-12" />
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 lg:mt-8 flex flex-col items-center justify-center py-2 lg:py-4 text-slate-200 group-hover:text-primary relative">
                    <div className="w-10 lg:w-12 h-10 lg:h-12 bg-slate-50 rounded-full flex items-center justify-center border-2 border-dashed border-slate-200 group-hover:border-primary/30 group-hover:bg-surface">
                      <Plus className="w-5 lg:w-6 h-5 lg:h-6 opacity-40 group-hover:opacity-100" />
                    </div>
                    <span className="text-[7px] lg:text-[8px] font-bold uppercase tracking-[0.2em] lg:tracking-[0.3em] mt-2 lg:mt-3 opacity-40 group-hover:opacity-100">Open Session</span>
                  </div>
                )}

                {/* Status Dot in BG */}
                <div className={cn("absolute -bottom-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-10", config.bg)} />
              </div>
            );
          })}
        </div>
      </div>
      {/* Table Side Drawer */}
      {selectedTable && (() => {
        return (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6">
            <div
              onClick={() => setSelectedTable(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <div
              className="relative w-full max-w-[95%] md:max-w-[500px] bg-surface shadow-2xl z-[201] flex flex-col rounded-[2rem] md:rounded-[2.5rem] overflow-hidden self-end sm:self-center max-h-[90vh]"
            >
              <div className="px-5 py-4 md:px-6 md:py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30 shrink-0">
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className={cn("w-10 lg:w-12 h-10 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center font-black text-base lg:text-lg text-white shadow-xl", getStatusConfig(liveTable.status).color)}>
                    {liveTable.name}
                  </div>
                  <div>
                    <h3 className="text-sm lg:text-lg font-black tracking-tight uppercase leading-none">Active Session</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn("badge px-1.5 py-0.5 text-[7px] lg:text-[9px]", getStatusConfig(liveTable.status).bg, getStatusConfig(liveTable.status).text)}>
                        {liveTable.status}
                      </span>
                      <span className="hidden sm:inline text-[8px] lg:text-[9px] font-bold text-slate-300 uppercase tracking-widest">ID: #TBL-{liveTable.id}04</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTable(null)}
                  className="p-2 lg:p-2.5 hover:bg-surface rounded-xl border border-transparent hover:border-border transition-all shadow-sm"
                >
                  <X className="w-5 lg:w-6 h-5 lg:h-6 text-text-secondary" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 lg:space-y-8 scrollbar-hide">
                {liveTable.status === 'occupied' ? (
                  <>
                    <div className="space-y-4 lg:space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[9px] lg:text-[10px] font-black text-text-secondary uppercase tracking-[0.3em]">Items Ordered</h4>
                        <div
                          className="flex items-center gap-2 text-primary font-black text-[10px] lg:text-[11px] uppercase tracking-widest px-2.5 py-1 bg-indigo-50 rounded-full cursor-pointer hover:bg-indigo-100"
                        >
                          <History className="w-3 h-3 lg:w-3.5 lg:h-3.5" /> Log
                        </div>
                      </div>
                      <div className="space-y-3 lg:space-y-4">
                        {liveTable.orders.length > 0 ? (
                          liveTable.orders.map((item, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-3 lg:p-4 bg-slate-50 rounded-xl lg:rounded-2xl group hover:bg-surface hover:shadow-xl transition-all border border-transparent hover:border-slate-100"
                            >
                              <div className="flex items-center gap-3 lg:gap-4">
                                <div className="w-8 lg:w-10 h-8 lg:h-10 bg-surface rounded-lg lg:rounded-xl flex items-center justify-center font-bold text-[10px] lg:text-xs border border-slate-100 group-hover:border-primary/20">
                                  {item.quantity || 1}x
                                </div>
                                <div>
                                  <p className="text-xs lg:text-sm font-bold text-text-primary leading-tight">{item.name}</p>
                                  <p className={cn(
                                    "text-[8px] lg:text-[9px] font-bold uppercase tracking-widest mt-1 flex items-center gap-1.5",
                                    item.status === 'kitchen' || item.status === 'ready' || item.status === 'delivered' ? "text-emerald-500" : "text-amber-500"
                                  )}>
                                    <UtensilsCrossed className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                                    {item.status === 'kitchen' || item.status === 'ready' || item.status === 'delivered' ? 'Kitchen Confirmed' : 'Pending Send'}
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs lg:text-sm font-bold text-text-primary tracking-tight">{formatCurrency(item.price)}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 lg:py-10 bg-slate-50 rounded-[1.5rem] lg:rounded-[2rem] border-2 border-dashed border-slate-200">
                            <UtensilsCrossed className="w-8 lg:w-10 h-8 lg:h-10 text-slate-200 mx-auto mb-2 lg:mb-3" />
                            <p className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest">No items ordered yet</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-6 lg:p-8 bg-primary text-white rounded-[1.5rem] lg:rounded-[2rem] shadow-2xl relative overflow-hidden group">
                      <div className="space-y-3 lg:space-y-4 relative z-10">
                        <div className="flex justify-between text-indigo-100 text-[8px] lg:text-[9px] font-bold uppercase tracking-[0.2em]">
                          <span>Net Subtotal</span>
                          <span className="text-white">{formatCurrency(liveTableSubtotal)}</span>
                        </div>
                        <div className="flex justify-between text-indigo-100 text-[8px] lg:text-[9px] font-bold uppercase tracking-[0.2em]">
                          <span>Tax (5%)</span>
                          <span className="text-white">{formatCurrency(Math.round(liveTableSubtotal * 0.05))}</span>
                        </div>
                        <div className="pt-4 lg:pt-6 border-t border-indigo-500/30 flex justify-between items-end">
                          <div>
                            <p className="text-indigo-200 text-[7px] lg:text-[8px] font-bold uppercase tracking-[0.2em] mb-1">Total Due</p>
                            <h4 className="text-2xl lg:text-3xl font-black text-white tracking-tighter">{formatCurrency(Math.round(liveTableSubtotal * 1.05))}</h4>
                          </div>
                          <div className="p-2.5 lg:p-3 bg-surface/10 rounded-xl lg:rounded-2xl border border-white/20">
                            <Receipt className="w-4 lg:w-5 h-4 lg:h-5 text-white" />
                          </div>
                        </div>
                      </div>
                      <Sparkles className="absolute -bottom-4 -right-4 w-24 lg:w-32 h-24 lg:h-32 text-white/10 rotate-12" />
                    </div>
                  </>
                ) : liveTable.status === 'reserved' ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 lg:p-12 bg-indigo-50/50 rounded-[2rem] lg:rounded-[3rem] border-4 border-dashed border-primary/20">
                    <div className="w-16 lg:w-24 h-16 lg:h-24 bg-surface rounded-2xl lg:rounded-[2rem] shadow-2xl flex items-center justify-center mb-6 lg:mb-8">
                      <Clock className="w-8 lg:w-10 h-8 lg:h-10 text-primary" />
                    </div>
                    <h4 className="text-2xl lg:text-3xl font-black text-text-primary tracking-tight">Table Reserved</h4>
                    <p className="text-text-secondary text-xs lg:text-sm font-medium mt-3 lg:mt-4 max-w-[240px] lg:max-w-[280px] leading-relaxed italic">
                      Reserved for <span className="font-black text-primary">{liveTable.reservedBy}</span> at <span className="font-black text-primary uppercase tracking-widest">{liveTable.time}</span>
                    </p>
                    <div className="mt-8 lg:mt-12 w-full space-y-3 lg:space-y-4">
                      <button
                        onClick={() => handleMarkArrived(liveTable)}
                        className="w-full btn-primary py-4 lg:py-5 text-sm lg:text-base font-black tracking-widest uppercase"
                      >
                        Mark as Arrived
                      </button>
                      <button
                        onClick={() => handleCancelBooking(liveTable)}
                        className="w-full btn-secondary py-4 lg:py-5 text-sm lg:text-base font-black tracking-widest uppercase text-primary border-none hover:bg-red-50"
                      >
                        Cancel Booking
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 lg:p-8 bg-slate-50 rounded-[2rem] lg:rounded-[3rem] border-4 border-dashed border-slate-200">
                    <div className="w-16 lg:w-20 h-16 lg:h-20 bg-surface rounded-xl lg:rounded-[1.5rem] shadow-xl flex items-center justify-center mb-4 lg:mb-6">
                      <Users className="w-6 lg:w-8 h-6 lg:h-8 text-slate-300" />
                    </div>
                    <h4 className="text-xl lg:text-2xl font-black text-text-primary">Table Available</h4>
                    <p className="text-text-secondary text-[10px] lg:text-xs font-medium mt-1.5 lg:mt-2">Ready for up to {liveTable.capacity} guests.</p>

                    <div className="mt-6 lg:mt-8 w-full space-y-4 lg:space-y-6">
                      <div className="space-y-2 lg:space-y-3">
                        <label className="text-[9px] lg:text-[10px] font-black text-text-secondary uppercase tracking-widest block text-left ml-4">Guest Count</label>
                        <div className="flex items-center gap-2 lg:gap-4 bg-surface p-1.5 lg:p-2 rounded-xl lg:rounded-2xl border-2 border-slate-100">
                          {[1, 2, 4, 6].map(num => (
                            <button
                              key={num}
                              onClick={() => setGuestCount(num)}
                              className={cn(
                                "flex-1 py-2 lg:py-3 rounded-lg lg:rounded-xl text-xs lg:text-sm font-black transition-all",
                                guestCount === num ? "bg-primary text-white shadow-lg" : "hover:bg-slate-50 text-text-secondary"
                              )}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenSession(liveTable)}
                        className="w-full btn-primary py-4 lg:py-5 text-sm lg:text-base font-black tracking-widest uppercase shadow-2xl shadow-primary/30"
                      >
                        Start Session
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {liveTable.status === 'occupied' && (
                <div className="px-6 py-6 bg-surface border-t border-slate-50 space-y-2 lg:space-y-3">
                  <button
                    onClick={() => setShowAddItems(true)}
                    className="w-full btn-primary flex items-center justify-center gap-2 py-3 lg:py-4 text-sm lg:text-base shadow-xl shadow-primary/30"
                  >
                    <Plus className="w-4 lg:w-5 h-4 lg:h-5 stroke-[3]" /> Quick Add
                  </button>
                  <div className="grid grid-cols-2 gap-2 lg:gap-3">
                    <button
                      onClick={handleSendToKitchen}
                      className="btn-secondary flex flex-col items-center justify-center gap-1 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl border transition-all group hover:border-primary/50"
                    >
                      <ChefHat className="w-4 lg:w-5 h-4 lg:h-5 text-slate-400 group-hover:text-primary transition-colors" />
                      <span className="text-[8px] lg:text-[9px] font-bold uppercase tracking-widest text-slate-500">To Kitchen</span>
                    </button>
                    <button
                      onClick={() => setShowBilling(true)}
                      className="btn-secondary flex flex-col items-center justify-center gap-1 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl border bg-indigo-50 border-primary/20 text-primary group"
                    >
                      <Receipt className="w-4 lg:w-5 h-4 lg:h-5" />
                      <span className="text-[8px] lg:text-[9px] font-bold uppercase tracking-widest">Final Bill</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Modern Compact Add Table Modal */}
      {showAddTable && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div
            onClick={() => setShowAddTable(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <div
            className="relative w-full max-w-[95%] md:max-w-md bg-surface rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 self-center"
          >
            <form onSubmit={handleCreateTable}>
              <div className="px-5 py-4 md:px-8 md:py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/20 shrink-0">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-14 md:h-14 bg-primary rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-xl relative group shrink-0">
                    <Users className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-black uppercase tracking-tight leading-none">New Table</h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5 md:mt-1">Assign to {activeFloor}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setShowAddTable(false)} className="p-2 md:p-2.5 hover:bg-surface rounded-xl border border-transparent hover:border-slate-100 shadow-sm group">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Identifier</label>
                  <input
                    required
                    value={newTableData.name}
                    onChange={e => setNewTableData({ ...newTableData, name: e.target.value })}
                    type="text" placeholder="e.g. T-15" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none font-bold text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Guest Capacity</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['2', '4', '6', '8'].map(cap => (
                      <button
                        key={cap}
                        type="button"
                        onClick={() => setNewTableData({ ...newTableData, capacity: cap })}
                        className={cn(
                          "py-2.5 rounded-xl border-2 text-[10px] font-black uppercase transition-all",
                          newTableData.capacity === cap ? "bg-primary border-primary text-white shadow-lg" : "bg-surface border-slate-50 text-slate-400 hover:border-primary/20"
                        )}
                      >
                        {cap}P
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Zone Assignment</label>
                  <div className="grid grid-cols-3 gap-2">
                    {floors.map(f => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setNewTableData({ ...newTableData, floor: f })}
                        className={cn(
                          "py-2.5 rounded-xl border-2 text-[8px] font-black uppercase tracking-widest transition-all",
                          newTableData.floor === f ? "bg-primary border-primary text-white shadow-lg" : "bg-surface border-slate-50 text-slate-400 hover:border-primary/20"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 lg:p-8 border-t border-slate-50 flex gap-3 bg-surface">
                <button type="button" onClick={() => setShowAddTable(false)} className="flex-1 py-3.5 lg:py-4 border-2 border-slate-100 rounded-xl lg:rounded-2xl font-black uppercase tracking-widest text-[9px] lg:text-[10px] hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 btn-primary py-3.5 lg:py-4 rounded-xl lg:rounded-full font-black uppercase tracking-widest shadow-xl shadow-primary/20 text-[9px] lg:text-[10px]">Create Entry</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 lg:p-6">
          <div
            onClick={() => setShowHistory(false)}
            className="absolute inset-0 bg-slate-900/60"
          />
          <div
            className="relative w-full max-w-[95%] md:max-w-[620px] max-h-[90vh] bg-surface rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col self-center"
          >
            <div className="px-6 py-6 lg:px-8 lg:py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 shrink-0">
              <div>
                <h3 className="text-xl lg:text-2xl font-black tracking-tight">Session History</h3>
                <p className="text-text-secondary text-xs lg:text-sm font-medium">Recent table settlements</p>
              </div>
              <button onClick={() => setShowHistory(false)} className="p-2 lg:p-3 bg-slate-50 rounded-xl lg:rounded-2xl hover:bg-slate-100 transition-all">
                <X className="w-5 lg:w-6 h-5 lg:h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6 lg:px-8 lg:py-10 space-y-3 lg:space-y-4 scrollbar-hide">
              {historyData.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 lg:p-6 bg-slate-50 rounded-2xl lg:rounded-3xl group hover:bg-surface hover:shadow-xl transition-all border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="w-10 lg:w-12 h-10 lg:h-12 bg-surface rounded-xl lg:rounded-2xl flex items-center justify-center font-black text-sm lg:text-primary shadow-sm">
                      {item.table}
                    </div>
                    <div>
                      <p className="text-sm lg:text-base font-black text-text-primary">{item.customer}</p>
                      <p className="text-[9px] lg:text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-0.5 lg:mt-1">{item.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base lg:text-lg font-black text-text-primary">{item.total}</p>
                    <span className="text-[8px] lg:text-[9px] font-black text-success uppercase tracking-[0.15em] lg:tracking-[0.2em]">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Items Quick Modal */}
      {showAddItems && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 lg:p-6">
          <div
            onClick={() => setShowAddItems(false)}
            className="absolute inset-0 bg-slate-900/60"
          />
          <div
            className="relative w-full max-w-[95%] md:max-w-md bg-surface rounded-[2rem] md:rounded-[3.5rem] shadow-2xl p-6 md:p-10 self-end sm:self-center max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="shrink-0">
              <h3 className="text-xl lg:text-2xl font-black tracking-tight mb-6 lg:mb-8 text-text-primary uppercase tracking-wider">Quick Add Items</h3>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                {((menuItems && menuItems.length > 0) ? menuItems.slice(0, 6) : [
                  { id: 1, item_name: 'Fresh Lime', price: 90 },
                  { id: 2, item_name: 'Garlic Bread', price: 180 },
                  { id: 3, item_name: 'Brownie Shake', price: 240 },
                  { id: 4, item_name: 'Extra Cheese', price: 60 }
                ]).map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      updateTableStatus(liveTable.id, 'occupied', {
                        orders: [...liveTable.orders, { name: item.item_name || item.name, price: item.price, status: 'pending', menu_item_id: item.id }],
                        total: liveTableSubtotal + item.price
                      });
                      setShowAddItems(false);
                    }}
                    className="p-4 lg:p-6 bg-slate-50 rounded-2xl lg:rounded-[2rem] border-2 border-transparent hover:border-primary/20 hover:bg-surface transition-all text-left group"
                  >
                    <p className="text-xs lg:text-sm font-black text-text-primary group-hover:text-primary">{item.item_name || item.name}</p>
                    <p className="text-[9px] lg:text-[10px] font-bold text-text-secondary mt-0.5 lg:mt-1">{formatCurrency(item.price)}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="shrink-0 mt-6 lg:mt-8">
              <button onClick={() => setShowAddItems(false)} className="w-full py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black uppercase text-[10px] lg:text-xs tracking-widest text-slate-400 hover:bg-slate-100 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compact & Interactive Billing Modal */}
      {showBilling && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 overflow-hidden">
          <div
            onClick={handleCloseBilling}
            className="absolute inset-0 bg-slate-900/60"
          />
          <div
            className="relative w-full max-w-[95%] md:max-w-xl bg-surface rounded-[2rem] md:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] border border-white/20 self-center"
          >
            {/* Header */}
            <div className="px-5 py-5 lg:px-6 lg:py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/20 shrink-0">
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-primary rounded-xl lg:rounded-2xl flex items-center justify-center text-white shadow-xl shrink-0">
                  <Receipt className="w-6 h-6 lg:w-7 lg:h-7" />
                </div>
                <div>
                  <h3 className="text-lg lg:text-xl font-black text-text-primary tracking-tight leading-none">Table Receipt</h3>
                  <p className="text-[8px] lg:text-[10px] text-text-secondary font-bold uppercase tracking-widest opacity-60 mt-1">
                    Table {liveTable?.name} • #7702
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseBilling}
                className="p-2 lg:p-2.5 hover:bg-surface rounded-xl border border-transparent hover:border-border transition-all shadow-sm group"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 scrollbar-hide">
              {paymentState === 'idle' ? (
                <>
                  {/* Payment Methods */}
                  <div className="space-y-4">
                    <h4 className="text-[9px] font-black text-text-secondary uppercase tracking-[0.3em] px-1">Settlement Method</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { name: 'Cash', icon: Receipt, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { name: 'QR Code', icon: QrCode, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { name: 'Card', icon: CreditCard, color: 'text-primary', bg: 'bg-indigo-50' },
                        { name: 'Bank', icon: Building, color: 'text-purple-600', bg: 'bg-purple-50' },
                      ].map((method) => (
                        <button
                          onClick={() => setPaymentMethod(method.name)}
                          key={method.name}
                          className={cn(
                            "relative p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all overflow-hidden",
                            paymentMethod === method.name
                              ? "border-primary bg-indigo-50/30 shadow-md"
                              : "border-slate-50 bg-slate-50/50 hover:border-primary/20 hover:bg-surface"
                          )}
                        >
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm", method.bg)}>
                            <method.icon className={cn("w-5 h-5 stroke-[2.5]", method.color)} />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-[0.1em]">{method.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amount Summary */}
                  <div className="px-6 py-7 bg-slate-50/80 rounded-[1.5rem] border-2 border-white flex items-center justify-between group hover:bg-surface shadow-inner">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Payable Amount</span>
                      <h4 className="text-4xl font-black text-text-primary tracking-tighter">{formatCurrency(Math.round(liveTableSubtotal * 1.05))}</h4>
                    </div>
                    <div className="flex w-12 h-12 bg-surface rounded-xl border border-slate-100 items-center justify-center shadow-lg">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                  </div>

                  {/* Brief Breakdown */}
                  <div className="px-4 space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-text-secondary uppercase tracking-widest opacity-60">
                      <span>Subtotal</span>
                      <span>{formatCurrency(liveTableSubtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                      <span>Taxes & Service (5%)</span>
                      <span>+ {formatCurrency(Math.round(liveTableSubtotal * 0.05))}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-6 py-4">
                   <div className="p-4 bg-white rounded-3xl shadow-sm border-2 border-slate-100">
                      {paymentMethod === 'QR Code' ? (
                        <QRCodeSVG value={invoiceUrl} size={200} />
                      ) : (
                        <div className="w-[200px] h-[200px] flex items-center justify-center bg-slate-50 rounded-2xl">
                           <CreditCard className="w-16 h-16 text-primary opacity-50" />
                        </div>
                      )}
                   </div>
                   <div className="text-center space-y-2">
                      <h4 className="text-xl font-black uppercase text-text-primary">Waiting for Payment</h4>
                      <p className="text-xs font-bold text-text-secondary">Please ask the customer to complete the payment.</p>
                      
                      {paymentMethod !== 'QR Code' && (
                         <button 
                           onClick={() => window.open(invoiceUrl, '_blank')}
                           className="mt-4 px-6 py-2 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/30"
                         >
                           Open Payment Link
                         </button>
                      )}
                   </div>
                   <div className="flex items-center gap-2 mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <div className="w-4 h-4 border-2 border-slate-300 border-t-primary rounded-full animate-spin" />
                      Awaiting confirmation...
                   </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 py-6 border-t border-slate-50 bg-surface shrink-0">
              <button
                disabled={isProcessing || paymentState !== 'idle'}
                onClick={handleFinalize}
                className={cn(
                  "w-full py-4.5 text-lg shadow-xl rounded-2xl font-black tracking-tight",
                  (isProcessing || paymentState !== 'idle')
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "btn-primary shadow-primary/20"
                )}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-sm">Processing...</span>
                  </div>
                ) : paymentState !== 'idle' ? 'Awaiting Payment' : 'Finalize & Print'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Hidden Printable Bill */}
      {liveTable && (
        <div id="bill-printable-area" className="hidden print:block printable-area receipt-print">
          <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
            <h1 className="text-xl font-black uppercase tracking-tighter">The Luxe Grande</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-1">Table Final Bill</p>
          </div>

          <div className="flex justify-between text-[10px] font-bold mb-4">
            <div>
              <p>TABLE: {liveTable.name}</p>
              <p>FLOOR: {liveTable.floor}</p>
              <p>DATE: {new Date().toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p>TIME: {new Date().toLocaleTimeString()}</p>
              <p>METHOD: {paymentMethod}</p>
            </div>
          </div>

          <table className="w-full text-[10px] mb-4">
            <thead>
              <tr className="border-b border-slate-300">
                <th className="text-left py-2">ITEM</th>
                <th className="text-center py-2">QTY</th>
                <th className="text-right py-2">PRICE</th>
              </tr>
            </thead>
            <tbody>
              {liveTable.orders?.map((item, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-2 uppercase font-medium">{item.name}</td>
                  <td className="py-2 text-center">{item.quantity || 1}</td>
                  <td className="py-2 text-right">{formatCurrency(item.price)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="py-4 font-black uppercase text-right pr-4">Subtotal</td>
                <td className="py-4 text-right font-black">{formatCurrency(liveTableSubtotal)}</td>
              </tr>
              <tr>
                <td className="py-1 font-black uppercase text-right pr-4">Tax (5%)</td>
                <td className="py-1 text-right font-black">{formatCurrency(Math.round(liveTableSubtotal * 0.05))}</td>
              </tr>
              <tr className="border-t-2 border-slate-900">
                <td className="py-4 font-black uppercase text-right pr-4 text-lg">Grand Total</td>
                <td className="py-4 text-right font-black text-lg">{formatCurrency(Math.round(liveTableSubtotal * 1.05))}</td>
              </tr>
            </tfoot>
          </table>

          <div className="text-center pt-4 border-t border-slate-200">
            <p className="text-[9px] font-black uppercase tracking-widest">Thank you for dining with us!</p>
            <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Visit again soon • {settings?.businessName || 'Gila House'} Systems</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tables;
