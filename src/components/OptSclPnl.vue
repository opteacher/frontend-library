<template>
  <div class="h-full flex flex-col space-y-3">
    <div class="flex-1 relative">
      <codemirror
        class="absolute"
        :value="fmtMessage()"
        :options="{
          mode: 'log',
          theme: 'default',
          lineNumbers: false,
          readOnly: true,
          scrollbarStyle: 'native'
        }"
        border
        :keep-cursor-in-end="ctrler.lockBtm"
      />
    </div>
    <div class="flex justify-between">
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
import { rmvStartsOf, setProp, until } from '../utils'
import { message as msgBox } from 'ant-design-vue'
import dayjs, { Dayjs } from 'dayjs'
import { TinyEmitter } from 'tiny-emitter'
import Codemirror, { createLogMark, createTitle } from 'codemirror-editor-vue3'
import mqtt from 'mqtt'

const props = defineProps({
  url: { type: String, default: '' }, // 使用SSE推送
  topic: { type: String, default: '' }, // 使用MQTT推送
  emitter: { type: TinyEmitter, default: null },
  recvMsg: { type: Function, default: (msg: string) => msg }
})
const emit = defineEmits(['before-start', 'after-end'])
const message = ref<{ content: string; time: Dayjs }[]>([])
const ctrler = reactive<
  {
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
    mqttCli?: mqtt.MqttClient
  } & Record<string, any>
>({
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

if (props.emitter) {
  props.emitter.on('start', startListen)
  props.emitter.on('stop', stopListen)
  props.emitter.on('clean', () => {
    message.value = []
  })
}

function onClrScnCick() {
  message.value = []
  ctrler.clrVsb = false
}
async function onCtrlClick({ key }: { key: 'start' | 'stop' | 'copy' }) {
  switch (key) {
    case 'start':
      await startListen()
      break
    case 'stop':
      await stopListen()
      break
    case 'copy':
      navigator.clipboard.writeText(fmtMessage())
      msgBox.success('复制成功！')
      break
  }
  ctrler.muVsb = false
}
async function startListen() {
  emit('before-start')
  if (props.topic) {
    await until(() => {
      try {
        ctrler.mqttCli = mqtt.connect('ws://192.168.1.11:8083/mqtt', {
          clientId: 'emqx_' + Math.random().toString(16).substring(2, 8),
          username: 'admin',
          password: '59524148chenOP',
          clean: true
        })
      } catch(e) {
        return Promise.resolve(false)
      }
      return Promise.resolve(true)
    })
    ctrler.mqttCli?.subscribe(props.topic, { qos: 0 })
    ctrler.outputing = true
    addMessage('等待任务开启……')
    ctrler.mqttCli?.on('connect', () => addMessage('开始任务……'))
    ctrler.mqttCli?.on('error', e => addMessage('[ERROR]' + JSON.stringify(e)))
    ctrler.mqttCli?.on('message', async (topic: string, msg) => {
      if (topic === props.topic) {
        addMessage(msg.toString())
      }
    })
  } else {
    ctrler.ess = new EventSource(props.url)
    ctrler.outputing = true
    addMessage('等待任务开启……')
    ctrler.ess.addEventListener('open', () => addMessage('开始任务……'))
    ctrler.ess.addEventListener('message', e => addMessage(e.data))
    // 服务器端完成任务后可激活stop事件停止输出
    ctrler.ess.addEventListener('stop', stopListen)
    ctrler.ess.addEventListener('error', e => addMessage('[ERROR]' + JSON.stringify(e)))
  }
}
async function stopListen() {
  addMessage('停止任务……')
  if (ctrler.mqttCli?.connected) {
    await ctrler.mqttCli?.unsubscribeAsync(props.topic, { qos: 0 })
    await ctrler.mqttCli?.endAsync()
  }
  if (ctrler.ess?.readyState) {
    ctrler.ess?.close()
  }
  ctrler.outputing = false
  emit('after-end')
}
function addMessage(content: string) {
  message.value.push({
    content: props.recvMsg(content),
    time: dayjs().add(8, 'hour')
  })
}
// 在行消息前放置：[INFO]、[ERROR]、[WARN]、[TITLE]来改变消息样式（改变的同时会去掉这个前缀），默认不做修饰
function fmtMessage() {
  return message.value
    .map(msg => (ctrler.tmVsb ? msg.time.format('HH:mm:ss') + ' - ' : '') + fixMessage(msg.content))
    .join('\n')
}
function fixMessage(msg: string) {
  if (msg.startsWith('[INFO]')) {
    return createLogMark(rmvStartsOf(msg, '[INFO]'), 'info')
  } else if (msg.startsWith('[ERROR]')) {
    return createLogMark(rmvStartsOf(msg, '[ERROR]'), 'error')
  } else if (msg.startsWith('[WARN]')) {
    return createLogMark(rmvStartsOf(msg, '[WARN]'), 'warning')
  } else if (msg.startsWith('[TITLE]')) {
    return createTitle(rmvStartsOf(msg, '[TITLE]'))
  } else {
    return msg
  }
}
</script>
