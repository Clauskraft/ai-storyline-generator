/**
 * Collaboration Client
 * Frontend service for real-time collaboration
 */

import { io, Socket } from 'socket.io-client';

class CollaborationClient {
  private socket: Socket | null = null;
  private presentationId: string | null = null;
  private userId: string | null = null;
  private userName: string | null = null;

  constructor() {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    // Socket.IO will be initialized when joining a room
  }

  /**
   * Join a presentation room
   */
  joinRoom(presentationId: string, userId: string, userName: string): void {
    if (!this.socket) {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      this.socket = io(API_URL);
    }

    this.presentationId = presentationId;
    this.userId = userId;
    this.userName = userName;

    this.socket.emit('join-room', {
      presentationId,
      userId,
      userName,
    });

    this.setupEventListeners();
  }

  /**
   * Leave current room
   */
  leaveRoom(): void {
    if (this.socket && this.presentationId) {
      this.socket.emit('leave-room', { presentationId: this.presentationId });
      this.presentationId = null;
    }
  }

  /**
   * Update slide content
   */
  updateSlide(slideId: string, updates: any): void {
    if (this.socket && this.presentationId) {
      this.socket.emit('update-slide', {
        presentationId: this.presentationId,
        slideId,
        updates,
      });
    }
  }

  /**
   * Update cursor position
   */
  updateCursor(position: { x: number; y: number }): void {
    if (this.socket && this.presentationId) {
      this.socket.emit('cursor-update', {
        presentationId: this.presentationId,
        position,
      });
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // User joined
    this.socket.on('user-joined', (data) => {
      this.onUserJoined?.(data);
    });

    // User left
    this.socket.on('user-left', (data) => {
      this.onUserLeft?.(data);
    });

    // Room presence
    this.socket.on('room-presence', (data) => {
      this.onRoomPresence?.(data);
    });

    // Slide updated
    this.socket.on('slide-updated', (data) => {
      this.onSlideUpdated?.(data);
    });

    // Cursor position
    this.socket.on('cursor-position', (data) => {
      this.onCursorPosition?.(data);
    });
  }

  // Event callbacks
  onUserJoined?: (data: any) => void;
  onUserLeft?: (data: any) => void;
  onRoomPresence?: (data: any) => void;
  onSlideUpdated?: (data: any) => void;
  onCursorPosition?: (data: any) => void;

  /**
   * Disconnect
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const collaborationClient = new CollaborationClient();

