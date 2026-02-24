export interface PlatformDto {
  id: string;
  name: string;
  commissionRate: number;
}

export interface CreatePlatformRequest {
  name: string;
  commissionRate: number;
}
