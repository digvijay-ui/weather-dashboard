<script setup lang="ts">
type WeatherTheme = 'sunny' | 'rainy' | 'windy' | 'cloudy'

interface Props {
  theme: WeatherTheme
}

defineProps<Props>()
</script>

<template>
  <div class="weather-background" aria-hidden="true">
    <div class="weather-background__glow" />
    <div class="weather-background__lines" />
  </div>
</template>

<style scoped>
.weather-background {
  position: absolute;
  inset: 0;
  z-index: -10;
  overflow: hidden;
  background: radial-gradient(
    circle at 30% 20%,
    #7b2ff7 0%,
    #4a1a7a 35%,
    #2b1055 70%,
    #1a0a33 100%
  );
}

.weather-background__glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 42%, rgb(162 57 202 / 0.4), transparent 22rem),
    radial-gradient(circle at 82% 18%, rgb(123 47 247 / 0.3), transparent 18rem);
}

.weather-background__lines {
  position: absolute;
  inset: -20%;
  opacity: 0.28;
  background:
    radial-gradient(
      ellipse at 35% 35%,
      transparent 0 38%,
      rgb(255 255 255 / 0.28) 38.2% 38.6%,
      transparent 38.8%
    ),
    radial-gradient(
      ellipse at 62% 58%,
      transparent 0 44%,
      rgb(255 255 255 / 0.2) 44.2% 44.6%,
      transparent 44.8%
    ),
    radial-gradient(
      ellipse at 48% 70%,
      transparent 0 52%,
      rgb(255 255 255 / 0.16) 52.2% 52.5%,
      transparent 52.7%
    );
  transform: rotate(-12deg);
}
</style>
