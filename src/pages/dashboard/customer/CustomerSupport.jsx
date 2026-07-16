import { formatCurrency } from '../../../utils/currencyUtils';
import React, { useState, useEffect, useRef } from 'react';
import { 
  HelpCircle, 
  ChevronLeft, 
  Phone, 
  MessageSquare, 
  Mail, 
  Info, 
  Utensils, 
  Zap, 
  ChevronRight, 
  Globe,
  X,
  Send,
  CheckCircle2,
  Clock,
  Plus,
  AlertCircle,
  ArrowRight,
  Paperclip,
  Smile,
  Mic,
  Square,
  Trash,
  CornerUpLeft
} from 'lucide-react';
import { cn } from "../../../utils/cn";
import { useCustomer } from "../../../context/CustomerContext";
import { useCommunication } from "../../../context/CommunicationContext";
import { useAuth } from "../../../context/AuthContext";
import { useSettings } from "../../../context/SettingsContext";
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { getImageUrl } from "../../../utils/imageUtils";

const CustomerSupport = () => {
  const navigate = useNavigate();
  const { createSupportRequest, supportRequests } = useCustomer();
  const { messages, sendGuestMessage, getGuestTicket, fetchMessages, uploadFile, deleteMessage } = useCommunication();
  const { user } = useAuth();
  const { settings } = useSettings();
  
  // Modals & UI State
  const [activeModal, setActiveModal] = useState(null); // 'ticket', 'chat', 'call', 'email', 'detail'
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [toast, setToast] = useState(null);
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [activeFaqCategory, setActiveFaqCategory] = useState('All');

  // Form States
  const [ticketForm, setTicketForm] = useState({ subject: '', category: 'General', priority: 'Medium', message: '' });
  const [chatMessage, setChatMessage] = useState('');
  const [chatTicketId, setChatTicketId] = useState(null);
  const chatEndRef = useRef(null);

  const [replyingToMessage, setReplyingToMessage] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const recordingIntervalRef = useRef(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojis = ['😊', '😂', '👍', '❤️', '🎉', '🍕', '🍔', '🥤', '🍟', '👋', '☕', '✨', '🎂', '🙌', '🔥'];

  const fileInputRef = useRef(null);

  const handleEmojiClick = (emoji) => {
    setChatMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const getFriendlyMessageText = (content) => {
    let text = content;
    const match = content.match(/^\[(Waiter|Reception|Billing|Kitchen|Manager|Staff|Customer)\]\s*(.*)/i);
    if (match) {
      text = match[2];
    }
    if (text.startsWith('[IMAGE]:')) return '📷 Photo';
    if (text.startsWith('[AUDIO]:')) return '🎵 Voice Note';
    
    const replyMatch = text.match(/^\[REPLY:\d+:[^:]+:[^\]]+\]\s*(.*)/s);
    if (replyMatch) {
      text = replyMatch[1];
    }
    return text;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !chatTicketId || !user) return;
    
    if (!file.type.startsWith('image/')) {
      showToast('Only image files are supported', 'error');
      return;
    }
    
    const url = await uploadFile(file);
    if (url) {
      const content = `[Reception] [IMAGE]:${url}`;
      await sendGuestMessage(chatTicketId, user.id, content);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([audioBlob], `voice-note-${Date.now()}.webm`, { type: 'audio/webm' });
        
        const url = await uploadFile(file);
        if (url) {
          const content = `[Reception] [AUDIO]:${url}`;
          await sendGuestMessage(chatTicketId, user.id, content);
        }
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      showToast('Microphone access denied or not available', 'error');
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = (cancel = false) => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      if (cancel) {
        mediaRecorder.onstop = () => {
          mediaRecorder.stream.getTracks().forEach(track => track.stop());
        };
      }
      mediaRecorder.stop();
    }
    
    setIsRecording(false);
    setMediaRecorder(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  // Constants
  const channels = [
    { id: 'waiter', title: 'Call Waiter', desc: 'Instant assistance', icon: Utensils, color: 'bg-orange-50 text-orange-600', badge: 'Fastest' },
    { id: 'chat', title: 'Live Chat', desc: 'Chat with manager', icon: MessageSquare, color: 'bg-indigo-50 text-indigo-600' },
    { id: 'emergency', title: 'Emergency', desc: 'Direct phone line', icon: Phone, color: 'bg-rose-50 text-primary' },
  ];

  const faqs = [
    { q: 'How do I apply points?', a: 'Points are automatically calculated and can be viewed in your profile. For redemptions, please consult our staff.', cat: 'Account' },
    { q: 'Can I cancel my order?', a: 'Orders can only be cancelled within 2 minutes of placement before they hit the kitchen.', cat: 'Orders' },
    { q: 'Is there a service fee?', a: 'A small service fee of Rp 25.000 applies to all dine-in orders for table maintenance.', cat: 'Pricing' },
    { q: 'What is the refund policy?', a: 'Refunds for prepayments are processed within 5-7 business days.', cat: 'Pricing' },
    { q: 'How to use QR code?', a: 'Scan the QR code on your table to access the menu and order directly.', cat: 'Orders' },
  ];

  const faqCategories = ['All', 'Account', 'Orders', 'Pricing'];

  // Effects
  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [activeModal]);

  useEffect(() => {
    if (activeModal === 'chat') {
       chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeModal]);

  useEffect(() => {
    if (activeModal === 'chat' && user) {
      const initChat = async () => {
        const ticket = await getGuestTicket(user.id);
        if (ticket) {
           setChatTicketId(ticket.id);
           fetchMessages(ticket.id);
        }
      };
      initChat();
    }
  }, [activeModal, user, getGuestTicket, fetchMessages]);

  // Handlers
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const renderMessageContent = (content) => {
    let cleanContent = content;
    let deptPrefix = "";
    
    const replyMatch = cleanContent.match(/^\[REPLY:(\d+):([^:]+):([^\]]+)\]\s*(.*)/s);
    let replyQuoteBlock = null;
    if (replyMatch) {
      const replyToId = Number(replyMatch[1]);
      const replyToSender = replyMatch[2];
      const replyToText = replyMatch[3];
      cleanContent = replyMatch[4];
      
      replyQuoteBlock = (
        <div 
          onClick={() => {
            const targetEl = document.getElementById(`msg-${replyToId}`);
            if (targetEl) {
              targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              targetEl.classList.add('bg-slate-100/50', 'animate-pulse');
              setTimeout(() => targetEl.classList.remove('bg-slate-100/50', 'animate-pulse'), 2000);
            }
          }}
          className="mb-2 p-2 bg-slate-500/10 border-l-4 border-primary rounded-r-lg text-[10px] cursor-pointer hover:bg-slate-500/15 transition-all text-left"
        >
          <div className="font-black uppercase tracking-tight text-[8px] opacity-75">{replyToSender}</div>
          <div className="truncate font-bold mt-0.5 opacity-90">{replyToText}</div>
        </div>
      );
    }

    const match = cleanContent.match(/^\[(Waiter|Reception|Billing|Kitchen|Manager|Staff|Customer)\]\s*(.*)/i);
    if (match) {
      deptPrefix = `[${match[1]}] `;
      cleanContent = match[2];
    }
    
    let mediaContent = cleanContent;
    if (cleanContent.startsWith('[IMAGE]:')) {
      const imageUrl = cleanContent.replace('[IMAGE]:', '');
      mediaContent = (
        <div className="flex flex-col gap-1">
          {deptPrefix && <span className="text-[9px] font-black opacity-65 mb-1 block uppercase tracking-wider">{deptPrefix}</span>}
          <img 
            src={getImageUrl(imageUrl)} 
            alt="Attachment" 
            onClick={(e) => {
              e.stopPropagation();
              window.open(getImageUrl(imageUrl), '_blank');
            }}
            className="max-h-60 rounded-xl object-contain cursor-pointer hover:opacity-90 transition-opacity" 
          />
        </div>
      );
    } else if (cleanContent.startsWith('[AUDIO]:')) {
      const audioUrl = cleanContent.replace('[AUDIO]:', '');
      mediaContent = (
        <div className="flex flex-col gap-1 text-slate-800">
          {deptPrefix && <span className="text-[9px] font-black opacity-65 mb-1 block uppercase tracking-wider">{deptPrefix}</span>}
          <audio 
            src={getImageUrl(audioUrl)} 
            controls 
            className="max-w-full" 
          />
        </div>
      );
    } else {
      mediaContent = (
        <div>
          {deptPrefix && <span className="text-[9px] font-black opacity-65 mb-1 block uppercase tracking-wider">{deptPrefix}</span>}
          <span>{cleanContent}</span>
        </div>
      );
    }

    if (replyQuoteBlock) {
      return (
        <div>
          {replyQuoteBlock}
          {mediaContent}
        </div>
      );
    }
    return mediaContent;
  };

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketForm.subject || !ticketForm.message) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    createSupportRequest({
      type: 'Ticket',
      subject: ticketForm.subject,
      category: ticketForm.category,
      priority: ticketForm.priority,
      message: ticketForm.message
    });
    setTicketForm({ subject: '', category: 'General', priority: 'Medium', message: '' });
    setActiveModal(null);
    showToast('Support ticket created successfully!');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !user || !chatTicketId) return;
    
    let content = chatMessage;
    if (replyingToMessage) {
      content = `[REPLY:${replyingToMessage.id}:${replyingToMessage.sender}:${replyingToMessage.friendlyText}] ${chatMessage}`;
    }
    
    setChatMessage('');
    setReplyingToMessage(null);
    
    const success = await sendGuestMessage(chatTicketId, user.id, content);
    if (!success) {
       showToast('Failed to send message', 'error');
    }
  };

  const filteredFaqs = faqs.filter(faq => 
    (activeFaqCategory === 'All' || faq.cat === activeFaqCategory) &&
    (faq.q.toLowerCase().includes(faqSearch.toLowerCase()) || faq.a.toLowerCase().includes(faqSearch.toLowerCase()))
  );

  const chatMessages = messages.filter(m => m.ticketId === chatTicketId);

  return (
    <div className="space-y-6 lg:space-y-8 pb-20">
      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest border animate-in slide-in-from-top-4 duration-300",
          toast.type === 'success' ? "bg-primary border-primary/20 text-white" : "bg-primary border-rose-500/20 text-white"
        )}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 px-1">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-surface rounded-xl shadow-sm border border-slate-100 lg:hidden">
            <ChevronLeft className="w-5 h-5 text-text-primary" />
          </button>
          <div>
            <h2 className="text-xl lg:text-2xl font-black text-text-primary uppercase tracking-tight">Support Hub</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">24/7 Assistance & Help Center</p>
          </div>
        </div>
        <button 
          onClick={() => setActiveModal('ticket')}
          className="btn-primary h-11 px-6 rounded-xl flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 w-full md:w-auto"
        >
          <Plus className="w-4 h-4" /> Open New Ticket
        </button>
      </div>

      {/* Main Support Channels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
         {channels.map(channel => (
            <div 
              key={channel.id} 
              onClick={() => {
                if (channel.id === 'chat') setActiveModal('chat');
                else if (channel.id === 'emergency') setActiveModal('call');
                else {
                  createSupportRequest({ type: 'Assistance', subject: channel.title, message: 'Waiter called to table.' });
                  showToast(`${channel.title} request sent!`);
                }
              }}
              className="card p-6 bg-surface border-none shadow-xl shadow-slate-100/50 hover:bg-slate-50 transition-all group cursor-pointer relative overflow-hidden"
            >
               {channel.badge && (
                 <span className="absolute top-4 right-4 px-2 py-1 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-lg">{channel.badge}</span>
               )}
               <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform", channel.color)}>
                  <channel.icon className="w-6 h-6" />
               </div>
               <h4 className="font-black text-text-primary text-base uppercase tracking-tight leading-none mb-1.5">{channel.title}</h4>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{channel.desc}</p>
            </div>
         ))}
      </div>

      {/* Active Requests Section */}
      {supportRequests.length > 0 && (
        <div className="space-y-4">
           <h3 className="text-lg font-black uppercase tracking-tight px-1 flex items-center justify-between">
              Recent Requests
              <span className="text-[9px] text-slate-400 font-bold bg-slate-100 px-2 py-1 rounded-lg">{supportRequests.length} Total</span>
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {supportRequests.slice(0, 6).map(req => (
                <div 
                  key={req.id} 
                  onClick={() => { setSelectedTicket(req); setActiveModal('detail'); }}
                  className="p-4 bg-surface rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm hover:border-primary/30 cursor-pointer transition-all group"
                >
                   <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shadow-inner",
                        req.status === 'Open' ? "bg-orange-50 text-orange-500" : "bg-emerald-50 text-emerald-500"
                      )}>
                         <Zap className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-[11px] font-black uppercase tracking-tight leading-none group-hover:text-primary transition-colors">{req.subject || req.type}</p>
                         <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                           <span className={cn("w-1.5 h-1.5 rounded-full", req.status === 'Open' ? "bg-orange-500" : "bg-emerald-500")} />
                           {req.status} • {req.id}
                         </p>
                      </div>
                   </div>
                   <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                </div>
              ))}
           </div>
        </div>
      )}

      {/* FAQ & Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 pt-4">
         {/* FAQ Section */}
         <div className="lg:col-span-3 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
              <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-primary" /> Help Center
              </h3>
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Search FAQ..."
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  className="pl-8 pr-4 py-2 bg-surface border border-slate-100 rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none focus:border-primary/30 w-full sm:w-48"
                />
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {faqCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveFaqCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all",
                    activeFaqCategory === cat ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-surface text-slate-400 border border-slate-50 hover:bg-slate-50"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-4">
               {filteredFaqs.length > 0 ? filteredFaqs.map((faq, idx) => (
                  <div key={idx} className="bg-surface rounded-3xl shadow-sm border border-slate-50 overflow-hidden transition-all">
                     <button 
                       onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                       className="w-full p-6 text-left flex items-center justify-between group"
                     >
                        <span className="text-xs font-black uppercase tracking-tight text-text-primary group-hover:text-primary transition-colors">{faq.q}</span>
                        <ChevronRight className={cn("w-4 h-4 text-slate-300 transition-transform", expandedFaq === idx && "rotate-90 text-primary")} />
                     </button>
                     {expandedFaq === idx && (
                       <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                          <p className="text-[10px] font-medium text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">{faq.a}</p>
                       </div>
                     )}
                  </div>
               )) : (
                 <div className="p-10 text-center bg-surface rounded-3xl border border-slate-50">
                    <Info className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No matching FAQs found</p>
                 </div>
               )}
            </div>
         </div>

         {/* Quick Actions & Support Links */}
         <div className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-black uppercase tracking-tight px-1 flex items-center gap-3">
               <Zap className="w-5 h-5 text-primary" /> Direct Access
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
               <div 
                 onClick={() => setActiveModal('call')}
                 className="p-6 bg-indigo-600 text-white border-none rounded-[2rem] shadow-xl shadow-indigo-100 relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all"
               >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-surface/10 rounded-full -mr-12 -mt-12 blur-2xl" />
                  <Globe className="w-8 h-8 mb-4 opacity-40 group-hover:rotate-12 transition-transform" />
                  <h4 className="text-xs font-black uppercase tracking-tight">International Support</h4>
                  <p className="text-[8px] font-bold text-white/60 uppercase tracking-widest mt-1">24/7 Global Concierge</p>
               </div>
               <div 
                 onClick={() => setActiveModal('ticket')}
                 className="p-6 bg-slate-900 text-white border-none rounded-[2rem] shadow-xl shadow-slate-100 relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all"
               >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full -mr-12 -mt-12 blur-2xl" />
                  <Zap className="w-8 h-8 mb-4 opacity-40 group-hover:scale-110 transition-transform" />
                  <h4 className="text-xs font-black uppercase tracking-tight">Instant Report</h4>
                  <p className="text-[8px] font-bold text-white/60 uppercase tracking-widest mt-1">Direct feedback node</p>
               </div>
            </div>
            
            <div 
              onClick={() => setActiveModal('email')}
              className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-surface transition-all shadow-sm active:scale-[0.98]"
            >
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-surface rounded-xl shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform"><Mail className="w-5 h-5" /></div>
                  <div>
                     <p className="text-[11px] font-black uppercase tracking-tight leading-none group-hover:text-primary transition-colors">Email Us</p>
                     <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">{settings?.email || 'support@gilahouse.com'}</p>
                  </div>
               </div>
               <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
            </div>

            <div className="card p-6 bg-surface border-slate-100 shadow-xl shadow-slate-100/50 rounded-[2rem] flex items-center gap-4">
               <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-tight leading-none">System Status</p>
                  <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> All Systems Operational
                  </p>
               </div>
            </div>
         </div>
      </div>

      {/* Modals - Improved Z-Index and Mobile Positioning */}
      {activeModal && createPortal(
        <div className="fixed inset-0 z-[10000] flex flex-col justify-end sm:justify-center items-center sm:p-4 overflow-hidden">
          <div 
            onClick={() => setActiveModal(null)} 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
          />
          
          {/* Create Ticket Modal */}
          {activeModal === 'ticket' && (
            <div className="relative w-full sm:max-w-[500px] bg-surface rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300 flex flex-col max-h-[90dvh] sm:max-h-[85vh] mt-auto sm:mt-0">
               <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                       <Plus className="w-5 h-5 text-primary stroke-[3]" />
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-black uppercase tracking-tight leading-none">Open New Ticket</h3>
                      <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 md:mt-1 leading-none">Average response: 15 mins</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-surface rounded-xl border border-transparent hover:border-slate-100 transition-all shadow-sm"><X className="w-5 h-5 text-slate-400" /></button>
               </div>
               <form onSubmit={handleTicketSubmit} className="flex-1 overflow-y-auto scrollbar-hide overscroll-contain">
                  <div className="p-6 sm:p-8 space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject *</label>
                      <input 
                        type="text"
                        required
                        value={ticketForm.subject}
                        onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                        placeholder="Brief summary of issue"
                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-xs transition-all shadow-sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                        <div className="relative">
                          <select 
                            value={ticketForm.category}
                            onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
                            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-xs appearance-none transition-all shadow-sm"
                          >
                             <option>General</option>
                             <option>Orders</option>
                             <option>Billing</option>
                             <option>Account</option>
                          </select>
                          <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                        <div className="relative">
                          <select 
                            value={ticketForm.priority}
                            onChange={(e) => setTicketForm({...ticketForm, priority: e.target.value})}
                            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-xs appearance-none transition-all shadow-sm"
                          >
                             <option>Low</option>
                             <option>Medium</option>
                             <option>High</option>
                             <option>Urgent</option>
                          </select>
                          <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Message *</label>
                      <textarea 
                        required
                        value={ticketForm.message}
                        onChange={(e) => setTicketForm({...ticketForm, message: e.target.value})}
                        placeholder="Describe your issue in detail..."
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-xs min-h-[140px] resize-none transition-all shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="p-6 sm:p-8 border-t border-slate-50 bg-surface shrink-0 sticky bottom-0 z-20 flex gap-4">
                    <button type="button" onClick={() => setActiveModal(null)} className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all">Cancel</button>
                    <button type="submit" className="flex-1 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 active:scale-95 transition-all">Submit Ticket</button>
                  </div>
               </form>
            </div>
          )}

          {/* Live Chat Modal - Redesigned for Perfection & Responsiveness */}
          {activeModal === 'chat' && (
            <div className="relative w-full sm:max-w-[420px] bg-surface rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col h-[90dvh] sm:h-[600px] animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-500 mt-auto sm:mt-0 border-x border-t sm:border border-slate-100">
               {/* Premium Header */}
               <div className="px-6 py-6 bg-gradient-to-br from-primary via-primary to-primary/90 text-white shrink-0 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-surface/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-surface/20 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-lg">
                        <MessageSquare className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black uppercase tracking-tight leading-none">Concierge</h3>
                        <div className="flex items-center gap-2 mt-2">
                           <div className="flex -space-x-2">
                              {[1,2,3].map(i => (
                                 <div key={i} className="w-4 h-4 rounded-full border-2 border-primary bg-slate-200" />
                              ))}
                           </div>
                           <p className="text-[8px] font-black uppercase tracking-widest opacity-80 ml-1">Support Team Online</p>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setActiveModal(null)} className="p-2.5 hover:bg-surface/10 rounded-xl transition-all border border-white/10 backdrop-blur-sm"><X className="w-5 h-5 text-white/80" /></button>
                  </div>
               </div>

               {/* Messages Area */}
               <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/30 scrollbar-hide overscroll-contain flex flex-col pb-8">
                  <div className="mx-auto px-4 py-1.5 bg-slate-100 rounded-full mb-4">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Conversation Started</p>
                  </div>
                  {chatMessages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-center opacity-50">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Send a message to start chatting</p>
                    </div>
                  ) : chatMessages.map((msg, i) => (
                    <div 
                      key={msg.id || i} 
                      id={`msg-${msg.id}`} 
                      className={cn(
                        "flex flex-col max-w-[85%] space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300 relative group rounded-2xl transition-all p-1",
                        msg.sender === 'Guest' ? "ml-auto items-end" : "items-start"
                      )}
                    >
                       <div className={cn("flex items-center gap-2", msg.sender === 'Guest' ? "flex-row-reverse" : "flex-row")}>
                          <div className={cn(
                            "px-5 py-4 rounded-[1.5rem] text-[11px] font-bold shadow-sm leading-relaxed",
                            msg.sender === 'Guest' 
                             ? "bg-primary text-white rounded-tr-none shadow-primary/20" 
                             : "bg-surface text-slate-700 rounded-tl-none border border-slate-100 shadow-slate-100"
                          )}>
                            {renderMessageContent(msg.content)}
                          </div>
                          
                          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              type="button"
                              onClick={() => {
                                setReplyingToMessage({
                                  id: msg.id,
                                  sender: msg.sender === 'Guest' ? 'Guest' : 'Staff',
                                  content: msg.content,
                                  friendlyText: getFriendlyMessageText(msg.content)
                                });
                              }}
                              className="p-1 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-full transition-all active:scale-95 shrink-0"
                              title="Reply to Message"
                            >
                               <CornerUpLeft className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => {
                                if (window.confirm("Are you sure you want to delete this message?")) {
                                  deleteMessage(msg.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-full transition-all active:scale-95 shrink-0"
                              title="Delete Message"
                            >
                               <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                       </div>
<span className="text-[8px] font-black text-slate-300 uppercase tracking-widest px-1">
                         {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
               </div>

               {/* Premium Input Area */}
               <div className="p-4 sm:p-6 bg-surface border-t border-slate-50 shrink-0 pb-safe relative">
                  {/* Hidden File Input */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />

                  {/* Emoji Picker Popup */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-24 left-4 bg-surface border border-slate-100 rounded-2xl p-3 shadow-xl z-50 grid grid-cols-5 gap-2 w-48 animate-in fade-in slide-in-from-bottom-2 duration-200">
                      {emojis.map(e => (
                        <button 
                          key={e} 
                          type="button" 
                          onClick={() => handleEmojiClick(e)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg text-lg active:scale-95 transition-all"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Replying Preview Bar */}
                  {replyingToMessage && (
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl p-3 px-5 mb-3 animate-in slide-in-from-bottom duration-200">
                      <div className="flex flex-col min-w-0 flex-1">
                         <span className="text-[8px] font-black uppercase text-primary tracking-widest">
                            Replying to {replyingToMessage.sender === 'Guest' ? 'Guest' : 'Staff'}
                         </span>
                         <span className="text-xs font-bold text-slate-500 truncate mt-0.5">
                            {replyingToMessage.friendlyText}
                         </span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setReplyingToMessage(null)}
                        className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-all"
                      >
                         <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {isRecording ? (
                    <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-2xl p-3 px-5 animate-pulse">
                      <div className="flex items-center gap-3">
                         <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                         <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">
                            Recording Voice ({formatTime(recordingTime)})
                         </span>
                      </div>
                      <div className="flex gap-2">
                         <button 
                           type="button"
                           onClick={() => stopRecording(true)}
                           className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                         >
                            Cancel
                         </button>
                         <button 
                           type="button"
                           onClick={() => stopRecording(false)}
                           className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md shadow-red-500/20"
                         >
                            Send
                         </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                       <button 
                         type="button"
                         onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                         className={cn("p-2 rounded-xl transition-all border border-slate-100/50 hover:bg-slate-50", showEmojiPicker ? "text-primary bg-primary-light" : "text-slate-400")}
                       >
                          <Smile className="w-5 h-5" />
                       </button>

                       <button 
                         type="button"
                         onClick={() => fileInputRef.current?.click()}
                         className="p-2 rounded-xl transition-all border border-slate-100/50 text-slate-400 hover:text-primary hover:bg-slate-50"
                       >
                          <Paperclip className="w-5 h-5" />
                       </button>

                       <button 
                         type="button"
                         onClick={startRecording}
                         className="p-2 rounded-xl transition-all border border-slate-100/50 text-slate-400 hover:text-red-500 hover:bg-red-50"
                         title="Record Voice Note"
                       >
                          <Mic className="w-5 h-5" />
                       </button>

                       <div className="relative flex-1 group">
                          <input 
                            type="text"
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="w-full pl-6 pr-12 py-3 bg-slate-50 border-2 border-transparent focus:border-primary/10 focus:bg-surface rounded-3xl outline-none font-bold text-xs transition-all placeholder:text-slate-300 shadow-inner group-hover:bg-slate-100/50"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                             <Globe className="w-4 h-4 opacity-50" />
                          </div>
                       </div>
                       
                       <button 
                          type="submit" 
                          disabled={!chatMessage.trim() || !chatTicketId}
                          className="w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30 active:scale-90 hover:scale-105 transition-all shrink-0 disabled:opacity-50 disabled:grayscale disabled:scale-100"
                       >
                          <Send className="w-5 h-5" />
                       </button>
                    </form>
                  )}
                  <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest text-center mt-3 sm:mt-4">
                     End-to-end encrypted • {settings?.businessName || 'Gila House'} Secure Chat
                  </p>
               </div>
            </div>
          )}

          {/* Call Support Modal */}
          {activeModal === 'call' && (
            <div className="relative w-full max-w-[95%] md:max-w-[400px] bg-surface rounded-t-[2.5rem] sm:rounded-[3rem] shadow-2xl p-8 md:p-10 text-center space-y-8 animate-in slide-in-from-bottom-4 sm:zoom-in duration-300 self-end sm:self-center">
               <div className="w-20 h-20 md:w-24 md:h-24 bg-rose-50 text-primary rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
                  <Phone className="w-8 h-8 md:w-10 md:h-10" />
               </div>
               <div>
                 <h3 className="text-2xl font-black uppercase tracking-tight leading-none text-text-primary">Call Support</h3>
                 <p className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest mt-3 leading-relaxed">You are about to dial our premium support line.</p>
               </div>
               <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Support Number</p>
                  <p className="text-2xl md:text-3xl font-black text-text-primary tracking-tighter tracking-widest">+00 12345 67890</p>
               </div>
               <div className="flex flex-col gap-4">
                  <a 
                    href="tel:+001234567890"
                    className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
                  >
                    <Phone className="w-4 h-4" /> Start Call
                  </a>
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="w-full py-4 bg-slate-50 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
               </div>
            </div>
          )}

          {/* Email Support Modal */}
          {activeModal === 'email' && (
            <div className="relative w-full max-w-[95%] md:max-w-[400px] bg-surface rounded-t-[2.5rem] sm:rounded-[3rem] shadow-2xl p-8 md:p-10 text-center space-y-8 animate-in slide-in-from-bottom-4 sm:zoom-in duration-300 self-end sm:self-center">
               <div className="w-20 h-20 md:w-24 md:h-24 bg-indigo-50 text-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
                  <Mail className="w-8 h-8 md:w-10 md:h-10" />
               </div>
               <div>
                 <h3 className="text-2xl font-black uppercase tracking-tight leading-none text-text-primary">Email Support</h3>
                 <p className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest mt-3 leading-relaxed">Our email agents respond within 2-4 hours.</p>
               </div>
               <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Official Support</p>
                  <p className="text-lg md:text-xl font-black text-text-primary tracking-tight">{settings?.email || 'support@gilahouse.com'}</p>
               </div>
               <div className="flex flex-col gap-4">
                  <a 
                    href={`mailto:${settings?.email || 'support@gilahouse.com'}?subject=Support Request - ${settings?.businessName || 'Gila House'}&body=Hello Support Team,`}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
                  >
                    <Mail className="w-4 h-4" /> Compose Email
                  </a>
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="w-full py-4 bg-slate-50 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
               </div>
            </div>
          )}

          {/* Ticket Detail Modal */}
          {activeModal === 'detail' && selectedTicket && (
            <div className="relative w-full max-w-[95%] sm:max-w-[500px] bg-surface rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 sm:zoom-in-95 duration-300 self-end sm:self-center flex flex-col max-h-[90vh] sm:max-h-[85vh]">
               <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shadow-inner">
                      <Zap className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-black uppercase tracking-tight leading-none">{selectedTicket.id}</h3>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5 md:mt-1 leading-none">
                        Created: {new Date(selectedTicket.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-surface rounded-xl border border-transparent hover:border-slate-100 transition-all shadow-sm"><X className="w-5 h-5 text-slate-400" /></button>
               </div>
               <div className="flex-1 overflow-y-auto scrollbar-hide p-6 sm:p-8 space-y-8 overscroll-contain">
                  <div className="grid grid-cols-2 gap-5">
                     <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Category</p>
                        <p className="text-xs font-black text-text-primary uppercase tracking-tight leading-none">{selectedTicket.category || 'Support'}</p>
                     </div>
                     <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Priority</p>
                        <span className={cn(
                          "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                          selectedTicket.priority === 'High' || selectedTicket.priority === 'Urgent' ? "bg-rose-100 text-primary" : "bg-emerald-100 text-emerald-600"
                        )}>
                          {selectedTicket.priority || 'Normal'}
                        </span>
                     </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Subject Matter</p>
                    <p className="text-sm font-black text-text-primary uppercase tracking-tight bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm">
                      {selectedTicket.subject || selectedTicket.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Detailed Report</p>
                    <div className="bg-surface p-5 rounded-[2rem] border border-slate-100 min-h-[140px] text-xs font-medium text-slate-600 leading-relaxed shadow-inner">
                      {selectedTicket.message || "No additional message provided."}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 shadow-sm">
                     <Clock className="w-5 h-5 animate-pulse" />
                     <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Awaiting staff response • Estimated time: 10m</p>
                  </div>
               </div>
               <div className="p-6 sm:p-8 border-t border-slate-50 bg-surface shrink-0 sticky bottom-0 z-20">
                 <button onClick={() => setActiveModal(null)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-slate-900/20 active:scale-95 transition-all">
                    Close Ticket View
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

export default CustomerSupport;
