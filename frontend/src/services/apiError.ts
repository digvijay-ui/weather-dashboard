import axios from 'axios'
import type { ApiErrorDetails, ApiErrorResponse } from '@/types/api'

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const response = value as Partial<ApiErrorResponse>

  if (response.status !== 'error') {
    return false
  }

  if (typeof response.error !== 'object' || response.error === null) {
    return false
  }

  return typeof response.error.code === 'string' && typeof response.error.message === 'string'
}

export function getApiErrorDetails(error: unknown): ApiErrorDetails {
  if (axios.isAxiosError(error)) {
    const responseData: unknown = error.response?.data

    if (isApiErrorResponse(responseData)) {
      return responseData.error
    }

    if (error.code === 'ECONNABORTED') {
      return {
        code: 'REQUEST_TIMEOUT',
        message: 'The weather request timed out. Please try again.',
      }
    }

    if (!error.response) {
      return {
        code: 'NETWORK_ERROR',
        message:
          'Unable to connect to the weather server. Please check that the backend is running.',
      }
    }
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'Something went wrong while loading weather data.',
  }
}
