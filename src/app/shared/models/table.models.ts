export interface TableDto {
  id: string;
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
