import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from '../config/app-config.service';
import { ApiRoutes } from '../config/api-routes';
import { ProductDto } from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class ProductsApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly config: AppConfigService
  ) {}

  getProducts(): Observable<ProductDto[]> {
    const url = this.config.buildApiUrl(ApiRoutes.products);
    return this.http.get<ProductDto[]>(url);
  }
}
