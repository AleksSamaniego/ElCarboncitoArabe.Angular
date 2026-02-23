import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from '../config/app-config.service';
import { ApiRoutes } from '../config/api-routes';
import { TableDto } from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class TablesApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly config: AppConfigService
  ) {}

  getTables(): Observable<TableDto[]> {
    const url = this.config.buildApiUrl(ApiRoutes.tables);
    return this.http.get<TableDto[]>(url);
  }
}
