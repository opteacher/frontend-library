<template>
  <a-input-group compact class="flex">
    <a-select
      v-if="mode === 'select'"
      class="flex-1"
      :options="options"
      :value="value"
      :placeholder="placeholder || '请选择'"
      :disabled="disabled"
      allowClear
      @change="(val: any) => emit('update:value', val)"
    />
    <a-input
      v-else
      class="flex-1"
      :placeholder="placeholder || '请输入'"
      :value="value"
      :disabled="disabled"
      allowClear
      @change="(e: any) => emit('update:value', e.target.value)"
    />
    <a-button @click="onModeUpdate" :disabled="disabled">
      <template #icon>
        <SelectOutlined v-if="mode === 'select'" />
        <EditOutlined v-else />
      </template>
    </a-button>
  </a-input-group>
</template>

<script setup lang="ts" name="SelOrIpt">
import { EditOutlined, SelectOutlined } from '@ant-design/icons-vue'
import { toRef } from 'vue'

const emit = defineEmits(['update:value', 'update:mode'])
const props = defineProps({
  value: { type: String, required: true },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  mode: { type: String, default: 'input' }
})
const mode = toRef(props.mode)

function onModeUpdate() {
  mode.value = mode.value === 'select' ? 'input' : 'select'
  emit('update:mode', mode.value)
}
</script>
