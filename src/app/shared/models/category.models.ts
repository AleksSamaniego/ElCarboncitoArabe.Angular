export interface CategoryDto {
  id: number;
  name: string;
  description?: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}
