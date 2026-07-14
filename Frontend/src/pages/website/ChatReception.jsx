import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Send, Plus, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCommunication } from '../../context/CommunicationContext';

const ChatReception = () => {
  const { messages, fetchMessages, sendGuestMessage, getGuestTicket } = useCommunication();
  const [ticket, setTicket] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const [guestId, setGuestId] = useState(null);
  const [guestName, setGuestName] = useState('Guest');

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
    
    const content = message;
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
                🏨
             </div>
             <div>
                <h1 className="text-sm md:text-base font-black text-slate-800 tracking-tight leading-none mb-1">Reception</h1>
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                   <span className="text-[10px] font-bold text-gray-400 tracking-wide uppercase">Available</span>
                </div>
             </div>
          </div>
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
              className={`flex flex-col ${msg.sender === 'Guest' ? 'items-end' : 'items-start'}`}
            >
              <div className={`max-w-[85%] md:max-w-[70%] p-4 md:p-5 rounded-3xl text-sm md:text-base font-bold shadow-sm ${
                msg.sender === 'Guest' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-surface text-slate-800 rounded-tl-none'
              }`}>
                {msg.content}
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
      <footer className="bg-surface p-4 pb-8 md:pb-4 border-t border-gray-100">
        <div className="max-w-4xl mx-auto w-full flex items-center gap-3">
          <button className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all active:scale-95 shrink-0">
             <Plus size={20} />
          </button>
          
          <div className="flex-1 relative">
             <input 
               type="text" 
               value={message}
               onChange={(e) => setMessage(e.target.value)}
               onKeyPress={(e) => e.key === 'Enter' && handleSend()}
               placeholder="Message Reception..." 
               className="w-full bg-gray-50 border border-gray-100 px-6 py-3 md:py-4 rounded-full text-sm md:text-base font-bold placeholder:text-gray-300 outline-none focus:border-blue-200 focus:bg-surface transition-all shadow-inner"
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
      </footer>
    </div>
  );
};

export default ChatReception;
