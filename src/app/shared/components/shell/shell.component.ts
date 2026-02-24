import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { AuthStateService } from '../../../core/auth/auth-state.service';
import { AuthUserDto } from '../../models';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  readonly currentUser$: Observable<AuthUserDto | null>;
  readonly isHandset$: Observable<boolean>;

  constructor(
    private readonly authService: AuthService,
    private readonly authState: AuthStateService,
    private readonly router: Router,
    private readonly breakpointObserver: BreakpointObserver,
  ) {
    const stored = this.authService.getCurrentUser();
    if (stored) {
      this.authState.setCurrentUser(stored);
    }
    this.currentUser$ = this.authState.currentUser$;
    this.isHandset$ = this.breakpointObserver
      .observe(Breakpoints.Handset)
      .pipe(map((result) => result.matches));
  }

  hasRole(user: AuthUserDto | null, ...roles: string[]): boolean {
    return user != null && roles.includes(user.role);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
