<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

interface Props {
  temperature: number
  city: string
}

type TemperatureDirection = 'up' | 'down' | 'same' | null

interface TemperatureCharacter {
  id: string
  value: string
  shouldFlip: boolean
}

const props = defineProps<Props>()

const displayedTemperature = ref(props.temperature)
const flippingCharacters = ref<Set<number>>(new Set())
const flipPhase = ref<'out' | 'in' | null>(null)
const direction = ref<TemperatureDirection>(null)
const showDirection = ref(false)
const prefersReducedMotion = ref(false)

let flipTimer: ReturnType<typeof window.setTimeout> | null = null
let badgeTimer: ReturnType<typeof window.setTimeout> | null = null
let mediaQuery: MediaQueryList | null = null
let handleMotionChange: ((event: MediaQueryListEvent) => void) | null = null

const storageKey = computed(() => `weather-temperature-${props.city.toLowerCase()}`)

const temperatureText = computed(() => `${displayedTemperature.value}°C`)
const propTemperatureText = computed(() => `${props.temperature}°C`)

const characters = computed<TemperatureCharacter[]>(() =>
  Array.from(temperatureText.value).map((value, index) => ({
    id: `${index}-${value}`,
    value,
    shouldFlip: flippingCharacters.value.has(index),
  })),
)

const directionLabel = computed(() => {
  if (direction.value === 'up') {
    return '▲'
  }

  if (direction.value === 'down') {
    return '▼'
  }

  if (direction.value === 'same') {
    return 'No change'
  }

  return ''
})

const directionClasses = computed(() => {
  if (direction.value === 'up') {
    return 'bg-orange-500/20 text-orange-100'
  }

  if (direction.value === 'down') {
    return 'bg-blue-500/20 text-blue-100'
  }

  return 'bg-slate-500/20 text-slate-200'
})

function clearTimers(): void {
  if (flipTimer !== null) {
    window.clearTimeout(flipTimer)
    flipTimer = null
  }

  if (badgeTimer !== null) {
    window.clearTimeout(badgeTimer)
    badgeTimer = null
  }
}

function getChangedDigitIndexes(previousText: string, nextText: string): Set<number> {
  const indexes = new Set<number>()

  Array.from(nextText).forEach((character, index) => {
    const previousCharacter = previousText[index]

    if (
      /\d/.test(character) &&
      /\d/.test(previousCharacter ?? '') &&
      character !== previousCharacter
    ) {
      indexes.add(index)
    }
  })

  return indexes
}

function updateDirection(previousTemperature: number, nextTemperature: number): void {
  if (nextTemperature > previousTemperature) {
    direction.value = 'up'
  } else if (nextTemperature < previousTemperature) {
    direction.value = 'down'
  } else {
    direction.value = 'same'
  }

  showDirection.value = true
  badgeTimer = window.setTimeout(() => {
    showDirection.value = false
  }, 2_000)
}

function saveCurrentTemperature(): void {
  localStorage.setItem(storageKey.value, String(props.temperature))
}

onMounted(() => {
  const storedTemperature = localStorage.getItem(storageKey.value)

  if (storedTemperature === null) {
    saveCurrentTemperature()
  }

  if (typeof window.matchMedia !== 'function') {
    return
  }

  mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefersReducedMotion.value = mediaQuery.matches

  handleMotionChange = (event: MediaQueryListEvent): void => {
    prefersReducedMotion.value = event.matches
  }

  mediaQuery.addEventListener('change', handleMotionChange)
})

watch(
  () => [props.temperature, props.city] as const,
  ([nextTemperature], [previousTemperature]) => {
    if (nextTemperature === previousTemperature) {
      return
    }

    clearTimers()

    const previousStoredTemperature = Number(localStorage.getItem(storageKey.value))
    const previousTemperatureValue = Number.isFinite(previousStoredTemperature)
      ? previousStoredTemperature
      : previousTemperature
    const changedDigitIndexes = getChangedDigitIndexes(
      `${previousTemperatureValue}°C`,
      propTemperatureText.value,
    )

    if (prefersReducedMotion.value || changedDigitIndexes.size === 0) {
      displayedTemperature.value = nextTemperature
      saveCurrentTemperature()
      updateDirection(previousTemperatureValue, nextTemperature)
      return
    }

    flippingCharacters.value = changedDigitIndexes
    flipPhase.value = 'out'

    flipTimer = window.setTimeout(() => {
      displayedTemperature.value = nextTemperature
      saveCurrentTemperature()
      updateDirection(previousTemperatureValue, nextTemperature)
      flipPhase.value = 'in'

      flipTimer = window.setTimeout(() => {
        flippingCharacters.value = new Set()
        flipPhase.value = null
      }, 300)
    }, 300)
  },
)

onBeforeUnmount(() => {
  clearTimers()

  if (mediaQuery !== null && handleMotionChange !== null) {
    mediaQuery.removeEventListener('change', handleMotionChange)
  }
})
</script>

<template>
  <div class="flex flex-wrap items-center justify-center gap-3" aria-live="polite">
    <div
      class="flex items-end font-black leading-none tracking-normal text-white drop-shadow-[0_12px_38px_rgba(162,57,202,0.45)]"
    >
      <span
        v-for="character in characters"
        :key="character.id"
        class="digit-perspective inline-block min-w-[0.58em] text-center text-7xl sm:text-8xl lg:text-9xl"
        :class="{
          'min-w-[0.36em] text-5xl sm:text-6xl lg:text-7xl': !/\\d/.test(character.value),
        }"
      >
        <span
          class="inline-block origin-center"
          :class="{
            'flip-out': character.shouldFlip && flipPhase === 'out',
            'flip-in': character.shouldFlip && flipPhase === 'in',
          }"
        >
          {{ character.value }}
        </span>
      </span>
    </div>

    <Transition
      :enter-from-class="prefersReducedMotion ? '' : 'opacity-0 translate-y-1'"
      :enter-active-class="prefersReducedMotion ? '' : 'duration-300'"
      :enter-to-class="prefersReducedMotion ? '' : 'opacity-100 translate-y-0'"
      :leave-active-class="prefersReducedMotion ? '' : 'duration-200'"
      :leave-to-class="prefersReducedMotion ? '' : 'opacity-0'"
    >
      <span
        v-if="showDirection && direction"
        class="rounded-full px-3 py-1 text-xs font-semibold transition"
        :class="directionClasses"
      >
        {{ directionLabel }}
      </span>
    </Transition>
  </div>
</template>

<style scoped>
.digit-perspective {
  perspective: 500px;
}

.flip-out {
  animation: flip-out 300ms ease-in forwards;
}

.flip-in {
  animation: flip-in 300ms ease-out forwards;
}

@keyframes flip-out {
  from {
    opacity: 1;
    transform: rotateX(0deg);
  }

  to {
    opacity: 0;
    transform: rotateX(-90deg);
  }
}

@keyframes flip-in {
  from {
    opacity: 0;
    transform: rotateX(90deg);
  }

  to {
    opacity: 1;
    transform: rotateX(0deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .flip-out,
  .flip-in {
    animation: none;
  }
}
</style>
