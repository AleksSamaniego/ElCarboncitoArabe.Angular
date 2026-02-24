import { OrderType, OrderStatus, PaymentMethod, PaymentStatus } from './enums';

export interface OrderItemUpsertDto {
  productId: string;
  quantity: number;
  notes?: string;
}

export interface CreateOrderRequest {
  type: OrderType;
  tableId?: string;
  platformId?: string;
  externalReference?: string;
  items: OrderItemUpsertDto[];
}

export interface UpdateOrderRequest {
  type: OrderType;
  tableId?: string;
  platformId?: string;
  externalReference?: string;
  items: OrderItemUpsertDto[];
}

export interface CheckoutRequest {
  orderId: string;
  paymentMethod: PaymentMethod;
  discount?: number;
  tax?: number;
}

export interface OrderItemDto {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
}

export interface OrderDto {
  id: string;
  type: OrderType;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  tableId?: string;
  tableNumber?: number;
  platformId?: string;
  platformName?: string;
  externalReference?: string;
  items: OrderItemDto[];
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}
