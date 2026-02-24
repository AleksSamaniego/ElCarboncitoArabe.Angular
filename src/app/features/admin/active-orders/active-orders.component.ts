import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';

import { OrdersApiService, ChangeTypeRequest } from '../../../core/api/orders-api.service';
import { OrdersRealtimeService } from '../../../core/realtime/orders-realtime.service';
import { CheckoutRequest, OrderDto, OrderStatus, OrderType, PaymentStatus } from '../../../shared/models';
import { CheckoutDialogComponent } from '../dialogs/checkout-dialog/checkout-dialog.component';
import { ChangeTypeDialogComponent } from '../dialogs/change-type-dialog/change-type-dialog.component';

@Component({
  selector: 'app-active-orders',
  templateUrl: './active-orders.component.html',
  styleUrl: './active-orders.component.scss'
})
export class ActiveOrdersComponent implements OnInit, OnDestroy {
  readonly OrderStatus = OrderStatus;
  readonly OrderType = OrderType;
  readonly PaymentStatus = PaymentStatus;

  orders: OrderDto[] = [];
  loading = false;
  processingIds = new Set<number>();

  readonly displayedColumns = ['id', 'type', 'location', 'status', 'total', 'paymentStatus', 'actions'];

  readonly orderTypeLabel: Record<OrderType, string> = {
    [OrderType.DineIn]: 'Comer aquí',
    [OrderType.TakeAway]: 'Para llevar',
    [OrderType.Delivery]: 'Plataforma'
  };

  readonly orderStatusLabel: Record<OrderStatus, string> = {
    [OrderStatus.Pending]: 'Pendiente',
    [OrderStatus.InProgress]: 'En progreso',
    [OrderStatus.Ready]: 'Listo',
    [OrderStatus.Delivered]: 'Entregado',
    [OrderStatus.Cancelled]: 'Cancelado'
  };

  readonly paymentStatusLabel: Record<PaymentStatus, string> = {
    [PaymentStatus.Unpaid]: 'Sin cobrar',
    [PaymentStatus.Paid]: 'Cobrado',
    [PaymentStatus.Refunded]: 'Reembolsado'
  };

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly ordersApi: OrdersApiService,
    private readonly realtime: OrdersRealtimeService,
    private readonly dialog: MatDialog
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

    this.realtime.orderPaid$
      .pipe(takeUntil(this.destroy$))
      .subscribe(order => this.upsertOrder(order));

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

  private removeOrder(id: number): void {
    this.orders = this.orders.filter(o => o.id !== id);
  }

  openCheckout(order: OrderDto): void {
    const ref = this.dialog.open(CheckoutDialogComponent, {
      width: '400px',
      data: { order }
    });
    ref.afterClosed().subscribe((req: CheckoutRequest | undefined) => {
      if (!req) return;
      this.processingIds.add(order.id);
      this.ordersApi.checkout(order.id, req)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updated) => {
            this.upsertOrder(updated);
            this.processingIds.delete(order.id);
          },
          error: () => this.processingIds.delete(order.id)
        });
    });
  }

  openChangeType(order: OrderDto): void {
    const ref = this.dialog.open(ChangeTypeDialogComponent, {
      width: '380px',
      data: { order }
    });
    ref.afterClosed().subscribe((req: ChangeTypeRequest | undefined) => {
      if (!req) return;
      this.processingIds.add(order.id);
      this.ordersApi.changeType(order.id, req)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updated) => {
            this.upsertOrder(updated);
            this.processingIds.delete(order.id);
          },
          error: () => this.processingIds.delete(order.id)
        });
    });
  }

  cancelOrder(order: OrderDto): void {
    if (!confirm(`¿Cancelar pedido #${order.id}?`)) return;
    this.processingIds.add(order.id);
    this.ordersApi.cancelOrder(order.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.removeOrder(order.id);
          this.processingIds.delete(order.id);
        },
        error: () => this.processingIds.delete(order.id)
      });
  }

  isProcessing(order: OrderDto): boolean {
    return this.processingIds.has(order.id);
  }

  getTypeLabel(type: OrderType): string {
    return this.orderTypeLabel[type];
  }

  getStatusLabel(status: OrderStatus): string {
    return this.orderStatusLabel[status];
  }

  getPaymentLabel(status: PaymentStatus): string {
    return this.paymentStatusLabel[status];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
