export enum OrderType {
  DineIn = 'DineIn',
  TakeAway = 'TakeAway',
  Delivery = 'Delivery'
}

export enum OrderStatus {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Ready = 'Ready',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled'
}

export enum PaymentMethod {
  Cash = 'Cash',
  Card = 'Card',
  Transfer = 'Transfer'
}

export enum PaymentStatus {
  Unpaid = 'Unpaid',
  Paid = 'Paid',
  Refunded = 'Refunded'
}
