import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { AuthStateService } from './auth-state.service';
import { AppConfigService } from '../config/app-config.service';
import { LoginRequest, LoginResponse } from '../../shared/models';

// Minimal JWT with payload: { sub: '1', username: 'admin', email: 'admin@test.com', role: 'Admin' }
const MOCK_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
  '.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImVtYWlsIjoiYWRtaW5AdGVzdC5jb20iLCJyb2xlIjoiQWRtaW4ifQ' +
  '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

const MOCK_LOGIN_RESPONSE: LoginResponse = {
  token: MOCK_TOKEN,
  user: {
    id: '1',
    name: 'admin',
    email: 'admin@test.com',
    role: 'Admin',
  },
};

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let authState: AuthStateService;
  let config: AppConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    authState = TestBed.inject(AuthStateService);
    config = TestBed.inject(AppConfigService);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should POST to the correct URL and return the response', () => {
      const credentials: LoginRequest = {
        email: 'admin@test.com',
        password: 'secret',
      };
      const expectedUrl = config.buildApiUrl('auth/login');

      service.login(credentials).subscribe((response) => {
        expect(response).toEqual(MOCK_LOGIN_RESPONSE);
      });

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(MOCK_LOGIN_RESPONSE);
    });

    it('should store the token in localStorage after login', () => {
      service
        .login({ email: 'admin@test.com', password: 'secret' })
        .subscribe();
      httpMock
        .expectOne(config.buildApiUrl('auth/login'))
        .flush(MOCK_LOGIN_RESPONSE);
      expect(localStorage.getItem('auth_token')).toBe(MOCK_TOKEN);
    });

    it('should update authState with the decoded user after login', () => {
      service
        .login({ email: 'admin@test.com', password: 'secret' })
        .subscribe();
      httpMock
        .expectOne(config.buildApiUrl('auth/login'))
        .flush(MOCK_LOGIN_RESPONSE);
      const user = authState.currentUser;
      expect(user).toBeTruthy();
      expect(user?.id).toBe('1');
      expect(user?.name).toBe('admin');
      expect(user?.email).toBe('admin@test.com');
      expect(user?.role).toBe('Admin');
    });
  });

  describe('getToken / setToken', () => {
    it('should return null when no token is stored', () => {
      expect(service.getToken()).toBeNull();
    });

    it('should return the stored token after setToken', () => {
      service.setToken('my-token');
      expect(service.getToken()).toBe('my-token');
    });
  });

  describe('logout', () => {
    it('should remove the token from localStorage', () => {
      service.setToken(MOCK_TOKEN);
      service.logout();
      expect(service.getToken()).toBeNull();
    });

    it('should clear the current user in authState', () => {
      service
        .login({ email: 'admin@test.com', password: 'secret' })
        .subscribe();
      httpMock
        .expectOne(config.buildApiUrl('auth/login'))
        .flush(MOCK_LOGIN_RESPONSE);
      service.logout();
      expect(authState.currentUser).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when no token is stored', () => {
      expect(service.getCurrentUser()).toBeNull();
    });

    it('should decode the stored token and return the user', () => {
      service.setToken(MOCK_TOKEN);
      const user = service.getCurrentUser();
      expect(user).toBeTruthy();
      expect(user?.id).toBe('1');
      expect(user?.name).toBe('admin');
      expect(user?.email).toBe('admin@test.com');
      expect(user?.role).toBe('Admin');
    });

    it('should return null for a malformed token', () => {
      service.setToken('not.a.valid.jwt.token.with.too.many.parts');
      expect(service.getCurrentUser()).toBeNull();
    });

    it('should return null for an expired token', () => {
      // payload: { sub: '1', username: 'admin', exp: 1 } (expired in the past)
      const expiredToken =
        'eyJhbGciOiJIUzI1NiJ9' +
        '.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImV4cCI6MX0' +
        '.signature';
      service.setToken(expiredToken);
      expect(service.getCurrentUser()).toBeNull();
    });

    it('should return null when required claims are missing', () => {
      // payload: { email: 'nobody@test.com' } (no sub/id or username)
      const noClaimsToken =
        'eyJhbGciOiJIUzI1NiJ9' +
        '.eyJlbWFpbCI6Im5vYm9keUB0ZXN0LmNvbSJ9' +
        '.signature';
      service.setToken(noClaimsToken);
      expect(service.getCurrentUser()).toBeNull();
    });
  });
});
