import { OrderType, OrderStatus, PaymentMethod, PaymentStatus } from './enums';

export interface UpdateOrderItemRequest {
  productId: string;
  quantity: number;
  notes?: string;
}

export interface CreateOrderRequest {
  type: OrderType;
  tableId?: string;
  platformName?: string;
  externalReference?: string;
  notes?: string;
}

export interface UpdateOrderRequest {
  notes?: string;
  items?: UpdateOrderItemRequest[];
}

export interface CheckoutRequest {
  paymentMethod: PaymentMethod;
  discount: number;
  tax: number;
  paymentNotes?: string;
}

export interface OrderItemDto {
  id: string;
  productId: string;
  productNameSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  notes?: string;
  total: number;
}

export interface OrderDto {
  id: string;
  type: OrderType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  tableId?: string;
  platformName?: string;
  externalReference?: string;
  notes?: string;
  items: OrderItemDto[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentNotes?: string;
  paidAt?: string | null;
  paidByUserId?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}
