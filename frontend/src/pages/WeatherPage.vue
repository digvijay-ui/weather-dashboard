<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import clearDayIcon from '@meteocons/svg/fill/clear-day.svg'
import overcastDayIcon from '@meteocons/svg/fill/overcast-day.svg'
import partlyCloudyDayIcon from '@meteocons/svg/fill/partly-cloudy-day.svg'
import rainIcon from '@meteocons/svg/fill/rain.svg'
import windIcon from '@meteocons/svg/fill/wind.svg'
import TemperatureDisplay from '@/components/TemperatureDisplay.vue'
import WeatherBackground from '@/components/WeatherBackground.vue'
import { useWeatherStore } from '@/stores/weather'

type WeatherTheme = 'sunny' | 'rainy' | 'windy' | 'cloudy'

const weatherStore = useWeatherStore()
const selectedForecastIndex = ref(0)

const activeTheme = computed<WeatherTheme>(() =>
  getWeatherTheme(weatherStore.currentWeather?.condition ?? ''),
)

const formattedUpdatedAt = computed(() => {
  const updatedAtIso = weatherStore.currentWeather?.updatedAtIso

  if (!updatedAtIso) {
    return ''
  }

  return new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(updatedAtIso))
})

const selectedForecastDay = computed(
  () => weatherStore.forecast?.days[selectedForecastIndex.value] ?? null,
)

watch(
  () => weatherStore.forecast?.days,
  () => {
    selectedForecastIndex.value = 0
  },
)

watch(
  () => weatherStore.cityInput,
  () => {
    weatherStore.clearError()
  },
)

async function handleSearch(): Promise<void> {
  const trimmedCity = weatherStore.cityInput.trim()

  if (!trimmedCity) {
    await weatherStore.searchWeather()
    return
  }

  weatherStore.clearError()
  weatherStore.cityInput = trimmedCity

  await weatherStore.searchWeather()
}

function getWeatherTheme(condition: string): WeatherTheme {
  const normalizedCondition = condition.toLowerCase()

  if (normalizedCondition.includes('rain')) {
    return 'rainy'
  }

  if (normalizedCondition.includes('wind')) {
    return 'windy'
  }

  if (normalizedCondition.includes('sun') || normalizedCondition.includes('clear')) {
    return 'sunny'
  }

  return 'cloudy'
}

function getMeteoconIcon(condition: string): string {
  const normalizedCondition = condition.toLowerCase()

  if (normalizedCondition.includes('rain')) {
    return rainIcon
  }

  if (normalizedCondition.includes('wind')) {
    return windIcon
  }

  if (normalizedCondition.includes('sun') || normalizedCondition.includes('clear')) {
    return clearDayIcon
  }

  if (normalizedCondition.includes('partly')) {
    return partlyCloudyDayIcon
  }

  return overcastDayIcon
}
</script>

<template>
  <main class="relative min-h-screen overflow-hidden text-white">
    <WeatherBackground :theme="activeTheme" />

    <div class="absolute inset-0 -z-10 bg-[#1a0a33]/20" aria-hidden="true" />

    <header class="border-b border-white/15 bg-black/10 backdrop-blur-sm">
      <div class="flex w-full flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
        <div class="mr-auto flex items-center gap-3">
          <img
            class="size-10"
            :src="partlyCloudyDayIcon"
            alt=""
            width="40"
            height="40"
            aria-hidden="true"
          />

          <p class="text-lg font-semibold tracking-normal">Weather Dashboard</p>
        </div>

        <div class="lg:ml-auto lg:w-[560px]">
          <form class="grid gap-3 sm:grid-cols-[1fr_auto_auto]" @submit.prevent="handleSearch">
            <label class="sr-only" for="city-search">City name</label>
            <input
              id="city-search"
              v-model="weatherStore.cityInput"
              class="min-h-12 w-full rounded-2xl border border-white/15 bg-white/[0.08] px-4 text-white shadow-lg outline-none transition placeholder:text-white/65 focus:border-white/70 focus:ring-2 focus:ring-white/30 disabled:opacity-70"
              type="text"
              placeholder="Enter city"
              :disabled="weatherStore.isLoading"
            />

            <button
              class="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              :disabled="weatherStore.isLoading"
            >
              <Icon icon="mdi:magnify" class="size-5" aria-hidden="true" />
              <span>Search</span>
            </button>

            <button
              class="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.08] px-5 text-sm font-semibold text-white shadow-lg transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              :disabled="weatherStore.isLoading"
              @click="weatherStore.refreshWeather"
            >
              <Icon
                v-if="!weatherStore.isLoading"
                icon="mdi:refresh"
                class="size-5"
                aria-hidden="true"
              />
            <span
              v-if="weatherStore.isLoading"
              class="size-4 animate-spin rounded-full border-2 border-white/25 border-t-white shadow-[0_0_14px_rgba(255,255,255,0.35)]"
            />

              <span>
                {{ weatherStore.isLoading ? 'Refreshing...' : 'Refresh' }}
              </span>
            </button>
          </form>

          <div
            v-if="weatherStore.error"
            class="mt-3 rounded-2xl border border-white/15 bg-white/[0.08] p-3 text-sm text-white shadow-2xl backdrop-blur-xl"
            role="alert"
          >
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p>
                {{ weatherStore.error.message }}
              </p>
              <button
                class="self-start rounded-full bg-white/[0.08] px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/50"
                type="button"
                @click="weatherStore.searchWeather"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="mx-auto flex w-full max-w-[1200px] flex-col px-4 pb-8 sm:px-6 lg:px-8">
      <section
        v-if="weatherStore.isLoading && !weatherStore.hasWeatherData"
        class="flex min-h-[70vh] items-center justify-center text-center"
        aria-live="polite"
      >
        <div
          class="rounded-[2rem] border border-white/15 bg-white/[0.08] px-10 py-9 shadow-2xl backdrop-blur-xl"
        >
          <div class="relative mx-auto size-20">
            <div class="absolute inset-0 rounded-full border border-white/15" />
            <div
              class="absolute inset-1 animate-spin rounded-full border-4 border-white/20 border-t-white shadow-[0_0_30px_rgba(255,255,255,0.35)]"
            />
            <div class="absolute inset-6 rounded-full bg-white/20 shadow-[0_0_24px_rgba(162,57,202,0.55)]" />
          </div>
          <p class="mt-6 text-lg font-semibold">Loading weather…</p>
          <p class="mt-2 text-sm text-white/65">Fetching the latest forecast</p>
        </div>
      </section>

      <template
        v-else-if="
          weatherStore.hasWeatherData && weatherStore.currentWeather && weatherStore.forecast
        "
      >
        <div
          class="transition duration-300"
          :class="weatherStore.isLoading ? 'opacity-80 motion-safe:animate-pulse' : ''"
        >
          <section class="relative flex min-h-[55vh] items-center justify-center py-12 text-center">
            <div
              v-if="weatherStore.isLoading"
              class="absolute inset-x-0 top-1/2 z-10 mx-auto flex w-fit -translate-y-1/2 items-center gap-3 rounded-full border border-white/15 bg-white/[0.08] px-5 py-3 text-sm font-semibold shadow-2xl backdrop-blur-xl"
              aria-live="polite"
            >
              <span
                class="size-5 animate-spin rounded-full border-2 border-white/25 border-t-white shadow-[0_0_14px_rgba(255,255,255,0.35)]"
              />
              Refreshing weather
            </div>

            <div class="flex max-w-3xl flex-col items-center">
              <p class="text-xl font-semibold sm:text-2xl">
                {{ weatherStore.currentWeather.city }},
                {{ weatherStore.currentWeather.country }}
              </p>

              <img
                class="mt-6 size-[120px] drop-shadow-2xl sm:size-[170px]"
                :src="getMeteoconIcon(weatherStore.currentWeather.condition)"
                :alt="weatherStore.currentWeather.condition"
                width="170"
                height="170"
              />

              <div class="mt-3 flex justify-center">
                <TemperatureDisplay
                  :temperature="weatherStore.currentWeather.temperatureC"
                  :city="weatherStore.currentWeather.city"
                />
              </div>

              <p class="mt-3 text-2xl font-medium sm:text-3xl">
                {{ weatherStore.currentWeather.condition }}
              </p>

              <p class="mt-3 text-sm text-white/75 sm:text-base">
                Last updated: {{ formattedUpdatedAt }}
              </p>
            </div>
          </section>

          <section
            class="flex flex-col gap-6 border-y border-white/20 py-6 text-center sm:flex-row sm:justify-between sm:text-left"
          >
            <div class="sm:w-1/3">
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
                Condition
              </p>
              <p class="mt-2 text-xl font-semibold">
                {{ weatherStore.currentWeather.condition }}
              </p>
            </div>

            <div class="sm:w-1/3">
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
                Humidity
              </p>
              <p class="mt-2 text-xl font-semibold">
                {{ weatherStore.currentWeather.humidityPercent }}%
              </p>
            </div>

            <div class="sm:w-1/3">
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">Wind</p>
              <p class="mt-2 text-xl font-semibold">
                {{ weatherStore.currentWeather.windKmph }} km/h
              </p>
            </div>
          </section>

          <section class="pt-8">
            <h2 class="text-2xl font-semibold">5-Day Forecast</h2>

            <div
              class="-mx-4 mt-4 flex gap-5 overflow-x-auto border-y border-white/20 px-4 py-4 sm:mx-0 sm:px-0"
            >
              <button
                v-for="(day, index) in weatherStore.forecast.days"
                :key="day.dateIso"
                class="min-w-40 flex-1 text-left transition hover:text-white disabled:cursor-default"
                :class="selectedForecastIndex === index ? 'text-white' : 'text-white/70'"
                type="button"
                @click="selectedForecastIndex = index"
              >
                <p class="text-sm font-semibold">
                  {{ day.dateIso }}
                </p>

                <img
                  class="mt-3 size-14"
                  :src="getMeteoconIcon(day.condition)"
                  :alt="day.condition"
                  width="64"
                  height="64"
                />

                <p class="mt-3 text-sm text-white/75">
                  {{ day.condition }}
                </p>

                <p class="mt-2 text-sm font-semibold">Min {{ day.minTempC }}°C</p>
                <p class="text-sm font-semibold">Max {{ day.maxTempC }}°C</p>
              </button>
            </div>

            <div v-if="selectedForecastDay" class="pt-5">
              <p class="text-sm font-semibold uppercase tracking-[0.14em] text-white/60">
                Selected forecast detail
              </p>
              <div
                class="mt-3 flex flex-col gap-4 border-b border-white/20 pb-5 sm:flex-row sm:justify-between"
              >
                <p>
                  <span class="block text-white/60">Date</span>
                  <span class="font-semibold">{{ selectedForecastDay.dateIso }}</span>
                </p>
                <p>
                  <span class="block text-white/60">Condition</span>
                  <span class="font-semibold">{{ selectedForecastDay.condition }}</span>
                </p>
                <p>
                  <span class="block text-white/60">Min</span>
                  <span class="font-semibold">{{ selectedForecastDay.minTempC }}°C</span>
                </p>
                <p>
                  <span class="block text-white/60">Max</span>
                  <span class="font-semibold">{{ selectedForecastDay.maxTempC }}°C</span>
                </p>
              </div>
            </div>
          </section>
        </div>
      </template>

      <section v-else class="flex min-h-[70vh] items-center justify-center text-center">
        <div class="flex max-w-md flex-col items-center">
          <img
            class="size-[130px] drop-shadow-2xl sm:size-[170px]"
            :src="partlyCloudyDayIcon"
            alt=""
            width="170"
            height="170"
            aria-hidden="true"
          />
          <p class="mt-6 text-2xl font-semibold">Search for Bengaluru to load weather.</p>
        </div>
      </section>
    </div>
  </main>
</template>
