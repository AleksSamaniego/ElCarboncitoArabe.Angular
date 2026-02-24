import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { PaymentMethodsApiService } from './payment-methods-api.service';
import { AppConfigService } from '../config/app-config.service';
import { PaymentMethodDto } from '../../shared/models';

const MOCK_PAYMENT_METHODS: PaymentMethodDto[] = [
  { value: 0, name: 'Cash' },
  { value: 1, name: 'Card' },
  { value: 2, name: 'Transfer' },
];

describe('PaymentMethodsApiService', () => {
  let service: PaymentMethodsApiService;
  let httpMock: HttpTestingController;
  let config: AppConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(PaymentMethodsApiService);
    httpMock = TestBed.inject(HttpTestingController);
    config = TestBed.inject(AppConfigService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPaymentMethods', () => {
    it('should GET payment-methods and return payment methods', () => {
      service.getPaymentMethods().subscribe((methods) => {
        expect(methods).toEqual(MOCK_PAYMENT_METHODS);
      });

      const req = httpMock.expectOne(config.buildApiUrl('payment-methods'));
      expect(req.request.method).toBe('GET');
      req.flush(MOCK_PAYMENT_METHODS);
    });
  });
});
