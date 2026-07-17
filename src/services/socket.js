import { io } from 'socket.io-client';

const rawApiUrl = import.meta.env.VITE_API_URL || 'https://gila-house-backend-production.up.railway.app/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || rawApiUrl.replace(/\/api$/, '').replace(/\/api\/$/, '');

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token, role) {
    if (this.socket) return;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      query: { role: role?.toLowerCase() }
    });

    this.socket.on('connect', () => {
      console.log('🔌 Socket connected:', this.socket.id);
      if (role) {
        this.socket.emit('join_role', role.toLowerCase());
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (!this.socket) return;
    this.socket.on(event, callback);
  }

  off(event) {
    if (!this.socket) return;
    this.socket.off(event);
  }

  emit(event, data) {
    if (!this.socket) return;
    this.socket.emit(event, data);
  }
}

export default new SocketService();
