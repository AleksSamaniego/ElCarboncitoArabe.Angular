import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  readonly apiBaseUrl: string = environment.apiBaseUrl;
  readonly signalRHubUrl: string = environment.signalRHubUrl;

  buildApiUrl(path: string): string {
    return `${this.apiBaseUrl}/${path.replace(/^\/+/, '')}`;
  }
}
