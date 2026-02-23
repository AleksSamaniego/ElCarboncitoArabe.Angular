import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from '../config/app-config.service';
import { ApiRoutes } from '../config/api-routes';
import { CategoryDto } from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class CategoriesApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly config: AppConfigService
  ) {}

  getCategories(): Observable<CategoryDto[]> {
    const url = this.config.buildApiUrl(ApiRoutes.categories);
    return this.http.get<CategoryDto[]>(url);
  }
}
