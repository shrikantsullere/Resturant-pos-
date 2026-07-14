import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  ClipboardCheck, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  User,
  MapPin,
  X,
  Activity,
  History,
  Trash2,
  Bed,
  UtensilsCrossed,
  Wrench,
  Sparkles,
  Printer
} from 'lucide-react';
import { cn } from "../../../utils/cn";
import { useHospitality } from "../../../context/HospitalityContext";
import printContent from "../../../utils/printUtil";

const Tasks = () => {
  const { tasks, staff, addTask, updateTaskStatus, deleteTask } = useHospitality();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const filteredTasks = tasks.map(t => ({
    ...t,
    assignee: t.assigned_staff || 'Unassigned',
    displayStatus: t.task_status?.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Pending'
  })).filter(t => {
    const matchesTab = activeTab === 'All' || t.displayStatus === activeTab;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.assignee.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getPriorityColor = (p) => {
    switch (p) {
      case 'Urgent': return 'bg-rose-50 text-primary border-rose-100';
      case 'High': return 'bg-orange-50 text-orange-600 border-orange-100';
      default: return 'bg-indigo-50 text-primary border-indigo-100';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Cleaning': return <Bed className="w-5 h-5" />;
      case 'Service': return <UtensilsCrossed className="w-5 h-5" />;
      case 'Maintenance': return <Wrench className="w-5 h-5" />;
      default: return <ClipboardCheck className="w-5 h-5" />;
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
            <ClipboardCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-text-primary uppercase tracking-wider">Duty <span className="text-primary">Board</span></h2>
            <p className="text-text-secondary text-sm font-bold mt-1">Orchestrate daily staff operations</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group min-w-[240px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Filter duties..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-5 py-3 bg-surface border border-slate-100 rounded-2xl outline-none shadow-sm text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all"
            />
          </div>
          <button 
             onClick={() => printContent('printable-area')}
            className="p-3 bg-surface border border-slate-100 rounded-2xl text-slate-400 hover:text-primary transition-all shadow-sm"
          >
            <Printer className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary h-[48px] px-6 rounded-full flex items-center gap-3 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all"
          >
             <Plus className="w-4 h-4" /> New Task
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1 shrink-0">
          {['All', 'Pending', 'In Progress', 'Completed'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 whitespace-nowrap transition-all",
                activeTab === tab 
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/10" 
                : "bg-surface text-text-secondary border-transparent hover:bg-slate-50 shadow-sm"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Task Grid */}
        <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide space-y-4">
           {filteredTasks.length === 0 ? (
             <div className="h-64 flex flex-col items-center justify-center text-center opacity-40">
                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-4">
                   <ClipboardCheck className="w-10 h-10 text-slate-200" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest">No active duties found</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTasks.map((task) => (
                  <div 
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="card p-6 bg-surface border-none shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:shadow-slate-200 transition-all cursor-pointer group flex flex-col h-full"
                  >
                     <div className="flex justify-between items-start mb-6">
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-primary shadow-inner", getPriorityColor(task.priority))}>
                           {getIcon(task.type)}
                        </div>
                        <span className={cn(
                          "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border shadow-sm",
                          task.task_status === 'completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                          task.task_status === 'in_progress' ? "bg-blue-50 text-blue-600 border-blue-100" :
                          "bg-orange-50 text-orange-600 border-orange-100"
                        )}>
                           {task.displayStatus}
                        </span>
                     </div>

                     <div className="flex-1">
                        <h4 className="text-lg font-black text-text-primary uppercase tracking-tight mb-2 group-hover:text-primary transition-colors">{task.title}</h4>
                        <p className="text-slate-500 text-[10px] font-medium leading-relaxed mb-4 line-clamp-2">
                           {task.description || "No additional details provided."}
                        </p>
                        <div className="flex items-center gap-2 mb-6">
                           <MapPin className="w-3 h-3 text-slate-300" />
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{task.location || task.target || 'General Area'}</span>
                        </div>
                     </div>

                     <div className="pt-6 border-t border-slate-50 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                           <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] font-black text-primary border border-white shadow-sm shrink-0">
                              {task.assignee?.split(' ').map(n => n[0]).join('') || 'U'}
                           </div>
                           <div className="min-w-0">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Assignee</p>
                              <p className="text-xs font-black text-text-primary uppercase leading-none truncate">{task.assignee}</p>
                           </div>
                        </div>
                        <div className="text-right shrink-0">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Deadline</p>
                           <p className="text-[10px] font-bold text-text-primary leading-none whitespace-nowrap">
                              {task.deadline ? new Date(task.deadline).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No Deadline'}
                           </p>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
           )}
        </div>
      </div>

      {/* Task Creation Modal */}
      {showAddModal && (
        <TaskModal 
          onClose={() => setShowAddModal(false)}
          staff={staff}
          onSave={addTask}
        />
      )}

      {/* Task Detail Modal */}
      {selectedTask && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 overflow-hidden">
           <div onClick={() => setSelectedTask(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
           <div className="relative w-full max-w-[95%] md:max-w-md bg-surface rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] self-end sm:self-center animate-in fade-in slide-in-from-bottom-4 sm:zoom-in duration-300">
              <div className="p-5 md:p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 shrink-0">
                 <div className="flex items-center gap-4">
                    <div className={cn("w-12 md:w-14 h-12 md:h-14 rounded-2xl flex items-center justify-center shadow-xl", getPriorityColor(selectedTask.priority))}>
                       {getIcon(selectedTask.type)}
                    </div>
                    <div>
                       <h3 className="text-lg md:text-xl font-black text-text-primary uppercase tracking-tight truncate max-w-[150px] sm:max-w-none">{selectedTask.title}</h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Status: {selectedTask.status}</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-surface rounded-2xl shadow-sm border border-transparent hover:border-slate-100 transition-all"><X className="w-5 h-5 md:w-6 md:h-6 text-slate-400" /></button>
              </div>

              <div className="p-6 md:p-8 space-y-6 overflow-y-auto scrollbar-hide">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/50">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Location</p>
                       <p className="text-xs font-black text-text-primary uppercase tracking-tight">{selectedTask.location || selectedTask.target || 'N/A'}</p>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/50">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Category</p>
                       <p className="text-xs font-black text-text-primary uppercase tracking-tight">{selectedTask.category || selectedTask.type || 'N/A'}</p>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/50">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Priority</p>
                       <p className={cn("text-xs font-black uppercase tracking-widest", 
                         selectedTask.priority === 'urgent' || selectedTask.priority === 'Urgent' ? "text-primary" : "text-primary"
                       )}>{selectedTask.priority}</p>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/50">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Deadline</p>
                       <p className="text-xs font-black text-text-primary uppercase tracking-tight">
                         {selectedTask.deadline ? new Date(selectedTask.deadline).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'No Deadline'}
                       </p>
                    </div>
                 </div>

                 <div className="p-5 bg-indigo-50/50 rounded-[2rem] border border-indigo-100 flex items-center gap-4">
                    <div className="w-10 md:w-12 h-10 md:h-12 bg-surface rounded-2xl flex items-center justify-center text-primary shadow-sm font-black uppercase text-[10px] md:text-xs shrink-0 border border-indigo-100/50">
                       {selectedTask.assignee?.split(' ').map(n => n[0]).join('') || 'U'}
                    </div>
                    <div className="min-w-0">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate leading-none mb-1.5">Assigned Specialist</p>
                       <p className="text-xs md:text-sm font-black text-text-primary uppercase tracking-tight truncate leading-none">{selectedTask.assignee}</p>
                    </div>
                 </div>

                 {selectedTask.description && (
                   <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Task Description</p>
                      <p className="text-xs font-bold text-text-primary leading-relaxed">
                         {selectedTask.description}
                      </p>
                   </div>
                 )}
              </div>

               <div className="p-6 md:p-8 border-t border-slate-50 flex flex-col sm:flex-row gap-3 md:gap-4 bg-surface shrink-0 relative z-20">
                 {selectedTask.task_status === 'pending' ? (
                   <button 
                     onClick={() => { updateTaskStatus(selectedTask.id, 'in_progress'); setSelectedTask(null); }}
                     className="flex-1 py-4 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all"
                   >
                      Start Operation
                   </button>
                 ) : selectedTask.task_status === 'in_progress' ? (
                    <button 
                      onClick={() => { updateTaskStatus(selectedTask.id, 'completed'); setSelectedTask(null); }}
                      className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-200 active:scale-95 transition-all"
                    >
                       Mark Completed
                    </button>
                 ) : (
                    <button 
                      onClick={() => { deleteTask(selectedTask.id); setSelectedTask(null); }}
                      className="flex-1 py-4 bg-rose-50 text-primary rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-100 active:scale-95 transition-all"
                    >
                       Delete Duty
                    </button>
                 )}
                 <button onClick={() => setSelectedTask(null)} className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all">Close</button>
              </div>
           </div>
        </div>,
        document.body
      )}
      {/* Hidden Printable Tasks */}
      <div id="printable-area" className="hidden print:block printable-area">
        <div className="text-center border-b-2 border-slate-900 pb-4 mb-8">
           <h1 className="text-2xl font-black uppercase tracking-tighter">Daily Duty Board</h1>
           <p className="text-[10px] font-bold uppercase tracking-widest mt-1">Generated: {new Date().toLocaleString()}</p>
        </div>
        <table className="w-full text-left text-[10px]">
           <thead>
             <tr className="border-b border-slate-900">
               <th className="py-2 uppercase font-black">Task Title</th>
               <th className="py-2 uppercase font-black">Assignee</th>
               <th className="py-2 uppercase font-black">Location</th>
               <th className="py-2 uppercase font-black">Deadline</th>
               <th className="py-2 uppercase font-black text-right">Status</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
             {filteredTasks.map(task => (
               <tr key={task.id}>
                 <td className="py-3 font-black uppercase">{task.title}</td>
                 <td className="py-3 uppercase font-bold text-primary">{task.assignee}</td>
                 <td className="py-3 uppercase text-slate-500">{task.target}</td>
                 <td className="py-3 font-black">{task.deadline}</td>
                 <td className="py-3 text-right font-black uppercase">{task.status}</td>
               </tr>
             ))}
           </tbody>
        </table>
      </div>
    </div>
  );
};

const TaskModal = ({ onClose, staff, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Cleaning',
    priority: 'Normal',
    assignee_id: staff[0]?.id || '',
    target: '',
    deadline: 'Today'
  });

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 overflow-hidden">
       <div onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
       <div className="relative w-full max-w-[95%] md:max-w-xl bg-surface rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh] self-center border border-slate-100 animate-in fade-in slide-in-from-bottom-4 sm:zoom-in duration-300">
          <div className="px-5 py-4 md:px-8 md:py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/20 shrink-0">
             <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-primary rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-xl shrink-0">
                   <ClipboardCheck className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                   <h3 className="text-lg md:text-xl font-black uppercase tracking-tight leading-none">Assign Duty</h3>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5 md:mt-1">Operational task distribution</p>
                </div>
             </div>
             <button onClick={onClose} className="p-2 md:p-2.5 hover:bg-surface rounded-xl border border-transparent hover:border-slate-100 shadow-sm group">
                <X className="w-5 h-5 text-slate-400" />
             </button>
          </div>
          
          <form 
            onSubmit={(e) => { e.preventDefault(); onSave({ ...formData, assigned_to: formData.assignee_id }); onClose(); }} 
            className="flex-1 flex flex-col min-h-0"
          >
             <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-hide">
                <div className="space-y-1.5">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Title</label>
                   <input 
                     type="text" 
                     value={formData.title}
                     onChange={(e) => setFormData({...formData, title: e.target.value})}
                     placeholder="e.g. Sanitize Room 101"
                     className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-sm transition-all" 
                     required 
                   />
                </div>

                <div className="space-y-1.5">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Details</label>
                   <textarea 
                     value={formData.description}
                     onChange={(e) => setFormData({...formData, description: e.target.value})}
                     placeholder="Provide specific instructions for this duty..."
                     className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none font-bold text-xs md:text-sm transition-all min-h-[100px] resize-y"
                   />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                      <select 
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm appearance-none focus:border-primary/20 transition-all"
                      >
                         {['Cleaning', 'Service', 'Maintenance', 'Delivery'].map(t => <option key={t}>{t}</option>)}
                      </select>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                      <select 
                        value={formData.priority}
                        onChange={(e) => setFormData({...formData, priority: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm appearance-none focus:border-primary/20 transition-all"
                      >
                         {['Normal', 'High', 'Urgent'].map(p => <option key={p}>{p}</option>)}
                      </select>
                   </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Specialist</label>
                      <select 
                        value={formData.assignee_id}
                        onChange={(e) => setFormData({...formData, assignee_id: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm appearance-none focus:border-primary/20 transition-all"
                      >
                         {staff.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.role_name})</option>)}
                      </select>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                      <input 
                        type="text" 
                        value={formData.target}
                        onChange={(e) => setFormData({...formData, target: e.target.value})}
                        placeholder="e.g. RM-101"
                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-sm transition-all" 
                        required 
                      />
                   </div>
                </div>
             </div>

             <div className="p-6 md:p-8 border-t border-slate-50 flex flex-col sm:flex-row gap-3 md:gap-4 bg-surface shrink-0">
                <button type="button" onClick={onClose} className="flex-1 py-4 border-2 border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" className="flex-1 btn-primary py-4 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all">Assign Duty</button>
             </div>
          </form>
       </div>
    </div>,
    document.body
  );
};

export default Tasks;
