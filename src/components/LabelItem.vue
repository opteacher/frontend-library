<script lang="ts">
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'LabelItem',
  props: {
    value: { type: [Object, String], required: true },
    prop: { type: String, default: '' },
    mapper: { type: Object, default: () => ({}) }
  },
  setup(props) {
    const fnlText = computed(() => {
      let val: string
      if (typeof props.value === 'object' && props.prop && props.prop in props.value) {
        val = props.value[props.prop]
      } else {
        val = props.value as string
      }
      return val in props.mapper ? props.mapper[val] : val
    })

    return { fnlText }
  }
})
</script>

<template>{{ fnlText }}</template>
