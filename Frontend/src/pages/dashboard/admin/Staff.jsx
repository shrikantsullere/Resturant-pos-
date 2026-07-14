import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Mail, 
  Phone, 
  Calendar,
  BadgeCheck,
  UserCheck,
  Filter,
  Shield,
  Clock,
  ChevronRight,
  Star,
  MapPin,
  Sparkles,
  X,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Printer,
  Bed
} from 'lucide-react';
import { cn } from "../../../utils/cn";
import { useHospitality } from "@/context/HospitalityContext";
import printContent from "../../../utils/printUtil";

const Staff = () => {
  const { staff: staffMembers, addStaff, updateStaff, deleteStaff } = useHospitality();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  const roles = ['All', 'Admin', 'Manager', 'Chef', 'Waiter', 'Cashier'];

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveMember = (data) => {
    if (editingStaff) {
      updateStaff(editingStaff.id, data);
      showToast('Staff profile updated');
    } else {
      const avatar = data.name.split(' ').map(n => n[0]).join('').toUpperCase();
      addStaff({ ...data, avatar });
      showToast('New staff member added');
    }
    setShowAddModal(false);
    setEditingStaff(null);
  };

  const handleDelete = (id) => {
    deleteStaff(id);
    setDeleteConfirm(null);
    showToast('Staff member removed', 'error');
  };

  const toggleStatus = (id) => {
    const member = staffMembers.find(m => m.id === id);
    if (member) {
      updateStaff(id, { status: member.status === 'Active' ? 'Inactive' : 'Active' });
      showToast('Status updated');
    }
  };

  const filteredStaff = useMemo(() => {
    return staffMembers.map(m => {
      const roleName = m.role_name || '';
      return {
        ...m,
        name: m.full_name,
        role: roleName.charAt(0).toUpperCase() + roleName.slice(1),
        avatar: m.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'
      };
    }).filter(m => {
      const matchesTab = activeTab === 'All' || m.role.toLowerCase() === activeTab.toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch = m.name?.toLowerCase().includes(query) || 
                           m.email?.toLowerCase().includes(query) || 
                           m.role?.toLowerCase().includes(query);
      return matchesTab && matchesSearch;
    });
  }, [staffMembers, activeTab, searchQuery]);

  return (
    <div className="space-y-5 h-full flex flex-col overflow-hidden relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest border bg-primary border-primary/20 text-white">
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-white" /> : <AlertCircle className="w-4 h-4 text-white" />}
          {toast.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-xl lg:text-2xl font-black text-text-primary uppercase tracking-tight leading-none">Staff Directory</h2>
          <p className="text-text-secondary mt-1 text-xs lg:text-sm font-medium">Manage your restaurant team.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
           <div className="relative group flex-1 sm:min-w-[200px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff..." 
                className="w-full pl-11 pr-4 py-2.5 bg-surface border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none shadow-sm text-xs font-bold uppercase tracking-widest"
              />
           </div>
           <button 
             onClick={() => {
              setTimeout(() => {
                printContent('printable-area');
              }, 500);
            }}
             className="p-2.5 bg-surface border border-slate-100 rounded-xl text-slate-400 hover:text-primary transition-all shadow-sm shrink-0"
           >
             <Printer className="w-5 h-5" />
           </button>
           <button 
             onClick={() => { setEditingStaff(null); setShowAddModal(true); }}
             className="btn-primary flex items-center justify-center gap-2 h-[42px] px-4 sm:px-5 shadow-xl shadow-primary/20 text-[10px] lg:text-xs font-black uppercase tracking-widest shrink-0"
           >
             <Plus className="w-4 h-4 stroke-[3]" /> <span className="hidden sm:inline">Add Member</span><span className="sm:hidden">Add</span>
           </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide shrink-0 -mx-1 px-1">
        {roles.map(role => (
          <button
            key={role}
            onClick={() => setActiveTab(role)}
            className={cn(
              "px-4 py-2 rounded-lg lg:rounded-xl text-[9px] lg:text-[10px] font-bold uppercase tracking-wider border-2 whitespace-nowrap transition-all",
              activeTab === role 
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                : "bg-surface text-text-secondary border-transparent hover:border-primary/20 hover:bg-indigo-50/30"
            )}
          >
            {role}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pb-20 lg:pb-8 pr-1 lg:pr-2 scrollbar-hide">
        {filteredStaff.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {filteredStaff.map((member) => (
              <div 
                key={member.id} 
                className={cn(
                  "card group border border-slate-100 relative overflow-hidden p-5 lg:p-6 rounded-[2.5rem] bg-surface cursor-pointer active:scale-[0.98] transition-all",
                  member.status === 'Inactive' && "opacity-60 grayscale-[0.5]"
                )}
                onClick={() => setSelectedStaff(member)}
              >
                {/* Status Badge */}
                <div className="absolute top-5 right-5 flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleStatus(member.id); }}
                    className={cn(
                      "px-2 py-0.5 rounded-lg text-[7px] lg:text-[8px] font-black uppercase tracking-widest border shadow-sm",
                      member.status === 'Active' ? "bg-green-50 text-success border-green-100" : "bg-red-50 text-primary border-red-100"
                    )}
                  >
                    {member.status}
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-primary font-black text-xl border-4 border-white shadow-xl">
                    {member.avatar}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-text-primary leading-none group-hover:text-primary">{member.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="flex items-center gap-1.5 text-[9px] font-bold text-text-secondary uppercase tracking-widest">
                          <Shield className="w-3 h-3 text-primary" /> {member.role}
                       </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-5 border-y border-slate-100 border-dashed">
                   <div className="space-y-1.5">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Current Shift</p>
                      <p className="text-xs font-black text-text-primary flex items-center gap-2">
                         <Clock className="w-4 h-4 text-primary" /> {member.shift}
                      </p>
                   </div>
                   <div className="space-y-1.5">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Efficiency</p>
                      <p className="text-xs font-black text-text-primary flex items-center gap-2 text-yellow-600">
                         <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" /> {member.rating}
                      </p>
                   </div>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Joined {member.joined}</p>
                   <button 
                     onClick={() => setSelectedStaff(member)}
                     className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-[0.2em]"
                   >
                      Details <ChevronRight className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
             <Search className="w-12 h-12 mb-4" />
             <p className="text-xs font-black uppercase tracking-widest">No matching personnel found</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <StaffModal 
          staff={editingStaff} 
          onClose={() => { setShowAddModal(false); setEditingStaff(null); }}
          onSave={handleSaveMember}
        />
      )}

      {selectedStaff && createPortal(
         <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div onClick={() => setSelectedStaff(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="relative w-full sm:max-w-[450px] bg-surface rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] self-center animate-in fade-in slide-in-from-bottom-4 sm:zoom-in duration-300">
             <div className="p-5 md:p-8 border-b border-slate-50 flex items-center justify-between shrink-0 bg-slate-50/20">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 md:w-14 md:h-14 bg-primary text-white rounded-2xl flex items-center justify-center text-xl md:text-2xl font-black shadow-xl shadow-primary/20 shrink-0">{selectedStaff.avatar}</div>
                   <div>
                      <h3 className="text-lg md:text-xl font-black text-text-primary uppercase tracking-tight truncate max-w-[150px] sm:max-w-none">{selectedStaff.name}</h3>
                      <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{selectedStaff.role} • ID-{selectedStaff.id}</p>
                   </div>
                </div>
                <button onClick={() => setSelectedStaff(null)} className="p-2 hover:bg-surface rounded-xl border border-transparent hover:border-slate-100 shadow-sm transition-all"><X className="w-5 h-5 md:w-6 md:h-6 text-slate-400" /></button>
             </div>
             <div className="p-6 md:p-8 space-y-6 md:space-y-8 overflow-y-auto scrollbar-hide">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/50">
                      <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email Terminal</p>
                      <p className="text-[11px] md:text-xs font-bold text-text-primary truncate">{selectedStaff.email}</p>
                   </div>
                   <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/50">
                      <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Mobile Line</p>
                      <p className="text-[11px] md:text-xs font-bold text-text-primary">{selectedStaff.phone}</p>
                   </div>
                </div>
                <div className="p-5 md:p-6 bg-primary rounded-[2.5rem] text-white flex justify-between items-center shadow-2xl shadow-primary/20">
                   <div>
                      <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest opacity-60">Success Rating</p>
                      <div className="flex items-center gap-2 mt-2">
                         <Star className="w-5 h-5 fill-white text-white" />
                         <span className="text-2xl md:text-3xl font-black tracking-tighter">{selectedStaff.rating}</span>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest opacity-60">Engagement Status</p>
                      <p className="text-xs md:text-sm font-black mt-2 uppercase tracking-[0.2em]">{selectedStaff.status}</p>
                   </div>
                </div>
             </div>
             <div className="px-6 py-4 md:px-8 md:py-6 border-t border-slate-50 flex flex-row gap-3 md:gap-4 bg-surface shrink-0 relative z-20">
                <button 
                  onClick={() => { setSelectedStaff(null); setDeleteConfirm(selectedStaff); }}
                  className="flex-1 py-4 bg-surface border-2 border-slate-100 text-primary rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-widest hover:bg-rose-50 transition-all active:scale-95"
                >
                   Delete Personnel
                </button>
                <button 
                  onClick={() => { setEditingStaff(selectedStaff); setShowAddModal(true); setSelectedStaff(null); }}
                  className="flex-1 py-4 bg-primary text-white rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all"
                >
                   Update Profile
                </button>
             </div>
          </div>
        </div>,
        document.body
      )}

      {deleteConfirm && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
           <div onClick={() => setDeleteConfirm(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
           <div className="relative w-full max-w-sm bg-surface rounded-[2rem] sm:rounded-[2.5rem] p-8 text-center shadow-2xl self-center animate-in fade-in slide-in-from-bottom-4 sm:zoom-in duration-300">
              <div className="w-16 h-16 bg-rose-50 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                 <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-2">Confirm Removal</h3>
              <p className="text-xs font-medium text-slate-400 mb-8 leading-relaxed">Are you certain you wish to delete <span className="text-text-primary font-black uppercase">{deleteConfirm.name}</span> from the system?</p>
              <div className="flex gap-4">
                 <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-4 border-2 border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">Cancel</button>
                 <button onClick={() => handleDelete(deleteConfirm.id)} className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-200 active:scale-95 transition-all">Confirm</button>
              </div>
           </div>
        </div>,
        document.body
      )}
      {/* Hidden Printable Staff List */}
      <div id="printable-area" className="hidden print:block printable-area">
        <div className="text-center border-b-2 border-slate-900 pb-4 mb-8">
           <h1 className="text-2xl font-black uppercase tracking-tighter">Staff Directory Manifest</h1>
           <p className="text-[10px] font-bold uppercase tracking-widest mt-1">Generated: {new Date().toLocaleString()}</p>
        </div>
        <table className="w-full text-left text-[10px]">
           <thead>
             <tr className="border-b border-slate-900">
               <th className="py-2 uppercase font-black">ID</th>
               <th className="py-2 uppercase font-black">Name</th>
               <th className="py-2 uppercase font-black">Role</th>
               <th className="py-2 uppercase font-black">Shift</th>
               <th className="py-2 uppercase font-black">Rating</th>
               <th className="py-2 uppercase font-black text-right">Status</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
             {staffMembers.map(member => (
               <tr key={member.id}>
                 <td className="py-2 font-bold text-slate-400">ID-{member.id}</td>
                 <td className="py-2 font-black uppercase">{member.name}</td>
                 <td className="py-2 uppercase text-primary font-bold">{member.role}</td>
                 <td className="py-2 uppercase">{member.shift}</td>
                 <td className="py-2 font-black text-yellow-600">{member.rating} ★</td>
                 <td className="py-2 text-right font-black uppercase">{member.status}</td>
               </tr>
             ))}
           </tbody>
        </table>
      </div>
    </div>
  );
};

const StaffModal = ({ staff, onClose, onSave }) => {
  const [formData, setFormData] = useState(staff || { 
    name: '', 
    email: '', 
    phone: '', 
    password: '',
    role: 'Waiter', 
    shift: 'Morning', 
    status: 'Active' 
  });

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-0 sm:p-4">
      <div onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <div className="relative w-full sm:max-w-[500px] bg-surface rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] self-center animate-in fade-in slide-in-from-bottom-4 sm:zoom-in duration-300">
        <div className="px-5 py-4 md:px-8 md:py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/20 shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
             <div className="w-10 h-10 md:w-14 md:h-14 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                <BadgeCheck className="w-5 h-5 md:w-6 md:h-6 text-primary md:stroke-[2.5]" />
             </div>
             <div>
               <h3 className="text-lg md:text-xl font-black uppercase tracking-tight leading-none">{staff ? 'Edit Personnel' : 'Onboard Talent'}</h3>
               <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 md:mt-1 leading-none">Register and assign team member</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 md:p-2.5 hover:bg-surface rounded-xl border border-transparent hover:border-slate-100 shadow-sm transition-all"><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 md:space-y-8 scrollbar-hide">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
               <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. John Doe"
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-sm transition-all" 
                    required 
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Role Type</label>
                  <div className="relative">
                    <select 
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm appearance-none focus:border-primary/20 transition-all"
                    >
                       {['Admin', 'Manager', 'Chef', 'Waiter', 'Cashier'].map(r => <option key={r}>{r}</option>)}
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                  </div>
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
               <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Terminal</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@hospitality.com"
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-sm transition-all" 
                    required 
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Line</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-sm transition-all" 
                    required 
                  />
               </div>
            </div>
             <div className="space-y-1.5 mt-5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                   {staff ? "Update Password (Leave blank to keep current)" : "Password"}
                </label>
                <input 
                  type="password" 
                  value={formData.password || ''}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder={staff ? "Enter new password" : "Secure password for staff"}
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-sm transition-all" 
                  required={!staff} 
                  minLength={6}
                />
             </div>
             <div className="space-y-3 mt-5">
               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Duty Shift Assignment</label>
               <div className="flex gap-2">
                  {['Morning', 'Evening', 'General'].map(s => (
                    <button 
                      key={s} 
                      type="button"
                      onClick={() => setFormData({...formData, shift: s})}
                      className={cn(
                        "flex-1 py-3.5 rounded-2xl border-2 text-[9px] font-black uppercase tracking-widest transition-all",
                        formData.shift === s ? "bg-primary border-primary text-white shadow-xl shadow-primary/20" : "bg-surface border-slate-100 text-slate-400 hover:border-slate-200"
                      )}
                    >
                      {s}
                    </button>
                  ))}
               </div>
            </div>
          </div>
          <div className="px-6 py-4 md:px-8 md:py-6 border-t border-slate-50 flex flex-row gap-3 md:gap-4 shrink-0 bg-surface relative z-20">
             <button type="button" onClick={onClose} className="flex-1 py-3.5 border-2 border-slate-100 rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all text-center">Cancel</button>
             <button type="submit" className="flex-1 btn-primary py-3.5 rounded-full font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all text-center">Confirm Onboard</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default Staff;
