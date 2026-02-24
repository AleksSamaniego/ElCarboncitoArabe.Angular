import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CategoriesApiService } from './categories-api.service';
import { AppConfigService } from '../config/app-config.service';
import { CategoryDto, CreateCategoryRequest } from '../../shared/models';

const MOCK_CATEGORIES: CategoryDto[] = [
  { id: 1, name: 'Entradas', description: 'Platos de entrada' },
  { id: 2, name: 'Principales' }
];

describe('CategoriesApiService', () => {
  let service: CategoriesApiService;
  let httpMock: HttpTestingController;
  let config: AppConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(CategoriesApiService);
    httpMock = TestBed.inject(HttpTestingController);
    config = TestBed.inject(AppConfigService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCategories', () => {
    it('should GET the categories endpoint and return categories', () => {
      service.getCategories().subscribe(categories => {
        expect(categories).toEqual(MOCK_CATEGORIES);
      });

      const req = httpMock.expectOne(config.buildApiUrl('categories'));
      expect(req.request.method).toBe('GET');
      req.flush(MOCK_CATEGORIES);
    });
  });

  describe('getCategory', () => {
    it('should GET categories/:id and return the category', () => {
      const id = 'abc-123';
      service.getCategory(id).subscribe(category => {
        expect(category).toEqual(MOCK_CATEGORIES[0]);
      });

      const req = httpMock.expectOne(config.buildApiUrl(`categories/${id}`));
      expect(req.request.method).toBe('GET');
      req.flush(MOCK_CATEGORIES[0]);
    });
  });

  describe('createCategory', () => {
    it('should POST to categories and return the created category', () => {
      const payload: CreateCategoryRequest = { name: 'Postres', description: 'Postres árabes' };
      const created: CategoryDto = { id: 3, ...payload };

      service.createCategory(payload).subscribe(category => {
        expect(category).toEqual(created);
      });

      const req = httpMock.expectOne(config.buildApiUrl('categories'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(created);
    });
  });

  describe('updateCategory', () => {
    it('should PUT to categories/:id and return the updated category', () => {
      const id = 'abc-123';
      const payload: CreateCategoryRequest = { name: 'Entradas actualizado' };
      const updated: CategoryDto = { id: 1, ...payload };

      service.updateCategory(id, payload).subscribe(category => {
        expect(category).toEqual(updated);
      });

      const req = httpMock.expectOne(config.buildApiUrl(`categories/${id}`));
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.flush(updated);
    });
  });

  describe('deleteCategory', () => {
    it('should DELETE categories/:id', () => {
      const id = 'abc-123';
      service.deleteCategory(id).subscribe();

      const req = httpMock.expectOne(config.buildApiUrl(`categories/${id}`));
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
