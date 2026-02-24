export interface TableDto {
  id: number;
  number: number;
  capacity: number;
  isAvailable: boolean;
}

export interface CreateTableRequest {
  number: number;
  capacity: number;
}

export interface UpdateTableRequest {
  number: number;
  capacity: number;
  isAvailable: boolean;
}
