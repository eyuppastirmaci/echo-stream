import { Injectable, signal } from '@angular/core';
import { ChatService } from '../services/chat.service';

@Injectable({
  providedIn: 'root'
})
export class ChatManager {
  // User state signals
  public readonly currentUser = signal<string>('');
  public readonly otherUser = signal<string>('');
  public readonly isInitialized = signal<boolean>(false);

  constructor(private chatService: ChatService) {}

  /**
   * Initialize the chat manager with users from URL or prompts
   */
  public async initialize(): Promise<void> {
    try {
      this.initializeUsersFromUrl();

      if (this.currentUser() && this.otherUser()) {
        await this.loadConversation();
        this.isInitialized.set(true);
        console.log(`Chat initialized between ${this.currentUser()} and ${this.otherUser()}`);
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      this.isInitialized.set(false);
    }
  }

  /**
   * Initialize users from URL parameters or prompts
   */
  private initializeUsersFromUrl(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user');
    const otherUserId = urlParams.get('other');

    // Set current user
    if (!userId) {
      const inputUserId = prompt('Enter your username:');
      if (!inputUserId) {
        throw new Error('Username is required');
      }
      this.currentUser.set(inputUserId);
    } else {
      this.currentUser.set(userId);
    }

    // Set other user
    if (!otherUserId) {
      const inputOtherUserId = prompt('Enter the username you want to chat with:');
      if (!inputOtherUserId) {
        throw new Error('Other user is required');
      }
      this.otherUser.set(inputOtherUserId);
    } else {
      this.otherUser.set(otherUserId);
    }
  }

  /**
   * Load conversation history from backend
   */
  public async loadConversation(limit: number = 50): Promise<void> {
    if (!this.currentUser() || !this.otherUser()) {
      console.warn('Cannot load conversation: users not initialized');
      return;
    }

    try {
      await this.chatService.loadConversation(
        this.currentUser(),
        this.otherUser(),
        limit
      );
    } catch (error) {
      console.error('Failed to load conversation:', error);
      throw error;
    }
  }

  /**
   * Send a new message
   */
  public sendMessage(content: string): boolean {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      console.warn('Cannot send message: empty content');
      return false;
    }

    if (!this.chatService.isConnected()) {
      console.warn('Cannot send message: not connected');
      return false;
    }

    if (!this.currentUser() || !this.otherUser()) {
      console.warn('Cannot send message: users not initialized');
      return false;
    }

    try {
      this.chatService.sendMessage(
        trimmedContent,
        this.otherUser(),
        this.currentUser()
      );
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  }

  /**
   * Reconnect to chat service
   */
  public reconnect(): void {
    console.log('Reconnecting to chat service...');
    this.chatService.reconnect();
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.chatService.disconnect();
    this.isInitialized.set(false);
  }

  // Expose ChatService properties as getters for cleaner access
  public get messages() {
    return this.chatService.messages;
  }

  public get isConnected() {
    return this.chatService.isConnected;
  }

  public get messages$() {
    return this.chatService.messages$;
  }
}
