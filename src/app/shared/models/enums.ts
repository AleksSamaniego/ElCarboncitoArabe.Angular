export enum OrderType {
  DineIn = 0,
  Takeaway = 1,
  Platform = 2,
}

export enum OrderStatus {
  Draft = 0,
  SentToKitchen = 1,
  Received = 2,
  InProgress = 3,
  Ready = 4,
  Delivered = 5,
  Cancelled = 6,
  Paid = 7,
}

export enum PaymentMethod {
  Cash = 0,
  Card = 1,
  Transfer = 2,
}

export enum PaymentStatus {
  Unpaid = 0,
  Paid = 1,
}
