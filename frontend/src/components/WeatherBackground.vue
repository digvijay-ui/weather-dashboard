<script setup lang="ts">
type WeatherTheme = 'sunny' | 'rainy' | 'windy' | 'cloudy'

interface Props {
  theme: WeatherTheme
}

defineProps<Props>()
</script>

<template>
  <div
    class="absolute inset-0 -z-10 overflow-hidden bg-gradient-to-br from-sky-500 via-blue-700 to-blue-950"
    aria-hidden="true"
  />
</template>
