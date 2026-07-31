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
import { formatForecastDate } from '@/utils/weatherFormat'

type WeatherTheme = 'sunny' | 'rainy' | 'windy' | 'cloudy'

const weatherStore = useWeatherStore()
const selectedForecastIndex = ref<number | null>(null)

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

const selectedForecastDay = computed(() =>
  selectedForecastIndex.value === null
    ? null
    : (weatherStore.forecast?.days[selectedForecastIndex.value] ?? null),
)

const displayCondition = computed(
  () => selectedForecastDay.value?.condition ?? weatherStore.currentWeather?.condition ?? '',
)

const displayTemperature = computed(
  () => selectedForecastDay.value?.maxTempC ?? weatherStore.currentWeather?.temperatureC ?? 0,
)

const displayUpdatedLabel = computed(() =>
  selectedForecastDay.value
    ? `Forecast for ${formatForecastDate(selectedForecastDay.value.dateIso)}`
    : `Last updated: ${formattedUpdatedAt.value}`,
)

const activeTheme = computed<WeatherTheme>(() => getWeatherTheme(displayCondition.value))

watch(
  () => weatherStore.forecast?.days,
  () => {
    selectedForecastIndex.value = null
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

function selectForecastDay(index: number): void {
  selectedForecastIndex.value = selectedForecastIndex.value === index ? null : index
}

function resetForecastSelection(): void {
  selectedForecastIndex.value = null
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

    <div class="absolute inset-0 -z-10 bg-[#1a0a33]/10" aria-hidden="true" />

    <header class="bg-black/10 backdrop-blur-sm">
      <div class="flex w-full flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
        <div class="mr-auto flex items-center gap-3">
          <img
            class="weather-icon-float size-10"
            :src="partlyCloudyDayIcon"
            alt=""
            width="40"
            height="40"
            aria-hidden="true"
          />

          <p class="font-[var(--font-heading)] text-lg font-semibold tracking-normal">
            Weather Dashboard
          </p>
        </div>

        <div class="lg:ml-auto lg:w-[560px]">
          <form class="grid gap-3 sm:grid-cols-[1fr_auto_auto]" @submit.prevent="handleSearch">
            <label class="sr-only" for="city-search">City name</label>
            <input
              id="city-search"
              v-model="weatherStore.cityInput"
              class="min-h-12 w-full rounded-full border border-white/15 bg-white/[0.09] px-5 text-white shadow-[0_14px_45px_rgba(20,5,40,0.24)] outline-none backdrop-blur-xl transition placeholder:text-white/60 focus:border-amber-200/60 focus:bg-white/[0.12] focus:ring-2 focus:ring-amber-200/45 disabled:opacity-70"
              type="text"
              placeholder="Enter city"
              :disabled="weatherStore.isLoading"
            />

            <button
              class="flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#2b1055] shadow-[0_12px_35px_rgba(255,255,255,0.18)] transition hover:-translate-y-0.5 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-200/60 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              type="submit"
              :disabled="weatherStore.isLoading"
            >
              <Icon icon="mdi:magnify" class="size-5" aria-hidden="true" />
              <span>Search</span>
            </button>

            <button
              class="flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.09] px-5 text-sm font-semibold text-white shadow-[0_14px_45px_rgba(20,5,40,0.24)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-fuchsia-200/50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
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
              <p class="font-[var(--font-heading)] text-xl font-semibold sm:text-2xl">
                {{ weatherStore.currentWeather.city }},
                {{ weatherStore.currentWeather.country }}
              </p>

              <img
                class="weather-icon-float mt-6 size-[120px] drop-shadow-[0_26px_60px_rgba(251,191,36,0.2)] sm:size-[170px]"
                :src="getMeteoconIcon(displayCondition)"
                :alt="displayCondition"
                width="170"
                height="170"
              />

              <div class="mt-3 flex justify-center">
                <TemperatureDisplay
                  :temperature="displayTemperature"
                  :city="weatherStore.currentWeather.city"
                />
              </div>

              <p class="mt-3 font-[var(--font-heading)] text-2xl font-medium sm:text-3xl">
                {{ displayCondition }}
              </p>

              <p class="mt-3 text-sm text-white/75 sm:text-base">
                {{ displayUpdatedLabel }}
              </p>

              <button
                v-if="selectedForecastDay"
                class="mt-4 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-xl transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-amber-200/50"
                type="button"
                @click="resetForecastSelection"
              >
                Back to live weather
              </button>
            </div>
          </section>

          <section
            class="weather-section-divider flex flex-col gap-7 py-7 text-center sm:flex-row sm:justify-between sm:text-left"
          >
            <div class="sm:w-1/3">
              <p class="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-white/55">
                Condition
              </p>
              <p class="mt-2 font-[var(--font-heading)] text-xl font-semibold">
                {{ displayCondition }}
              </p>
            </div>

            <div class="sm:w-1/3">
              <p class="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-white/55">
                Humidity
              </p>
              <p class="mt-2 font-[var(--font-heading)] text-xl font-semibold">
                {{ weatherStore.currentWeather.humidityPercent }}%
              </p>
            </div>

            <div class="sm:w-1/3">
              <p class="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-white/55">
                Wind
              </p>
              <p class="mt-2 font-[var(--font-heading)] text-xl font-semibold">
                {{ weatherStore.currentWeather.windKmph }} km/h
              </p>
            </div>
          </section>

          <section class="pt-10">
            <h2 class="font-[var(--font-heading)] text-2xl font-semibold">5-Day Forecast</h2>

            <div
              class="forecast-strip mt-5 grid grid-cols-2 gap-4 py-5 lg:grid-cols-5"
            >
              <button
                v-for="(day, index) in weatherStore.forecast.days"
                :key="day.dateIso"
                class="w-full rounded-[1.25rem] border p-4 text-left shadow-lg backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_20px_55px_rgba(20,5,40,0.34)] disabled:cursor-default"
                :class="
                  selectedForecastIndex === index
                    ? 'border-amber-200/45 bg-white/[0.16] text-white'
                    : index === 0
                      ? 'border-fuchsia-200/25 bg-fuchsia-200/[0.13] text-white'
                      : 'border-white/12 bg-white/[0.07] text-white/72 hover:border-white/25 hover:text-white'
                "
                type="button"
                @click="selectForecastDay(index)"
              >
                <div class="flex items-center justify-between gap-2">
                  <p class="text-sm font-semibold">
                    {{ formatForecastDate(day.dateIso) }}
                  </p>
                  <span
                    v-if="selectedForecastIndex === index || index === 0"
                    class="rounded-full bg-amber-200 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.06em] text-[#2b1055]"
                  >
                    {{ selectedForecastIndex === index ? 'Selected' : 'Today' }}
                  </span>
                </div>

                <img
                  class="weather-icon-float mt-4 size-14 drop-shadow-[0_12px_24px_rgba(251,191,36,0.18)]"
                  :src="getMeteoconIcon(day.condition)"
                  :alt="day.condition"
                  width="64"
                  height="64"
                />

                <p class="mt-3 text-sm text-white/72">
                  {{ day.condition }}
                </p>

                <p class="mt-3 text-sm font-semibold">Min {{ day.minTempC }}°C</p>
                <p class="text-sm font-semibold text-amber-100">Max {{ day.maxTempC }}°C</p>
              </button>
            </div>

            <div v-if="selectedForecastDay" class="pt-5">
              <p class="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-white/55">
                Selected forecast detail
              </p>
              <div
                class="forecast-detail-divider mt-3 flex flex-col gap-4 pb-5 sm:flex-row sm:justify-between"
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
