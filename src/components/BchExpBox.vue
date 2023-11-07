<template>
  <a-button @click="visible = true">
    <template #icon><export-outlined /></template>
    批量导出
  </a-button>
  <FormDialog
    title="导出登记在案的资产"
    v-model:show="visible"
    :copy="copyFun"
    :emitter="emitter"
    :mapper="mapper"
    width="80vw"
    :lblWid="3"
    @submit="onSubmit"
  >
    <template #itfcTable="{ formState }">
      <a-form-item-rest>
        <a-table
          v-if="formState.worksheet"
          :columns="genDspColumns(formState as Batch)"
          :data-source="genDspRecords(formState as Batch)"
          :scroll="{ x: 'max-content' }"
          :loading="formState.loading"
          size="small"
          :pagination="false"
          bordered
        >
          <template #headerCell="{ column }">
            <a-space>
              {{ column.title }}
              <enter-outlined :rotate="-90" />
            </a-space>
            <a-select
              class="mb-2"
              size="small"
              placeholder="等于……"
              allowClear
              :options="cols.map((col: Column) => ({ label: col.title, value: col.dataIndex }))"
              @select="(selected: string) => onAsIdenSelect(formState, selected, column.dataIndex)"
            />
          </template>
          <template #footer>.....</template>
        </a-table>
      </a-form-item-rest>
    </template>
    <template #filterCols="{ formState }">
      <a-form-item-rest>
        <a-checkbox
          v-model:checked="allChk.checkAll"
          :indeterminate="allChk.indeterminate"
          @change="onAllChkChange"
        >
          全部选择
        </a-checkbox>
      </a-form-item-rest>
      <a-checkbox-group
        v-model:value="formState.filterCols"
        :options="cols.map((col: any) => ({ label: col.title, value: col.dataIndex }))"
      />
    </template>
  </FormDialog>
</template>

<script lang="ts">
import Mapper from '../types/mapper'
import { defineComponent, onMounted, reactive, ref, watch } from 'vue'
import FormDialog from './FormDialog.vue'
import { TinyEmitter as Emitter } from 'tiny-emitter'
import { ExportOutlined, EnterOutlined } from '@ant-design/icons-vue'
import Column from '../types/column'
import { read } from 'xlsx'
import { Cond } from '../types'
import { upperFirst } from '../utils'
import { genDspColumns, genDspRecords } from '../utils'
import Batch from '../types/batch'

export default defineComponent({
  name: 'BchExpBox',
  components: {
    FormDialog,
    ExportOutlined,
    EnterOutlined
  },
  emits: ['submit'],
  props: {
    columns: { type: Array, required: true },
    copyFun: { type: Function, required: true }
  },
  setup(props, { emit }) {
    const visible = ref(false)
    const emitter = new Emitter()
    const cols = reactive(props.columns.map(col => Column.copy(col)))
    const allChk = reactive({
      indeterminate: true,
      checkAll: true
    })

    onMounted(resetAllChk)
    watch(
      () => props.columns.length,
      () => {
        cols.splice(0, cols.length, ...props.columns.map(col => Column.copy(col)))
        resetAllChk()
      }
    )
    watch(() => visible.value, resetAllChk)

    function resetAllChk() {
      emitter.emit('update:data', { filterCols: cols.map((col: Column) => col.dataIndex) })
      allChk.checkAll = true
      allChk.indeterminate = false
    }
    function onAsIdenSelect(formState: any, selected: string, prop: string) {
      for (const [key, val] of Object.entries(formState)) {
        if (key.startsWith('col') && val === prop) {
          formState[key] = ''
          break
        }
      }
      formState[`col${upperFirst(selected)}`] = prop
      cols.splice(
        0,
        cols.length,
        ...(props.columns as Column[]).filter(
          (col: Column) => !formState[`col${upperFirst(col.dataIndex)}`]
        )
      )
    }
    function onAllChkChange(e: any) {
      emitter.emit('update:data', {
        filterCols: e.target.checked ? cols.map((col: Column) => col.dataIndex) : []
      })
    }
    async function onSubmit(info: any, next: () => void) {
      info.ttlMap = Object.fromEntries(props.columns.map((col: any) => [col.dataIndex, col.title]))
      emit('submit', info)
      next()
    }
    return {
      visible,
      emitter,
      mapper,
      cols,
      allChk,

      genDspColumns,
      genDspRecords,
      onAsIdenSelect,
      onAllChkChange,
      onSubmit
    }
  }
})

const mapper = new Mapper({
  file: {
    label: '上传参照文档',
    type: 'UploadFile',
    desc: '没有参照文档，则导出所有设备',
    path: '/police-assets/api/v1/excel/upload',
    headers: { authorization: `Bearer ${localStorage.getItem('token')}` },
    onChange: (form: any, info: any) => {
      form.loading = true
      if (info.file.status === 'done') {
        const reader = new FileReader()
        reader.readAsArrayBuffer(info.file.originFileObj)
        reader.onload = () => {
          const workbook = read(reader.result)
          form.worksheet = workbook.Sheets[workbook.SheetNames[0]]
          form.loading = false
        }
      }
    }
  },
  hdRowNo: {
    label: '标题行号',
    type: 'Number',
    iptType: 'number',
    display: [
      new Cond({ key: 'file.length', cmp: '!=', val: 0 }),
      new Cond({ key: 'file[0].status', cmp: '!=', val: 'done' })
    ]
  },
  dtRowNo: {
    label: '数据开始行号',
    type: 'Number',
    iptType: 'number',
    display: [
      new Cond({ key: 'file.length', cmp: '!=', val: 0 }),
      new Cond({ key: 'file[0].status', cmp: '!=', val: 'done' })
    ]
  },
  itfcTable: {
    label: '指定对照列',
    type: 'Unknown',
    display: [
      new Cond({ key: 'file.length', cmp: '!=', val: 0 }),
      new Cond({ key: 'file[0].status', cmp: '!=', val: 'done' })
    ]
  },
  filterCols: {
    label: '导出列',
    type: 'Unknown'
  }
})
</script>
