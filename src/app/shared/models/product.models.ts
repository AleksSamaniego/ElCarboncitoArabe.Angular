export interface ProductDto {
  id: number;
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  isAvailable: boolean;
  imageUrl?: string;
}
