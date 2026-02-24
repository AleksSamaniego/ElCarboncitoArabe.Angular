import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ProductsApiService } from './products-api.service';
import { AppConfigService } from '../config/app-config.service';
import {
  CreateProductRequest,
  ProductDto,
  UpdateProductRequest,
} from '../../shared/models';

const MOCK_PRODUCTS: ProductDto[] = [
  {
    id: 'guid-1',
    name: 'Shawarma',
    price: 5.5,
    categoryId: 'cat-guid-1',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: null,
  },
  {
    id: 'guid-2',
    name: 'Falafel',
    price: 3.0,
    categoryId: 'cat-guid-1',
    isActive: false,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: null,
  },
];

describe('ProductsApiService', () => {
  let service: ProductsApiService;
  let httpMock: HttpTestingController;
  let config: AppConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ProductsApiService);
    httpMock = TestBed.inject(HttpTestingController);
    config = TestBed.inject(AppConfigService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProducts', () => {
    it('should GET the products endpoint and return products', () => {
      service.getProducts().subscribe((products) => {
        expect(products).toEqual(MOCK_PRODUCTS);
      });

      const req = httpMock.expectOne(config.buildApiUrl('products'));
      expect(req.request.method).toBe('GET');
      req.flush(MOCK_PRODUCTS);
    });

    it('should GET products with optional query params', () => {
      service
        .getProducts({ categoryId: 'cat-1', page: 1, pageSize: 10 })
        .subscribe((products) => {
          expect(products).toEqual(MOCK_PRODUCTS);
        });

      const req = httpMock.expectOne(
        (r) =>
          r.url === config.buildApiUrl('products') &&
          r.params.get('categoryId') === 'cat-1' &&
          r.params.get('page') === '1' &&
          r.params.get('pageSize') === '10',
      );
      expect(req.request.method).toBe('GET');
      req.flush(MOCK_PRODUCTS);
    });
  });

  describe('getProduct', () => {
    it('should GET products/:id and return the product', () => {
      const id = 'abc-123';
      service.getProduct(id).subscribe((product) => {
        expect(product).toEqual(MOCK_PRODUCTS[0]);
      });

      const req = httpMock.expectOne(config.buildApiUrl(`products/${id}`));
      expect(req.request.method).toBe('GET');
      req.flush(MOCK_PRODUCTS[0]);
    });
  });

  describe('createProduct', () => {
    it('should POST to the products endpoint and return the created product', () => {
      const payload: CreateProductRequest = {
        name: 'Shawarma',
        price: 5.5,
        categoryId: 'cat-guid-1',
      };
      const created: ProductDto = {
        id: 'guid-3',
        name: payload.name,
        price: payload.price,
        categoryId: payload.categoryId,
        isActive: true,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: null,
      };

      service.createProduct(payload).subscribe((product) => {
        expect(product).toEqual(created);
      });

      const req = httpMock.expectOne(config.buildApiUrl('products'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(created);
    });
  });

  describe('updateProduct', () => {
    it('should PUT to the product endpoint and return the updated product', () => {
      const payload: UpdateProductRequest = {
        name: 'Shawarma actualizado',
        price: 6.0,
        categoryId: 'cat-guid-1',
        isActive: false,
      };
      const updated: ProductDto = {
        id: 'guid-1',
        name: payload.name,
        price: payload.price,
        categoryId: payload.categoryId,
        isActive: payload.isActive,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-04T00:00:00Z',
      };

      service.updateProduct('guid-1', payload).subscribe((product) => {
        expect(product).toEqual(updated);
      });

      const req = httpMock.expectOne(config.buildApiUrl('products/guid-1'));
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.flush(updated);
    });
  });

  describe('deleteProduct', () => {
    it('should DELETE products/:id', () => {
      const id = 'abc-123';
      service.deleteProduct(id).subscribe();

      const req = httpMock.expectOne(config.buildApiUrl(`products/${id}`));
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
