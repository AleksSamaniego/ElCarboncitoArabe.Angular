import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { OrdersApiService } from '../../../core/api/orders-api.service';
import { TablesApiService } from '../../../core/api/tables-api.service';
import { OrdersRealtimeService } from '../../../core/realtime/orders-realtime.service';
import {
  OrderDto,
  OrderStatus,
  OrderType,
  TableDto,
} from '../../../shared/models';

interface KanbanColumn {
  status: OrderStatus;
  label: string;
  colorClass: string;
  icon: string;
}

@Component({
  selector: 'app-kitchen-board',
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
})
export class BoardComponent implements OnInit, OnDestroy {
  readonly OrderStatus = OrderStatus;
  readonly OrderType = OrderType;

  orders: OrderDto[] = [];
  tables: TableDto[] = [];
  loading = false;
  advancing: { [orderId: string]: boolean } = {};
  private readonly tableNameById = new Map<string, string>();

  readonly columns: KanbanColumn[] = [
    {
      status: OrderStatus.SentToKitchen,
      label: 'Enviado a Cocina',
      colorClass: 'col-pending',
      icon: 'send',
    },
    {
      status: OrderStatus.Received,
      label: 'Recibido',
      colorClass: 'col-received',
      icon: 'mark_email_read',
    },
    {
      status: OrderStatus.InProgress,
      label: 'En Progreso',
      colorClass: 'col-inprogress',
      icon: 'local_fire_department',
    },
    {
      status: OrderStatus.Ready,
      label: 'Listo',
      colorClass: 'col-ready',
      icon: 'check_circle',
    },
    {
      status: OrderStatus.Delivered,
      label: 'Entregado',
      colorClass: 'col-delivered',
      icon: 'done_all',
    },
  ];

  private readonly nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
    [OrderStatus.SentToKitchen]: OrderStatus.Received,
    [OrderStatus.Received]: OrderStatus.InProgress,
    [OrderStatus.InProgress]: OrderStatus.Ready,
    [OrderStatus.Ready]: OrderStatus.Delivered,
  };

  private readonly nextLabel: Partial<Record<OrderStatus, string>> = {
    [OrderStatus.SentToKitchen]: 'Recibir',
    [OrderStatus.Received]: 'Iniciar',
    [OrderStatus.InProgress]: 'Marcar listo',
    [OrderStatus.Ready]: 'Entregar',
  };

  readonly orderTypeLabel: Record<OrderType, string> = {
    [OrderType.DineIn]: 'Comer ahí',
    [OrderType.Takeaway]: 'Para llevar',
    [OrderType.Platform]: 'Plataforma',
  };

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly ordersApi: OrdersApiService,
    private readonly realtime: OrdersRealtimeService,
    private readonly tablesApi: TablesApiService,
  ) {}

  ngOnInit(): void {
    this.loadTables();
  }

  private loadTables(): void {
    this.tablesApi
      .getTables()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tables) => {
          this.tables = tables;
          this.buildTableMap(tables);
          this.loadOrders(); // Load orders after tables are ready
        },
        error: (err) => {
          this.tables = [];
          this.tableNameById.clear();
          this.loadOrders(); // Still load orders even if tables fail
        },
      });
  }

  private loadOrders(): void {
    this.loading = true;
    this.ordersApi
      .getActiveOrders()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (orders) => {
          this.orders = orders.filter(
            (o) =>
              o.status !== OrderStatus.Cancelled &&
              o.status !== OrderStatus.Delivered,
          );
          this.loading = false;
          this.subscribeToRealtime(); // Subscribe after initial load
        },
        error: () => {
          this.loading = false;
          this.subscribeToRealtime(); // Still subscribe even on error
        },
      });
  }

  private subscribeToRealtime(): void {
    this.realtime.orderCreated$
      .pipe(takeUntil(this.destroy$))
      .subscribe((order) => {
        if (
          order.status !== OrderStatus.Cancelled &&
          order.status !== OrderStatus.Delivered
        ) {
          this.upsertOrder(order);
        }
      });

    this.realtime.orderUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe((order) => this.upsertOrder(order));

    this.realtime.orderStatusChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((order) => {
        if (
          order.status === OrderStatus.Cancelled ||
          order.status === OrderStatus.Delivered
        ) {
          this.removeOrder(order.id);
        } else {
          this.upsertOrder(order);
        }
      });

    this.realtime.orderCancelled$
      .pipe(takeUntil(this.destroy$))
      .subscribe((order) => this.removeOrder(order.id));

    this.realtime.orderTypeChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((order) => this.upsertOrder(order));
  }

  private upsertOrder(order: OrderDto): void {
    const idx = this.orders.findIndex((o) => o.id === order.id);
    if (idx >= 0) {
      this.orders = [
        ...this.orders.slice(0, idx),
        order,
        ...this.orders.slice(idx + 1),
      ];
    } else {
      this.orders = [...this.orders, order];
    }
  }

  private removeOrder(id: string): void {
    this.orders = this.orders.filter((o) => o.id !== id);
  }

  ordersForColumn(status: OrderStatus): OrderDto[] {
    return this.orders.filter((o) => o.status === status);
  }

  getNextLabel(order: OrderDto): string | null {
    return this.nextLabel[order.status] ?? null;
  }

  getTableLabel(tableId?: string | null): string {
    if (!tableId) return '—';
    return this.tableNameById.get(tableId) ?? tableId;
  }

  private buildTableMap(tables: TableDto[]): void {
    this.tableNameById.clear();
    tables.forEach((table) => this.tableNameById.set(table.id, table.name));
  }

  advance(order: OrderDto): void {
    const next = this.nextStatus[order.status];
    if (!next || this.advancing[order.id]) return;

    this.advancing[order.id] = true;
    this.ordersApi
      .changeStatus(order.id, next)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.upsertOrder(updated);
          delete this.advancing[order.id];
        },
        error: () => {
          delete this.advancing[order.id];
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
