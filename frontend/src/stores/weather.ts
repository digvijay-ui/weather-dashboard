import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getApiErrorDetails } from '@/services/apiError'
import { weatherService } from '@/services/weatherService'
import type { ApiErrorDetails } from '@/types/api'
import type { CurrentWeather, WeatherForecast } from '@/types/weather'

export const useWeatherStore = defineStore('weather', () => {
  const cityInput = ref('Bengaluru')
  const currentCity = ref('')
  const currentWeather = ref<CurrentWeather | null>(null)
  const forecast = ref<WeatherForecast | null>(null)
  const isLoading = ref(false)
  const error = ref<ApiErrorDetails | null>(null)

  const hasWeatherData = computed(
    () => currentWeather.value !== null && forecast.value !== null,
  )

  async function loadWeather(city: string, clearOldData: boolean): Promise<void> {
    if (isLoading.value) {
      return
    }

    const trimmedCity = city.trim()

    if (!trimmedCity) {
      error.value = {
        code: 'CITY_REQUIRED',
        message: 'Please enter a city name.',
      }

      return
    }

    isLoading.value = true
    error.value = null

    if (clearOldData) {
      currentCity.value = ''
      currentWeather.value = null
      forecast.value = null
    }

    try {
      const [currentResponse, forecastResponse] = await Promise.all([
        weatherService.getCurrentWeather(trimmedCity),
        weatherService.getForecast(trimmedCity),
      ])

      currentWeather.value = currentResponse
      forecast.value = forecastResponse
      currentCity.value = currentResponse.city
      cityInput.value = currentResponse.city
    } catch (caughtError: unknown) {
      error.value = getApiErrorDetails(caughtError)
    } finally {
      isLoading.value = false
    }
  }

  async function searchWeather(): Promise<void> {
    await loadWeather(cityInput.value, true)
  }

  async function refreshWeather(): Promise<void> {
    const city = currentCity.value || cityInput.value

    await loadWeather(city, false)
  }

  function clearError(): void {
    error.value = null
  }

  return {
    cityInput,
    currentCity,
    currentWeather,
    forecast,
    isLoading,
    error,
    hasWeatherData,
    searchWeather,
    refreshWeather,
    clearError,
  }
})
