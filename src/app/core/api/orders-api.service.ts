import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  tableId?: string;
  platformId?: string;
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

  getOrderHistory(date?: string): Observable<OrderDto[]> {
    const url = this.config.buildApiUrl(`${ApiRoutes.orders}/history`);
    let params = new HttpParams();
    if (date != null) {
      params = params.set('date', date);
    }
    return this.http.get<OrderDto[]>(url, { params });
  }

  getOrder(id: string): Observable<OrderDto> {
    const url = this.config.buildApiUrl(`${ApiRoutes.orders}/${id}`);
    return this.http.get<OrderDto>(url);
  }

  createOrder(req: CreateOrderRequest): Observable<OrderDto> {
    const url = this.config.buildApiUrl(ApiRoutes.orders);
    return this.http.post<OrderDto>(url, req);
  }

  updateOrder(id: string, req: UpdateOrderRequest): Observable<OrderDto> {
    const url = this.config.buildApiUrl(`${ApiRoutes.orders}/${id}`);
    return this.http.put<OrderDto>(url, req);
  }

  sendToKitchen(id: string): Observable<OrderDto> {
    const url = this.config.buildApiUrl(`${ApiRoutes.orders}/${id}/send-to-kitchen`);
    return this.http.post<OrderDto>(url, {});
  }

  changeStatus(id: string, status: OrderStatus): Observable<OrderDto> {
    const url = this.config.buildApiUrl(`${ApiRoutes.orders}/${id}/status`);
    return this.http.post<OrderDto>(url, { status });
  }

  cancelOrder(id: string): Observable<OrderDto> {
    const url = this.config.buildApiUrl(`${ApiRoutes.orders}/${id}/cancel`);
    return this.http.post<OrderDto>(url, {});
  }

  checkout(id: string, req: CheckoutRequest): Observable<OrderDto> {
    const url = this.config.buildApiUrl(`${ApiRoutes.orders}/${id}/checkout`);
    return this.http.post<OrderDto>(url, req);
  }

  changeType(id: string, req: ChangeTypeRequest): Observable<OrderDto> {
    const url = this.config.buildApiUrl(`${ApiRoutes.orders}/${id}/change-type`);
    return this.http.post<OrderDto>(url, req);
  }
}
