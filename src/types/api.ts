export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  data: T;
  error?: never;
}

export interface ApiErrorResponse {
  data?: never;
  error: ApiError;
}
