import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from '../config/app-config.service';
import { ApiRoutes } from '../config/api-routes';
import {
  OrderDto,
  CreateOrderRequest,
  UpdateOrderRequest,
  CheckoutRequest,
  OrderStatus,
  OrderType
} from '../../shared/models';

export interface ChangeTypeRequest {
  type: OrderType;
  tableId?: number;
  platformId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrdersApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly config: AppConfigService
  ) {}

  getActiveOrders(): Observable<OrderDto[]> {
    const url = this.config.buildApiUrl(`${ApiRoutes.orders}/active`);
    return this.http.get<OrderDto[]>(url);
  }

  getOrder(id: number): Observable<OrderDto> {
    const url = this.config.buildApiUrl(`${ApiRoutes.orders}/${id}`);
    return this.http.get<OrderDto>(url);
  }

  createOrder(req: CreateOrderRequest): Observable<OrderDto> {
    const url = this.config.buildApiUrl(ApiRoutes.orders);
    return this.http.post<OrderDto>(url, req);
  }

  updateOrder(id: number, req: UpdateOrderRequest): Observable<OrderDto> {
    const url = this.config.buildApiUrl(`${ApiRoutes.orders}/${id}`);
    return this.http.put<OrderDto>(url, req);
  }

  sendToKitchen(id: number): Observable<OrderDto> {
    const url = this.config.buildApiUrl(`${ApiRoutes.orders}/${id}/send-to-kitchen`);
    return this.http.post<OrderDto>(url, {});
  }

  changeStatus(id: number, status: OrderStatus): Observable<OrderDto> {
    const url = this.config.buildApiUrl(`${ApiRoutes.orders}/${id}/status`);
    return this.http.patch<OrderDto>(url, { status });
  }

  cancelOrder(id: number): Observable<OrderDto> {
    const url = this.config.buildApiUrl(`${ApiRoutes.orders}/${id}/cancel`);
    return this.http.post<OrderDto>(url, {});
  }

  checkout(id: number, req: CheckoutRequest): Observable<OrderDto> {
    const url = this.config.buildApiUrl(`${ApiRoutes.orders}/${id}/checkout`);
    return this.http.post<OrderDto>(url, req);
  }

  changeType(id: number, req: ChangeTypeRequest): Observable<OrderDto> {
    const url = this.config.buildApiUrl(`${ApiRoutes.orders}/${id}/type`);
    return this.http.patch<OrderDto>(url, req);
  }
}
