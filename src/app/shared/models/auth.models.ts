export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserDto {
  id: string;
  username: string;
  email: string;
  role: string;
}
