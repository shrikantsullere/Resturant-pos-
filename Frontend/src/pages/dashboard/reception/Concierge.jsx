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
  ChevronLeft
} from 'lucide-react';
import { cn } from "../../../utils/cn";
import { useCommunication } from "../../../context/CommunicationContext";

const Concierge = () => {
  const { messages, activeChats, sendMessage, markAsRead, fetchMessages } = useCommunication();
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const selectedChat = activeChats.find(c => c.ticketId === selectedTicketId);
  const chatMessages = messages.filter(m => m.ticketId === selectedTicketId);

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
                 <div className="flex gap-2">
                    <button className="p-2 text-slate-400 hover:text-primary transition-all"><Phone className="w-4 h-4" /></button>
                    <button className="p-2 text-slate-400 hover:text-primary transition-all"><MoreVertical className="w-4 h-4" /></button>
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
                     <div key={msg.id} className={cn("flex flex-col", isStaff ? "items-end" : "items-start")}>
                        <div className={cn(
                          "max-w-[80%] p-4 rounded-2xl text-xs font-bold shadow-sm",
                          isStaff ? "bg-primary text-white rounded-tr-none" : "bg-surface text-text-primary rounded-tl-none border border-slate-50"
                        )}>
                          {msg.content}
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
              <div className="p-4 border-t border-slate-50 bg-surface">
                 <form onSubmit={handleSend} className="flex gap-2">
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
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default Concierge;
