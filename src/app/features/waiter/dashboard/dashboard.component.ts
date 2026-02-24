import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, combineLatest, of } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

import { OrdersApiService } from '../../../core/api/orders-api.service';
import { ProductsApiService } from '../../../core/api/products-api.service';
import { TablesApiService } from '../../../core/api/tables-api.service';
import { PlatformsApiService } from '../../../core/api/platforms-api.service';
import { CategoriesApiService } from '../../../core/api/categories-api.service';
import { OrdersRealtimeService } from '../../../core/realtime/orders-realtime.service';
import {
  OrderDto,
  OrderType,
  OrderStatus,
  ProductDto,
  CategoryDto,
  TableDto,
  PlatformDto,
} from '../../../shared/models';

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  notes: string;
}

@Component({
  selector: 'app-waiter-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  readonly OrderType = OrderType;

  tables: TableDto[] = [];
  platforms: PlatformDto[] = [];
  products: ProductDto[] = [];
  categories: CategoryDto[] = [];
  activeOrders: OrderDto[] = [];
  selectedOrderId: string | null = null;
  private readonly tableNameById = new Map<string, string>();

  activeOrder: OrderDto | null = null;
  cartItems: CartItem[] = [];

  selectedCategoryId: string | null = null;
  searchText = '';

  loading = false;
  saving = false;
  sendingToKitchen = false;
  statusUpdating = false;
  cancelling = false;

  orderForm: FormGroup;

  readonly orderTypes = [
    { value: OrderType.DineIn, label: 'Mesa (Dine In)' },
    { value: OrderType.Takeaway, label: 'Para llevar' },
    { value: OrderType.Platform, label: 'Plataforma' },
  ];

  private readonly statusLabels: Record<OrderStatus, string> = {
    [OrderStatus.Draft]: 'Borrador',
    [OrderStatus.SentToKitchen]: 'Enviado a cocina',
    [OrderStatus.Received]: 'Recibido',
    [OrderStatus.InProgress]: 'En progreso',
    [OrderStatus.Ready]: 'Listo',
    [OrderStatus.Delivered]: 'Entregado',
    [OrderStatus.Cancelled]: 'Cancelado',
    [OrderStatus.Paid]: 'Pagado',
  };

  private readonly nextStatusMap: Partial<Record<OrderStatus, OrderStatus>> = {
    [OrderStatus.SentToKitchen]: OrderStatus.Received,
    [OrderStatus.Received]: OrderStatus.InProgress,
    [OrderStatus.InProgress]: OrderStatus.Ready,
    [OrderStatus.Ready]: OrderStatus.Delivered,
  };

  private readonly nextStatusLabelMap: Partial<Record<OrderStatus, string>> = {
    [OrderStatus.Draft]: 'Enviar a cocina',
    [OrderStatus.SentToKitchen]: 'Marcar recibido',
    [OrderStatus.Received]: 'Iniciar preparación',
    [OrderStatus.InProgress]: 'Marcar listo',
    [OrderStatus.Ready]: 'Marcar entregado',
  };

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly ordersApi: OrdersApiService,
    private readonly productsApi: ProductsApiService,
    private readonly tablesApi: TablesApiService,
    private readonly platformsApi: PlatformsApiService,
    private readonly categoriesApi: CategoriesApiService,
    private readonly realtime: OrdersRealtimeService,
  ) {
    this.orderForm = this.fb.group({
      type: [OrderType.Takeaway, Validators.required],
      tableId: [null],
      platformName: [null],
      externalReference: [''],
    });
  }

  ngOnInit(): void {
    this.loadData();
    this.subscribeToTypeChanges();
    this.subscribeToRealtime();
  }

  private loadData(): void {
    this.loading = true;
    combineLatest([
      this.tablesApi.getTables(),
      this.platformsApi.getPlatforms(),
      this.productsApi.getProducts(),
      this.categoriesApi.getCategories(),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([tables, platforms, products, categories]) => {
          this.tables = tables;
          this.buildTableMap(tables);
          this.platforms = platforms;
          this.products = products;
          this.categories = categories;
          this.loading = false;
          this.loadActiveOrders();
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  private loadActiveOrders(): void {
    this.ordersApi
      .getActiveOrders()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (orders) => {
          this.activeOrders = orders.filter(
            (o) =>
              o.status !== OrderStatus.Cancelled &&
              o.status !== OrderStatus.Paid,
          );

          if (this.activeOrder) {
            const updated = this.activeOrders.find(
              (o) => o.id === this.activeOrder?.id,
            );
            if (updated) {
              this.applyOrder(updated);
            } else {
              this.resetActiveOrder();
            }
          } else if (this.activeOrders.length > 0) {
            const draft = this.activeOrders.find(
              (o) => o.status === OrderStatus.Draft,
            );
            this.applyOrder(draft ?? this.activeOrders[0]);
          }

          this.selectedOrderId = this.activeOrder?.id ?? null;
        },
      });
  }

  private applyOrder(order: OrderDto): void {
    this.activeOrder = order;
    this.selectedOrderId = order.id;
    this.orderForm.patchValue({
      type: order.type,
      tableId: order.tableId ?? null,
      platformName: order.platformName ?? null,
      externalReference: order.externalReference ?? '',
    });
    this.cartItems = order.items.map((item) => ({
      productId: item.productId,
      productName: item.productNameSnapshot,
      quantity: item.quantity,
      unitPrice: item.unitPriceSnapshot,
      notes: item.notes ?? '',
    }));
    this.updateTypeValidators(order.type);
  }

  private subscribeToTypeChanges(): void {
    this.orderForm
      .get('type')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((type) => this.updateTypeValidators(type));
  }

  private updateTypeValidators(type: OrderType): void {
    const tableCtrl = this.orderForm.get('tableId')!;
    const platformCtrl = this.orderForm.get('platformName')!;
    if (type === OrderType.DineIn) {
      tableCtrl.setValidators(Validators.required);
      platformCtrl.clearValidators();
    } else if (type === OrderType.Platform) {
      platformCtrl.setValidators(Validators.required);
      tableCtrl.clearValidators();
    } else {
      tableCtrl.clearValidators();
      platformCtrl.clearValidators();
    }
    tableCtrl.updateValueAndValidity();
    platformCtrl.updateValueAndValidity();
  }

  private subscribeToRealtime(): void {
    this.realtime.orderCreated$
      .pipe(takeUntil(this.destroy$))
      .subscribe((order) => this.upsertActiveOrder(order));

    this.realtime.orderUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe((order) => this.upsertActiveOrder(order));
    this.realtime.orderStatusChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((order) => {
        if (
          order.status === OrderStatus.Cancelled ||
          order.status === OrderStatus.Paid
        ) {
          this.removeActiveOrder(order.id);
        } else {
          this.upsertActiveOrder(order);
        }
      });

    this.realtime.orderPaid$
      .pipe(takeUntil(this.destroy$))
      .subscribe((order) => this.removeActiveOrder(order.id));

    this.realtime.orderCancelled$
      .pipe(takeUntil(this.destroy$))
      .subscribe((order) => this.removeActiveOrder(order.id));
  }

  selectActiveOrder(orderId: string | null): void {
    if (!orderId) {
      this.resetActiveOrder();
      return;
    }
    const selected = this.activeOrders.find((o) => o.id === orderId);
    if (selected) {
      this.applyOrder(selected);
    }
  }

  getOrderDisplay(order: OrderDto): string {
    const shortId = order.id.slice(0, 8);
    return `#${shortId} · ${this.getOrderLocationLabel(order)}`;
  }

  getOrderLocationLabel(order: OrderDto): string {
    if (order.type === OrderType.DineIn) {
      return `Mesa ${this.getTableLabel(order.tableId)}`;
    }
    if (order.type === OrderType.Platform) {
      return order.platformName ?? 'Plataforma';
    }
    return 'Para llevar';
  }

  getTableLabel(tableId?: string | null): string {
    if (!tableId) return '—';
    return this.tableNameById.get(tableId) ?? tableId;
  }

  private upsertActiveOrder(order: OrderDto): void {
    if (
      order.status === OrderStatus.Cancelled ||
      order.status === OrderStatus.Paid
    ) {
      this.removeActiveOrder(order.id);
      return;
    }

    const idx = this.activeOrders.findIndex((o) => o.id === order.id);
    if (idx >= 0) {
      this.activeOrders = [
        ...this.activeOrders.slice(0, idx),
        order,
        ...this.activeOrders.slice(idx + 1),
      ];
    } else {
      this.activeOrders = [...this.activeOrders, order];
    }

    if (this.activeOrder && order.id === this.activeOrder.id) {
      this.applyOrder(order);
    }
  }

  private removeActiveOrder(orderId: string): void {
    this.activeOrders = this.activeOrders.filter((o) => o.id !== orderId);
    if (this.activeOrder?.id === orderId) {
      this.resetActiveOrder();
    }
  }

  private resetActiveOrder(): void {
    this.activeOrder = null;
    this.selectedOrderId = null;
    this.cartItems = [];
    this.orderForm.reset({
      type: OrderType.Takeaway,
      tableId: null,
      platformName: null,
      externalReference: '',
    });
    this.updateTypeValidators(OrderType.Takeaway);
  }

  getStatusLabel(status: OrderStatus): string {
    return this.statusLabels[status];
  }

  getNextStatusLabel(status?: OrderStatus | null): string | null {
    if (status == null) return null;
    return this.nextStatusLabelMap[status] ?? null;
  }

  private getNextStatus(status: OrderStatus): OrderStatus | null {
    return this.nextStatusMap[status] ?? null;
  }

  get filteredProducts(): ProductDto[] {
    return this.products.filter((p) => {
      const matchesCategory =
        this.selectedCategoryId == null ||
        p.categoryId === this.selectedCategoryId;
      const matchesSearch =
        !this.searchText ||
        p.name.toLowerCase().includes(this.searchText.toLowerCase());
      return matchesCategory && matchesSearch && p.isActive;
    });
  }

  get subtotal(): number {
    return this.cartItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
  }

  selectCategory(id: string | null): void {
    this.selectedCategoryId = id;
  }

  addToCart(product: ProductDto): void {
    const existing = this.cartItems.find((i) => i.productId === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.cartItems.push({
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.price,
        notes: '',
      });
    }
  }

  incrementItem(item: CartItem): void {
    item.quantity++;
  }

  decrementItem(item: CartItem): void {
    if (item.quantity > 1) {
      item.quantity--;
    } else {
      this.removeItem(item);
    }
  }

  removeItem(item: CartItem): void {
    this.cartItems = this.cartItems.filter((i) => i !== item);
  }

  save(): void {
    if (this.orderForm.invalid || this.saving) return;
    this.saving = true;
    const val = this.orderForm.value;
    const createReq = {
      type: val.type as OrderType,
      tableId: val.type === OrderType.DineIn ? val.tableId : undefined,
      platformName:
        val.type === OrderType.Platform ? val.platformName : undefined,
      externalReference:
        val.type === OrderType.Platform && val.externalReference
          ? val.externalReference
          : undefined,
    };

    const updateReq = {
      items: this.cartItems.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        notes: i.notes || undefined,
      })),
    };

    const obs = this.activeOrder
      ? this.ordersApi.updateOrder(this.activeOrder.id, updateReq)
      : this.ordersApi
          .createOrder(createReq)
          .pipe(
            switchMap((order) =>
              this.cartItems.length > 0
                ? this.ordersApi.updateOrder(order.id, updateReq)
                : of(order),
            ),
          );

    obs.pipe(takeUntil(this.destroy$)).subscribe({
      next: (order) => {
        this.applyOrder(order);
        this.saving = false;
      },
      error: () => {
        this.saving = false;
      },
    });
  }

  sendToKitchen(): void {
    if (!this.activeOrder || this.sendingToKitchen) return;
    this.sendingToKitchen = true;
    this.ordersApi
      .sendToKitchen(this.activeOrder.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.activeOrder = null;
          this.cartItems = [];
          this.orderForm.reset({
            type: OrderType.Takeaway,
            tableId: null,
            platformName: null,
            externalReference: '',
          });
          this.sendingToKitchen = false;
        },
        error: () => {
          this.sendingToKitchen = false;
        },
      });
  }

  advanceStatus(): void {
    if (!this.activeOrder || this.statusUpdating) return;
    const status = this.activeOrder.status;

    if (status === OrderStatus.Draft) {
      this.sendToKitchen();
      return;
    }

    const nextStatus = this.getNextStatus(status);
    if (!nextStatus) return;

    this.statusUpdating = true;
    this.ordersApi
      .changeStatus(this.activeOrder.id, nextStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (order) => {
          this.applyOrder(order);
          this.statusUpdating = false;
        },
        error: () => {
          this.statusUpdating = false;
        },
      });
  }

  cancelOrder(): void {
    if (!this.activeOrder || this.cancelling) return;
    if (!confirm(`¿Cancelar pedido #${this.activeOrder.id}?`)) return;
    this.cancelling = true;
    this.ordersApi
      .cancelOrder(this.activeOrder.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.removeActiveOrder(this.activeOrder!.id);
          this.cancelling = false;
        },
        error: () => {
          this.cancelling = false;
        },
      });
  }

  private buildTableMap(tables: TableDto[]): void {
    this.tableNameById.clear();
    tables.forEach((table) => this.tableNameById.set(table.id, table.name));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
