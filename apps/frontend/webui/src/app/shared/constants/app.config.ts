import { environment } from '../../../environments/environment';

/**
 * Application Constants
 * Centralized configuration values imported from environment files
 */
export const APP_CONFIG = {
  // Server URLs
  CHAT_SERVER_URL: environment.chatServerUrl,
  API_URL: environment.apiUrl,
  USER_SERVICE_URL: environment.userServerUrl,

  // WebSocket Configuration
  WEBSOCKET_TRANSPORTS: ['websocket'] as const,
  WEBSOCKET_AUTO_CONNECT: true,

  // Chat Configuration
  DEFAULT_MESSAGE_LIMIT: 50,
  RECONNECT_DELAY: 3000,

  // UI Configuration
  MESSAGE_INPUT_PLACEHOLDER: 'Type your message...',
  SEND_BUTTON_TEXT: 'Send'
} as const;

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  MESSAGES: '/messages',
  CONVERSATION: (otherUserId: string) => `/messages/conversation/${otherUserId}`
} as const;
