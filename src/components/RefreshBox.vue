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
        class="w-50"
        @change="autoRfsh.tip = true"
      >
        <template #addonAfter>
          <a-select
            v-model:value="autoRfsh.unit"
            :options="timeUnits"
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

<script lang="ts">
import { defineComponent, reactive } from 'vue'
import { SyncOutlined, InfoCircleOutlined } from '@ant-design/icons-vue'

const timeUnits = [
  {
    label: '毫秒',
    value: 'ms'
  },
  {
    label: '秒',
    value: 's'
  },
  {
    label: '分钟',
    value: 'm'
  },
  {
    label: '小时',
    value: 'h'
  },
  {
    label: '天',
    value: 'D'
  },
  {
    label: '周',
    value: 'W'
  },
  {
    label: '月',
    value: 'M'
  },
  {
    label: '年',
    value: 'Y'
  }
]

export default defineComponent({
  name: 'RefreshBox',
  components: { SyncOutlined, InfoCircleOutlined },
  emits: ['click'],
  props: {
    tblRfsh: { type: Array, required: true }
  },
  setup(_props, { emit }) {
    const autoRfsh = reactive({
      enable: false,
      interval: 1,
      unit: 's',
      handle: undefined as any,
      tip: false
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
    return {
      autoRfsh,
      timeUnits,

      onAutoEnbChange
    }
  }
})
</script>
