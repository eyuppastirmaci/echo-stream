import { Message } from './message.model';

// ========== CHAT EVENTS ==========

/**
 * DTO for the 'sendMessage' event, sent from client to server.
 */
export interface SendMessageDto {
  senderId?: string; // Optional, can be provided by client or extracted from socket
  receiverId: string;
  content: string;
}

/**
 * Payload for the 'newMessage' event, broadcast from server to clients.
 */
export interface NewMessageEvent extends Message {}

// ========== USER EVENTS ==========

/**
 * Base interface for all user events
 */
interface BaseUserEvent {
  eventType: string;
  timestamp: Date;
  userId: string;
}

/**
 * Event published when a user is created/registered
 */
export interface UserCreatedEvent extends BaseUserEvent {
  eventType: 'user.created';
  data: {
    userId: string;
    email: string;
    username: string;
    isVerified: boolean;
    createdAt: Date;
  };
}

/**
 * Event published when a user is updated
 */
export interface UserUpdatedEvent extends BaseUserEvent {
  eventType: 'user.updated';
  data: {
    userId: string;
    email?: string;
    username?: string;
    isVerified?: boolean;
    isOnline?: boolean;
    updatedAt: Date;
  };
}

/**
 * Event published when a user's verification status changes
 */
export interface UserVerifiedEvent extends BaseUserEvent {
  eventType: 'user.verified';
  data: {
    userId: string;
    email: string;
    username: string;
    verifiedAt: Date;
  };
}

/**
 * Event published when a user's online status changes
 */
export interface UserOnlineStatusChangedEvent extends BaseUserEvent {
  eventType: 'user.online-status-changed';
  data: {
    userId: string;
    isOnline: boolean;
    lastSeenAt?: Date;
  };
}

/**
 * Union type for all user events
 */
export type UserEvent = 
  | UserCreatedEvent 
  | UserUpdatedEvent 
  | UserVerifiedEvent 
  | UserOnlineStatusChangedEvent;

// ========== KAFKA TOPICS ==========

export const KAFKA_TOPICS = {
  CHAT_MESSAGES: 'chat.messages.one-to-one',
  USER_EVENTS: 'user.events',
} as const;
