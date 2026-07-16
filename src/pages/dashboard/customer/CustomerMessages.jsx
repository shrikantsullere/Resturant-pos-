import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  MessageSquare, 
  User, 
  Clock, 
  Check, 
  CheckCheck,
  Smartphone,
  Phone,
  Video,
  Info,
  Paperclip,
  Smile,
  Image as ImageIcon,
  ChevronLeft,
  Mic,
  Square,
  Trash,
  CornerUpLeft,
  X
} from 'lucide-react';
import { cn } from "../../../utils/cn";
import { useCommunication } from "../../../context/CommunicationContext";
import { useCustomer } from "../../../context/CustomerContext";
import { getImageUrl } from "../../../utils/imageUtils";

const CustomerMessages = () => {
  const { messages, sendMessage, uploadFile, deleteMessage } = useCommunication();
  const { profile } = useCustomer();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

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
    setNewMessage(prev => prev + emoji);
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
    if (!file || !profile.id) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Only image files are supported');
      return;
    }
    
    const url = await uploadFile(file);
    if (url) {
      const content = `[Customer] [IMAGE]:${url}`;
      sendMessage(profile.id, profile.name, content, 'Guest');
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
          const content = `[Customer] [AUDIO]:${url}`;
          sendMessage(profile.id, profile.name, content, 'Guest');
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
          className="mb-2 p-2 bg-slate-500/10 border-l-4 border-primary rounded-r-lg text-[10px] cursor-pointer hover:bg-slate-500/15 transition-all text-left text-slate-700"
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

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  const myMessages = messages.filter(m => m.guestId === profile.id || m.guestName === profile.name);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [myMessages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    let content = newMessage;
    if (replyingToMessage) {
      content = `[REPLY:${replyingToMessage.id}:${replyingToMessage.sender}:${replyingToMessage.friendlyText}] ${newMessage}`;
    }
    
    sendMessage(profile.id || 'CUST-TEMP', profile.name, content, 'Guest');
    setNewMessage('');
    setReplyingToMessage(null);
  };

  return (
    <div className="h-[calc(100vh-10rem)] lg:h-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/customer/home')}
            className="lg:hidden p-2 bg-surface rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-primary transition-all mr-1"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
            <MessageSquare className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-text-primary uppercase tracking-wider">Concierge <span className="text-primary">Chat</span></h2>
            <p className="text-text-secondary text-sm font-bold mt-1">We're here to help you 24/7</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button className="p-3 bg-surface border border-slate-100 rounded-2xl text-slate-400 hover:text-primary transition-all shadow-sm"><Phone className="w-5 h-5" /></button>
           <button className="p-3 bg-surface border border-slate-100 rounded-2xl text-slate-400 hover:text-primary transition-all shadow-sm"><Video className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 min-h-0 flex flex-col bg-surface border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 scrollbar-hide">
          {myMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
               <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center">
                  <MessageSquare className="w-10 h-10 text-slate-200" />
               </div>
               <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Start a conversation with our concierge</p>
            </div>
          ) : (
             myMessages.map((msg, i) => {
               const isMe = msg.sender === 'Guest';
               return (
                 <div 
                   key={msg.id || i} 
                   id={`msg-${msg.id}`} 
                   className={cn("flex flex-col relative group rounded-2xl transition-all p-1", isMe ? "items-end" : "items-start")}
                 >
                   <div className={cn("flex items-center gap-2 max-w-[85%] lg:max-w-[70%]", isMe ? "flex-row-reverse" : "flex-row")}>
                      <div className={cn(
                        "p-5 rounded-[2rem] text-sm font-bold leading-relaxed shadow-sm",
                        isMe 
                        ? "bg-primary text-white rounded-tr-none" 
                        : "bg-slate-50 text-text-primary rounded-tl-none border border-slate-100"
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
                   <div className={cn("flex items-center gap-2 mt-2 px-1", isMe ? "flex-row-reverse" : "flex-row")}>
                     <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </span>
                     {isMe && (
                       <div className="flex items-center text-primary">
                         {msg.status === 'read' ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                       </div>
                     )}
                   </div>
                 </div>
               );
             })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 lg:p-8 border-t border-slate-50 bg-slate-50/30 relative">
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
            <div className="absolute bottom-28 left-8 bg-surface border border-slate-100 rounded-2xl p-3 shadow-xl z-50 grid grid-cols-5 gap-2 w-48 animate-in fade-in slide-in-from-bottom-2 duration-200">
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
            <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl p-3 px-5 mb-4 animate-in slide-in-from-bottom duration-200">
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
            <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-[2rem] p-4 px-6 animate-pulse">
              <div className="flex items-center gap-3">
                 <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                 <span className="text-xs font-black text-red-600 uppercase tracking-widest">
                    Recording Voice ({formatTime(recordingTime)})
                 </span>
              </div>
              <div className="flex gap-2">
                 <button 
                   type="button"
                   onClick={() => stopRecording(true)}
                   className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                 >
                    Cancel
                 </button>
                 <button 
                   type="button"
                   onClick={() => stopRecording(false)}
                   className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-red-500/20"
                 >
                    Send
                 </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSend} className="relative flex items-center gap-2">
               <button 
                 type="button"
                 onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                 className={cn("p-3 rounded-2xl transition-all border border-slate-100/50 hover:bg-slate-100", showEmojiPicker ? "text-primary bg-primary-light" : "text-slate-400")}
               >
                  <Smile className="w-5 h-5" />
               </button>

               <button 
                 type="button"
                 onClick={() => fileInputRef.current?.click()}
                 className="p-3 rounded-2xl transition-all border border-slate-100/50 text-slate-400 hover:text-primary hover:bg-slate-100"
               >
                  <Paperclip className="w-5 h-5" />
               </button>

               <button 
                 type="button"
                 onClick={startRecording}
                 className="p-3 rounded-2xl transition-all border border-slate-100/50 text-slate-400 hover:text-red-500 hover:bg-red-100"
                 title="Record Voice Note"
               >
                  <Mic className="w-5 h-5" />
               </button>

               <div className="relative flex-1">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full pl-6 pr-16 py-4 bg-surface border border-slate-100 rounded-[2rem] outline-none shadow-xl shadow-slate-200/20 text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all"
                  />
               </div>
               
               <button 
                 type="submit"
                 disabled={!newMessage.trim()}
                 className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 active:scale-90 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
               >
                 <Send className="w-5 h-5 ml-0.5" />
               </button>
            </form>
          )}

          <div className="flex items-center justify-center gap-6 mt-4 opacity-50">
             {['Request Room Cleaning', 'Need Extra Water', 'Order Room Service'].map(suggestion => (
               <button 
                 key={suggestion}
                 onClick={() => setNewMessage(suggestion)}
                 className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-all"
               >
                 {suggestion}
               </button>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerMessages;
