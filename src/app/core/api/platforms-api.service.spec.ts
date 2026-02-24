import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PlatformsApiService } from './platforms-api.service';
import { AppConfigService } from '../config/app-config.service';
import { PlatformDto, CreatePlatformRequest } from '../../shared/models';

const MOCK_PLATFORMS: PlatformDto[] = [
  { id: 1, name: 'Rappi', commissionRate: 0.15 },
  { id: 2, name: 'Uber Eats', commissionRate: 0.3 }
];

describe('PlatformsApiService', () => {
  let service: PlatformsApiService;
  let httpMock: HttpTestingController;
  let config: AppConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(PlatformsApiService);
    httpMock = TestBed.inject(HttpTestingController);
    config = TestBed.inject(AppConfigService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPlatforms', () => {
    it('should GET the platforms endpoint and return platforms', () => {
      service.getPlatforms().subscribe(platforms => {
        expect(platforms).toEqual(MOCK_PLATFORMS);
      });

      const req = httpMock.expectOne(config.buildApiUrl('platforms'));
      expect(req.request.method).toBe('GET');
      req.flush(MOCK_PLATFORMS);
    });
  });

  describe('getPlatform', () => {
    it('should GET platforms/:id and return the platform', () => {
      const id = 'abc-123';
      service.getPlatform(id).subscribe(platform => {
        expect(platform).toEqual(MOCK_PLATFORMS[0]);
      });

      const req = httpMock.expectOne(config.buildApiUrl(`platforms/${id}`));
      expect(req.request.method).toBe('GET');
      req.flush(MOCK_PLATFORMS[0]);
    });
  });

  describe('createPlatform', () => {
    it('should POST to platforms and return the created platform', () => {
      const payload: CreatePlatformRequest = { name: 'PedidosYa', commissionRate: 0.2 };
      const created: PlatformDto = { id: 3, ...payload };

      service.createPlatform(payload).subscribe(platform => {
        expect(platform).toEqual(created);
      });

      const req = httpMock.expectOne(config.buildApiUrl('platforms'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(created);
    });
  });

  describe('updatePlatform', () => {
    it('should PUT to platforms/:id and return the updated platform', () => {
      const id = 'abc-123';
      const payload: CreatePlatformRequest = { name: 'Rappi updated', commissionRate: 0.18 };
      const updated: PlatformDto = { id: 1, ...payload };

      service.updatePlatform(id, payload).subscribe(platform => {
        expect(platform).toEqual(updated);
      });

      const req = httpMock.expectOne(config.buildApiUrl(`platforms/${id}`));
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.flush(updated);
    });
  });

  describe('deletePlatform', () => {
    it('should DELETE platforms/:id', () => {
      const id = 'abc-123';
      service.deletePlatform(id).subscribe();

      const req = httpMock.expectOne(config.buildApiUrl(`platforms/${id}`));
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
