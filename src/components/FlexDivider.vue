<script setup lang="ts">
import { TinyEmitter } from 'tiny-emitter'
import { reactive, ref, type PropType } from 'vue'

const emit = defineEmits(['update:widHgt'])
const props = defineProps({
  orientation: { type: String as PropType<'horizontal' | 'vertical'>, default: 'horizontal' },
  widHgt: { type: Number, required: true },
  emitter: { type: TinyEmitter, required: true },
  ctrlSide: { type: String as PropType<'left' | 'right'>, default: 'right' }
})
const clsDict = {
  horizontal: 'w-full py-0.5 hover:cursor-ns-resize',
  vertical: 'h-full px-0.5 hover:cursor-ew-resize'
}
const begPos = ref(-1)
const orgWidHgt = reactive([props.widHgt, props.widHgt])

props.emitter.on('mousemove', (e: MouseEvent) => {
  if (begPos.value !== -1) {
    const curPos = e[props.orientation === 'vertical' ? 'clientX' : 'clientY']
    const addSig = { left: 1, right: -1 }[props.ctrlSide]
    orgWidHgt[1] = orgWidHgt[0] + addSig * (curPos - begPos.value)
    emit('update:widHgt', orgWidHgt[1])
  }
})
props.emitter.on('mouseup', () => {
  begPos.value = -1
})

function onLytRszStart(e: MouseEvent) {
  begPos.value = e.clientX
  orgWidHgt[0] = orgWidHgt[1]
}
</script>

<template>
  <a-button :class="clsDict[orientation]" @mousedown="onLytRszStart" />
</template>
