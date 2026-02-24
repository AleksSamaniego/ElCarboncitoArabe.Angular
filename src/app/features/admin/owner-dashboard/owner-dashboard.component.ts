import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { OrdersApiService } from '../../../core/api/orders-api.service';
import { TablesApiService } from '../../../core/api/tables-api.service';
import {
  OrderDto,
  OrderStatus,
  OrderType,
  PaymentStatus,
  TableDto,
} from '../../../shared/models';

@Component({
  selector: 'app-owner-dashboard',
  templateUrl: './owner-dashboard.component.html',
  styleUrl: './owner-dashboard.component.scss',
})
export class OwnerDashboardComponent implements OnInit, OnDestroy {
  readonly OrderStatus = OrderStatus;
  readonly OrderType = OrderType;
  readonly PaymentStatus = PaymentStatus;

  orders: OrderDto[] = [];
  filteredOrders: OrderDto[] = [];
  tables: TableDto[] = [];
  loading = false;
  filterForm: FormGroup;
  private readonly tableNameById = new Map<string, string>();
  private readonly destroy$ = new Subject<void>();

  readonly orderTypes = [
    { value: OrderType.DineIn, label: 'Comer aquí' },
    { value: OrderType.Takeaway, label: 'Para llevar' },
    { value: OrderType.Platform, label: 'Plataforma' },
  ];

  readonly orderStatusOptions = [
    { value: OrderStatus.Draft, label: 'Borrador' },
    { value: OrderStatus.SentToKitchen, label: 'Enviado a cocina' },
    { value: OrderStatus.Received, label: 'Recibido' },
    { value: OrderStatus.InProgress, label: 'En progreso' },
    { value: OrderStatus.Ready, label: 'Listo' },
    { value: OrderStatus.Delivered, label: 'Entregado' },
    { value: OrderStatus.Paid, label: 'Pagado' },
    { value: OrderStatus.Cancelled, label: 'Cancelado' },
  ];

  readonly paymentStatusOptions = [
    { value: PaymentStatus.Unpaid, label: 'Sin cobrar' },
    { value: PaymentStatus.Paid, label: 'Cobrado' },
  ];

  readonly displayedColumns = [
    'id',
    'date',
    'type',
    'location',
    'items',
    'total',
    'status',
    'paymentStatus',
    'actions',
  ];

  get stats() {
    return {
      totalOrders: this.filteredOrders.length,
      totalRevenue: this.filteredOrders
        .filter((o) => o.paymentStatus === PaymentStatus.Paid)
        .reduce((sum, o) => sum + o.total, 0),
      paidOrders: this.filteredOrders.filter(
        (o) => o.paymentStatus === PaymentStatus.Paid,
      ).length,
      unpaidOrders: this.filteredOrders.filter(
        (o) => o.paymentStatus === PaymentStatus.Unpaid,
      ).length,
    };
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly ordersApi: OrdersApiService,
    private readonly tablesApi: TablesApiService,
  ) {
    this.filterForm = this.fb.group({
      dateFrom: [''],
      dateTo: [''],
      orderType: [''],
      orderStatus: [''],
      paymentStatus: [''],
      searchText: [''],
    });
  }

  ngOnInit(): void {
    this.loadTables();
    this.loadOrders();
    this.subscribeToFilterChanges();
  }

  private loadTables(): void {
    this.tablesApi
      .getTables()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tables) => {
          this.tables = tables;
          this.buildTableMap(tables);
        },
      });
  }

  private loadOrders(): void {
    this.loading = true;
    this.ordersApi
      .getOrderHistory()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (orders) => {
          this.orders = orders;
          this.applyFilters();
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  private subscribeToFilterChanges(): void {
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());
  }

  private applyFilters(): void {
    let filtered = [...this.orders];

    const {
      dateFrom,
      dateTo,
      orderType,
      orderStatus,
      paymentStatus,
      searchText,
    } = this.filterForm.value;

    // Filter by date range
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      filtered = filtered.filter((o) => new Date(o.createdAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter((o) => new Date(o.createdAt) <= to);
    }

    // Filter by order type
    if (orderType !== null && orderType !== undefined && orderType !== '') {
      filtered = filtered.filter((o) => o.type === orderType);
    }

    // Filter by order status
    if (
      orderStatus !== null &&
      orderStatus !== undefined &&
      orderStatus !== ''
    ) {
      filtered = filtered.filter((o) => o.status === orderStatus);
    }

    // Filter by payment status
    if (
      paymentStatus !== null &&
      paymentStatus !== undefined &&
      paymentStatus !== ''
    ) {
      filtered = filtered.filter((o) => o.paymentStatus === paymentStatus);
    }

    // Filter by search text (order ID or table name)
    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.id.toLowerCase().includes(search) ||
          this.getTableLabel(o.tableId).toLowerCase().includes(search),
      );
    }

    this.filteredOrders = filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  private buildTableMap(tables: TableDto[]): void {
    this.tableNameById.clear();
    tables.forEach((table) => this.tableNameById.set(table.id, table.name));
  }

  getTableLabel(tableId?: string | null): string {
    if (!tableId) return '—';
    return this.tableNameById.get(tableId) ?? tableId;
  }

  getTypeLabel(type: OrderType): string {
    return (this.orderTypes.find((t) => t.value === type)?.label ??
      OrderType[type]) as string;
  }

  getStatusLabel(status: OrderStatus): string {
    return (this.orderStatusOptions.find((s) => s.value === status)?.label ??
      OrderStatus[status]) as string;
  }

  getPaymentLabel(status: PaymentStatus): string {
    return (this.paymentStatusOptions.find((p) => p.value === status)?.label ??
      PaymentStatus[status]) as string;
  }

  getTypeClass(type: OrderType): string {
    return `type-${OrderType[type].toLowerCase()}`;
  }

  getStatusClass(status: OrderStatus): string {
    return `status-${OrderStatus[status].toLowerCase()}`;
  }

  getPaymentClass(status: PaymentStatus): string {
    return `payment-${PaymentStatus[status].toLowerCase()}`;
  }

  resetFilters(): void {
    this.filterForm.reset();
  }

  onViewDetails(order: OrderDto): void {
    // TODO: Implement order details dialog
    console.log('View details for order:', order.id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
