<template>
  <div class="flex justify-between">
    <a-space v-if="outputing">
      <PlayCircleTwoTone two-tone-color="#52c41a" />
      <span>输出中</span>
      <LoadingOutlined />
    </a-space>
    <a-space v-else>
      <PauseCircleTwoTone two-tone-color="#eb2f96" />
      <span>停止</span>
    </a-space>
    <a-popover placement="topRight" v-model:open="showMenu" :overlayInnerStyle="{ padding: 0 }">
      <template #content>
        <a-menu
          mode="vertical"
          theme="light"
          :items="Object.entries(muItems).map(([key, value]) => ({ key, ...value }))"
          @click="onCtrlClick"
        />
      </template>
      <a-button type="text" size="small">
        <template #icon>
          <UpOutlined v-if="showMenu" />
          <DownOutlined v-else />
        </template>
      </a-button>
    </a-popover>
  </div>
</template>

<script setup lang="ts">
import { h, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlayCircleTwoTone,
  LoadingOutlined,
  PauseCircleTwoTone,
  CopyOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  ClearOutlined,
  UpOutlined,
  DownOutlined,
  FieldTimeOutlined,
  VerticalAlignBottomOutlined
} from '@ant-design/icons-vue'

const props = defineProps({
  outputing: { type: Boolean, required: true },
  showTime: { type: Boolean, default: false },
  tailf: { type: Boolean, default: true }
})
const emit = defineEmits(['clear-msgs', 'start', 'stop', 'copy', 'update:showTime', 'update:tailf'])
const showMenu = ref(false)
const muItems = reactive({
  start: {
    icon: () => h(PlayCircleOutlined),
    label: '开始',
    title: '开始'
  },
  stop: {
    icon: () => h(PauseCircleOutlined),
    label: '停止',
    title: '停止'
  },
  copy: {
    icon: () => h(CopyOutlined),
    label: '复制',
    title: '复制'
  },
  clean: {
    icon: () => h(ClearOutlined),
    label: '清屏',
    title: '清屏'
  },
  time: {
    icon: () => h(FieldTimeOutlined),
    label: getTimeLbl(),
    title: getTimeLbl()
  },
  tailf: {
    icon: () => h(VerticalAlignBottomOutlined),
    label: '保持到底',
    title: '保持到底'
  }
})

async function onCtrlClick({ key }: { key: keyof typeof muItems }) {
  switch (key) {
    case 'start':
      emit('start')
      break
    case 'stop':
      emit('stop')
      break
    case 'copy':
      emit('copy')
      message.success('复制成功！')
      break
    case 'clean':
      emit('clear-msgs')
      break
    case 'time':
      emit('update:showTime', !props.showTime)
      muItems['time'].label = getTimeLbl(!props.showTime)
      break
    case 'tailf':
      emit('update:tailf', !props.tailf)
      muItems['tailf'].label = !props.tailf ? '自由滚动' : '保持到底'
      break
  }
  showMenu.value = false
}
function getTimeLbl(showTime?: boolean) {
  if (typeof showTime !== 'undefined') {
    return showTime ? '隐藏时间' : '显示时间'
  } else {
    return props.showTime ? '隐藏时间' : '显示时间'
  } 
}
// function getTailfLbl(tailf?: boolean) {
//   if (typeof tailf !== 'undefined') {
//     return tailf ? '自由滚动' : '保持到底'
//   } else {
//     return props.tailf ? '自由滚动' : '保持到底'
//   }
// }
</script>
