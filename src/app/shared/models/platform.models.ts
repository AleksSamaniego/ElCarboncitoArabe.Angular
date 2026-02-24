export interface PlatformDto {
  id: number;
  name: string;
  commissionRate: number;
}

export interface CreatePlatformRequest {
  name: string;
  commissionRate: number;
}
