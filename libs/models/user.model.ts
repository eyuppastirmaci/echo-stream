export interface User {
  id: string;
  email: string;
  username: string;
  isVerified: boolean;
  isOnline?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterUserDto {
  email: string;
  username: string;
  password: string;
  passwordAgain: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  isVerified: boolean;
  createdAt: Date;
}

export interface ConversationQuery {
  requesterId: string;
  otherUserId: string;
  limit?: number;
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';