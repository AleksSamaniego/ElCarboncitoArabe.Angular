import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from '../config/app-config.service';
import { ApiRoutes } from '../config/api-routes';
import { PlatformDto, CreatePlatformRequest } from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class PlatformsApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly config: AppConfigService
  ) {}

  getPlatforms(): Observable<PlatformDto[]> {
    const url = this.config.buildApiUrl(ApiRoutes.platforms);
    return this.http.get<PlatformDto[]>(url);
  }

  getPlatform(id: string): Observable<PlatformDto> {
    const url = this.config.buildApiUrl(`${ApiRoutes.platforms}/${id}`);
    return this.http.get<PlatformDto>(url);
  }

  createPlatform(req: CreatePlatformRequest): Observable<PlatformDto> {
    const url = this.config.buildApiUrl(ApiRoutes.platforms);
    return this.http.post<PlatformDto>(url, req);
  }

  updatePlatform(id: string, req: CreatePlatformRequest): Observable<PlatformDto> {
    const url = this.config.buildApiUrl(`${ApiRoutes.platforms}/${id}`);
    return this.http.put<PlatformDto>(url, req);
  }

  deletePlatform(id: string): Observable<void> {
    const url = this.config.buildApiUrl(`${ApiRoutes.platforms}/${id}`);
    return this.http.delete<void>(url);
  }
}
