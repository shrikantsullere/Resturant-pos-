import { io } from 'socket.io-client';

// const SOCKET_URL = 'https://restourant-pos-gila-house-production.up.railway.app'; // import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.userId = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.buffer = [];
  }

  connect(userId) {
    // If already connected for the same user, do nothing
    if (this.socket?.connected && this.userId === userId) return;

    // Disconnect existing if any
    if (this.socket) {
      this.disconnect();
    }

    this.userId = userId;
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to socket server');
      this.reconnectAttempts = 0;
      
      if (this.userId) {
        this.socket.emit('join_room', `user_${this.userId}`);
      }

      // Process buffered messages
      while (this.buffer.length > 0) {
        const { event, data } = this.buffer.shift();
        console.log(`📤 Sending buffered event: ${event}`);
        this.socket.emit(event, data);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from socket server:', reason);
      if (reason === 'io server disconnect') {
        // the disconnection was initiated by the server, you need to reconnect manually
        this.socket.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('⚠️ Socket connection error:', error.message);
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('🚫 Max socket reconnect attempts reached');
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.log(`🔌 Socket not connected, buffering ${event}`);
      this.buffer.push({ event, data });
    }
  }
}

const socketService = new SocketService();
export default socketService;
