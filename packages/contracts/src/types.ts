export type RoleName = 'ADMIN' | 'DIRECTOR' | 'SUPERVISOR' | 'ADVISOR';

export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: RoleName;
  isActive: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
