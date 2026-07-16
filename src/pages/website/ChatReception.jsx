import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Send, Plus, Loader2, Paperclip, Smile, Mic, Square, Trash } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCommunication } from '../../context/CommunicationContext';
import { getImageUrl } from '../../utils/imageUtils';
import { categoryIconMap } from '../../context/MenuContext';
import api from '@/services/api';

const ChatReception = () => {
  const { messages, fetchMessages, sendGuestMessage, getGuestTicket, uploadFile, deleteMessage } = useCommunication();
  const [ticket, setTicket] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const [guestId, setGuestId] = useState(null);
  const [guestName, setGuestName] = useState('Guest');
  const [department, setDepartment] = useState('Reception');

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const recordingIntervalRef = useRef(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojis = ['😊', '😂', '👍', '❤️', '🎉', '🍕', '🍔', '🥤', '🍟', '👋', '☕', '✨', '🎂', '🙌', '🔥'];

  const fileInputRef = useRef(null);

  const handleEmojiClick = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !ticket || !guestId) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Only image files are supported');
      return;
    }
    
    const url = await uploadFile(file);
    if (url) {
      const content = `[${department}] [IMAGE]:${url}`;
      await sendGuestMessage(ticket.id, guestId, content);
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
          const content = `[${department}] [AUDIO]:${url}`;
          await sendGuestMessage(ticket.id, guestId, content);
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
      alert('Microphone access denied or not available');
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const deptParam = params.get('dept');
    if (deptParam) {
      const formatted = deptParam.charAt(0).toUpperCase() + deptParam.slice(1);
      const validDepts = ['Waiter', 'Reception', 'Billing', 'Kitchen', 'Manager'];
      let matched = formatted;
      if (deptParam === 'kitchen' || deptParam === 'restaurant' || deptParam === 'bar') {
        matched = 'Kitchen';
      }
      if (validDepts.includes(matched)) {
        setDepartment(matched);
      }
    }
  }, []);

  useEffect(() => {
    const savedInfo = localStorage.getItem('guest_info');
    if (savedInfo) {
      const parsed = JSON.parse(savedInfo);
      setGuestId(parsed.guestId);
      setGuestName(parsed.name || 'Guest');
      
      const initChat = async () => {
        if (!parsed.guestId) {
           console.error('Guest ID not found in localStorage. Please check in again.');
           setLoading(false);
           return;
        }
        const ticketData = await getGuestTicket(parsed.guestId);
        if (ticketData) {
          setTicket(ticketData);
          fetchMessages(ticketData.id);
        }
        setLoading(false);
      };
      initChat();
    } else {
      setLoading(false);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !ticket || !guestId) return;
    
    const content = `[${department}] ${message.trim()}`;
    setMessage(''); // Clear input immediately for better UX
    
    const success = await sendGuestMessage(ticket.id, guestId, content);
    if (!success) {
      // Could show error here
    }
  };

  const filteredMessages = messages.filter(m => m.ticketId === ticket?.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f7fbfb]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!guestId) {
    return (
      <StartChatForm 
        onStart={(info) => {
          setGuestId(info.guestId);
          setGuestName(info.name);
          const initChat = async () => {
            const ticketData = await getGuestTicket(info.guestId);
            if (ticketData) {
              setTicket(ticketData);
              fetchMessages(ticketData.id);
            }
          };
          initChat();
        }} 
      />
    );
  }

  const renderMessageContent = (content) => {
    let cleanContent = content;
    let deptPrefix = "";
    
    const match = content.match(/^\[(Waiter|Reception|Billing|Kitchen|Manager|Staff|Customer)\]\s*(.*)/i);
    if (match) {
      deptPrefix = `[${match[1]}] `;
      cleanContent = match[2];
    }
    
    if (cleanContent.startsWith('[IMAGE]:')) {
      const imageUrl = cleanContent.replace('[IMAGE]:', '');
      return (
        <div className="flex flex-col gap-1">
          {deptPrefix && <span className="text-[9px] font-black opacity-65 mb-1 block uppercase tracking-wider">{deptPrefix}</span>}
          <img 
            src={getImageUrl(imageUrl)} 
            alt="Attachment" 
            onClick={() => window.open(getImageUrl(imageUrl), '_blank')}
            className="max-h-60 rounded-xl object-contain cursor-pointer hover:opacity-90 transition-opacity" 
          />
        </div>
      );
    }
    
    if (cleanContent.startsWith('[AUDIO]:')) {
      const audioUrl = cleanContent.replace('[AUDIO]:', '');
      return (
        <div className="flex flex-col gap-1 text-slate-800">
          {deptPrefix && <span className="text-[9px] font-black opacity-65 mb-1 block uppercase tracking-wider">{deptPrefix}</span>}
          <audio 
            src={getImageUrl(audioUrl)} 
            controls 
            className="max-w-full" 
          />
        </div>
      );
    }
    
    return content;
  };

  return (
    <div className="flex flex-col h-screen bg-[#f7fbfb] font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-surface px-4 md:px-8 py-3 md:py-4 flex items-center justify-between border-b border-gray-100 z-50">
        <div className="flex items-center gap-3">
          <Link to="/request-chat" className="text-slate-400 hover:text-slate-800 transition-colors p-1">
            <ChevronLeft size={22} strokeWidth={3} />
          </Link>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-xl flex items-center justify-center text-xl md:text-2xl shadow-sm">
                {department === 'Waiter' ? '🛎️' : 
                 department === 'Reception' ? '🏨' : 
                 department === 'Billing' ? '💳' : 
                 department === 'Kitchen' ? '🍳' : '👔'}
             </div>
             <div>
                <h1 className="text-sm md:text-base font-black text-slate-800 tracking-tight leading-none mb-1">{department}</h1>
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                   <span className="text-[10px] font-bold text-gray-400 tracking-wide uppercase">Available</span>
                </div>
             </div>
          </div>
        </div>

        {/* Department Dropdown Selection */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-[9px] font-black text-slate-400 uppercase tracking-widest">To:</span>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-[10px] font-black uppercase tracking-wider rounded-xl px-3 py-2 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-sans"
          >
            <option value="Waiter">🛎️ Waiter</option>
            <option value="Reception">🏨 Reception</option>
            <option value="Billing">💳 Billing</option>
            <option value="Kitchen">🍳 Kitchen</option>
            <option value="Manager">👔 Manager</option>
          </select>
        </div>
      </header>

      {/* Chat Messages */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6 no-scrollbar bg-slate-50/50">
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
          <div className="text-center">
             <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest bg-surface/80 px-4 py-1.5 rounded-full shadow-sm">Today</span>
          </div>

          {filteredMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`flex flex-col relative group ${msg.sender === 'Guest' ? 'items-end' : 'items-start'}`}
            >
              <div className={`flex items-center gap-2 max-w-[85%] md:max-w-[70%] ${msg.sender === 'Guest' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`p-4 md:p-5 rounded-3xl text-sm md:text-base font-bold shadow-sm ${
                  msg.sender === 'Guest' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-surface text-slate-800 rounded-tl-none'
                }`}>
                  {renderMessageContent(msg.content)}
                </div>
                
                <button 
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this message?")) {
                      deleteMessage(msg.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-full transition-all active:scale-95 shrink-0"
                  title="Delete Message"
                >
                   <Trash className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                 <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                   {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </span>
                 {msg.sender === 'Guest' && (
                    <div className="flex items-center">
                       <svg className="w-3 h-3 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                        <polyline points="22 10 13 19 8 14" className="-ml-2" />
                      </svg>
                    </div>
                 )}
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Bar */}
      <footer className="bg-surface p-4 pb-8 md:pb-4 border-t border-gray-100 relative">
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
           <div className="absolute bottom-20 left-4 bg-surface border border-slate-100 rounded-2xl p-3 shadow-xl z-50 grid grid-cols-5 gap-2 w-48 animate-in fade-in slide-in-from-bottom-2 duration-200">
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

         {isRecording ? (
           <div className="max-w-4xl mx-auto w-full flex items-center justify-between bg-red-50 border border-red-100 rounded-2xl p-3 px-5 animate-pulse">
             <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-black text-red-600 uppercase tracking-widest">
                   Recording Voice Note ({formatTime(recordingTime)})
                </span>
             </div>
             <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => stopRecording(true)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                >
                   Cancel
                </button>
                <button 
                  type="button"
                  onClick={() => stopRecording(false)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md shadow-red-500/20"
                >
                   Stop & Send
                </button>
             </div>
           </div>
         ) : (
           <div className="max-w-4xl mx-auto w-full flex items-center gap-2">
              <button 
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={cn("w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all border border-slate-100/50 hover:bg-slate-50", showEmojiPicker ? "text-blue-600 bg-blue-50" : "text-slate-400")}
              >
                 <Smile className="w-5 h-5" />
              </button>

              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all border border-slate-100/50 text-slate-400 hover:text-blue-600 hover:bg-slate-50"
              >
                 <Paperclip className="w-5 h-5" />
              </button>

              <button 
                type="button"
                onClick={startRecording}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all border border-slate-100/50 text-slate-400 hover:text-red-500 hover:bg-red-50"
                title="Record Voice Note"
              >
                 <Mic className="w-5 h-5" />
              </button>

              <div className="flex-1 relative">
                 <input 
                   type="text" 
                   value={message}
                   onChange={(e) => setMessage(e.target.value)}
                   onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                   placeholder={`Message ${department}...`} 
                   className="w-full bg-gray-50 border border-gray-100 px-6 py-3 md:py-3.5 rounded-full text-sm md:text-base font-bold placeholder:text-gray-300 outline-none focus:border-blue-200 focus:bg-surface transition-all shadow-inner"
                 />
              </div>

              <button 
                onClick={handleSend}
                disabled={!message.trim() || !ticket}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg shrink-0 ${
                  message.trim() && ticket
                  ? 'bg-blue-600 text-white shadow-blue-200' 
                  : 'bg-gray-50 text-gray-300'
                }`}
              >
                 <Send size={18} />
              </button>
           </div>
         )}
      </footer>
    </div>
  );
};

const StartChatForm = ({ onStart }) => {
  const [name, setName] = useState('');
  const [tableOrRoom, setTableOrRoom] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const response = await api.post('/reservations', {
        guestName: name.trim(),
        notes: `Started chat session from Table/Room ${tableOrRoom}`,
        type: 'table',
        status: 'pending'
      });

      if (response.data.success) {
        const info = {
          name: name.trim(),
          guestId: response.data.data.guestId,
          reservationId: response.data.data.id
        };
        localStorage.setItem('guest_info', JSON.stringify(info));
        onStart(info);
      } else {
        alert('Failed to start chat session: ' + response.data.message);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#bdf0e7] to-[#e0f7f3] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      <div className="w-full max-w-md text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-surface rounded-[1.5rem] shadow-xl flex items-center justify-center mb-6">
          <img src="/1000464407-removebg-preview.png" alt="Logo" className="w-12 h-auto" />
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-[#2a2a2a] mb-2 tracking-tight">Contact Staff</h1>
        <p className="text-[10px] md:text-xs font-bold text-teal-700/60 uppercase tracking-widest mb-8">Start a live chat session</p>

        <form onSubmit={handleSubmit} className="bg-surface rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-teal-900/5 w-full border border-white/50 text-left space-y-5">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-[#2a2a2a] uppercase tracking-widest ml-1">Your Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-sm shadow-sm transition-all" 
              placeholder="e.g. Manuel"
              required 
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-[#2a2a2a] uppercase tracking-widest ml-1">Table or Room Number</label>
            <input 
              type="text" 
              value={tableOrRoom}
              onChange={(e) => setTableOrRoom(e.target.value)}
              className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl outline-none font-bold text-sm shadow-sm transition-all" 
              placeholder="e.g. Table 04 or Room 102"
            />
          </div>

          <button 
            type="submit"
            disabled={submitting || !name.trim()}
            className="w-full bg-orange-500 text-white py-4 rounded-2xl text-[13px] font-black tracking-tight shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {submitting ? 'Starting...' : 'Start Chatting'}
          </button>
        </form>

        <div className="mt-8">
          <Link to="/" className="text-xs font-bold text-teal-700/60 hover:text-teal-700 transition-colors underline underline-offset-4">
            Go back to Home
          </Link>
        </div>
      </div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-surface/30 blur-[100px] rounded-full pointer-events-none" />
    </div>
  );
};

export default ChatReception;
