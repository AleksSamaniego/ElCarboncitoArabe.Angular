import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { OrdersApiService } from '../../../core/api/orders-api.service';
import { OrdersRealtimeService } from '../../../core/realtime/orders-realtime.service';
import { OrderDto, OrderStatus, OrderType } from '../../../shared/models';

interface KanbanColumn {
  status: OrderStatus;
  label: string;
  colorClass: string;
  icon: string;
}

@Component({
  selector: 'app-kitchen-board',
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent implements OnInit, OnDestroy {
  readonly OrderStatus = OrderStatus;
  readonly OrderType = OrderType;

  orders: OrderDto[] = [];
  loading = false;
  advancing: { [orderId: string]: boolean } = {};

  readonly columns: KanbanColumn[] = [
    { status: OrderStatus.Pending,    label: 'Enviado a Cocina', colorClass: 'col-pending',    icon: 'send' },
    { status: OrderStatus.InProgress, label: 'En Progreso',      colorClass: 'col-inprogress', icon: 'local_fire_department' },
    { status: OrderStatus.Ready,      label: 'Listo',            colorClass: 'col-ready',      icon: 'check_circle' },
    { status: OrderStatus.Delivered,  label: 'Entregado',        colorClass: 'col-delivered',  icon: 'done_all' }
  ];

  private readonly nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
    [OrderStatus.Pending]:    OrderStatus.InProgress,
    [OrderStatus.InProgress]: OrderStatus.Ready,
    [OrderStatus.Ready]:      OrderStatus.Delivered
  };

  private readonly nextLabel: Partial<Record<OrderStatus, string>> = {
    [OrderStatus.Pending]:    'Iniciar',
    [OrderStatus.InProgress]: 'Marcar listo',
    [OrderStatus.Ready]:      'Entregar'
  };

  readonly orderTypeLabel: Record<OrderType, string> = {
    [OrderType.DineIn]:   'Comer ahí',
    [OrderType.TakeAway]: 'Para llevar',
    [OrderType.Delivery]: 'Plataforma'
  };

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly ordersApi: OrdersApiService,
    private readonly realtime: OrdersRealtimeService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    this.subscribeToRealtime();
  }

  private loadOrders(): void {
    this.loading = true;
    this.ordersApi.getActiveOrders()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (orders) => {
          this.orders = orders.filter(o => o.status !== OrderStatus.Cancelled);
          this.loading = false;
        },
        error: () => { this.loading = false; }
      });
  }

  private subscribeToRealtime(): void {
    this.realtime.orderCreated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(order => {
        if (order.status !== OrderStatus.Cancelled) {
          this.upsertOrder(order);
        }
      });

    this.realtime.orderUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(order => this.upsertOrder(order));

    this.realtime.orderStatusChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(order => {
        if (order.status === OrderStatus.Cancelled) {
          this.removeOrder(order.id);
        } else {
          this.upsertOrder(order);
        }
      });

    this.realtime.orderCancelled$
      .pipe(takeUntil(this.destroy$))
      .subscribe(order => this.removeOrder(order.id));

    this.realtime.orderTypeChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(order => this.upsertOrder(order));
  }

  private upsertOrder(order: OrderDto): void {
    const idx = this.orders.findIndex(o => o.id === order.id);
    if (idx >= 0) {
      this.orders = [
        ...this.orders.slice(0, idx),
        order,
        ...this.orders.slice(idx + 1)
      ];
    } else {
      this.orders = [...this.orders, order];
    }
  }

  private removeOrder(id: string): void {
    this.orders = this.orders.filter(o => o.id !== id);
  }

  ordersForColumn(status: OrderStatus): OrderDto[] {
    return this.orders.filter(o => o.status === status);
  }

  getNextLabel(order: OrderDto): string | null {
    return this.nextLabel[order.status] ?? null;
  }

  advance(order: OrderDto): void {
    const next = this.nextStatus[order.status];
    if (!next || this.advancing[order.id]) return;

    this.advancing[order.id] = true;
    this.ordersApi.changeStatus(order.id, next)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.upsertOrder(updated);
          delete this.advancing[order.id];
        },
        error: () => { delete this.advancing[order.id]; }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
