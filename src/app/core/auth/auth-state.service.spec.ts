import { TestBed } from '@angular/core/testing';
import { AuthStateService } from './auth-state.service';
import { UserDto } from '../../shared/models';

describe('AuthStateService', () => {
  let service: AuthStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have null as the initial current user', () => {
    expect(service.currentUser).toBeNull();
  });

  it('should emit null on currentUser$ initially', (done) => {
    service.currentUser$.subscribe((user) => {
      expect(user).toBeNull();
      done();
    });
  });

  it('should update currentUser when setCurrentUser is called', () => {
    const user: UserDto = {
      id: '1',
      name: 'admin',
      email: 'admin@test.com',
      role: 'Admin',
    };
    service.setCurrentUser(user);
    expect(service.currentUser).toEqual(user);
  });

  it('should emit the new user on currentUser$ after setCurrentUser', (done) => {
    const user: UserDto = {
      id: '2',
      name: 'waiter',
      email: 'waiter@test.com',
      role: 'Waiter',
    };
    service.currentUser$.subscribe((emitted) => {
      if (emitted) {
        expect(emitted).toEqual(user);
        done();
      }
    });
    service.setCurrentUser(user);
  });

  it('should clear currentUser when setCurrentUser(null) is called', () => {
    const user: UserDto = {
      id: '1',
      name: 'admin',
      email: 'admin@test.com',
      role: 'Admin',
    };
    service.setCurrentUser(user);
    service.setCurrentUser(null);
    expect(service.currentUser).toBeNull();
  });
});
