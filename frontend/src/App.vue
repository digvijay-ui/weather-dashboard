<script setup lang="ts">
const projectName = 'Weather Dashboard'
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-[#F3F1EB] px-4 text-[#20242B]">
    <section
      class="w-full max-w-xl rounded-2xl border border-[#DDE2E1] bg-white p-8 text-center shadow-sm"
    >
      <p class="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#C08A3E]">
        Frontend setup complete
      </p>

      <h1 class="text-3xl font-semibold sm:text-4xl">
        {{ projectName }}
      </h1>

      <p class="mt-4 text-sm leading-6 text-slate-600 sm:text-base">
        Vue, TypeScript, Pinia, Vue Router, Axios, Tailwind CSS and Vitest are ready.
      </p>
    </section>
  </main>
</template>
