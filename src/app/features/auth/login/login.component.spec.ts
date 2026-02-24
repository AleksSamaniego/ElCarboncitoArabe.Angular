import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/auth/auth.service';
import { UserDto } from '../../../shared/models';

describe('LoginComponent', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['login', 'getCurrentUser']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [
        RouterTestingModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
        CommonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule
      ],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have an invalid form when empty', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    expect(fixture.componentInstance.loginForm.invalid).toBeTrue();
  });

  it('should not call login when form is invalid', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.componentInstance.onSubmit();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should navigate to /waiter for Waiter role after login', () => {
    authService.login.and.returnValue(of({ accessToken: 'token', refreshToken: 'rt', expiresIn: 3600 }));
    const user: UserDto = { id: '1', username: 'waiter', email: '', role: 'Waiter' };
    authService.getCurrentUser.and.returnValue(user);

    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    component.loginForm.setValue({ email: 'waiter@test.com', password: 'pass' });
    component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/waiter']);
  });

  it('should navigate to /kitchen for Kitchen role after login', () => {
    authService.login.and.returnValue(of({ accessToken: 'token', refreshToken: 'rt', expiresIn: 3600 }));
    const user: UserDto = { id: '2', username: 'cook', email: '', role: 'Kitchen' };
    authService.getCurrentUser.and.returnValue(user);

    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    component.loginForm.setValue({ email: 'cook@test.com', password: 'pass' });
    component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/kitchen']);
  });

  it('should navigate to /admin for Owner role after login', () => {
    authService.login.and.returnValue(of({ accessToken: 'token', refreshToken: 'rt', expiresIn: 3600 }));
    const user: UserDto = { id: '3', username: 'admin', email: '', role: 'Owner' };
    authService.getCurrentUser.and.returnValue(user);

    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    component.loginForm.setValue({ email: 'admin@test.com', password: 'pass' });
    component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('should set error message on failed login', () => {
    authService.login.and.returnValue(throwError(() => new Error('Unauthorized')));

    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    component.loginForm.setValue({ email: 'user@test.com', password: 'wrong' });
    component.onSubmit();

    expect(component.error).toBe('Usuario o contraseña incorrectos');
    expect(component.loading).toBeFalse();
  });
});
