import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MessageSquare, 
  User, 
  Send, 
  CheckCheck,
  Phone,
  Video,
  MoreVertical,
  ChevronLeft,
  Paperclip,
  Smile,
  Mic,
  Square,
  Trash
} from 'lucide-react';
import { cn } from "../../../utils/cn";
import { useCommunication } from "../../../context/CommunicationContext";
import { useToast } from "../../../context/ToastContext";
import { getImageUrl } from "../../../utils/imageUtils";

const Concierge = () => {
  const { messages, activeChats, sendMessage, markAsRead, fetchMessages, uploadFile, deleteMessage } = useCommunication();
  const { showToast } = useToast();
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const selectedChat = activeChats.find(c => c.ticketId === selectedTicketId);
  const chatMessages = messages.filter(m => m.ticketId === selectedTicketId);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const recordingIntervalRef = useRef(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojis = ['😊', '😂', '👍', '❤️', '🎉', '🍕', '🍔', '🥤', '🍟', '👋', '☕', '✨', '🎂', '🙌', '🔥'];

  const fileInputRef = useRef(null);

  const handleEmojiClick = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedChat) return;
    
    if (!file.type.startsWith('image/')) {
      showToast('Only image files are supported');
      return;
    }
    
    const url = await uploadFile(file);
    if (url) {
      sendMessage(selectedChat.ticketId, selectedChat.guestName, `[IMAGE]:${url}`, 'Staff');
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
          sendMessage(selectedChat.ticketId, selectedChat.guestName, `[AUDIO]:${url}`, 'Staff');
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
      showToast('Microphone access denied or not available');
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
    if (selectedTicketId) {
      fetchMessages(selectedTicketId);
      markAsRead(selectedTicketId);
    }
  }, [selectedTicketId, fetchMessages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;
    sendMessage(selectedChat.ticketId, selectedChat.guestName, newMessage, 'Staff');
    setNewMessage('');
  };

  const filteredChats = activeChats.filter(c => 
    (c.guestName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.lastMessage || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (chatMessages.length > 0) {
      scrollToBottom();
    }
  }, [chatMessages]);

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
    <div className="w-full min-w-0 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-text-primary uppercase tracking-tight">Concierge</h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage guest conversations and requests.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[380px_1fr] gap-6 overflow-hidden">
        {/* Guest List Panel */}
        <section className={cn(
          "rounded-3xl bg-surface border border-slate-100 shadow-sm p-4 min-w-0 flex flex-col gap-4 h-[calc(100vh-14rem)] min-h-[500px] transition-all duration-300",
          selectedTicketId ? "hidden md:flex" : "flex"
        )}>
          <div className="relative group shrink-0">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
             <input 
               type="text" 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Search guests..." 
               className="w-full pl-11 pr-5 py-3 bg-slate-50 border-none rounded-2xl outline-none text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all"
             />
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto pr-1 scrollbar-hide">
             {filteredChats.map(chat => (
               <button 
                 key={chat.ticketId}
                 onClick={() => setSelectedTicketId(chat.ticketId)}
                 className={cn(
                   "w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 text-left group relative",
                   selectedTicketId === chat.ticketId 
                   ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                   : "bg-surface text-text-primary border-transparent hover:bg-slate-50"
                 )}
               >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    selectedTicketId === chat.ticketId ? "bg-surface/20" : "bg-slate-100"
                  )}>
                     <User className={cn("w-5 h-5", selectedTicketId === chat.ticketId ? "text-white" : "text-slate-400")} />
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-center mb-1">
                        <h4 className="text-[11px] font-black uppercase truncate tracking-tight">{chat.guestName}</h4>
                        <span className={cn("text-[8px] font-black uppercase opacity-60", selectedTicketId === chat.ticketId ? "text-white" : "text-slate-300")}>
                           {new Date(chat.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                     </div>
                     <p className={cn("text-[10px] font-bold truncate opacity-80 uppercase tracking-widest", selectedTicketId === chat.ticketId ? "text-white" : "text-slate-400")}>
                        {chat.lastMessage}
                     </p>
                  </div>
               </button>
             ))}
          </div>
        </section>

        {/* Chat Panel */}
        <section className={cn(
          "rounded-3xl bg-surface border border-slate-100 shadow-sm min-w-0 overflow-hidden flex flex-col h-[calc(100vh-14rem)] min-h-[500px] transition-all duration-300",
          !selectedTicketId ? "hidden md:flex" : "flex"
        )}>
          {!selectedChat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 opacity-30">
               <MessageSquare className="w-12 h-12 mb-4" />
               <p className="text-xs font-black uppercase tracking-widest">Select a guest to chat</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedTicketId(null)} className="md:hidden p-2 hover:bg-surface rounded-xl transition-all">
                       <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center text-primary shadow-sm">
                       <User className="w-5 h-5" />
                    </div>
                    <div>
                       <h3 className="text-sm font-black text-text-primary uppercase tracking-tight">{selectedChat.guestName}</h3>
                       <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Online</span>
                    </div>
                 </div>
                 <div className="flex gap-2 relative">
                    <button onClick={() => showToast(`Guest Phone: ${selectedChat?.guestPhone || 'Not Registered'}`)} className="p-2 text-slate-400 hover:text-primary transition-all"><Phone className="w-4 h-4" /></button>
                    <button onClick={() => setShowMenu(!showMenu)} className="p-2 text-slate-400 hover:text-primary transition-all"><MoreVertical className="w-4 h-4" /></button>
                    
                    {showMenu && (
                      <div className="absolute right-0 top-10 w-32 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                        <button 
                          onClick={() => {
                            setSelectedTicketId(null);
                            setShowMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                        >
                          Close Chat
                        </button>
                      </div>
                    )}
                 </div>
              </div>

              {/* Messages Area */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide bg-slate-50/10"
              >
                 {chatMessages.map(msg => {
                   const isStaff = msg.sender === 'Staff';
                   return (
                      <div key={msg.id} className={cn("flex flex-col relative group", isStaff ? "items-end" : "items-start")}>
                         <div className={cn("flex items-center gap-2 max-w-[80%]", isStaff ? "flex-row-reverse" : "flex-row")}>
                            <div className={cn(
                              "p-4 rounded-2xl text-xs font-bold shadow-sm",
                              isStaff ? "bg-primary text-white rounded-tr-none" : "bg-surface text-text-primary rounded-tl-none border border-slate-50"
                            )}>
                              {renderMessageContent(msg.content)}
                            </div>
                            <button 
                              onClick={() => {
                                if (window.confirm("Are you sure you want to delete this message?")) {
                                  deleteMessage(msg.id);
                                }
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg transition-all active:scale-95 shrink-0"
                              title="Delete Message"
                            >
                               <Trash className="w-3.5 h-3.5" />
                            </button>
                         </div>
                         <div className={cn("flex items-center gap-2 mt-1.5 px-1", isStaff ? "flex-row-reverse" : "flex-row")}>
                           <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </span>
                           {isStaff && <CheckCheck className="w-3 h-3 text-primary" />}
                         </div>
                      </div>
                   );
                 })}
                 <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-slate-50 bg-surface relative">
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
                   <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-2xl p-3 px-5 animate-pulse">
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
                   <form onSubmit={handleSend} className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={cn("p-2.5 rounded-xl transition-all border border-slate-100/50 hover:bg-slate-50", showEmojiPicker ? "text-primary bg-primary-light" : "text-slate-400")}
                      >
                         <Smile className="w-5 h-5" />
                      </button>

                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2.5 rounded-xl transition-all border border-slate-100/50 text-slate-400 hover:text-primary hover:bg-slate-50"
                      >
                         <Paperclip className="w-5 h-5" />
                      </button>

                      <button 
                        type="button"
                        onClick={startRecording}
                        className="p-2.5 rounded-xl transition-all border border-slate-100/50 text-slate-400 hover:text-red-500 hover:bg-red-50"
                        title="Record Voice Note"
                      >
                         <Mic className="w-5 h-5" />
                      </button>

                      <input 
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-5 py-3 bg-slate-50 border-none rounded-2xl outline-none text-xs font-bold focus:ring-4 focus:ring-primary/5 transition-all"
                      />

                      <button 
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="px-6 py-3 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 disabled:opacity-50"
                      >
                        Send
                      </button>
                   </form>
                 )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default Concierge;
