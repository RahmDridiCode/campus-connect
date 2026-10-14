// Types des objets renvoyés par l'API (propositions, avis, signalements, ...)

export interface PersonLite {
  id: string;
  fullName: string;
  email?: string;
  skills?: string[];
}

export interface Proposal {
  id: string;
  requestId: string;
  proposerId: string;
  message: string;
  availabilities: string[];
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  proposer?: PersonLite;
  request?: {
    id: string;
    title: string;
    subject: string;
    status: string;
    author: { id: string; fullName: string };
  };
}

export interface Review {
  id: string;
  requestId: string;
  authorId: string;
  targetId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  author?: PersonLite;
  target?: PersonLite;
}

export interface Report {
  id: string;
  requestId: string;
  reason: string;
  description?: string | null;
  status: 'PENDING' | 'REVIEWED' | 'DISMISSED';
  notes?: string | null;
  createdAt: string;
  reporter?: PersonLite;
  request?: { id: string; title: string; author: { id: string; fullName: string } };
}

export interface Recommendation {
  userId: string;
  fullName: string;
  specialty: string;
  studyLevel: string;
  skills: string[];
  score: number;
  reasons: string[];
  averageRating: number | null;
}

export interface DashboardData {
  totalRequests: number;
  openRequests: number;
  completedRequests: number;
  totalProposals: number;
  receivedProposals: number;
  pendingProposals: number;
  acceptedProposals: number;
  totalReviews: number;
  averageRating: number | null;
  recentRequests: { id: string; title: string; status: string; createdAt: string }[];
  recentProposals: {
    id: string;
    status: string;
    request: { id: string; title: string };
    createdAt: string;
  }[];
}

export function errorMessage(err: any, fallback = 'Une erreur est survenue'): string {
  const data = err?.response?.data;
  if (data?.errors) {
    const first = Object.values(data.errors as Record<string, string[]>)[0];
    if (first?.[0]) return first[0];
  }
  return data?.message || fallback;
}
