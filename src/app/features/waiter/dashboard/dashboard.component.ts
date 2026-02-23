import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
  PlatformDto
} from '../../../shared/models';

interface CartItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  notes: string;
}

@Component({
  selector: 'app-waiter-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  readonly OrderType = OrderType;

  tables: TableDto[] = [];
  platforms: PlatformDto[] = [];
  products: ProductDto[] = [];
  categories: CategoryDto[] = [];

  activeOrder: OrderDto | null = null;
  cartItems: CartItem[] = [];

  selectedCategoryId: number | null = null;
  searchText = '';

  loading = false;
  saving = false;
  sendingToKitchen = false;

  orderForm: FormGroup;

  readonly orderTypes = [
    { value: OrderType.DineIn, label: 'Mesa (Dine In)' },
    { value: OrderType.TakeAway, label: 'Para llevar' },
    { value: OrderType.Delivery, label: 'Plataforma' }
  ];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly ordersApi: OrdersApiService,
    private readonly productsApi: ProductsApiService,
    private readonly tablesApi: TablesApiService,
    private readonly platformsApi: PlatformsApiService,
    private readonly categoriesApi: CategoriesApiService,
    private readonly realtime: OrdersRealtimeService
  ) {
    this.orderForm = this.fb.group({
      type: [OrderType.TakeAway, Validators.required],
      tableId: [null],
      platformId: [null],
      externalReference: ['']
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
      this.categoriesApi.getCategories()
    ]).pipe(takeUntil(this.destroy$)).subscribe({
      next: ([tables, platforms, products, categories]) => {
        this.tables = tables;
        this.platforms = platforms;
        this.products = products;
        this.categories = categories;
        this.loading = false;
        this.loadActiveOrder();
      },
      error: () => { this.loading = false; }
    });
  }

  private loadActiveOrder(): void {
    this.ordersApi.getActiveOrders().pipe(takeUntil(this.destroy$)).subscribe({
      next: (orders) => {
        const pending = orders.find(o => o.status === OrderStatus.Pending);
        if (pending) {
          this.applyOrder(pending);
        }
      }
    });
  }

  private applyOrder(order: OrderDto): void {
    this.activeOrder = order;
    this.orderForm.patchValue({
      type: order.type,
      tableId: order.tableId ?? null,
      platformId: order.platformId ?? null,
      externalReference: order.externalReference ?? ''
    });
    this.cartItems = order.items.map(item => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      notes: item.notes ?? ''
    }));
    this.updateTypeValidators(order.type);
  }

  private subscribeToTypeChanges(): void {
    this.orderForm.get('type')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(type => this.updateTypeValidators(type));
  }

  private updateTypeValidators(type: OrderType): void {
    const tableCtrl = this.orderForm.get('tableId')!;
    const platformCtrl = this.orderForm.get('platformId')!;
    if (type === OrderType.DineIn) {
      tableCtrl.setValidators(Validators.required);
      platformCtrl.clearValidators();
    } else if (type === OrderType.Delivery) {
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
    this.realtime.orderUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(order => {
        if (this.activeOrder && order.id === this.activeOrder.id) {
          this.applyOrder(order);
        }
      });
    this.realtime.orderStatusChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(order => {
        if (this.activeOrder && order.id === this.activeOrder.id) {
          this.applyOrder(order);
        }
      });
  }

  get filteredProducts(): ProductDto[] {
    return this.products.filter(p => {
      const matchesCategory = this.selectedCategoryId == null || p.categoryId === this.selectedCategoryId;
      const matchesSearch = !this.searchText || p.name.toLowerCase().includes(this.searchText.toLowerCase());
      return matchesCategory && matchesSearch && p.isAvailable;
    });
  }

  get subtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }

  selectCategory(id: number | null): void {
    this.selectedCategoryId = id;
  }

  addToCart(product: ProductDto): void {
    const existing = this.cartItems.find(i => i.productId === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.cartItems.push({
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.price,
        notes: ''
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
    this.cartItems = this.cartItems.filter(i => i !== item);
  }

  save(): void {
    if (this.orderForm.invalid || this.saving) return;
    this.saving = true;
    const val = this.orderForm.value;
    const req = {
      type: val.type as OrderType,
      tableId: val.type === OrderType.DineIn ? val.tableId : undefined,
      platformId: val.type === OrderType.Delivery ? val.platformId : undefined,
      externalReference: val.type === OrderType.Delivery && val.externalReference ? val.externalReference : undefined,
      items: this.cartItems.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        notes: i.notes || undefined
      }))
    };

    const obs = this.activeOrder
      ? this.ordersApi.updateOrder(this.activeOrder.id, req)
      : this.ordersApi.createOrder(req);

    obs.pipe(takeUntil(this.destroy$)).subscribe({
      next: (order) => {
        this.applyOrder(order);
        this.saving = false;
      },
      error: () => { this.saving = false; }
    });
  }

  sendToKitchen(): void {
    if (!this.activeOrder || this.sendingToKitchen) return;
    this.sendingToKitchen = true;
    this.ordersApi.sendToKitchen(this.activeOrder.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.activeOrder = null;
          this.cartItems = [];
          this.orderForm.reset({ type: OrderType.TakeAway, tableId: null, platformId: null, externalReference: '' });
          this.sendingToKitchen = false;
        },
        error: () => { this.sendingToKitchen = false; }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
