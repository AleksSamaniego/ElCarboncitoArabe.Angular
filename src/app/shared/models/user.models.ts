export enum UserRole {
  Waiter = 'Waiter',
  Kitchen = 'Kitchen',
  Admin = 'Admin',
  Owner = 'Owner',
}

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: UserRole | string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole | string;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  role: UserRole | string;
  isActive: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
