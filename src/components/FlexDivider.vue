<script setup lang="ts">
import { TinyEmitter } from 'tiny-emitter'
import { reactive, ref, type PropType } from 'vue'
import { RightOutlined, LeftOutlined } from '@ant-design/icons-vue'

const emit = defineEmits(['update:widHgt', 'ltHbtnClick', 'rbHbtnClick'])
const props = defineProps({
  orientation: { type: String as PropType<'horizontal' | 'vertical'>, default: 'horizontal' },
  widHgt: { type: Number, required: true },
  emitter: { type: TinyEmitter, required: true },
  ctrlSide: { type: String as PropType<'leftTop' | 'rightBottom'>, default: 'right' },
  hideBtn: { type: String as PropType<'leftTop' | 'rightBottom' | ''>, default: '' },
  hideBtnVsb: { type: Boolean, default: true },
  bgColor: { type: String, default: 'inherit' }
})
const clsDict = {
  horizontal: 'w-full py-0.5 hover:cursor-ns-resize',
  vertical: 'h-full px-0.5 hover:cursor-ew-resize'
}
const begPos = ref(-1)
const orgWidHgt = reactive([props.widHgt, props.widHgt])
const hbAttrs = reactive({ pos: [50, 50], begPos: -1 })
const mosProp = props.orientation === 'vertical' ? 'clientX' : 'clientY'

props.emitter.on('mousemove', (e: MouseEvent) => {
  if (begPos.value !== -1) {
    const curPos = e[mosProp]
    const addSig = { leftTop: 1, rightBottom: -1 }[props.ctrlSide]
    orgWidHgt[1] = orgWidHgt[0] + addSig * (curPos - begPos.value)
    emit('update:widHgt', orgWidHgt[1])
  } else if (hbAttrs.begPos !== -1) {
    hbAttrs.pos[1] = hbAttrs.pos[0] + (e.clientY - hbAttrs.begPos)
  }
})
props.emitter.on('mouseup', () => {
  begPos.value = -1
  hbAttrs.begPos = -1
})

function onLytRszStart(e: MouseEvent) {
  begPos.value = e[mosProp]
  orgWidHgt[0] = orgWidHgt[1]
}
function onHdBtnMovStart(e: MouseEvent) {
  e.preventDefault()
  hbAttrs.begPos = e.clientY
  hbAttrs.pos[0] = hbAttrs.pos[1]
}
function onHdBtnMosUp(e: MouseEvent) {
  e.preventDefault()
  hbAttrs.begPos = -1
}
</script>

<template>
  <div class="relative" :style="{ backgroundColor: bgColor }">
    <a-button
      v-if="hideBtn === 'leftTop'"
      class="absolute right-1 border-e-0 rounded-e-none z-10"
      :style="{ top: hbAttrs.pos[1] + 'px' }"
      @mousedown="onHdBtnMovStart"
      @click="() => emit('ltHbtnClick')"
    >
      <template #icon><RightOutlined /></template>
    </a-button>
    <a-button :class="clsDict[orientation]" @mousedown="onLytRszStart" />
    <a-button
      v-if="hideBtn === 'rightBottom'"
      class="absolute left-1 border-s-0 rounded-s-none z-10"
      :style="{ top: hbAttrs.pos[1] + 'px' }"
      @mousedown="onHdBtnMovStart"
      @click="() => emit('rbHbtnClick')"
    >
      <template #icon><RightOutlined /></template>
    </a-button>
  </div>
</template>
