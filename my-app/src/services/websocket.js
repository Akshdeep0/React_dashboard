import { io } from 'socket.io-client';

const BACKEND_URL = 'http://192.168.1.4:5000';  // Your Python backend IP

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = {};
  }

  connect() {
    if (this.socket?.connected) {
      console.log('Already connected');
      return;
    }

    this.socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('Connected to ECG backend');
      this.emit('connection_established', { timestamp: new Date().toISOString() });
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from ECG backend');
      this.emit('connection_lost', { timestamp: new Date().toISOString() });
    });

    this.socket.on('connection_status', (data) => {
      console.log('Connection status:', data);
      this.emit('status_update', data);
    });

    this.socket.on('ecg_update', (data) => {
      console.log('ECG update received:', data);
      this.emit('ecg_data', data);
    });

    this.socket.on('system_status', (data) => {
      this.emit('system_status', data);
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
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  requestStatus() {
    if (this.socket?.connected) {
      this.socket.emit('request_status');
    }
  }
}

export default new WebSocketService();