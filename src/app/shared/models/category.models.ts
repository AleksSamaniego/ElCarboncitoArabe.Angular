export interface CategoryDto {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateCategoryRequest {
  name: string;
  sortOrder: number;
}

export interface UpdateCategoryRequest {
  name: string;
  sortOrder: number;
  isActive: boolean;
}
