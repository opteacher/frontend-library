<template>
  <a-space>
    <a-button v-if="addable" type="primary" @click="onAddClick">新增</a-button>
    <slot name="FormDialog" />
    <a-typography-text type="secondary">
      <InfoCircleOutlined />
      {{ mapper.placeholder || '点击添加' }}
    </a-typography-text>
  </a-space>
  <a-table
    class="mt-1.5"
    v-if="value && value.length"
    :columns="mapper.columns.concat([new Column('操作', 'opera', { width: 80 })])"
    :data-source="value"
    :pagination="false"
    size="small"
    :custom-row="
      (record: any) => ({
        onClick: () => onRowClick(record)
      })
    "
  >
    <template v-if="delable" #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'opera'">
        <a-popconfirm title="确定删除该字段" @confirm.stop="() => onDelClick(record)">
          <a-button danger size="small" @click.stop="() => {}">删除</a-button>
        </a-popconfirm>
      </template>
    </template>
  </a-table>
</template>

<script setup lang="ts" name="FormTable">
import { InfoCircleOutlined } from '@ant-design/icons-vue'

import Column from '../types/column'

const props = defineProps({
  value: { type: Array, required: true },
  mapper: { type: Object, required: true },
  addable: { type: Boolean, default: true },
  delable: { type: Boolean, default: true }
})
const emit = defineEmits(['update:value', 'edit', 'delete'])

function onAddClick() {
  props.mapper.emitter.emit('update:show', { show: true, viewOnly: false })
  emit('edit')
}
function onRowClick(record: any) {
  props.mapper.emitter.emit('update:show', {
    show: true,
    object: record,
    viewOnly: !props.mapper.editable
  })
  emit('edit')
}
function onDelClick(record: any) {
  emit('delete', record.key, props.value)
}
</script>
