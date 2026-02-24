import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TablesApiService } from './tables-api.service';
import { AppConfigService } from '../config/app-config.service';
import {
  TableDto,
  CreateTableRequest,
  UpdateTableRequest,
} from '../../shared/models';

const MOCK_TABLES: TableDto[] = [
  {
    id: 'guid-1',
    name: 'Mesa 1',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: null,
  },
  {
    id: 'guid-2',
    name: 'Mesa 2',
    isActive: false,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: null,
  },
];

describe('TablesApiService', () => {
  let service: TablesApiService;
  let httpMock: HttpTestingController;
  let config: AppConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
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
      service.getTables().subscribe((tables) => {
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
      service.getTable(id).subscribe((table) => {
        expect(table).toEqual(MOCK_TABLES[0]);
      });

      const req = httpMock.expectOne(config.buildApiUrl(`tables/${id}`));
      expect(req.request.method).toBe('GET');
      req.flush(MOCK_TABLES[0]);
    });
  });

  describe('createTable', () => {
    it('should POST to tables and return the created table', () => {
      const payload: CreateTableRequest = { name: 'Mesa 3' };
      const created: TableDto = {
        id: 'guid-3',
        name: payload.name,
        isActive: true,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: null,
      };

      service.createTable(payload).subscribe((table) => {
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
      const payload: UpdateTableRequest = { name: 'Mesa 1', isActive: false };
      const updated: TableDto = {
        id: 'guid-1',
        name: payload.name,
        isActive: payload.isActive,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-04T00:00:00Z',
      };

      service.updateTable(id, payload).subscribe((table) => {
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
