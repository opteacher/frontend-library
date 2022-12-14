<script setup lang="ts">
import { computed } from 'vue'
import Component from '../types/compo'
const props = defineProps({
  compo: Component
})
const attrs = computed(() => ({}))
</script>

<template>
  <component :is="props.compo?.name" v-bind="props.compo?.toAttributes()">
    <template v-if="!compo.children.length">
      {{ compo['#inner'] }}
    </template>
    <component-card v-else v-for="subCmp in compo.children" :key="subCmp.name" :compo="subCmp" />
  </component>
</template>
