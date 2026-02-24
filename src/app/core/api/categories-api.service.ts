import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from '../config/app-config.service';
import { ApiRoutes } from '../config/api-routes';
import {
  CategoryDto,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../../shared/models';

@Injectable({
  providedIn: 'root',
})
export class CategoriesApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly config: AppConfigService,
  ) {}

  getCategories(): Observable<CategoryDto[]> {
    const url = this.config.buildApiUrl(ApiRoutes.categories);
    return this.http.get<CategoryDto[]>(url);
  }

  getCategory(id: string): Observable<CategoryDto> {
    const url = this.config.buildApiUrl(`${ApiRoutes.categories}/${id}`);
    return this.http.get<CategoryDto>(url);
  }

  createCategory(req: CreateCategoryRequest): Observable<CategoryDto> {
    const url = this.config.buildApiUrl(ApiRoutes.categories);
    return this.http.post<CategoryDto>(url, req);
  }

  updateCategory(
    id: string,
    req: UpdateCategoryRequest,
  ): Observable<CategoryDto> {
    const url = this.config.buildApiUrl(`${ApiRoutes.categories}/${id}`);
    return this.http.put<CategoryDto>(url, req);
  }

  deleteCategory(id: string): Observable<void> {
    const url = this.config.buildApiUrl(`${ApiRoutes.categories}/${id}`);
    return this.http.delete<void>(url);
  }
}
