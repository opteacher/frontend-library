<template>
  <template
    v-for="(fragment, i) in text.toString().split(new RegExp(`(?<=${search})|(?=${search})`, 'i'))"
  >
    <mark v-if="fragment.toLowerCase() === search.toLowerCase()" :key="i" class="highlight">
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
  },
  setup(props) {
    console.log(props.text, props.search)
  }
})
</script>

<style scoped>
.highlight {
  background-color: rgb(255, 192, 105);
  padding: 0px;
}
</style>
