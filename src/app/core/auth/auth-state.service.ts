import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserDto } from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private readonly _currentUser$ = new BehaviorSubject<UserDto | null>(null);

  readonly currentUser$: Observable<UserDto | null> = this._currentUser$.asObservable();

  get currentUser(): UserDto | null {
    return this._currentUser$.getValue();
  }

  setCurrentUser(user: UserDto | null): void {
    this._currentUser$.next(user);
  }
}
