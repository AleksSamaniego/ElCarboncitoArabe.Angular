import { Injectable, InjectionToken, OnDestroy, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppConfigService } from '../config/app-config.service';
import { AuthService } from '../auth/auth.service';
import { AuthStateService } from '../auth/auth-state.service';
import { OrderDto } from '../../shared/models';

export const HUB_CONNECTION_FACTORY = new InjectionToken<
  (url: string, options: signalR.IHttpConnectionOptions) => signalR.HubConnection
>('HUB_CONNECTION_FACTORY', {
  factory: () => (url: string, options: signalR.IHttpConnectionOptions) =>
    new signalR.HubConnectionBuilder()
      .withUrl(url, options)
      .withAutomaticReconnect()
      .build()
});

@Injectable({
  providedIn: 'root'
})
export class OrdersRealtimeService implements OnDestroy {
  private hub: signalR.HubConnection | null = null;

  private readonly _orderCreated$ = new Subject<OrderDto>();
  private readonly _orderUpdated$ = new Subject<OrderDto>();
  private readonly _orderStatusChanged$ = new Subject<OrderDto>();
  private readonly _orderPaid$ = new Subject<OrderDto>();
  private readonly _orderCancelled$ = new Subject<OrderDto>();
  private readonly _orderTypeChanged$ = new Subject<OrderDto>();

  readonly orderCreated$ = this._orderCreated$.asObservable();
  readonly orderUpdated$ = this._orderUpdated$.asObservable();
  readonly orderStatusChanged$ = this._orderStatusChanged$.asObservable();
  readonly orderPaid$ = this._orderPaid$.asObservable();
  readonly orderCancelled$ = this._orderCancelled$.asObservable();
  readonly orderTypeChanged$ = this._orderTypeChanged$.asObservable();

  private readonly _authSub: Subscription;
  private readonly _hubFactory = inject(HUB_CONNECTION_FACTORY);

  constructor(
    private readonly config: AppConfigService,
    private readonly authService: AuthService,
    private readonly authState: AuthStateService
  ) {
    this._authSub = this.authState.currentUser$
      .pipe(filter(user => user !== undefined))
      .subscribe(user => {
        if (user) {
          this.start();
        } else {
          this.stop();
        }
      });
  }

  start(): void {
    if (this.hub && this.hub.state !== signalR.HubConnectionState.Disconnected) {
      return;
    }

    this.hub = this._hubFactory(this.config.signalRHubUrl, {
      accessTokenFactory: () => this.authService.getToken() ?? ''
    });

    this.hub.on('orderCreated', (data: OrderDto) => this._orderCreated$.next(data));
    this.hub.on('orderUpdated', (data: OrderDto) => this._orderUpdated$.next(data));
    this.hub.on('orderStatusChanged', (data: OrderDto) => this._orderStatusChanged$.next(data));
    this.hub.on('orderPaid', (data: OrderDto) => this._orderPaid$.next(data));
    this.hub.on('orderCancelled', (data: OrderDto) => this._orderCancelled$.next(data));
    this.hub.on('orderTypeChanged', (data: OrderDto) => this._orderTypeChanged$.next(data));

    this.hub.start().catch(err => console.error('SignalR connection error:', err));
  }

  stop(): void {
    if (!this.hub) {
      return;
    }
    this.hub.stop().catch(err => console.error('SignalR stop error:', err));
    this.hub = null;
  }

  ngOnDestroy(): void {
    this._authSub.unsubscribe();
    this.stop();
  }
}
