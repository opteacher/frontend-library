<script setup lang="ts">
import type { MapperType } from '../types/mapper'
import { TinyEmitter } from 'tiny-emitter'
import { ref, type PropType } from 'vue'
import FieldItem from './FieldItem.vue'
import { getProp } from '../utils'

const errMsgs = ref<string[]>([])
const props = defineProps({
  mapper: {
    type: Object as PropType<MapperType>,
    required: true
  },
  form: { type: Object, required: true },
  emitter: { type: TinyEmitter, default: null }
})
const emit = defineEmits(['update:form'])
defineExpose({ validField })

function validField() {
  errMsgs.value = []
  for (const rule of props.mapper.rules) {
    if (rule.required && !getProp(props.form, props.mapper.key)) {
      errMsgs.value.push(rule?.message as string)
    }
  }
  return errMsgs.value.length === 0
}
</script>

<template>
  <FieldItem
    :mapper="mapper"
    :form="form"
    :skey="mapper.key"
    @update:fprop="(vals: any) => emit('update:form', vals)"
  />
  <ul class="list-none ps-0 mb-0">
    <li v-for="msg in errMsgs">
      <a-typography-text type="danger">{{ msg }}</a-typography-text>
    </li>
  </ul>
</template>
