/**
 * API client for communicating with the ExamGuard backend.
 */
import axios, { AxiosError } from 'axios';
import type * as T from './types';
import ErrorHandler from './error-handler';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor to include JWT token and CSRF token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add CSRF token to state-changing requests
    const method = config.method?.toLowerCase();
    if (method && ['post', 'put', 'patch', 'delete'].includes(method)) {
      try {
        const { getCsrfHeaders } = require('@/lib/security/csrf');
        const csrfHeaders = getCsrfHeaders();
        Object.assign(config.headers, csrfHeaders);
      } catch {
        // Security module unavailable - continue without CSRF header
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle 401 - token expired/invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    // Process error through centralized error handler
    const appError = ErrorHandler.getInstance().handleError(error, {
      endpoint: error.config?.url,
      method: error.config?.method,
    });
    
    // Re-throw the AppError so callers get typed errors
    return Promise.reject(appError);
  }
);

// Helper function for handling API calls with loading and error states
export async function apiCall<T>(
  apiFunction: () => Promise<any>,
  onSuccess?: (data: T) => void,
  onError?: (error: Error) => void
): Promise<{ data?: T; error?: Error }> {
  try {
    const response = await apiFunction();
    const data = response.data as T;
    if (onSuccess) onSuccess(data);
    return { data };
  } catch (error) {
    const err = error as Error;
    if (onError) onError(err);
    return { error: err };
  }
}

// ============================================================================
// Auth API
// ============================================================================
export const authAPI = {
  login: (email: string, password: string) =>
    api.post<T.LoginResponse>('/api/auth/login', { email, password }),
  
  register: (data: T.RegisterRequest) =>
    api.post<T.User>('/api/auth/register', data),
  
  getCurrentUser: () =>
    api.get<T.User>('/api/auth/me'),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/api/auth/change-password', { 
      current_password: currentPassword, 
      new_password: newPassword 
    }),
};

// ============================================================================
// Users API
// ============================================================================
export const usersAPI = {
  list: (params?: { role?: string }) =>
    api.get<T.User[]>('/api/users', { params }),
  
  get: (id: number) =>
    api.get<T.User>(`/api/users/${id}`),
  
  create: (data: Partial<T.User>) =>
    api.post<T.User>('/api/users', data),
  
  update: (id: number, data: Partial<T.User>) =>
    api.patch<T.User>(`/api/users/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/api/users/${id}`),
};

// ============================================================================
// Plans API
// ============================================================================
export const plansAPI = {
  list: (status?: string) =>
    api.get<T.Plan[]>('/api/plans', { params: { status } }),
  
  get: (id: number) =>
    api.get<T.Plan>(`/api/plans/${id}`),
  
  create: (data: Partial<T.Plan>) =>
    api.post<T.Plan>('/api/plans', data),
  
  update: (id: number, data: Partial<T.Plan>) =>
    api.patch<T.Plan>(`/api/plans/${id}`, data),
  
  approve: (id: number) =>
    api.post<T.Plan>(`/api/plans/${id}/approve`),
  
  publish: (id: number) =>
    api.post<T.Plan>(`/api/plans/${id}/publish`),
  
  delete: (id: number) =>
    api.delete(`/api/plans/${id}`),
};

// ============================================================================
// Courses API
// ============================================================================
export const coursesAPI = {
  list: (params?: { branch?: string; semester?: number }) =>
    api.get<T.Course[]>('/api/courses', { params }),
  
  get: (id: number) =>
    api.get<T.Course>(`/api/courses/${id}`),
  
  create: (data: Partial<T.Course>) =>
    api.post<T.Course>('/api/courses', data),
  
  update: (id: number, data: Partial<T.Course>) =>
    api.patch<T.Course>(`/api/courses/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/api/courses/${id}`),
};

// ============================================================================
// Students API
// ============================================================================
export const studentsAPI = {
  list: (params?: { branch?: string; semester?: number }) =>
    api.get<T.Student[]>('/api/students', { params }),
  
  get: (id: number) =>
    api.get<T.Student>(`/api/students/${id}`),
  
  create: (data: Partial<T.Student>) =>
    api.post<T.Student>('/api/students', data),
  
  update: (id: number, data: Partial<T.Student>) =>
    api.patch<T.Student>(`/api/students/${id}`, data),
  
  enroll: (id: number, courseIds: number[]) =>
    api.post(`/api/students/${id}/enroll`, { 
      student_id: id, 
      course_ids: courseIds 
    }),
  
  delete: (id: number) =>
    api.delete(`/api/students/${id}`),
};

// ============================================================================
// Rooms API
// ============================================================================
export const roomsAPI = {
  list: () =>
    api.get<T.Room[]>('/api/rooms'),
  
  get: (id: number) =>
    api.get<T.Room>(`/api/rooms/${id}`),
  
  create: (data: Partial<T.Room>) =>
    api.post<T.Room>('/api/rooms', data),
  
  update: (id: number, data: Partial<T.Room>) =>
    api.patch<T.Room>(`/api/rooms/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/api/rooms/${id}`),
};

// ============================================================================
// Schedules API
// ============================================================================
export const schedulesAPI = {
  list: (planId?: number) =>
    api.get<T.Schedule[]>('/api/schedules', { params: { plan_id: planId } }),
  
  get: (id: number) =>
    api.get<T.Schedule>(`/api/schedules/${id}`),
};

// ============================================================================
// Seating API
// ============================================================================
export const seatingAPI = {
  list: (params?: { scheduled_exam_id?: number; room_id?: number }) =>
    api.get<T.SeatAssignment[]>('/api/seating', { params }),
  
  get: (id: number) =>
    api.get<T.SeatAssignment>(`/api/seating/${id}`),
};

// ============================================================================
// Invigilators API
// ============================================================================
export const invigilatorsAPI = {
  listAvailability: (userId?: number) =>
    api.get<T.InvigilatorAvailability[]>('/api/invigilators/availability', { 
      params: { user_id: userId } 
    }),
  
  createAvailability: (data: Partial<T.InvigilatorAvailability>) =>
    api.post<T.InvigilatorAvailability>('/api/invigilators/availability', data),
  
  listAssignments: (params?: { scheduled_exam_id?: number; user_id?: number }) =>
    api.get<T.InvigilatorAssignment[]>('/api/invigilators/assignments', { params }),
  
  confirmAssignment: (assignmentId: number, confirmed: boolean) =>
    api.post(`/api/invigilators/assignments/${assignmentId}/confirm`, { 
      assignment_id: assignmentId, 
      confirmed 
    }),
};

// ============================================================================
// Rules API
// ============================================================================
export const rulesAPI = {
  list: (params?: { category?: string; exam_type?: string }) =>
    api.get<T.Rule[]>('/api/rules', { params }),
  
  get: (id: number) =>
    api.get<T.Rule>(`/api/rules/${id}`),
  
  create: (data: Partial<T.Rule>) =>
    api.post<T.Rule>('/api/rules', data),
  
  update: (id: number, data: Partial<T.Rule>) =>
    api.patch<T.Rule>(`/api/rules/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/api/rules/${id}`),
};

// ============================================================================
// Engines v1 API (Legacy)
// ============================================================================
export const enginesAPI = {
  generateSchedule: (data: { 
    plan_id: number; 
    course_ids: number[]; 
    timeout_seconds?: number 
  }) =>
    api.post('/api/engines/schedule/generate', data),
  
  allocateRooms: (scheduledExamId: number) =>
    api.post('/api/engines/rooms/allocate', { scheduled_exam_id: scheduledExamId }),
  
  allocateSeats: (scheduledExamId: number) =>
    api.post('/api/engines/seats/allocate', { scheduled_exam_id: scheduledExamId }),
  
  assignInvigilators: (scheduledExamId: number, autoAssign = true) =>
    api.post('/api/engines/invigilators/assign', { 
      scheduled_exam_id: scheduledExamId, 
      auto_assign: autoAssign 
    }),
  
  validatePlan: (planId: number, includeDetails = true) =>
    api.post('/api/engines/validate', { 
      plan_id: planId, 
      include_details: includeDetails 
    }),
  
  generateReport: (data: { 
    plan_id: number; 
    report_type: string; 
    format: string 
  }) =>
    api.post('/api/engines/reports/generate', data),
  
  getDashboard: (planId: number) =>
    api.post<T.DashboardStats>('/api/engines/dashboard', { plan_id: planId }),
};

// ============================================================================
// Engines v2 API (Universal Engine Interface)
// ============================================================================
export const enginesV2API = {
  // List all registered engines
  listEngines: () =>
    api.get<{ engines: T.Engine[]; count: number }>('/api/engines/v2/'),
  
  // Get engine metadata
  getMetadata: (engineName: string) =>
    api.get<T.EngineMetadata>(`/api/engines/v2/${engineName}/metadata`),
  
  // Check engine health
  checkHealth: (engineName: string) =>
    api.get<T.EngineHealthCheck>(`/api/engines/v2/${engineName}/health`),
  
  // Execute engine
  execute: (engineName: string, inputData: any) =>
    api.post<T.EngineExecutionResponse>(`/api/engines/v2/${engineName}/execute`, {
      input_data: inputData
    }),
  
  // Get execution status
  getStatus: (engineName: string, executionId: string) =>
    api.get<T.EngineExecutionStatus>(`/api/engines/v2/${engineName}/status/${executionId}`),
  
  // Convenience methods for specific engines
  executeEngine1: (data: {
    plan_id: number;
    course_ids: number[];
    start_date: string;
    end_date: string;
    sessions: string[];
    user_id: number;
  }) =>
    api.post<T.EngineExecutionResponse>('/api/engines/v2/engine1-scheduling/execute', {
      input_data: data
    }),
  
  executeEngine2: (data: {
    scheduled_exam_ids: number[];
    exam_type: T.ExamType;
    operation: 'rooms' | 'seating' | 'both';
    user_id: number;
  }) =>
    api.post<T.EngineExecutionResponse>('/api/engines/v2/engine2-room-seating/execute', {
      input_data: data
    }),
  
  executeEngine3: (data: {
    scheduled_exam_ids: number[];
    exam_type: T.ExamType;
    operation: 'assign' | 'check_eligibility' | 'balance_workload' | 'send_notifications' | 'bulk_assign';
    include_relief?: boolean;
    include_reserve?: boolean;
    user_id: number;
  }) =>
    api.post<T.EngineExecutionResponse>('/api/engines/v2/engine3-invigilator/execute', {
      input_data: data
    }),
};

// ============================================================================
// Course Registrations API
// ============================================================================
export const courseRegistrationsAPI = {
  list: (params?: { student_id?: number; course_id?: number; semester?: number }) =>
    api.get<T.CourseRegistration[]>('/api/course-registrations', { params }),
  
  get: (id: number) =>
    api.get<T.CourseRegistration>(`/api/course-registrations/${id}`),
  
  create: (data: Partial<T.CourseRegistration>) =>
    api.post<T.CourseRegistration>('/api/course-registrations', data),
  
  update: (id: number, data: Partial<T.CourseRegistration>) =>
    api.patch<T.CourseRegistration>(`/api/course-registrations/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/api/course-registrations/${id}`),
  
  bulkEnroll: (studentId: number, courseIds: number[]) =>
    api.post('/api/course-registrations/bulk', {
      student_id: studentId,
      course_ids: courseIds
    }),
};

// ============================================================================
// Data Extraction API
// ============================================================================
export const dataExtractionAPI = {
  // Extract courses from CSV
  extractCourses: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<T.ExtractionResult>('/api/data-extraction/courses', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Extract students from CSV
  extractStudents: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<T.ExtractionResult>('/api/data-extraction/students', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Extract rooms from CSV
  extractRooms: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<T.ExtractionResult>('/api/data-extraction/rooms', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Extract course registrations from CSV
  extractRegistrations: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<T.ExtractionResult>('/api/data-extraction/registrations', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Extract faculty availability from CSV
  extractAvailability: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<T.ExtractionResult>('/api/data-extraction/availability', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Check for conflicts before bulk import
  checkConflicts: (entityType: string, data: any[]) =>
    api.post<T.ConflictCheck>('/api/data-extraction/check-conflicts', {
      entity_type: entityType,
      data
    }),
};

// ============================================================================
// File Upload API
// ============================================================================
export const uploadAPI = {
  // Single file upload
  uploadFile: (file: File, options?: { 
    onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void;
    category?: string;
    description?: string;
  }) => {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options?.category) {
      formData.append('category', options.category);
    }
    
    if (options?.description) {
      formData.append('description', options.description);
    }

    return api.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (options?.onProgress && progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          options.onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage,
          });
        }
      },
    });
  },

  // Multiple files upload
  uploadMultiple: (files: FileList | File[], options?: {
    onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void;
    batchSize?: number;
  }) => {
    const formData = new FormData();
    Array.from(files).forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    return api.post('/api/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (options?.onProgress && progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          options.onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage,
          });
        }
      },
    });
  },

  // Image upload with processing options
  uploadImage: (file: File, options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
    onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void;
  }) => {
    const formData = new FormData();
    formData.append('image', file);
    
    if (options?.maxWidth) formData.append('maxWidth', options.maxWidth.toString());
    if (options?.maxHeight) formData.append('maxHeight', options.maxHeight.toString());
    if (options?.quality) formData.append('quality', options.quality.toString());
    if (options?.format) formData.append('format', options.format);

    return api.post('/api/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (options?.onProgress && progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          options.onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage,
          });
        }
      },
    });
  },

  // Document upload
  uploadDocument: (file: File, options?: {
    extractText?: boolean;
    category?: 'academic' | 'administrative' | 'legal' | 'other';
    onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void;
  }) => {
    const formData = new FormData();
    formData.append('document', file);
    
    if (options?.extractText !== undefined) {
      formData.append('extractText', options.extractText.toString());
    }
    
    if (options?.category) {
      formData.append('category', options.category);
    }

    return api.post('/api/upload/document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (options?.onProgress && progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          options.onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage,
          });
        }
      },
    });
  },

  // CSV upload for data import (enhanced version of existing dataExtractionAPI)
  uploadCSV: (file: File, options: {
    entityType: 'courses' | 'students' | 'rooms' | 'registrations' | 'availability' | 'faculty' | 'departments';
    skipFirstRow?: boolean;
    delimiter?: ',' | ';' | '\t' | '|';
    encoding?: 'utf-8' | 'iso-8859-1' | 'windows-1252';
    validateHeaders?: boolean;
    onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void;
  }) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', options.entityType);
    
    if (options.skipFirstRow !== undefined) {
      formData.append('skipFirstRow', options.skipFirstRow.toString());
    }
    
    if (options.delimiter) formData.append('delimiter', options.delimiter);
    if (options.encoding) formData.append('encoding', options.encoding);
    if (options.validateHeaders !== undefined) {
      formData.append('validateHeaders', options.validateHeaders.toString());
    }

    return api.post('/api/upload/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (options?.onProgress && progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          options.onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage,
          });
        }
      },
    });
  },

  // Get upload progress
  getUploadProgress: (uploadId: string) =>
    api.get(`/api/upload/progress/${uploadId}`),

  // Cancel upload
  cancelUpload: (uploadId: string) =>
    api.delete(`/api/upload/cancel/${uploadId}`),

  // List uploaded files
  listFiles: (params?: { 
    category?: string; 
    type?: string; 
    limit?: number; 
    offset?: number 
  }) =>
    api.get('/api/upload/files', { params }),

  // Get file metadata
  getFileMetadata: (fileId: string) =>
    api.get(`/api/upload/files/${fileId}/metadata`),

  // Delete uploaded file
  deleteFile: (fileId: string) =>
    api.delete(`/api/upload/files/${fileId}`),

  // Generate download URL
  getDownloadUrl: (fileId: string, options?: { expiresIn?: number }) =>
    api.get(`/api/upload/files/${fileId}/download-url`, { params: options }),
};

export default api;
