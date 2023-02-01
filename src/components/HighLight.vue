<template>
  <template
    v-for="(fragment, i) in text.toString().split(new RegExp(`(?<=${search})|(?=${search})`, 'i'))"
  >
    <mark v-if="fragment.toLowerCase() === search.toLowerCase()" :key="i" class="bg-high-light p-0">
      {{ fragment }}
    </mark>
    <template v-else>{{ fragment }}</template>
  </template>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'HighLight',
  props: {
    text: { type: String, required: true },
    search: { type: String, required: true }
  }
})
</script>
