import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PlatformsApiService } from './platforms-api.service';
import { AppConfigService } from '../config/app-config.service';
import { PlatformDto } from '../../shared/models';

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
});
