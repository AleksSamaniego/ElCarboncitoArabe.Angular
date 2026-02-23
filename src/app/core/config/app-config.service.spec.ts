import { TestBed } from '@angular/core/testing';
import { AppConfigService } from './app-config.service';
import { environment } from '../../../environments/environment';

describe('AppConfigService', () => {
  let service: AppConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should expose apiBaseUrl from environment', () => {
    expect(service.apiBaseUrl).toBe(environment.apiBaseUrl);
  });

  it('should expose signalRHubUrl from environment', () => {
    expect(service.signalRHubUrl).toBe(environment.signalRHubUrl);
  });

  it('should build a full API URL from a path', () => {
    const path = 'orders';
    expect(service.buildApiUrl(path)).toBe(`${environment.apiBaseUrl}/${path}`);
  });

  it('should strip leading slashes from path when building API URL', () => {
    expect(service.buildApiUrl('/orders')).toBe(`${environment.apiBaseUrl}/orders`);
  });
});
