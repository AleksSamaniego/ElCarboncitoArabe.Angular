import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { RoleGuard } from './role.guard';
import { AuthService } from '../auth/auth.service';
import { UserDto } from '../../shared/models';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  const makeRoute = (roles: string[]): ActivatedRouteSnapshot => {
    return { data: { roles } } as unknown as ActivatedRouteSnapshot;
  };

  const makeUser = (role: string): UserDto => ({
    id: '1', username: 'test', email: 'test@test.com', role
  });

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        RoleGuard,
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    });
    guard = TestBed.inject(RoleGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow activation when user role is in allowed roles', () => {
    authService.getCurrentUser.and.returnValue(makeUser('Owner'));
    expect(guard.canActivate(makeRoute(['Owner', 'Waiter']))).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should deny activation and redirect to /login when user role is not allowed', () => {
    authService.getCurrentUser.and.returnValue(makeUser('Waiter'));
    expect(guard.canActivate(makeRoute(['Owner']))).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should deny activation and redirect to /login when no user', () => {
    authService.getCurrentUser.and.returnValue(null);
    expect(guard.canActivate(makeRoute(['Owner']))).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
