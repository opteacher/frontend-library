<script lang="ts">
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'LabelItem',
  props: {
    value: { type: Object, required: true },
    prop: { type: String, default: '' },
    mapper: { type: Object, default: () => ({}) }
  },
  setup(props) {
    const fnlText = computed(() => {
      const val = props.prop && props.prop in props.value ? props.value[props.prop] : props.value
      return val in props.mapper ? props.mapper[val] : val
    })

    return { fnlText }
  }
})
</script>

<template>{{ fnlText }}</template>
