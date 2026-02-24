import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OrdersApiService, ChangeTypeRequest } from './orders-api.service';
import { AppConfigService } from '../config/app-config.service';
import {
  OrderDto,
  CreateOrderRequest,
  UpdateOrderRequest,
  CheckoutRequest,
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus
} from '../../shared/models';

const MOCK_ORDER: OrderDto = {
  id: 'order-guid-1',
  type: OrderType.DineIn,
  status: OrderStatus.Pending,
  paymentStatus: PaymentStatus.Unpaid,
  tableId: 'table-guid-1',
  tableNumber: 1,
  items: [],
  subtotal: 10,
  tax: 1,
  total: 11,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

describe('OrdersApiService', () => {
  let service: OrdersApiService;
  let httpMock: HttpTestingController;
  let config: AppConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(OrdersApiService);
    httpMock = TestBed.inject(HttpTestingController);
    config = TestBed.inject(AppConfigService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getActiveOrders', () => {
    it('should GET orders/active and return orders', () => {
      service.getActiveOrders().subscribe(orders => {
        expect(orders).toEqual([MOCK_ORDER]);
      });

      const req = httpMock.expectOne(config.buildApiUrl('orders/active'));
      expect(req.request.method).toBe('GET');
      req.flush([MOCK_ORDER]);
    });
  });

  describe('getOrder', () => {
    it('should GET orders/:id and return the order', () => {
      service.getOrder('order-guid-1').subscribe(order => {
        expect(order).toEqual(MOCK_ORDER);
      });

      const req = httpMock.expectOne(config.buildApiUrl('orders/order-guid-1'));
      expect(req.request.method).toBe('GET');
      req.flush(MOCK_ORDER);
    });
  });

  describe('createOrder', () => {
    it('should POST to orders and return the created order', () => {
      const createReq: CreateOrderRequest = {
        type: OrderType.DineIn,
        tableId: 'table-guid-1',
        items: [{ productId: 'product-guid-1', quantity: 2 }]
      };

      service.createOrder(createReq).subscribe(order => {
        expect(order).toEqual(MOCK_ORDER);
      });

      const req = httpMock.expectOne(config.buildApiUrl('orders'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createReq);
      req.flush(MOCK_ORDER);
    });
  });

  describe('updateOrder', () => {
    it('should PUT to orders/:id and return the updated order', () => {
      const updateReq: UpdateOrderRequest = {
        type: OrderType.DineIn,
        tableId: 'table-guid-1',
        items: [{ productId: 'product-guid-1', quantity: 3 }]
      };

      service.updateOrder('order-guid-1', updateReq).subscribe(order => {
        expect(order).toEqual(MOCK_ORDER);
      });

      const req = httpMock.expectOne(config.buildApiUrl('orders/order-guid-1'));
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateReq);
      req.flush(MOCK_ORDER);
    });
  });

  describe('sendToKitchen', () => {
    it('should POST to orders/:id/send-to-kitchen', () => {
      service.sendToKitchen('order-guid-1').subscribe(order => {
        expect(order).toEqual(MOCK_ORDER);
      });

      const req = httpMock.expectOne(config.buildApiUrl('orders/order-guid-1/send-to-kitchen'));
      expect(req.request.method).toBe('POST');
      req.flush(MOCK_ORDER);
    });
  });

  describe('changeStatus', () => {
    it('should POST to orders/:id/status with the new status', () => {
      service.changeStatus('order-guid-1', OrderStatus.InProgress).subscribe(order => {
        expect(order).toEqual(MOCK_ORDER);
      });

      const req = httpMock.expectOne(config.buildApiUrl('orders/order-guid-1/status'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ status: OrderStatus.InProgress });
      req.flush(MOCK_ORDER);
    });
  });

  describe('cancelOrder', () => {
    it('should POST to orders/:id/cancel', () => {
      service.cancelOrder('order-guid-1').subscribe(order => {
        expect(order).toEqual(MOCK_ORDER);
      });

      const req = httpMock.expectOne(config.buildApiUrl('orders/order-guid-1/cancel'));
      expect(req.request.method).toBe('POST');
      req.flush(MOCK_ORDER);
    });
  });

  describe('checkout', () => {
    it('should POST to orders/:id/checkout with the checkout request', () => {
      const checkoutReq: CheckoutRequest = { orderId: 'order-guid-1', paymentMethod: PaymentMethod.Cash };

      service.checkout('order-guid-1', checkoutReq).subscribe(order => {
        expect(order).toEqual(MOCK_ORDER);
      });

      const req = httpMock.expectOne(config.buildApiUrl('orders/order-guid-1/checkout'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(checkoutReq);
      req.flush(MOCK_ORDER);
    });
  });

  describe('changeType', () => {
    it('should POST to orders/:id/change-type with the change type request', () => {
      const changeTypeReq: ChangeTypeRequest = { type: OrderType.TakeAway };

      service.changeType('order-guid-1', changeTypeReq).subscribe(order => {
        expect(order).toEqual(MOCK_ORDER);
      });

      const req = httpMock.expectOne(config.buildApiUrl('orders/order-guid-1/change-type'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(changeTypeReq);
      req.flush(MOCK_ORDER);
    });
  });

  describe('getOrderHistory', () => {
    it('should GET orders/history without date param', () => {
      service.getOrderHistory().subscribe(orders => {
        expect(orders).toEqual([MOCK_ORDER]);
      });

      const req = httpMock.expectOne(config.buildApiUrl('orders/history'));
      expect(req.request.method).toBe('GET');
      req.flush([MOCK_ORDER]);
    });

    it('should GET orders/history with date param when provided', () => {
      service.getOrderHistory('2024-01-01').subscribe(orders => {
        expect(orders).toEqual([MOCK_ORDER]);
      });

      const req = httpMock.expectOne(r => r.url === config.buildApiUrl('orders/history') && r.params.get('date') === '2024-01-01');
      expect(req.request.method).toBe('GET');
      req.flush([MOCK_ORDER]);
    });
  });
});
