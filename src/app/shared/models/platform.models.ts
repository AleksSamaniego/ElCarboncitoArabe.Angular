export interface PlatformDto {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreatePlatformRequest {
  name: string;
}

export interface UpdatePlatformRequest {
  name: string;
  isActive: boolean;
}
