export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUserDto;
}

export interface AuthUserDto {
  id: string;
  name: string;
  email: string;
  role: string;
}
