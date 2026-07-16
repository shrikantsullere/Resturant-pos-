import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import socketService from '@/sockets/socket.service';

const CommunicationContext = createContext();

export const useCommunication = () => useContext(CommunicationContext);

export const CommunicationProvider = ({ children }) => {
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [activeChats, setActiveChats] = useState([]);
  const [loading, setLoading] = useState(false);

  // Normalize user role
  const userRole = String(typeof user?.role === 'object' ? user?.role?.role_name || '' : (user?.role || user?.role_name || '')).toUpperCase();
  const isStaff = ['ADMIN', 'MANAGER', 'WAITER', 'CASHIER', 'CHEF'].includes(userRole);

  const fetchActiveChats = useCallback(async () => {
    if (!isStaff) return;
    try {
      const response = await api.get('/concierge/tickets');
      if (response.data.success) {
        const chats = response.data.data.map(ticket => ({
          guestId: ticket.guest_id,
          ticketId: ticket.id,
          guestName: ticket.guest_name || 'Guest',
          lastMessage: ticket.last_message,
          lastTimestamp: ticket.last_message_at,
          unreadCount: 0,
          status: ticket.ticket_status
        }));
        setActiveChats(chats);
      }
    } catch (error) {
      console.error('Error fetching concierge chats:', error);
    }
  }, [isStaff]);

  const fetchMessages = useCallback(async (ticketId) => {
    try {
      const response = await api.get(`/concierge/tickets/${ticketId}/messages`);
      if (response.data.success) {
        const formattedMessages = response.data.data.map(msg => ({
          id: msg.id,
          ticketId: msg.ticket_id,
          content: msg.message,
          sender: msg.sender_id ? 'Staff' : 'Guest',
          timestamp: msg.createdAt
        }));
        setMessages(prev => {
          const otherMessages = prev.filter(m => m.ticketId !== ticketId);
          return [...otherMessages, ...formattedMessages];
        });
        
        socketService.emit('join_room', `ticket_${ticketId}`);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, []);

  // Handle real-time messages
  useEffect(() => {
    const handleNewMessage = (msg) => {
      const formattedMsg = {
        id: msg.id,
        ticketId: msg.ticket_id,
        content: msg.message,
        sender: msg.sender_id ? 'Staff' : 'Guest',
        timestamp: msg.createdAt || new Date().toISOString()
      };
      
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, formattedMsg];
      });

      // Update chat summary OR add new chat if missing
      setActiveChats(prev => {
        const exists = prev.some(c => c.ticketId === msg.ticket_id);
        if (exists) {
          return prev.map(chat => 
            chat.ticketId === msg.ticket_id 
            ? { ...chat, lastMessage: msg.message, lastTimestamp: formattedMsg.timestamp } 
            : chat
          ).sort((a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp));
        } else {
          // If it's a new ticket that we don't have in list, refetch list
          fetchActiveChats();
          return prev;
        }
      });

      // Notify if it's from guest and staff is logged in
      if (!msg.sender_id && isStaff) {
         addNotification({
            id: Date.now(),
            title: 'New Guest Message',
            message: msg.message,
            type: 'message'
         });
      }
    };

    socketService.on('new_message', handleNewMessage);
    return () => socketService.off('new_message', handleNewMessage);
  }, [isStaff, fetchActiveChats, addNotification]);

  useEffect(() => {
    if (isStaff) {
      fetchActiveChats();
      socketService.emit('join_room', 'staff');
      const interval = setInterval(fetchActiveChats, 10000); // 10s poll
      return () => clearInterval(interval);
    }
  }, [isStaff, fetchActiveChats]);

  const sendMessage = async (ticketId, guestName, content, sender = 'Staff') => {
    try {
      const response = await api.post('/concierge/messages', {
        ticket_id: ticketId,
        message: content
      });

      if (response.data.success) {
        const newMessage = {
          id: response.data.data.id,
          ticketId,
          content,
          sender,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, newMessage]);
        
        setActiveChats(prev => prev.map(chat => 
          chat.ticketId === ticketId 
          ? { ...chat, lastMessage: content, lastTimestamp: newMessage.timestamp } 
          : chat
        ));
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getGuestTicket = async (guestId) => {
    try {
      const response = await api.get(`/concierge/guest/ticket/${guestId}`);
      if (response.data.success) {
        // Connect the socket for the guest
        socketService.connect(guestId);
        // Also join the ticket room immediately
        socketService.emit('join_room', `ticket_${response.data.data.id}`);
        return response.data.data;
      }
    } catch (error) {
      console.error('Error getting guest ticket:', error);
    }
    return null;
  };

  const sendGuestMessage = async (ticketId, guestId, content) => {
    try {
      socketService.connect(guestId);
      const response = await api.post('/concierge/guest/messages', {
        ticket_id: ticketId,
        guest_id: guestId,
        message: content
      });

      if (response.data.success) {
        const newMessage = {
          id: response.data.data.id,
          ticketId,
          content,
          sender: 'Guest',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, newMessage]);
        return true;
      }
    } catch (error) {
      console.error('Error sending guest message:', error);
    }
    return false;
  };

  const uploadFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append('menu', file);
      
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        return response.data.url;
      }
    } catch (error) {
      console.error('Error uploading file in chat:', error);
    }
    return null;
  };

  const markAsRead = (ticketId) => {
    setActiveChats(prev => prev.map(c => 
      c.ticketId === ticketId ? { ...c, unreadCount: 0 } : c
    ));
  };

  return (
    <CommunicationContext.Provider value={{
      messages,
      activeChats,
      sendMessage,
      sendGuestMessage,
      getGuestTicket,
      markAsRead,
      fetchMessages,
      uploadFile,
      loading
    }}>
      {children}
    </CommunicationContext.Provider>
  );
};
