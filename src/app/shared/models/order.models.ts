import { OrderType, OrderStatus, PaymentMethod, PaymentStatus } from './enums';

export interface OrderItemUpsertDto {
  productId: number;
  quantity: number;
  notes?: string;
}

export interface CreateOrderRequest {
  type: OrderType;
  tableId?: number;
  platformId?: number;
  externalReference?: string;
  items: OrderItemUpsertDto[];
}

export interface UpdateOrderRequest {
  type: OrderType;
  tableId?: number;
  platformId?: number;
  externalReference?: string;
  items: OrderItemUpsertDto[];
}

export interface CheckoutRequest {
  orderId: number;
  paymentMethod: PaymentMethod;
  discount?: number;
  tax?: number;
}

export interface OrderItemDto {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
}

export interface OrderDto {
  id: number;
  type: OrderType;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  tableId?: number;
  tableNumber?: number;
  platformId?: number;
  platformName?: string;
  externalReference?: string;
  items: OrderItemDto[];
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}
