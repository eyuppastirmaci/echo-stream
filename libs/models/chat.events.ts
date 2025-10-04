import { Message } from './message.model';

/**
 * DTO for the 'sendMessage' event, sent from client to server.
 */
export interface SendMessageDto {
  receiverId: string;
  content: string;
}

/**
 * Payload for the 'newMessage' event, broadcast from server to clients.
 */
export interface NewMessageEvent extends Message {}
