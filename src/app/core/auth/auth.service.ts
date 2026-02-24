import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AppConfigService } from '../config/app-config.service';
import { ApiRoutes } from '../config/api-routes';
import { AuthStateService } from './auth-state.service';
import { LoginRequest, LoginResponse, UserDto } from '../../shared/models';

const TOKEN_KEY = 'auth_token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private readonly http: HttpClient,
    private readonly config: AppConfigService,
    private readonly authState: AuthStateService,
  ) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    const url = this.config.buildApiUrl(ApiRoutes.auth.login);
    return this.http.post<LoginResponse>(url, credentials).pipe(
      tap((response) => {
        this.setToken(response.token);
        const user = this.decodeToken(response.token);
        this.authState.setCurrentUser(user);
      }),
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
      // const payload = JSON.parse(
      //   atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')),
      // );
      const payload = this.decodeBase64Url(parts[1]);
      const data = JSON.parse(payload);
      if (data.exp !== undefined && data.exp * 1000 < Date.now()) {
        return null;
      }

      const id: string = data.sub ?? data.id ?? '';
      const username: string =
        data.username ?? data.unique_name ?? data.name ?? '';
      if (!id || !username) {
        return null;
      }

      return {
        id,
        username,
        email: data.email ?? '',
        role:
          data.role ??
          data[
            'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
          ] ??
          '',
      };
    } catch {
      return null;
    }
  }

  private decodeBase64Url(input: string): string {
    // base64url -> base64
    let base64 = input.replace(/-/g, '+').replace(/_/g, '/');

    // add padding if missing
    const pad = base64.length % 4;
    if (pad) base64 += '='.repeat(4 - pad);

    return atob(base64);
  }
}
