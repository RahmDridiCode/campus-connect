// ============================================
// User Types
// ============================================

export type UserRole = 'STUDENT' | 'ADMIN';
export type StudyLevel = 'BACHELOR' | 'MASTER' | 'PHD';

export interface User {
  id: string;
  email: string;
  fullName: string;
  specialty?: string;
  studyLevel: StudyLevel;
  skills: string[];
  availabilities?: string[];
  role: UserRole;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Auth Types
// ============================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  specialty?: string;
  studyLevel?: StudyLevel;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  error: string | null;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface AuthResponse {
  user: User;
  token: string;
}
