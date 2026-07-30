export interface CurrentWeather {
  city: string
  country: string
  temperatureC: number
  condition: string
  humidityPercent: number
  windKmph: number
  updatedAtIso: string
}

export interface ForecastDay {
  dateIso: string
  minTempC: number
  maxTempC: number
  condition: string
}

export interface WeatherForecast {
  city: string
  country: string
  days: ForecastDay[]
}
