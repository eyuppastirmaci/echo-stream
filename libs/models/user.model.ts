export interface User {
  id: string;
  username: string;
  isOnline?: boolean;
}

export interface ConversationQuery {
  requesterId: string;
  otherUserId: string;
  limit?: number;
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';