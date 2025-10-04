import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';
import { Message } from '../models/chat.models';
import { APP_CONFIG, API_ENDPOINTS } from '../constants/app.config';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket: Socket | null = null;
  private readonly serverUrl = APP_CONFIG.CHAT_SERVER_URL;

  // Reactive state with signals
  public readonly isConnected = signal<boolean>(false);
  public readonly messages = signal<Message[]>([]);

  // RxJS subjects for real-time updates
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  constructor() {
    this.initializeConnection();
  }

  private initializeConnection(): void {

    this.socket = io(this.serverUrl, {
      transports: [...APP_CONFIG.WEBSOCKET_TRANSPORTS],
      autoConnect: APP_CONFIG.WEBSOCKET_AUTO_CONNECT
    });

    // Connection events
    this.socket.on('connect', () => {
      this.isConnected.set(true);
    });

    this.socket.on('disconnect', () => {
      this.isConnected.set(false);
    });

    this.socket.on('connect_error', (error) => {
      this.isConnected.set(false);
    });

    // Message events
    this.socket.on('newMessage', (message: Message) => {
      this.addMessage(message);
    });
  }

  /**
   * Send a message via WebSocket
   */
  public sendMessage(content: string, receiverId: string, senderId: string): void {
    if (!this.socket?.connected) {
      return;
    }

    const messageData = {
      senderId,
      receiverId,
      content
    };

    this.socket.emit('sendMessage', messageData);
  }

  /**
   * Load conversation history from REST API
   */
  public async loadConversation(requesterId: string, otherUserId: string, limit: number = APP_CONFIG.DEFAULT_MESSAGE_LIMIT): Promise<Message[]> {
    try {
      const response = await fetch(
        `${APP_CONFIG.API_URL}${API_ENDPOINTS.CONVERSATION(otherUserId)}?requesterId=${requesterId}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const messages: Message[] = await response.json();

      // Update signals and subjects
      this.messages.set(messages);
      this.messagesSubject.next(messages);

      return messages;
    } catch (error) {
      console.error('Error loading conversation:', error);
      return [];
    }
  }

  /**
   * Add a new message to the conversation
   */
  private addMessage(message: Message): void {
    this.messages.update(msgs => [...msgs, message]);
    this.messagesSubject.next(this.messages());
  }

  /**
   * Disconnect WebSocket
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected.set(false);
  }

  /**
   * Reconnect WebSocket
   */
  public reconnect(): void {
    this.disconnect();
    this.initializeConnection();
  }
}
