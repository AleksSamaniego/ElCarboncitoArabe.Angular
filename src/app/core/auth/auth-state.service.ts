import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthUserDto } from '../../shared/models';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private readonly _currentUser$ = new BehaviorSubject<AuthUserDto | null>(
    null,
  );

  readonly currentUser$: Observable<AuthUserDto | null> =
    this._currentUser$.asObservable();

  get currentUser(): AuthUserDto | null {
    return this._currentUser$.getValue();
  }

  setCurrentUser(user: AuthUserDto | null): void {
    this._currentUser$.next(user);
  }
}
