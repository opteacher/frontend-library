<script setup lang="ts">
import { TinyEmitter } from 'tiny-emitter'
import { computed, reactive, ref, type PropType } from 'vue'
import { RightOutlined, LeftOutlined } from '@ant-design/icons-vue'
import { setProp } from '@/utils'

const emit = defineEmits(['update:widHgt', 'hbtnClick'])
const props = defineProps({
  orientation: { type: String as PropType<'horizontal' | 'vertical'>, default: 'horizontal' },
  widHgt: { type: Number, required: true },
  emitter: { type: TinyEmitter, required: true },
  ctrlSide: { type: String as PropType<'leftTop' | 'rightBottom'>, default: 'right' },
  hideBtn: { type: Boolean, default: true },
  isHide: { type: Boolean, default: false },
  hbtnPos: {
    type: Object as PropType<{
      top?: number | string
      left?: number | string
      right?: number | string
      bottom?: number | string
    }>,
    default: {}
  },
  bgColor: { type: String, default: 'inherit' },
  hbtnTxt: { type: String, default: '' }
})
const clsDict = {
  horizontal: 'w-full py-0.5 hover:cursor-ns-resize',
  vertical: 'h-full px-0.5 hover:cursor-ew-resize'
}
const begPos = ref(-1)
const orgWidHgt = reactive([props.widHgt, props.widHgt])
const mosProp = props.orientation === 'vertical' ? 'clientX' : 'clientY'
const hbtnStyle = computed(() => {
  switch (true) {
    case props.ctrlSide === 'leftTop' && props.orientation === 'vertical':
      return setProp(props.hbtnPos, 'left', '4px')
    case props.ctrlSide === 'rightBottom' && props.orientation === 'vertical':
      return setProp(props.hbtnPos, 'right', '4px')
    case props.ctrlSide === 'leftTop' && props.orientation === 'horizontal':
      return setProp(props.hbtnPos, 'top', '4px')
    case props.ctrlSide === 'rightBottom' && props.orientation === 'horizontal':
      return setProp(props.hbtnPos, 'bottom', '4px')
  }
})

props.emitter.on('mousemove', (e: MouseEvent) => {
  if (begPos.value !== -1) {
    const curPos = e[mosProp]
    const addSig = { leftTop: 1, rightBottom: -1 }[props.ctrlSide]
    orgWidHgt[1] = orgWidHgt[0] + addSig * (curPos - begPos.value)
    emit('update:widHgt', orgWidHgt[1])
  }
})
props.emitter.on('mouseup', () => {
  begPos.value = -1
})

function onLytRszStart(e: MouseEvent) {
  begPos.value = e[mosProp]
  orgWidHgt[0] = orgWidHgt[1]
}
</script>

<template>
  <div class="relative" :style="{ backgroundColor: bgColor }">
    <a-button
      class="absolute z-10 h-fit px-2"
      :class="{
        'border-s-0 rounded-s-none': ctrlSide === 'leftTop' && orientation === 'vertical',
        'border-e-0 rounded-e-none': ctrlSide === 'rightBottom' && orientation === 'vertical',
        'border-t-0 rounded-t-none': ctrlSide === 'leftTop' && orientation === 'horizontal',
        'border-b-0 rounded-b-none': ctrlSide === 'rightBottom' && orientation === 'horizontal'
      }"
      :style="hbtnStyle"
      @click="() => emit('hbtnClick')"
    >
      <template v-if="isHide" v-for="wd in hbtnTxt.match(/[一-龥]/g)">
        {{ wd }}
        <br />
      </template>
      <template v-if="ctrlSide === 'leftTop' && orientation === 'vertical'">
        <RightOutlined v-if="isHide" />
        <LeftOutlined v-else />
      </template>
      <template v-else-if="ctrlSide === 'rightBottom' && orientation === 'vertical'">
        <LeftOutlined v-if="isHide" />
        <RightOutlined v-else />
      </template>
      <!-- {{ hbtnTxt }} -->
    </a-button>
    <a-button
      v-show="!isHide"
      :class="clsDict[orientation]"
      :disabled="isHide"
      @mousedown="onLytRszStart"
    />
  </div>
</template>
