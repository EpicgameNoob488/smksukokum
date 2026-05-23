const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/access-request`;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface CreateRequestParams {
  email: string;
  fullName: string;
  password: string;
  requestType?: 'teacher' | 'admin';
  confirmedDuplicate?: boolean;
  matchedTeacherName?: string;
}

interface ListRequestsResponse {
  requests: Array<{
    id: string;
    email: string;
    full_name: string;
    request_type: string;
    status: string;
    created_at: string;
    updated_at: string;
    reviewed_by: string | null;
    reviewed_at: string | null;
    notes: string | null;
  }>;
}

interface PendingRoleAssignmentsResponse {
  requests: Array<{
    id: string;
    full_name: string;
    email: string;
    status: string;
    reviewed_at: string | null;
    matched_teacher_name: string | null;
  }>;
}

interface ApiResponse {
  success?: boolean;
  error?: string;
  message?: string;
  warning?: string;
  requiresConfirmation?: boolean;
}

interface SimilarName {
  name: string;
  similarity: number;
  source: string;
}

interface FindSimilarNamesResponse {
  similarNames: SimilarName[];
}

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
}

interface ListUsersResponse {
  users: User[];
}

async function callEdgeFunction<T>(body: Record<string, unknown>): Promise<T> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  findSimilarNames: async (name: string, threshold?: number): Promise<FindSimilarNamesResponse> => {
    return callEdgeFunction<FindSimilarNamesResponse>({
      action: 'findSimilarNames',
      name,
      threshold,
    });
  },

  createRequest: async ({ email, fullName, password, requestType = 'teacher', confirmedDuplicate, matchedTeacherName }: CreateRequestParams): Promise<ApiResponse> => {
    return callEdgeFunction<ApiResponse>({
      action: 'create',
      email,
      fullName,
      password,
      requestType,
      confirmedDuplicate,
      matchedTeacherName,
    });
  },

  listRequests: async (): Promise<ListRequestsResponse> => {
    return callEdgeFunction<ListRequestsResponse>({
      action: 'list',
    });
  },

  approveRequest: async (requestId: string, notes?: string): Promise<ApiResponse> => {
    return callEdgeFunction<ApiResponse>({
      action: 'approve',
      requestId,
      notes,
    });
  },

  rejectRequest: async (requestId: string, notes?: string): Promise<ApiResponse> => {
    return callEdgeFunction<ApiResponse>({
      action: 'reject',
      requestId,
      notes,
    });
  },

  listUsers: async (): Promise<ListUsersResponse> => {
    return callEdgeFunction<ListUsersResponse>({
      action: 'listUsers',
    });
  },

  resetPassword: async (userId: string, newPassword: string): Promise<ApiResponse> => {
    return callEdgeFunction<ApiResponse>({
      action: 'resetPassword',
      userId,
      newPassword,
    });
  },

  resendEmail: async (requestId: string): Promise<ApiResponse> => {
    return callEdgeFunction<ApiResponse>({
      action: 'resend',
      requestId,
    });
  },

  pendingRoleAssignments: async (): Promise<PendingRoleAssignmentsResponse> => {
    return callEdgeFunction<PendingRoleAssignmentsResponse>({
      action: 'pendingRoleAssignments',
    });
  },
};

export type { CreateRequestParams, ListRequestsResponse, ApiResponse, ListUsersResponse, User, PendingRoleAssignmentsResponse };
