import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TablesApiService } from './tables-api.service';
import { AppConfigService } from '../config/app-config.service';
import { TableDto, CreateTableRequest, UpdateTableRequest } from '../../shared/models';

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

  describe('getTable', () => {
    it('should GET tables/:id and return the table', () => {
      const id = 'abc-123';
      service.getTable(id).subscribe(table => {
        expect(table).toEqual(MOCK_TABLES[0]);
      });

      const req = httpMock.expectOne(config.buildApiUrl(`tables/${id}`));
      expect(req.request.method).toBe('GET');
      req.flush(MOCK_TABLES[0]);
    });
  });

  describe('createTable', () => {
    it('should POST to tables and return the created table', () => {
      const payload: CreateTableRequest = { number: 3, capacity: 6 };
      const created: TableDto = { id: 3, isAvailable: true, ...payload };

      service.createTable(payload).subscribe(table => {
        expect(table).toEqual(created);
      });

      const req = httpMock.expectOne(config.buildApiUrl('tables'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(created);
    });
  });

  describe('updateTable', () => {
    it('should PUT to tables/:id and return the updated table', () => {
      const id = 'abc-123';
      const payload: UpdateTableRequest = { number: 1, capacity: 8, isAvailable: false };
      const updated: TableDto = { id: 1, ...payload };

      service.updateTable(id, payload).subscribe(table => {
        expect(table).toEqual(updated);
      });

      const req = httpMock.expectOne(config.buildApiUrl(`tables/${id}`));
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.flush(updated);
    });
  });

  describe('deleteTable', () => {
    it('should DELETE tables/:id', () => {
      const id = 'abc-123';
      service.deleteTable(id).subscribe();

      const req = httpMock.expectOne(config.buildApiUrl(`tables/${id}`));
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
