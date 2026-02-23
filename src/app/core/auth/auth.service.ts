import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AppConfigService } from '../config/app-config.service';
import { ApiRoutes } from '../config/api-routes';
import { AuthStateService } from './auth-state.service';
import { LoginRequest, LoginResponse, UserDto } from '../../shared/models';

const TOKEN_KEY = 'auth_token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private readonly http: HttpClient,
    private readonly config: AppConfigService,
    private readonly authState: AuthStateService
  ) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    const url = this.config.buildApiUrl(ApiRoutes.auth.login);
    return this.http.post<LoginResponse>(url, credentials).pipe(
      tap(response => {
        this.setToken(response.accessToken);
        const user = this.decodeToken(response.accessToken);
        this.authState.setCurrentUser(user);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.authState.setCurrentUser(null);
  }

  getCurrentUser(): UserDto | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    return this.decodeToken(token);
  }

  private decodeToken(token: string): UserDto | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

      if (payload.exp !== undefined && payload.exp * 1000 < Date.now()) {
        return null;
      }

      const id: string = payload.sub ?? payload.id ?? '';
      const username: string = payload.username ?? payload.unique_name ?? payload.name ?? '';
      if (!id || !username) {
        return null;
      }

      return {
        id,
        username,
        email: payload.email ?? '',
        role: payload.role ?? payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? ''
      };
    } catch {
      return null;
    }
  }
}
