import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const allowedRoles: string[] = route.data['roles'] ?? [];
    if (!allowedRoles.length) {
      console.warn('RoleGuard: no roles configured for this route. Access will be denied.');
    }
    const user = this.authService.getCurrentUser();
    if (user && allowedRoles.includes(user.role)) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
