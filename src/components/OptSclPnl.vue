<template>
  <div class="relative h-full border border-solid border-slate-300 rounded">
    <pre class="absolute top-0 bottom-0 left-0 right-0 overflow-y-auto p-2 mb-10" ref="panel">{{
      fmtMessage()
    }}</pre>
    <div class="absolute bottom-2 left-2 right-2 flex justify-between">
      <a-space v-if="ctrler.outputing">
        <PlayCircleTwoTone two-tone-color="#52c41a" />
        <span>输出中</span>
        <LoadingOutlined />
      </a-space>
      <a-space v-else>
        <PauseCircleTwoTone two-tone-color="#eb2f96" />
        <span>停止</span>
      </a-space>
      <a-space>
        <span>显示时间</span>
        <a-switch size="small" v-model:checked="ctrler.tmVsb" />
        <span>保持滚动到底</span>
        <a-switch size="small" v-model:checked="ctrler.lockBtm" />
        <a-popover title="警告" trigger="click" placement="topRight" v-model:open="ctrler.clrVsb">
          <template #content>
            <div class="space-x-2">
              <InfoCircleOutlined class="text-amber-500" />
              <span>确定清屏？历史消息无法查看！</span>
            </div>
            <a-divider class="my-2" />
            <div class="space-x-1 text-right">
              <a-button size="small" type="primary" danger @click="onClrScnCick">确定</a-button>
              <a-button size="small" @click="() => setProp(ctrler, 'clrVsb', false)">取消</a-button>
            </div>
          </template>
          <a-button size="small">
            <template #icon><ClearOutlined /></template>
            清屏
          </a-button>
        </a-popover>
        <a-popover
          placement="topRight"
          v-model:open="ctrler.muVsb"
          :overlayInnerStyle="{ padding: 0 }"
        >
          <template #content>
            <a-menu mode="vertical" theme="light" :items="ctrler.muItms" @click="onCtrlClick" />
          </template>
          <a-button type="text" size="small">
            <template #icon>
              <UpOutlined v-if="ctrler.muVsb" />
              <DownOutlined v-else />
            </template>
          </a-button>
        </a-popover>
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts" name="OptSclPnl">
import { h, reactive, ref, VNode } from 'vue'
import {
  ClearOutlined,
  PlayCircleTwoTone,
  PauseCircleTwoTone,
  UpOutlined,
  DownOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  InfoCircleOutlined,
  CopyOutlined,
  LoadingOutlined
} from '@ant-design/icons-vue'
import { setProp } from '../utils'
import { message as msgBox } from 'ant-design-vue'
import dayjs, { Dayjs } from 'dayjs'

const props = defineProps({
  url: { type: String, required: true }
})
const message = ref<{ content: string; time: Dayjs }[]>([])
const panel = ref<HTMLElement>()
const ctrler = reactive<{
  outputing: boolean
  lockBtm: boolean
  muVsb: boolean
  clrVsb: boolean
  muItms: {
    key: string
    icon: () => VNode
    label: string
    title: string
  }[]
  tmVsb: boolean
  ess?: EventSource
}>({
  outputing: false,
  lockBtm: true,
  muVsb: false,
  clrVsb: false,
  tmVsb: false,
  muItms: [
    {
      key: 'start',
      icon: () => h(PlayCircleOutlined),
      label: '开始',
      title: '开始'
    },
    {
      key: 'stop',
      icon: () => h(PauseCircleOutlined),
      label: '停止',
      title: '停止'
    },
    {
      key: 'copy',
      icon: () => h(CopyOutlined),
      label: '复制',
      title: '复制'
    }
  ]
})

function onClrScnCick() {
  message.value = []
  ctrler.clrVsb = false
}
function onCtrlClick({ key }: { key: 'start' | 'stop' | 'copy' }) {
  switch (key) {
    case 'start':
      startListen()
      break
    case 'stop':
      stopListen()
      break
    case 'copy':
      navigator.clipboard.writeText(fmtMessage())
      msgBox.success('复制成功！')
      break
  }
  ctrler.muVsb = false
}
function startListen() {
  ctrler.ess = new EventSource(props.url)
  ctrler.outputing = true
  addMessage('等待任务开启……')
  ctrler.ess.addEventListener('open', () => {
    addMessage('开始任务……')
  })
  ctrler.ess.addEventListener('message', e => {
    addMessage(e.data)
    if (ctrler.lockBtm && panel.value) {
      const pnlRef = panel.value as HTMLElement
      if (pnlRef.scrollHeight > pnlRef.clientHeight) {
        setTimeout(() => {
          pnlRef.scrollTop = pnlRef.scrollHeight
        }, 100)
      }
    }
  })
  ctrler.ess.addEventListener('end', stopListen)
  ctrler.ess.addEventListener('error', e => {
    console.error(e)
    stopListen()
  })
}
function stopListen() {
  addMessage('停止任务……')
  ctrler.ess?.close()
  ctrler.outputing = false
}
function addMessage(content: string) {
  message.value.push({ content, time: dayjs() })
}
function fmtMessage() {
  return message.value
    .map(msg => (ctrler.tmVsb ? msg.time.format('HH:mm:ss') + ' - ' : '') + msg.content)
    .join('\n')
}
</script>
