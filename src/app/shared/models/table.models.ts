export interface TableDto {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateTableRequest {
  name: string;
}

export interface UpdateTableRequest {
  name: string;
  isActive: boolean;
}
