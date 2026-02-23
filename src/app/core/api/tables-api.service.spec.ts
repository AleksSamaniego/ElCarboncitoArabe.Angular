import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TablesApiService } from './tables-api.service';
import { AppConfigService } from '../config/app-config.service';
import { TableDto } from '../../shared/models';

const MOCK_TABLES: TableDto[] = [
  { id: 1, number: 1, capacity: 4, isAvailable: true },
  { id: 2, number: 2, capacity: 2, isAvailable: false }
];

describe('TablesApiService', () => {
  let service: TablesApiService;
  let httpMock: HttpTestingController;
  let config: AppConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(TablesApiService);
    httpMock = TestBed.inject(HttpTestingController);
    config = TestBed.inject(AppConfigService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTables', () => {
    it('should GET the tables endpoint and return tables', () => {
      service.getTables().subscribe(tables => {
        expect(tables).toEqual(MOCK_TABLES);
      });

      const req = httpMock.expectOne(config.buildApiUrl('tables'));
      expect(req.request.method).toBe('GET');
      req.flush(MOCK_TABLES);
    });
  });
});
