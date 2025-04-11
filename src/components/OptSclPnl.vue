<template>
  <div class="flex flex-col space-y-3" :style="{ height }">
    <OptSclTbox
      v-if="toolbox && tboxPos === 'top'"
      :outputing="outputing"
      v-model:show-time="showTime"
      v-model:tailf="tailf"
      @start="startListen"
      @stop="stopListen"
      @copy="cpyMsgs"
      @clear-msgs="() => messages.splice(0, messages.length)"
    />
    <div class="flex-1 relative">
      <codemirror
        class="absolute"
        :value="fmtMessage()"
        :options="{
          mode: 'log',
          theme: 'default',
          lineNumbers,
          readOnly: true,
          scrollbarStyle: 'native',
          lineWrapping
        }"
        :border="true"
        :keep-cursor-in-end="tailf"
      />
    </div>
    <OptSclTbox
      v-if="toolbox && tboxPos === 'bottom'"
      :outputing="outputing"
      v-model:show-time="showTime"
      v-model:tailf="tailf"
      @start="startListen"
      @stop="stopListen"
      @copy="cpyMsgs"
      @clear-msgs="() => messages.splice(0, messages.length)"
    />
  </div>
</template>

<script setup lang="ts" name="OptSclPnl">
import { type PropType, ref } from 'vue'
import dayjs, { Dayjs } from 'dayjs'
import { TinyEmitter } from 'tiny-emitter'
import Codemirror from 'codemirror-editor-vue3'
import Paho from 'paho-mqtt'
import OptSclTbox from './OptSclTbox.vue'

const props = defineProps({
  url: { type: String, default: '' }, // 使用SSE推送
  topic: { type: String, default: '' }, // 使用MQTT推送
  emitter: { type: TinyEmitter, default: null },
  tboxPos: { type: String as PropType<'top' | 'bottom'>, default: 'bottom' },
  toolbox: { type: [Boolean, Array], default: true },
  recvMsg: { type: Function, default: (msg: string) => msg },
  lineWrapping: { type: Boolean, default: false },
  lineNumbers: { type: Boolean, default: false },
  height: { type: String, default: '100%' }
})
const emit = defineEmits(['before-start', 'after-end'])
const messages = ref<{ content: string; time: Dayjs }[]>([])
const outputing = ref(false)
const showTime = ref(false)
const tailf = ref(true)
const mqttCli = ref<Paho.Client | null>(null)
const ess = ref<EventSource | null>(null)

if (props.emitter) {
  props.emitter.on('start', startListen)
  props.emitter.on('stop', stopListen)
  props.emitter.on('clean', () => {
    messages.value = []
  })
  props.emitter.on('message', addMessage)
}

function startListen() {
  emit('before-start')
  addMessage('等待任务开启……')
  if (props.topic) {
    if (!mqttCli.value) {
      const [host, strPort] = import.meta.env.VITE_MQTT_URL.split(':')
      mqttCli.value = new Paho.Client(
        host,
        parseInt(strPort),
        '/mqtt',
        import.meta.env.VITE_MQTT_CLIENT + Math.random().toString(16).substring(2, 8)
      )
    }
    if (!mqttCli.value.isConnected()) {
      mqttCli.value.connect({
        onSuccess: () => {
          mqttCli.value?.subscribe(props.topic)
          addMessage('开始任务……')
        },
        onFailure: err => addMessage('[ERROR]' + err.errorMessage)
      })
    }
    mqttCli.value.onConnectionLost = err => addMessage('[WARN]' + err.errorMessage)
    mqttCli.value.onMessageArrived = msg => addMessage(msg.payloadString)
  } else {
    if (!ess.value) {
      ess.value = new EventSource(props.url)
    }
    ess.value?.addEventListener('open', () => addMessage('开始任务……'))
    ess.value?.addEventListener('message', e => addMessage(e.data))
    // 服务器端完成任务后可激活stop事件停止输出
    ess.value?.addEventListener('stop', stopListen)
    ess.value?.addEventListener('error', e => addMessage('[ERROR]' + JSON.stringify(e)))
  }
  outputing.value = true
}
async function stopListen() {
  addMessage('停止任务……')
  if (mqttCli.value?.isConnected()) {
    mqttCli.value.unsubscribe(props.topic)
    mqttCli.value.disconnect()
  }
  if (ess.value?.readyState) {
    ess.value?.close()
  }
  outputing.value = false
  emit('after-end')
}
function addMessage(content: string) {
  console.log(content)
  messages.value.push({
    content: props.recvMsg(content),
    time: dayjs().add(8, 'hour')
  })
}
function cpyMsgs() {
  navigator.clipboard.writeText(fmtMessage())
}
// 在行消息前放置：[INFO]、[ERROR]、[WARN]、[TITLE]来改变消息样式（改变的同时会去掉这个前缀），默认不做修饰
function fmtMessage() {
  return messages.value
    .map(
      msg => (showTime.value ? msg.time.format('HH:mm:ss') + ' - ' : '') + fixMessage(msg.content)
    )
    .join('\n')
}
function fixMessage(msg: string) {
  // if (msg.startsWith('[INFO]')) {
  //   return createLogMark(rmvStartsOf(msg, '[INFO]'), 'info')
  // } else if (msg.startsWith('[ERROR]')) {
  //   return createLogMark(rmvStartsOf(msg, '[ERROR]'), 'error')
  // } else if (msg.startsWith('[WARN]')) {
  //   return createLogMark(rmvStartsOf(msg, '[WARN]'), 'warning')
  // } else if (msg.startsWith('[TITLE]')) {
  //   return createTitle(rmvStartsOf(msg, '[TITLE]'))
  // } else {
  //   return msg
  // }
  return msg
}
</script>
