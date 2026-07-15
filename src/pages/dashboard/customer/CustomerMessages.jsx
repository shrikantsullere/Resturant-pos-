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
  ChevronLeft
} from 'lucide-react';
import { cn } from "../../../utils/cn";
import { useCommunication } from "../../../context/CommunicationContext";
import { useCustomer } from "../../../context/CustomerContext";

const CustomerMessages = () => {
  const { messages, sendMessage } = useCommunication();
  const { profile } = useCustomer();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

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
    sendMessage(profile.id || 'CUST-TEMP', profile.name, newMessage, 'Guest');
    setNewMessage('');
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
                <div key={msg.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                  <div className={cn(
                    "max-w-[85%] lg:max-w-[70%] p-5 rounded-[2rem] text-sm font-bold leading-relaxed shadow-sm",
                    isMe 
                    ? "bg-primary text-white rounded-tr-none" 
                    : "bg-slate-50 text-text-primary rounded-tl-none border border-slate-100"
                  )}>
                    {msg.content}
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
        <div className="p-6 lg:p-8 border-t border-slate-50 bg-slate-50/30">
          <form onSubmit={handleSend} className="relative group">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full pl-6 pr-32 py-5 bg-surface border border-slate-100 rounded-[2rem] outline-none shadow-xl shadow-slate-200/20 text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
               <button type="button" className="p-2.5 text-slate-300 hover:text-primary transition-all"><ImageIcon className="w-5 h-5" /></button>
               <button 
                 type="submit"
                 disabled={!newMessage.trim()}
                 className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 active:scale-90 transition-all disabled:opacity-50 disabled:scale-100"
               >
                 <Send className="w-5 h-5 ml-0.5" />
               </button>
            </div>
          </form>
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
