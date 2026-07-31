<script setup lang="ts">
import { computed } from 'vue'

type WeatherTheme = 'sunny' | 'rainy' | 'windy' | 'cloudy'

interface Props {
  theme: WeatherTheme
}

const props = defineProps<Props>()

const themeClass = computed(() => `weather-background--${props.theme}`)
</script>

<template>
  <div class="weather-background" :class="themeClass" aria-hidden="true">
    <div class="weather-background__mesh weather-background__mesh--one" />
    <div class="weather-background__mesh weather-background__mesh--two" />
    <div class="weather-background__mesh weather-background__mesh--three" />
    <div class="weather-background__glow" />
    <div class="weather-background__lines" />
    <div class="weather-background__particles" />
  </div>
</template>

<style scoped>
.weather-background {
  position: absolute;
  inset: 0;
  z-index: -10;
  overflow: hidden;
  background:
    radial-gradient(circle at 30% 20%, #8f3cff 0%, #5d1f92 34%, transparent 62%),
    radial-gradient(circle at 78% 12%, rgb(255 180 74 / 0.34), transparent 24rem),
    radial-gradient(circle at 72% 78%, rgb(216 70 239 / 0.42), transparent 28rem),
    linear-gradient(135deg, #1a0a33 0%, #2b1055 42%, #4a1a7a 72%, #1a0a33 100%);
}

.weather-background--rainy {
  background:
    radial-gradient(circle at 34% 18%, #6d28d9 0%, #3b136f 38%, transparent 64%),
    radial-gradient(circle at 70% 80%, rgb(168 85 247 / 0.36), transparent 28rem),
    linear-gradient(135deg, #13051f 0%, #251044 48%, #3b136f 100%);
}

.weather-background--windy {
  background:
    radial-gradient(circle at 24% 22%, #a855f7 0%, #6d28d9 30%, transparent 60%),
    radial-gradient(circle at 78% 76%, rgb(244 114 182 / 0.32), transparent 28rem),
    linear-gradient(135deg, #18072d 0%, #3b136f 50%, #5b21b6 100%);
}

.weather-background--sunny {
  background:
    radial-gradient(circle at 28% 20%, rgb(251 191 36 / 0.72), transparent 18rem),
    radial-gradient(circle at 52% 34%, #a855f7 0%, #6d28d9 32%, transparent 62%),
    radial-gradient(circle at 78% 78%, rgb(236 72 153 / 0.42), transparent 28rem),
    linear-gradient(135deg, #1a0a33 0%, #3b136f 44%, #6d28d9 100%);
}

.weather-background__mesh {
  position: absolute;
  width: 34rem;
  height: 34rem;
  border-radius: 9999px;
  opacity: 0.48;
  filter: blur(54px);
  mix-blend-mode: screen;
  animation: drift-mesh 18s ease-in-out infinite alternate;
}

.weather-background__mesh--one {
  top: 10%;
  left: -8rem;
  background: rgb(168 85 247 / 0.7);
}

.weather-background__mesh--two {
  right: -8rem;
  bottom: 6%;
  background: rgb(236 72 153 / 0.56);
  animation-delay: -6s;
}

.weather-background__mesh--three {
  top: 30%;
  right: 18%;
  width: 24rem;
  height: 24rem;
  background: rgb(251 191 36 / 0.32);
  animation-delay: -10s;
}

.weather-background__glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 42%, rgb(255 255 255 / 0.12), transparent 22rem),
    radial-gradient(circle at 82% 18%, rgb(251 191 36 / 0.16), transparent 18rem);
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
  animation: drift-lines 22s ease-in-out infinite alternate;
}

.weather-background__particles {
  position: absolute;
  inset: 0;
  opacity: 0.32;
  background-image:
    radial-gradient(circle, rgb(255 255 255 / 0.6) 0 1px, transparent 1.5px),
    radial-gradient(circle, rgb(251 191 36 / 0.5) 0 1px, transparent 1.5px);
  background-position:
    0 0,
    30px 45px;
  background-size:
    90px 90px,
    130px 130px;
  animation: float-particles 18s linear infinite;
}

@keyframes drift-mesh {
  from {
    transform: translate3d(0, 0, 0) scale(1);
  }

  to {
    transform: translate3d(4rem, -2rem, 0) scale(1.08);
  }
}

@keyframes drift-lines {
  from {
    transform: rotate(-12deg) translateX(-1.5rem);
  }

  to {
    transform: rotate(-12deg) translateX(1.5rem);
  }
}

@keyframes float-particles {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(-90px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .weather-background__mesh,
  .weather-background__lines,
  .weather-background__particles {
    animation: none;
  }
}
</style>
