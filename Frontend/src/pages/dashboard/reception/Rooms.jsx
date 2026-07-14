import { formatCurrency } from '../../../utils/currencyUtils';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  X, 
  ChevronRight, 
  Bed, 
  Users, 
  Clock, 
  Sparkles,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Trash2
} from 'lucide-react';
import { cn } from "../../../utils/cn";
import { useHospitality } from "@/context/HospitalityContext";

const Rooms = () => {
  const { rooms, addRoom, updateRoom, updateRoomStatus, deleteRoom } = useHospitality();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const [newRoomData, setNewRoomData] = useState({ 
    code: '',
    name: '', 
    type: 'Deluxe', 
    capacity: 2, 
    status: 'Available',
    price: 0,
    notes: '' 
  });

  const roomTypes = ['Standard', 'Deluxe', 'Suite', 'Executive'];
  const roomStatuses = ['Available', 'Occupied', 'Reserved', 'Cleaning', 'Maintenance'];

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Available': return { color: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', icon: CheckCircle2 };
      case 'Occupied': return { color: 'bg-primary', bg: 'bg-rose-50', text: 'text-primary', border: 'border-rose-100', icon: Users };
      case 'Reserved': return { color: 'bg-primary', bg: 'bg-indigo-50', text: 'text-primary', border: 'border-indigo-100', icon: Clock };
      case 'Cleaning': return { color: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', icon: Sparkles };
      case 'Maintenance': return { color: 'bg-slate-400', bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100', icon: Wrench };
      default: return { color: 'bg-slate-300', bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-100', icon: AlertCircle };
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = (room.room_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                          (room.room_code?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                          (room.assigned_guest?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'All' || room.room_status?.toLowerCase() === activeTab.toLowerCase();
    return matchesSearch && matchesTab;
  });

  const handleCreateRoom = (e) => {
    e.preventDefault();
    addRoom({
      room_code: newRoomData.code,
      room_name: newRoomData.name,
      room_type: newRoomData.type,
      capacity: parseInt(newRoomData.capacity),
      room_status: newRoomData.status.toLowerCase(),
      base_rate: parseFloat(newRoomData.price || 0),
      notes: newRoomData.notes
    });
    setNewRoomData({ code: '', name: '', type: 'Deluxe', capacity: 2, status: 'Available', price: 0, notes: '' });
    setShowAddRoom(false);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Area */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
            <Bed className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-text-primary uppercase tracking-wider">Rooms Management</h2>
            <p className="text-text-secondary text-sm font-bold mt-1">Total {rooms.length} Units • {rooms.filter(r => r.room_status?.toLowerCase() === 'available').length} Ready</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group min-w-[240px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search rooms or guests..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-5 py-3 bg-surface border border-slate-100 rounded-2xl outline-none shadow-sm text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all"
            />
          </div>
          <button 
            onClick={() => setShowAddRoom(true)}
            className="btn-primary h-[48px] px-6 rounded-full flex items-center gap-3 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5" /> New Room
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1 shrink-0">
        {['All', ...roomStatuses].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 whitespace-nowrap transition-all",
              activeTab === tab 
              ? "bg-primary text-white border-primary shadow-lg shadow-primary/10" 
              : "bg-surface text-text-secondary border-transparent hover:bg-slate-50"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Rooms Grid */}
      <div className="flex-1 overflow-y-auto scrollbar-hide -mx-1 px-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 pb-10">
          {filteredRooms.map((room) => {
            const status = room.room_status?.charAt(0).toUpperCase() + room.room_status?.slice(1);
            const config = getStatusConfig(status || 'Available');
            const StatusIcon = config.icon;
            return (
              <div 
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className="group card bg-surface border-none shadow-xl shadow-slate-100/50 p-5 rounded-[2.5rem] hover:bg-slate-50 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 opacity-10", config.color)} />
                
                <div className="flex justify-between items-start mb-6">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg", config.bg, config.text)}>
                    <Bed className="w-6 h-6" />
                  </div>
                  <div className={cn("px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border", config.bg, config.text, config.border)}>
                    {status}
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black text-text-primary tracking-tight truncate" title={room.room_name}>
                    {room.room_name || room.room_code}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{room.room_type}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cap: {room.capacity}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{formatCurrency(parseFloat(room.base_rate || 0))}</span>
                  </div>
                  {room.room_name && room.room_name !== room.room_code && (
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{room.room_code}</p>
                  )}
                </div>

                <div className="mt-6 pt-5 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={cn("w-4 h-4", config.text)} />
                    <span className="text-[11px] font-bold text-text-primary">
                      {room.assigned_guest || room.assignedGuest || 'No Guest'}
                      {room.room_status === 'occupied' && room.guests_count ? ` (${room.guests_count} P)` : ''}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Modals */}
      {showAddRoom && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div onClick={() => setShowAddRoom(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="relative w-full sm:max-w-[500px] bg-surface rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] self-center animate-in fade-in slide-in-from-bottom-4 sm:zoom-in duration-300">
            <div className="px-6 py-5 md:px-8 md:py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 shrink-0">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                     <Plus className="w-5 h-5 text-primary stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-black uppercase tracking-tight leading-none">Add New Unit</h3>
                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 md:mt-1 leading-none">Register and configure hospitality space</p>
                  </div>
               </div>
              <button onClick={() => setShowAddRoom(false)} className="p-2 hover:bg-surface rounded-xl border border-transparent hover:border-slate-100 shadow-sm transition-all"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!newRoomData.name.trim() || !newRoomData.code.trim()) return;
                addRoom({
                  room_code: newRoomData.code,
                  room_name: newRoomData.name,
                  room_type: newRoomData.type,
                  capacity: parseInt(newRoomData.capacity),
                  room_status: newRoomData.status.toLowerCase(),
                  base_rate: parseFloat(newRoomData.price || 0),
                  notes: newRoomData.notes
                });
                setNewRoomData({ code: '', name: '', type: 'Deluxe', capacity: 2, status: 'Available', price: 0, notes: '' });
                setShowAddRoom(false);
              }} 
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-hide">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Room ID / Code</label>
                    <input 
                      required
                      value={newRoomData.code}
                      onChange={(e) => setNewRoomData({...newRoomData, code: e.target.value})}
                      placeholder="e.g. RM-101"
                      className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl text-xs font-bold outline-none border-2 border-transparent focus:border-primary/20 focus:bg-surface transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Room Name</label>
                    <input 
                      required
                      list="room-names-list"
                      value={newRoomData.name}
                      onChange={(e) => setNewRoomData({...newRoomData, name: e.target.value})}
                      placeholder="e.g. LENA"
                      className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl text-xs font-bold outline-none border-2 border-transparent focus:border-primary/20 focus:bg-surface transition-all"
                    />
                    <datalist id="room-names-list">
                      {Array.from(new Set(rooms.map(r => r.room_name).filter(Boolean))).map(name => (
                        <option key={name} value={name} />
                      ))}
                    </datalist>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 mt-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Type</label>
                    <div className="relative">
                      <select 
                        value={newRoomData.type}
                        onChange={(e) => setNewRoomData({...newRoomData, type: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl text-xs font-bold outline-none border-2 border-transparent focus:border-primary/20 focus:bg-surface transition-all appearance-none"
                      >
                        {roomTypes.map(t => <option key={t}>{t}</option>)}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Capacity</label>
                    <input 
                      type="number"
                      min="1"
                      max="10"
                      value={newRoomData.capacity}
                      onChange={(e) => setNewRoomData({...newRoomData, capacity: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl text-xs font-bold outline-none border-2 border-transparent focus:border-primary/20 focus:bg-surface transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Initial Status</label>
                    <div className="relative">
                      <select 
                        value={newRoomData.status}
                        onChange={(e) => setNewRoomData({...newRoomData, status: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl text-xs font-bold outline-none border-2 border-transparent focus:border-primary/20 focus:bg-surface transition-all appearance-none"
                      >
                        {roomStatuses.map(s => <option key={s}>{s}</option>)}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Base Rate (Rp)</label>
                    <input 
                      type="number"
                      value={newRoomData.price}
                      onChange={(e) => setNewRoomData({...newRoomData, price: e.target.value})}
                      placeholder="e.g. 2500"
                      className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl text-xs font-bold outline-none border-2 border-transparent focus:border-primary/20 focus:bg-surface transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Notes</label>
                  <textarea 
                    value={newRoomData.notes}
                    onChange={(e) => setNewRoomData({...newRoomData, notes: e.target.value})}
                    className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl text-xs font-bold outline-none border-2 border-transparent focus:border-primary/20 focus:bg-surface h-24 resize-none transition-all"
                    placeholder="Additional space configuration details..."
                  />
                </div>
              </div>
              <div className="px-6 py-4 md:px-8 md:py-6 border-t border-slate-50 bg-surface shrink-0 relative z-20">
                <button type="submit" className="w-full btn-primary py-3.5 rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 active:scale-95 transition-all text-center">
                  Register Unit
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {selectedRoom && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div onClick={() => setSelectedRoom(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="relative w-full sm:max-w-[500px] bg-surface rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] self-center animate-in fade-in slide-in-from-bottom-4 sm:zoom-in duration-300">
            <div className="p-5 md:p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className={cn("w-12 md:w-14 h-12 md:h-14 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-inner", getStatusConfig(selectedRoom.room_status?.charAt(0).toUpperCase() + selectedRoom.room_status?.slice(1) || 'Available').color)}>
                  <Bed className="w-6 md:w-7 h-6 md:h-7" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-text-primary uppercase tracking-tight leading-none">{selectedRoom.room_name || selectedRoom.room_code}</h3>
                  {selectedRoom.room_name && selectedRoom.room_name !== selectedRoom.room_code && (
                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 md:mt-1">{selectedRoom.room_code}</p>
                  )}
                </div>
              </div>
              <button onClick={() => setSelectedRoom(null)} className="p-2.5 hover:bg-surface rounded-xl border border-transparent hover:border-slate-100 shadow-sm transition-all"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-8 md:px-8 md:py-10 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Room ID / Code</p>
                  <input 
                    defaultValue={selectedRoom.room_code}
                    onBlur={(e) => {
                      if(e.target.value.trim() !== selectedRoom.room_code) {
                        updateRoom(selectedRoom.id, { room_code: e.target.value.trim() });
                        setSelectedRoom({...selectedRoom, room_code: e.target.value.trim()});
                      }
                    }}
                    className="w-full px-4 py-2.5 bg-slate-50 rounded-xl text-xs font-bold outline-none border-2 border-transparent focus:border-primary/20 focus:bg-surface transition-all shadow-inner uppercase"
                  />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Room Name</p>
                  <input 
                    defaultValue={selectedRoom.room_name}
                    onBlur={(e) => {
                      if(e.target.value.trim() !== selectedRoom.room_name) {
                        updateRoom(selectedRoom.id, { room_name: e.target.value.trim() });
                        setSelectedRoom({...selectedRoom, room_name: e.target.value.trim()});
                      }
                    }}
                    className="w-full px-4 py-2.5 bg-slate-50 rounded-xl text-xs font-bold outline-none border-2 border-transparent focus:border-primary/20 focus:bg-surface transition-all shadow-inner uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-4">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Guest Assignment</p>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-black text-text-primary">
                      {selectedRoom.assigned_guest || selectedRoom.assignedGuest || 'No Guest Active'}
                      {selectedRoom.room_status === 'occupied' && selectedRoom.guests_count ? ` - ${selectedRoom.guests_count} Person(s)` : ''}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Daily Rate (Rp)</p>
                  <input 
                    type="number"
                    defaultValue={selectedRoom.base_rate}
                    onBlur={(e) => updateRoom(selectedRoom.id, { base_rate: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 rounded-xl text-xs font-bold outline-none border-2 border-transparent focus:border-primary/20 focus:bg-surface transition-all shadow-inner"
                  />
                </div>
                <div className="sm:text-right col-span-1 sm:col-span-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Room State</p>
                  <div className="flex sm:justify-end">
                    <div className="relative min-w-[140px] w-full sm:w-auto">
                      <select 
                        value={selectedRoom.room_status}
                        onChange={(e) => {
                          updateRoomStatus(selectedRoom.id, e.target.value);
                          setSelectedRoom({...selectedRoom, room_status: e.target.value.toLowerCase()});
                        }}
                        className={cn("w-full px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 outline-none transition-all appearance-none", getStatusConfig(selectedRoom.room_status?.charAt(0).toUpperCase() + selectedRoom.room_status?.slice(1) || 'Available').border, getStatusConfig(selectedRoom.room_status?.charAt(0).toUpperCase() + selectedRoom.room_status?.slice(1) || 'Available').text)}
                      >
                        {roomStatuses.map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
                      </select>
                      <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rotate-90 pointer-events-none opacity-50" />
                    </div>
                  </div>
                </div>
              </div>

              {!selectedRoom.assigned_guest && (
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Direct Assignment</label>
                  <div className="flex gap-2">
                    <input 
                      id="assign-guest-input"
                      placeholder="Enter guest name for onboarding..."
                      className="flex-1 px-5 py-4 bg-slate-50 rounded-2xl text-xs font-bold outline-none border-2 border-transparent focus:border-primary/20 focus:bg-surface transition-all shadow-inner"
                    />
                    <button 
                      onClick={() => {
                        const input = document.getElementById('assign-guest-input');
                        if (input.value.trim()) {
                          updateRoom(selectedRoom.id, { assigned_guest: input.value.trim(), room_status: 'occupied' });
                          setSelectedRoom(null);
                        }
                      }}
                      className="px-6 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-xl shadow-primary/20 active:scale-95 transition-all"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              )}

              <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100/50 space-y-4">
                <div className="flex justify-between items-center">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Configuration Profile</p>
                   <span className="px-3 py-1 bg-surface rounded-lg text-[9px] font-black uppercase tracking-widest text-primary border border-slate-100 shadow-sm">{selectedRoom.type}</span>
                </div>
                <textarea 
                  className="w-full bg-transparent text-xs font-medium text-text-secondary leading-relaxed border-none outline-none resize-none h-20 scrollbar-hide"
                  defaultValue={selectedRoom.notes}
                  onBlur={(e) => updateRoom(selectedRoom.id, { notes: e.target.value })}
                  placeholder="No specific intelligence notes for this unit."
                />
              </div>
            </div>
            
            <div className="px-6 py-4 md:px-8 md:py-6 border-t border-slate-50 flex flex-row items-center gap-3 bg-surface shrink-0 relative z-20">
              <button 
                onClick={() => setSelectedRoom(null)}
                className="flex-1 py-3.5 bg-slate-50 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all active:scale-95 text-center"
              >
                Close Details
              </button>
              <button 
                onClick={() => {
                  if (confirm('Delete this unit? This action cannot be undone.')) {
                    deleteRoom(selectedRoom.id);
                    setSelectedRoom(null);
                  }
                }}
                className="w-12 h-12 sm:w-14 sm:h-14 bg-rose-50 text-primary rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all active:scale-95 shadow-sm shrink-0"
              >
                <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default Rooms;
