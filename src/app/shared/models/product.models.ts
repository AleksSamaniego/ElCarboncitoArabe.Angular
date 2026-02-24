export interface ProductDto {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateProductRequest {
  categoryId: string;
  name: string;
  price: number;
}

export interface UpdateProductRequest {
  categoryId: string;
  name: string;
  price: number;
  isActive: boolean;
}
