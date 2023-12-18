<script lang="ts" setup name="LabelItem">
import { computed } from 'vue'

const props = defineProps({
  value: { type: [Object, String, Number], required: true },
  prop: { type: String, default: '' },
  subPrp: { type: String, default: '' },
  mapper: { type: Object, default: () => ({}) }
})
const title = computed(() => pickText(props.prop))
const desc = computed(() => pickText(props.subPrp))

function pickText(prop: string) {
  let val: string
  if (typeof props.value === 'object') {
    if (prop && prop in props.value) {
      val = props.value[prop]
    } else {
      return ''
    }
  } else {
    val = props.value as string
  }
  return val in props.mapper ? props.mapper[val] : val
}
</script>

<template>
  <a-list-item-meta :description="desc">
    <template #title>{{ title }}</template>
  </a-list-item-meta>
</template>
