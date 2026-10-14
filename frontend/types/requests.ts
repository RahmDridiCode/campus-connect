export type RequiredLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type RequestStatus = 'OPEN' | 'HELP_ACCEPTED' | 'COMPLETED';

export interface HelpRequest {
  id: string;
  title: string;
  description: string;
  subject: string;
  requiredLevel: RequiredLevel;
  status: RequestStatus;
  availabilities: string[];
  author?: {
    id: string;
    email: string;
    fullName: string;
    skills: string[];
  };
  _count?: {
    proposals: number;
    reviews: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateRequestFormData {
  title: string;
  description: string;
  subject: string;
  requiredLevel: RequiredLevel;
  availabilities: string[];
}

export interface HelpRequestFilters {
  subject?: string;
  requiredLevel?: RequiredLevel;
  status?: RequestStatus;
  search?: string;
  mine?: 'true';
  page?: number;
  limit?: number;
}

export interface HelpRequestListResponse {
  data: HelpRequest[];
  pagination: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  };
}
