import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ChatManager } from '../../managers/chat.manager';
import { APP_CONFIG } from '../../../../shared';

@Component({
  selector: 'page-chat',
  imports: [FormsModule, DatePipe],
  templateUrl: './chat.page.html',
  styleUrl: './chat.page.scss'
})
export class ChatPage implements OnInit, OnDestroy {
  // Form data
  protected newMessage = '';

  // Constants for template
  protected readonly APP_CONFIG = APP_CONFIG;

  constructor(private chatManager: ChatManager) {}

  async ngOnInit(): Promise<void> {
    // Initialize chat manager
    await this.chatManager.initialize();

    // Subscribe to real-time messages for logging
    this.chatManager.messages$.subscribe(messages => {
      console.log('Messages updated via RxJS:', messages.length);
    });
  }

  ngOnDestroy(): void {
    this.chatManager.destroy();
  }

  // Expose ChatManager properties for template
  protected get currentUser() {
    return this.chatManager.currentUser;
  }

  protected get otherUser() {
    return this.chatManager.otherUser;
  }

  protected get messages() {
    return this.chatManager.messages;
  }

  protected get isConnected() {
    return this.chatManager.isConnected;
  }

  protected get isInitialized() {
    return this.chatManager.isInitialized;
  }

  /**
   * Send a new message
   */
  protected sendMessage(): void {
    if (this.chatManager.sendMessage(this.newMessage)) {
      // Clear input only if message was sent successfully
      this.newMessage = '';
    }
  }

  /**
   * Retry connection
   */
  protected reconnect(): void {
    this.chatManager.reconnect();
  }
}
