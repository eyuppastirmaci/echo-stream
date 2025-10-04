import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONFIG } from '../../../shared';

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  passwordAgain: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  isVerified: boolean;
  createdAt?: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  token?: string;
}

export interface ApiError {
  message: string | string[];
  statusCode: number;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl = `${APP_CONFIG.USER_SERVICE_URL}/users`;

  constructor(private http: HttpClient) {}

  /**
   * Register a new user
   */
  register(userData: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/register`, userData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Login user (for future use)
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get user profile (for future use)
   */
  getProfile(userId: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${userId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  isValidPassword(password: string): { isValid: boolean; message?: string } {
    if (!password) {
      return { isValid: false, message: 'Password is required' };
    }

    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }

    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }

    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }

    if (!/\d/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }

    return { isValid: true };
  }

  /**
   * Validate username
   */
  isValidUsername(username: string): { isValid: boolean; message?: string } {
    if (!username) {
      return { isValid: false, message: 'Username is required' };
    }

    if (username.length < 3) {
      return { isValid: false, message: 'Username must be at least 3 characters long' };
    }

    if (username.length > 20) {
      return { isValid: false, message: 'Username cannot be longer than 20 characters' };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { isValid: false, message: 'Username can only contain letters, numbers, and underscores' };
    }

    return { isValid: true };
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage: string;

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Network error: ${error.error.message}`;
    } else {
      // Server-side error
      const apiError = error.error as ApiError;

      if (apiError?.message) {
        if (Array.isArray(apiError.message)) {
          errorMessage = apiError.message.join(', ');
        } else {
          errorMessage = apiError.message;
        }
      } else {
        errorMessage = `Server error: ${error.status} ${error.statusText}`;
      }
    }

    console.error('UserService Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
