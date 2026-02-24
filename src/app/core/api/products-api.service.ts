import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from '../config/app-config.service';
import { ApiRoutes } from '../config/api-routes';
import {
  ProductDto,
  CreateProductRequest,
  UpdateProductRequest,
} from '../../shared/models';

export interface GetProductsParams {
  categoryId?: string;
  page?: number;
  pageSize?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductsApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly config: AppConfigService,
  ) {}

  getProducts(params?: GetProductsParams): Observable<ProductDto[]> {
    const url = this.config.buildApiUrl(ApiRoutes.products);
    let httpParams = new HttpParams();
    if (params?.categoryId != null) {
      httpParams = httpParams.set('categoryId', params.categoryId);
    }
    if (params?.page != null) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.pageSize != null) {
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }
    return this.http.get<ProductDto[]>(url, { params: httpParams });
  }

  getProduct(id: string): Observable<ProductDto> {
    const url = this.config.buildApiUrl(`${ApiRoutes.products}/${id}`);
    return this.http.get<ProductDto>(url);
  }

  createProduct(req: CreateProductRequest): Observable<ProductDto> {
    const url = this.config.buildApiUrl(ApiRoutes.products);
    return this.http.post<ProductDto>(url, req);
  }

  updateProduct(id: string, req: UpdateProductRequest): Observable<ProductDto> {
    const url = this.config.buildApiUrl(`${ApiRoutes.products}/${id}`);
    return this.http.put<ProductDto>(url, req);
  }

  deleteProduct(id: string): Observable<void> {
    const url = this.config.buildApiUrl(`${ApiRoutes.products}/${id}`);
    return this.http.delete<void>(url);
  }
}
