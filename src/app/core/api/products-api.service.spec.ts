import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductsApiService } from './products-api.service';
import { AppConfigService } from '../config/app-config.service';
import { CreateProductRequest, ProductDto } from '../../shared/models';

const MOCK_PRODUCTS: ProductDto[] = [
  { id: 1, name: 'Shawarma', price: 5.5, categoryId: 1, isAvailable: true },
  { id: 2, name: 'Falafel', price: 3.0, categoryId: 1, isAvailable: false }
];

describe('ProductsApiService', () => {
  let service: ProductsApiService;
  let httpMock: HttpTestingController;
  let config: AppConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
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
      service.getProducts().subscribe(products => {
        expect(products).toEqual(MOCK_PRODUCTS);
      });

      const req = httpMock.expectOne(config.buildApiUrl('products'));
      expect(req.request.method).toBe('GET');
      req.flush(MOCK_PRODUCTS);
    });
  });

  describe('createProduct', () => {
    it('should POST to the products endpoint and return the created product', () => {
      const payload: CreateProductRequest = {
        name: 'Shawarma',
        price: 5.5,
        categoryId: 1,
        isAvailable: true
      };
      const created: ProductDto = { id: 3, ...payload };

      service.createProduct(payload).subscribe(product => {
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
      const payload: CreateProductRequest = {
        name: 'Shawarma actualizado',
        price: 6.0,
        categoryId: 1,
        isAvailable: true
      };
      const updated: ProductDto = { id: 1, ...payload };

      service.updateProduct(1, payload).subscribe(product => {
        expect(product).toEqual(updated);
      });

      const req = httpMock.expectOne(config.buildApiUrl('products/1'));
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.flush(updated);
    });
  });
});

