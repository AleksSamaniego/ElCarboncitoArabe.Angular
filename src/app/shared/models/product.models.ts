export interface ProductDto {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  isAvailable: boolean;
  imageUrl?: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  isAvailable: boolean;
  imageUrl?: string;
}
