// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
}

// User DTO (Data Transfer Object)
export interface UserDTO {
  id: string;
  email: string;
  fullName: string;
  specialty?: string;
  studyLevel: 'BACHELOR' | 'MASTER' | 'PHD';
  skills: string[];
  availabilities: string[];
  role: 'STUDENT' | 'ADMIN';
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Auth Requests/Responses
export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword?: string;
  fullName: string;
  specialty?: string;
  studyLevel?: 'BACHELOR' | 'MASTER' | 'PHD';
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Aliases for compatibility
export type RegisterInput = RegisterRequest;
export type LoginInput = LoginRequest;

export interface AuthResponse {
  user: UserDTO;
  token: string;
}

// API Error Response
export interface ErrorResponse {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
}

// API Success Response
export interface SuccessResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
