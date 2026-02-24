import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from '../config/app-config.service';
import { ApiRoutes } from '../config/api-routes';
import { TableDto, CreateTableRequest, UpdateTableRequest } from '../../shared/models';

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

  getTable(id: string): Observable<TableDto> {
    const url = this.config.buildApiUrl(`${ApiRoutes.tables}/${id}`);
    return this.http.get<TableDto>(url);
  }

  createTable(req: CreateTableRequest): Observable<TableDto> {
    const url = this.config.buildApiUrl(ApiRoutes.tables);
    return this.http.post<TableDto>(url, req);
  }

  updateTable(id: string, req: UpdateTableRequest): Observable<TableDto> {
    const url = this.config.buildApiUrl(`${ApiRoutes.tables}/${id}`);
    return this.http.put<TableDto>(url, req);
  }

  deleteTable(id: string): Observable<void> {
    const url = this.config.buildApiUrl(`${ApiRoutes.tables}/${id}`);
    return this.http.delete<void>(url);
  }
}
