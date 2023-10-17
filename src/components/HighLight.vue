<template>
  <template v-if="search">
    <template
      v-for="(fragment, i) in text
        .toString()
        .split(new RegExp(`(?<=${search})|(?=${search})`, 'i'))"
      :key="i"
    >
      <mark
        v-if="fragment.toLowerCase() === search.toLowerCase()"
        :key="i"
        class="bg-high-light p-0"
      >
        {{ fragment }}
      </mark>
      <template v-else>{{ fragment }}</template>
    </template>
  </template>
  <template v-else>{{ text }}</template>
</template>

<script lang="ts" setup name="HighLight">
defineProps({
  text: { type: String, required: true },
  search: { type: String, required: true }
})
</script>
