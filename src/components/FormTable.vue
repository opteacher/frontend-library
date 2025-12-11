<template>
  <a-table
    class="edit-table"
    :columns="fmtCols()"
    :data-source="edtRow && edtRow.key === ADD_ROW ? valState.concat([edtRow]) : valState"
    :pagination="false"
    size="small"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'opera'">
        <template v-if="edtRow">
          <a-button type="link" size="small" @click="onAddSubmit">确定</a-button>
          <a-button type="text" size="small" @click="() => (edtRow = null)">取消</a-button>
        </template>
        <template v-else>
          <a-button
            v-if="edtable"
            size="small"
            type="text"
            :disabled="mapper.disabled"
            @click="() => onRowClick(record)"
          >
            编辑
          </a-button>
          <a-popconfirm v-if="delable" title="确定删除该字段" @confirm="() => onDelSubmit(record)">
            <a-button danger type="text" size="small" :disabled="mapper.disabled">删除</a-button>
          </a-popconfirm>
        </template>
      </template>
      <DirectField
        v-else-if="edtRow && record.key === edtRow.key"
        :mapper="setProp(getProp(mapper.mapper, column.dataIndex), 'key', column.dataIndex)"
        :form="record"
        :emitter="mapper.emitter"
        @update:form="onEditFormUpdate"
      />
      <template v-else-if="column.dataIndex in mapper.lblDict">
        {{
          getProp(mapper.lblDict, column.dataIndex)[getProp(record, column.dataIndex)] ||
          getProp(record, column.dataIndex)
        }}
      </template>
      <a-tooltip v-else-if="['Checkbox', 'Switch'].includes(getProp(mapper.mapper, column.dataIndex).type)">
        <template #title>{{ getProp(record, column.dataIndex) ? 'True' : 'False' }}</template>
        <CheckOutlined v-if="getProp(record, column.dataIndex)" />
        <CloseOutlined v-else />
      </a-tooltip>
    </template>
    <template v-if="addable && !edtRow" #footer>
      <a-button
        class="w-full rounded-t-none"
        type="text"
        :disabled="mapper.disabled"
        @click="() => onRowClick()"
      >
        <template #icon><PlusOutlined /></template>
      </a-button>
    </template>
  </a-table>
</template>

<script setup lang="ts" name="FormTable">
import { PlusOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons-vue'
import Column from '../types/column'
import { ref, toRef, type PropType } from 'vue'
import DirectField from './DirectField.vue'
import { getProp, setProp } from '../utils'
import { newObjByMapper, TableMapper } from '../types/mapper'
import { cloneDeep } from 'lodash'

const props = defineProps({
  value: { type: Array, required: true },
  mapper: { type: Object as PropType<TableMapper>, required: true },
  addable: { type: Boolean, default: true },
  edtable: { type: Boolean, default: true },
  delable: { type: Boolean, default: true }
})
const emit = defineEmits(['update:value', 'edit', 'delete'])
const valState = toRef<any[]>(props.value)
const edtRow = ref<any>(null)
const ADD_ROW = '^addRow$'

function onRowClick(row?: any) {
  if (row) {
    edtRow.value = row
  } else {
    if (props.mapper.newFun) {
      edtRow.value = props.mapper.newFun()
    } else {
      edtRow.value = newObjByMapper(props.mapper.mapper)
    }
    setProp(edtRow.value, 'key', ADD_ROW)
  }
  emit('edit')
}
async function onAddSubmit() {
  if (edtRow.value.key === ADD_ROW) {
    const newRow = cloneDeep(edtRow.value)
    if (props.mapper.genIdFun) {
      newRow.key = await props.mapper.genIdFun(newRow)
    }
    valState.value.push(newRow)
  } else {
    valState.value.splice(
      valState.value.findIndex(item => item.key === edtRow.value.key),
      1,
      cloneDeep(edtRow.value)
    )
  }
  emit('update:value', valState.value)
  edtRow.value = null
}
function onDelSubmit(record: any) {
  valState.value.splice(
    valState.value.findIndex((row: any) => row.key === record.key),
    1
  )
  emit('delete', record.key, valState.value)
}
function fmtCols() {
  return props.mapper.columns.concat(
    props.delable || props.edtable ? [new Column('操作', 'opera', { width: 80 })] : []
  )
}
function onEditFormUpdate(vals: any) {
  if (edtRow.value) {
    Object.entries(vals).map(([k, v]) => setProp(edtRow.value, k, v))
  }
}
</script>

<style>
.edit-table .ant-table-footer {
  padding: 0 !important;
}
</style>
