import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../app.config';

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly TOKEN_KEY = 'gh_token';
  private readonly USER_KEY = 'gh_user';

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(res => this.saveSession(res))
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data).pipe(
      tap(res => this.saveSession(res))
    );
  }

  logout(): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.USER_KEY);
    }
  }

  getToken(): string | null {
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  getCurrentUser(): AuthResponse | null {
    if (typeof sessionStorage !== 'undefined') {
      const raw = sessionStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private saveSession(res: AuthResponse): void {
    if (typeof localStorage !== 'undefined') {
      sessionStorage.setItem(this.TOKEN_KEY, res.token);
      sessionStorage.setItem(this.USER_KEY, JSON.stringify(res));
    }
  }
}
