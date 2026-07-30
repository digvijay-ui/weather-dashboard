export interface ApiSuccessResponse<T> {
  status: 'success'
  data: T
}

export interface ApiErrorDetails {
  code: string
  message: string
}

export interface ApiErrorResponse {
  status: 'error'
  error: ApiErrorDetails
}

export interface HealthResponse {
  status: 'success'
  message: string
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse
