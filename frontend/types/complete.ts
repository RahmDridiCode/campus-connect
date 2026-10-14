export interface User {
  id: string;
  fullName: string;
  email: string;
  specialty: string;
  studyLevel: string;
  skills: string[];
  role: 'STUDENT' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface HelpRequest {
  id: string;
  title: string;
  description: string;
  subject: string;
  requiredLevel: string;
  availabilities: string[];
  status: 'OPEN' | 'HELP_ACCEPTED' | 'COMPLETED';
  author: User;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  hidden?: boolean;
}

export interface HelpProposal {
  id: string;
  requestId: string;
  proposerId: string;
  proposer: User;
  message: string;
  availabilities: string[];
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  requestId: string;
  authorId: string;
  author: User;
  targetId: string;
  target: User;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Report {
  id: string;
  requestId: string;
  reporterId: string;
  reporter: User;
  reason: 'INAPPROPRIATE' | 'SPAM' | 'OTHER';
  description?: string;
  status: 'PENDING' | 'REVIEWED' | 'DISMISSED';
  notes?: string;
  handledById?: string;
  handledAt?: string;
  createdAt: string;
}

export interface StudentRecommendation {
  userId: string;
  fullName: string;
  specialty: string;
  studyLevel: string;
  email: string;
  skills: string[];
  score: number;
  reasons: string[];
  averageRating: number | null;
}

export interface DashboardStats {
  totalRequests: number;
  openRequests: number;
  completedRequests: number;
  totalProposals: number;
  pendingProposals: number;
  acceptedProposals: number;
  totalReviews: number;
  averageRating: number | null;
  recentRequests: HelpRequest[];
  recentProposals: Array<{
    id: string;
    status: string;
    request: { title: string };
    createdAt: string;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  specialty: string;
  studyLevel: string;
}

export interface UpdateProfileData {
  fullName?: string;
  specialty?: string;
  studyLevel?: string;
  skills?: string[];
}

export interface CreateRequestFormData {
  title: string;
  description: string;
  subject: string;
  requiredLevel: string;
  availabilities: string[];
}

export interface CreateProposalFormData {
  message: string;
  availabilities: string[];
}

export interface CreateReviewFormData {
  targetId: string;
  rating: number;
  comment?: string;
}

export interface HelpRequestFilters {
  subject?: string;
  requiredLevel?: string;
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
}
