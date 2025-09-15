<template>
  <a-space>
    <a-button v-if="tblRfsh.includes('manual')" size="small" @click="$emit('click')">
      <template #icon><sync-outlined /></template>
      刷新
    </a-button>
    <template v-if="tblRfsh.includes('auto')">
      <a-divider v-if="tblRfsh.includes('manual')" type="vertical" />
      <p class="mb-0">自动刷新：</p>
      <a-switch
        v-model:checked="autoRfsh.enable"
        checked-children="开"
        un-checked-children="关"
        @change="onAutoEnbChange"
      />
      <a-input-number
        v-model:value="autoRfsh.interval"
        size="small"
        :min="1"
        class="w-32"
        @change="autoRfsh.tip = true"
      >
        <template #addonAfter>
          <a-select
            v-model:value="autoRfsh.unit"
            :options="Object.entries(timeUnits).map(([value, label]) => ({ label, value }))"
            class="w-20"
            @change="autoRfsh.tip = true"
          />
        </template>
      </a-input-number>
      <template v-if="autoRfsh.tip">
        <info-circle-outlined class="text-warning" />
        &nbsp;修改刷新间隔后需要重启自动刷新（关闭后再开启）
      </template>
    </template>
  </a-space>
</template>

<script lang="ts" setup name="RefreshBox">
import { reactive, type PropType } from 'vue'
import { SyncOutlined, InfoCircleOutlined } from '@ant-design/icons-vue'
import { TinyEmitter } from 'tiny-emitter'

const timeUnits = {
  ms: '毫秒',
  s: '秒',
  m: '分钟',
  h: '小时',
  D: '天',
  W: '周',
  M: '月',
  Y: '年'
}
const emit = defineEmits(['click'])
const props = defineProps({
  tblRfsh: { type: Array, required: true },
  emitter: { type: Object as PropType<TinyEmitter>, default: new TinyEmitter() }
})
const autoRfsh = reactive({
  enable: false,
  interval: 1,
  unit: 's',
  handle: undefined as any,
  tip: false
})

props.emitter.on('update:auto-refresh', (
  params?: boolean | {
    enable: boolean
    interval?: number
    unit?: keyof typeof timeUnits
  }
) => {
  if (typeof params !== 'undefined') {
    if (typeof params === 'object') {
      if (params.interval) {
        autoRfsh.interval = params.interval
      }
      if (params.unit) {
        autoRfsh.unit = params.unit
      }
      if (typeof params.enable === 'boolean') {
        autoRfsh.enable = params.enable
      }
    } else {
      autoRfsh.enable = params
    }
  } else {
    autoRfsh.enable = !autoRfsh.enable
  }
  onAutoEnbChange(autoRfsh.enable)
})

function onAutoEnbChange(checked: boolean) {
  autoRfsh.tip = false
  if (!checked) {
    clearInterval(autoRfsh.handle)
  } else {
    let unit = autoRfsh.unit
    let interval = autoRfsh.interval
    switch (unit) {
      case 'Y':
        interval *= 365
        unit = 'D'
        break
      case 'M':
        interval *= 30
        unit = 'D'
        break
      case 'W':
        interval *= 7
        unit = 'D'
        break
    }
    switch (unit) {
      case 'D':
        interval *= 24 * 60 * 60 * 1000
        break
      case 'h':
        interval *= 60 * 60 * 1000
        break
      case 'm':
        interval *= 60 * 1000
        break
      case 's':
        interval *= 1000
        break
      case 'ms':
      default:
    }
    autoRfsh.handle = setInterval(() => emit('click'), interval)
    if (interval > 60 * 1000) {
      setTimeout(() => emit('click'), 10)
    }
  }
}
</script>
