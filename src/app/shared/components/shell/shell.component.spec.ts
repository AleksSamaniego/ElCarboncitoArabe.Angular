import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { ShellComponent } from './shell.component';
import { AuthService } from '../../../core/auth/auth.service';
import { AuthStateService } from '../../../core/auth/auth-state.service';
import { UserDto } from '../../models';

describe('ShellComponent', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let authState: jasmine.SpyObj<AuthStateService>;
  let router: jasmine.SpyObj<Router>;
  let breakpointObserver: jasmine.SpyObj<BreakpointObserver>;

  const mockUser: UserDto = { id: '1', username: 'owner', email: 'owner@test.com', role: 'Owner' };

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'logout']);
    authState = jasmine.createSpyObj('AuthStateService', ['setCurrentUser'], {
      currentUser$: of(mockUser)
    });
    router = jasmine.createSpyObj('Router', ['navigate']);
    breakpointObserver = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    breakpointObserver.observe.and.returnValue(of({ matches: false, breakpoints: {} }));

    authService.getCurrentUser.and.returnValue(mockUser);

    await TestBed.configureTestingModule({
      declarations: [ShellComponent],
      imports: [
        RouterTestingModule,
        NoopAnimationsModule,
        CommonModule,
        MatSidenavModule,
        MatToolbarModule,
        MatListModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule
      ],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: AuthStateService, useValue: authState },
        { provide: Router, useValue: router },
        { provide: BreakpointObserver, useValue: breakpointObserver }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should initialize auth state from stored token on creation', () => {
    TestBed.createComponent(ShellComponent);
    expect(authService.getCurrentUser).toHaveBeenCalled();
    expect(authState.setCurrentUser).toHaveBeenCalledWith(mockUser);
  });

  it('should navigate to /login on logout', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    fixture.componentInstance.logout();
    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  describe('hasRole', () => {
    let component: ShellComponent;

    beforeEach(() => {
      component = TestBed.createComponent(ShellComponent).componentInstance;
    });

    it('should return true when user role matches', () => {
      const user: UserDto = { id: '1', username: 'waiter', email: '', role: 'Waiter' };
      expect(component.hasRole(user, 'Waiter', 'Owner')).toBeTrue();
    });

    it('should return false when user role does not match', () => {
      const user: UserDto = { id: '1', username: 'waiter', email: '', role: 'Waiter' };
      expect(component.hasRole(user, 'Kitchen', 'Owner')).toBeFalse();
    });

    it('should return false when user is null', () => {
      expect(component.hasRole(null, 'Waiter')).toBeFalse();
    });
  });
});
