<script lang="ts" setup name="LabelItem">
import { computed } from 'vue'

const props = defineProps({
  value: { type: [Object, String, Number], required: true },
  prop: { type: String, default: '' },
  subPrp: { type: String, default: '' },
  dict: { type: Object, default: () => ({}) },
  tip: { type: String, default: '' }
})
const title = computed(() => pickText(props.prop))
const desc = computed(() => props.subPrp ? pickText(props.subPrp) : '')

function pickText(prop: string): string {
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
  return val in props.dict ? props.dict[val] : val
}
</script>

<template>
  <a-tooltip>
    <template v-if="tip" #title>{{ tip }}</template>
    <a-space>
      <a-typography-text strong>{{ title }}</a-typography-text>
      <a-typography-text type="secondary">{{ desc }}</a-typography-text>
    </a-space>
  </a-tooltip>
</template>
