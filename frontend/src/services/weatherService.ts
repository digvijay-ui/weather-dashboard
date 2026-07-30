import apiClient from '@/services/apiClient'
import type { ApiSuccessResponse } from '@/types/api'
import type { CurrentWeather, WeatherForecast } from '@/types/weather'

async function getCurrentWeather(city: string): Promise<CurrentWeather> {
  const response = await apiClient.get<ApiSuccessResponse<CurrentWeather>>('/api/weather/current', {
    params: {
      city,
    },
  })

  return response.data.data
}

async function getForecast(city: string): Promise<WeatherForecast> {
  const response = await apiClient.get<ApiSuccessResponse<WeatherForecast>>(
    '/api/weather/forecast',
    {
      params: {
        city,
      },
    },
  )

  return response.data.data
}

export const weatherService = {
  getCurrentWeather,
  getForecast,
}
