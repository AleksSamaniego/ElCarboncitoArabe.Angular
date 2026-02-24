export interface ProductDto {
  id: number;
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  isAvailable: boolean;
  imageUrl?: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  isAvailable: boolean;
  imageUrl?: string;
}
