<script lang="ts" setup name="LabelItem">
import { computed } from 'vue'

const props = defineProps({
  value: { type: [Object, String, Number], required: true },
  prop: { type: String, default: '' },
  mapper: { type: Object, default: () => ({}) },
  tooltip: { type: String, default: '' }
})
const fnlText = computed(() => {
  let val: string
  if (typeof props.value === 'object' && props.prop && props.prop in props.value) {
    val = props.value[props.prop]
  } else {
    val = props.value as string
  }
  return val in props.mapper ? props.mapper[val] : val
})
</script>

<template>
  <a-tooltip v-if="tooltip">
    <template #title>{{ (value as any)[tooltip] }}</template>
    {{ fnlText }}
  </a-tooltip>
  <template v-else>{{ fnlText }}</template>
</template>
