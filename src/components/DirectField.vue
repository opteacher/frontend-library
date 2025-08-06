<script setup lang="ts">
import type { MapperType } from '@/types/mapper'
import { TinyEmitter } from 'tiny-emitter'
import { ref, type PropType } from 'vue'
import FieldItem from './FieldItem.vue'

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

if (props.emitter) {
  props.emitter.on('check:rules', (callback: Function) => {
    errMsgs.value = []
    for (const rule of props.mapper.rules) {
      if (rule.required && !props.form[props.mapper.key]) {
        errMsgs.value.push(rule?.message as string)
      }
    }
    callback(errMsgs.value.length === 0)
  })
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
