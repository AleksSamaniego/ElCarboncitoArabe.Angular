import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from '../config/app-config.service';
import { ApiRoutes } from '../config/api-routes';
import { PaymentMethodDto } from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class PaymentMethodsApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly config: AppConfigService
  ) {}

  getPaymentMethods(): Observable<PaymentMethodDto[]> {
    const url = this.config.buildApiUrl(ApiRoutes.paymentMethods);
    return this.http.get<PaymentMethodDto[]>(url);
  }
}
