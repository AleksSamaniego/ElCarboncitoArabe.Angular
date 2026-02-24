import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import * as signalR from '@microsoft/signalr';
import {
  OrdersRealtimeService,
  HUB_CONNECTION_FACTORY,
} from './orders-realtime.service';
import { AuthService } from '../auth/auth.service';
import { AuthStateService } from '../auth/auth-state.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  OrderDto,
  UserDto,
  OrderStatus,
  OrderType,
  PaymentStatus,
} from '../../shared/models';

// ---------------------------------------------------------------------------
// Minimal stub for HubConnection
// ---------------------------------------------------------------------------
class HubConnectionStub {
  state: signalR.HubConnectionState = signalR.HubConnectionState.Disconnected;
  private _handlers: Record<string, (data: OrderDto) => void> = {};

  on(event: string, handler: (data: OrderDto) => void): void {
    this._handlers[event] = handler;
  }

  /** Trigger a registered event handler (used in tests) */
  trigger(event: string, data: OrderDto): void {
    this._handlers[event]?.(data);
  }

  start = jasmine.createSpy('start').and.returnValue(Promise.resolve());
  stop = jasmine.createSpy('stop').and.returnValue(Promise.resolve());
}

describe('OrdersRealtimeService', () => {
  let service: OrdersRealtimeService;
  let authState: AuthStateService;
  let authService: AuthService;
  let hubStub: HubConnectionStub;
  let capturedUrl: string;
  let capturedOptions: signalR.IHttpConnectionOptions;

  const mockUser: UserDto = {
    id: '1',
    name: 'admin',
    email: 'admin@test.com',
    role: 'Admin',
  };

  beforeEach(() => {
    hubStub = new HubConnectionStub();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HUB_CONNECTION_FACTORY,
          useValue: (url: string, options: signalR.IHttpConnectionOptions) => {
            capturedUrl = url;
            capturedOptions = options;
            return hubStub;
          },
        },
      ],
    });

    service = TestBed.inject(OrdersRealtimeService);
    authState = TestBed.inject(AuthStateService);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('start()', () => {
    it('should build and start the hub connection', fakeAsync(() => {
      service.start();
      tick();
      expect(hubStub.start).toHaveBeenCalledTimes(1);
    }));

    it('should not start a second connection if already connected', fakeAsync(() => {
      service.start();
      tick();
      hubStub.state = signalR.HubConnectionState.Connected;
      service.start();
      tick();
      expect(hubStub.start).toHaveBeenCalledTimes(1);
    }));

    it('should use the signalRHubUrl from AppConfigService', fakeAsync(() => {
      service.start();
      tick();
      expect(capturedUrl).toContain('hubs/orders');
    }));

    it('should use the JWT token from AuthService via accessTokenFactory', fakeAsync(() => {
      spyOn(authService, 'getToken').and.returnValue('test-jwt-token');
      service.start();
      tick();
      expect(capturedOptions.accessTokenFactory!()).toBe('test-jwt-token');
    }));
  });

  describe('stop()', () => {
    it('should stop the hub connection', fakeAsync(() => {
      service.start();
      tick();
      service.stop();
      tick();
      expect(hubStub.stop).toHaveBeenCalledTimes(1);
    }));

    it('should be a no-op when not started', () => {
      expect(() => service.stop()).not.toThrow();
    });
  });

  describe('automatic start/stop based on auth state', () => {
    it('should call start() when a user logs in', fakeAsync(() => {
      spyOn(service, 'start');
      authState.setCurrentUser(mockUser);
      tick();
      expect(service.start).toHaveBeenCalled();
    }));

    it('should call stop() when the user logs out', fakeAsync(() => {
      authState.setCurrentUser(mockUser);
      tick();
      spyOn(service, 'stop');
      authState.setCurrentUser(null);
      tick();
      expect(service.stop).toHaveBeenCalled();
    }));
  });

  describe('event observables', () => {
    const mockOrder: OrderDto = {
      id: 'order-guid-42',
      type: OrderType.DineIn,
      status: OrderStatus.Draft,
      paymentStatus: PaymentStatus.Unpaid,
      items: [],
      subtotal: 0,
      discount: 0,
      tax: 0,
      total: 0,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    const events: Array<[string, keyof OrdersRealtimeService]> = [
      ['orderCreated', 'orderCreated$'],
      ['orderUpdated', 'orderUpdated$'],
      ['orderStatusChanged', 'orderStatusChanged$'],
      ['orderPaid', 'orderPaid$'],
      ['orderCancelled', 'orderCancelled$'],
      ['orderTypeChanged', 'orderTypeChanged$'],
    ];

    events.forEach(([hubEvent, observable]) => {
      it(`should emit on ${observable} when hub fires "${hubEvent}"`, fakeAsync(() => {
        service.start();
        tick();

        let emitted: OrderDto | undefined;
        (service[observable] as import('rxjs').Observable<OrderDto>).subscribe(
          (v) => (emitted = v),
        );

        hubStub.trigger(hubEvent, mockOrder);
        expect(emitted).toEqual(mockOrder);
      }));
    });
  });
});
