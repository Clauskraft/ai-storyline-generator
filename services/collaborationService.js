/**
 * Real-Time Collaboration Service
 * WebSocket-based collaboration with presence tracking
 */

import { Server as SocketIOServer } from 'socket.io';

class CollaborationService {
  constructor() {
    this.io = null;
    this.rooms = new Map(); // Room ID -> Set of socket IDs
    this.userSessions = new Map(); // Socket ID -> User info
    this.presenceCache = new Map(); // Room ID -> Map of user presence
  }

  /**
   * Initialize Socket.IO server
   */
  initialize(httpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });

    this.setupEventHandlers();
    console.log('✅ WebSocket server initialized');
  }

  /**
   * Setup socket event handlers
   */
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`✅ Client connected: ${socket.id}`);

      // Join room
      socket.on('join-room', async ({ presentationId, userId, userName }) => {
        await this.handleJoinRoom(socket, presentationId, userId, userName);
      });

      // Leave room
      socket.on('leave-room', ({ presentationId }) => {
        this.handleLeaveRoom(socket, presentationId);
      });

      // Update slide content
      socket.on('update-slide', ({ presentationId, slideId, updates }) => {
        this.handleUpdateSlide(socket, presentationId, slideId, updates);
      });

      // Cursor position update
      socket.on('cursor-update', ({ presentationId, position }) => {
        this.handleCursorUpdate(socket, presentationId, position);
      });

      // Disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  /**
   * Handle join room
   */
  async handleJoinRoom(socket, presentationId, userId, userName) {
    const roomId = `presentation:${presentationId}`;
    
    // Join socket room
    socket.join(roomId);

    // Track room membership
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId).add(socket.id);

    // Track user session
    this.userSessions.set(socket.id, {
      userId,
      userName,
      presentationId,
      roomId,
      connectedAt: Date.now()
    });

    // Add to presence cache
    if (!this.presenceCache.has(roomId)) {
      this.presenceCache.set(roomId, new Map());
    }
    this.presenceCache.get(roomId).set(userId, {
      userName,
      joinedAt: Date.now()
    });

    // Broadcast user joined
    socket.to(roomId).emit('user-joined', {
      userId,
      userName,
      users: Array.from(this.presenceCache.get(roomId).values())
    });

    // Send current presence to new user
    socket.emit('room-presence', {
      users: Array.from(this.presenceCache.get(roomId).values())
    });

    console.log(`✅ User ${userName} joined room ${roomId}`);
  }

  /**
   * Handle leave room
   */
  handleLeaveRoom(socket, presentationId) {
    const roomId = `presentation:${presentationId}`;
    socket.leave(roomId);

    const session = this.userSessions.get(socket.id);
    if (session) {
      // Remove from room
      if (this.rooms.has(roomId)) {
        this.rooms.get(roomId).delete(socket.id);
      }

      // Remove from presence
      if (this.presenceCache.has(roomId)) {
        this.presenceCache.get(roomId).delete(session.userId);
      }

      // Broadcast user left
      socket.to(roomId).emit('user-left', {
        userId: session.userId,
        userName: session.userName,
        users: Array.from(this.presenceCache.get(roomId).values())
      });
    }

    console.log(`👋 User left room ${roomId}`);
  }

  /**
   * Handle slide update
   */
  handleUpdateSlide(socket, presentationId, slideId, updates) {
    const roomId = `presentation:${presentationId}`;
    const session = this.userSessions.get(socket.id);

    // Broadcast to all other clients in room
    socket.to(roomId).emit('slide-updated', {
      slideId,
      updates,
      updatedBy: session ? session.userId : null,
      timestamp: Date.now()
    });
  }

  /**
   * Handle cursor update
   */
  handleCursorUpdate(socket, presentationId, position) {
    const roomId = `presentation:${presentationId}`;
    const session = this.userSessions.get(socket.id);

    // Broadcast cursor position (with throttle in production)
    socket.to(roomId).emit('cursor-position', {
      userId: session ? session.userId : null,
      userName: session ? session.userName : null,
      position,
      timestamp: Date.now()
    });
  }

  /**
   * Handle disconnect
   */
  handleDisconnect(socket) {
    const session = this.userSessions.get(socket.id);
    
    if (session) {
      this.handleLeaveRoom(socket, session.presentationId);
      this.userSessions.delete(socket.id);
    }

    console.log(`👋 Client disconnected: ${socket.id}`);
  }

  /**
   * Get room presence
   */
  getRoomPresence(presentationId) {
    const roomId = `presentation:${presentationId}`;
    const presence = this.presenceCache.get(roomId);
    
    if (!presence) {
      return [];
    }

    return Array.from(presence.values());
  }

  /**
   * Broadcast to room
   */
  broadcastToRoom(presentationId, event, data) {
    const roomId = `presentation:${presentationId}`;
    this.io.to(roomId).emit(event, data);
  }
}

export const collaborationService = new CollaborationService();

