<script setup lang="ts">
import { TinyEmitter } from 'tiny-emitter'
import { reactive, ref, type PropType } from 'vue'

const emit = defineEmits(['update:widHgt'])
const props = defineProps({
  orientation: { type: String as PropType<'horizontal' | 'vertical'>, default: 'horizontal' },
  widHgt: { type: Number, required: true },
  emitter: { type: TinyEmitter, required: true }
})
const clsDict = {
  horizontal: 'w-full py-0.5 hover:cursor-ns-resize',
  vertical: 'h-full px-0.5 hover:cursor-ew-resize'
}
const rszRng = ref(-1)
const attrs = reactive([props.widHgt, props.widHgt])

props.emitter.on('mousemove', (e: MouseEvent) => {
  if (rszRng.value !== -1) {
    attrs[1] = attrs[0] - (e[props.orientation === 'vertical' ? 'clientX' : 'clientY'] - rszRng.value)
    emit('update:widHgt', attrs[1])
  }
})
props.emitter.on('mouseup', () => {
  rszRng.value = -1
})

function onLytRszStart(e: MouseEvent) {
  rszRng.value = e.clientX
  attrs[0] = attrs[1]
}
</script>

<template>
  <a-button :class="clsDict[orientation]" @mousedown="onLytRszStart" />
</template>
