import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from '../config/app-config.service';
import { ApiRoutes } from '../config/api-routes';
import { PlatformDto } from '../../shared/models';

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
}
