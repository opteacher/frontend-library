<template>
  <a-button @click="visible = true">
    <template #icon><import-outlined /></template>
    批量导入
  </a-button>
  <FormDialog
    title="导入登记在案的资产"
    width="70vw"
    v-model:show="visible"
    :copy="copyFun"
    :emitter="emitter"
    :mapper="mapper"
    @submit="onSubmit"
  >
    <template #itfcTable="{ formState }">
      <a-form-item-rest>
        <a-space class="mb-2.5">
          <a-input v-model:value="startCol" placeholder="开始列号" />
          <a-button
            :disabled="!formState.worksheet"
            type="primary"
            ghost
            @click="onOrderFill(formState)"
          >
            <template #icon><arrow-right-outlined /></template>
            顺序填入
          </a-button>
          <a-button :disabled="!formState.worksheet" danger ghost @click="onClrCols(formState)">
            <template #icon><close-outlined /></template>
            清空
          </a-button>
        </a-space>
        <a-table
          :columns="genDspColumns(formState as Batch)"
          :data-source="genDspRecords(formState as Batch)"
          :scroll="{ x: 'max-content' }"
          :loading="formState.loading"
          size="small"
          :pagination="false"
          bordered
        >
          <template #headerCell="{ column }">
            {{ column.title }}&nbsp;
            <enter-outlined :rotate="-90" />
            <a-select
              class="mt-0.5 min-w-full"
              size="small"
              allowClear
              placeholder="填入……"
              :style="{ 'max-width': `${column.width}px` }"
              :value="getSelCol(formState, column.dataIndex)"
              :options="cols.map((col: Column) => ({ label: col.title, value: `col${upperFirst(col.dataIndex)}` }))"
              @select="(selected: string) => onBdPropSelect(formState, selected, column.dataIndex)"
            />
          </template>
          <template #footer>.....</template>
        </a-table>
      </a-form-item-rest>
    </template>
    <template #boolMapper="{ formState }">
      <a-form-item-rest>
        <a-row :gutter="8">
          <a-col :span="12">
            <a-input v-model:value="formState.boolMapper['TRUE']" placeholder="输入真值" />
          </a-col>
          <a-col :span="12">
            <a-input v-model:value="formState.boolMapper['FALSE']" placeholder="输入假值" />
          </a-col>
        </a-row>
      </a-form-item-rest>
    </template>
  </FormDialog>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, watch } from 'vue'
import FormDialog from './FormDialog.vue'
import { TinyEmitter as Emitter } from 'tiny-emitter'
import Mapper from '../types/mapper'
import { read } from 'xlsx'
import { Cond } from '../types'
import { charInc, upperFirst, genDspColumns, genDspRecords, revsKeyVal } from '../utils'
import Column from '../types/column'
import {
  ImportOutlined,
  ArrowRightOutlined,
  EnterOutlined,
  CloseOutlined
} from '@ant-design/icons-vue'

export default defineComponent({
  name: 'BchImpBox',
  components: {
    FormDialog,
    ImportOutlined,
    ArrowRightOutlined,
    EnterOutlined,
    CloseOutlined
  },
  emits: ['refresh', 'submit'],
  props: {
    columns: { type: Array, required: true },
    ignCols: { type: Array, default: () => [] },
    copyFun: { type: Function, required: true }
  },
  setup(props, { emit }) {
    const emitter = new Emitter()
    const visible = ref(false)
    const cols = reactive(props.columns.map(col => Column.copy(col)))
    const startCol = ref('A')

    watch(
      () => props.columns.length,
      () => cols.splice(0, cols.length, ...props.columns.map(col => Column.copy(col)))
    )

    async function onSubmit(info: any, next: () => void) {
      emit('submit', info)
      next()
    }
    function onBdPropSelect(formState: any, selected: string, prop: string) {
      for (const [key, val] of Object.entries(formState)) {
        if (key.startsWith('col') && val === prop) {
          formState[key] = ''
          break
        }
      }
      formState[selected] = prop
      // cols.splice(
      //   0,
      //   cols.length,
      //   ...(props.columns as Column[]).filter(
      //     (col: Column) => !formState[`col${upperFirst(col.dataIndex)}`]
      //   )
      // )
    }
    function getSelCol(formState: any, selColKey: string) {
      return revsKeyVal(formState)[selColKey]
    }
    function onOrderFill(formState: any) {
      if (!formState.worksheet) {
        return
      }
      const usdVals = Object.values(formState).filter(val => val)
      let begColNo = startCol.value
      for (const colKey of Object.keys(formState).filter(
        col => col.startsWith('col') && !props.ignCols.includes(col)
      )) {
        if (!formState[colKey]) {
          while (usdVals.includes(begColNo)) {
            begColNo = charInc(begColNo)
          }
          formState[colKey] = begColNo
          begColNo = charInc(begColNo)
        }
      }
    }
    function onClrCols(formState: any) {
      for (const key of Object.keys(formState)) {
        if (key.startsWith('col')) {
          formState[key] = ''
        }
      }
    }
    return {
      Mapper,

      visible,
      emitter,
      mapper,
      cols,
      startCol,

      onSubmit,
      getSelCol,
      upperFirst,
      genDspColumns,
      genDspRecords,
      onBdPropSelect,
      onOrderFill,
      onClrCols
    }
  }
})

const mapper = new Mapper({
  file: {
    label: '上传在案资产',
    type: 'UploadFile',
    rules: [
      {
        required: true,
        message: '必须选择要上传的Excel文件！'
      }
    ],
    path: '/police-assets/api/v1/excel/upload',
    headers: { authorization: `Bearer ${localStorage.getItem('token')}` },
    onChange: async (form: any, info: any) => {
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
    },
    disabled: [Cond.copy({ key: 'loading', cmp: '=', val: true })]
  },
  hdRowNo: {
    label: '标题行号',
    type: 'Number',
    iptType: 'number',
    rules: [
      {
        required: true,
        message: '必须填写填写标题行号，用于收集标题信息！'
      }
    ],
    display: [
      Cond.copy({ key: 'file.length', cmp: '!=', val: 0 }),
      Cond.copy({ key: 'file[0].status', cmp: '!=', val: 'done' })
    ],
    disabled: [Cond.copy({ key: 'loading', cmp: '=', val: true })]
  },
  dtRowNo: {
    label: '数据开始行号',
    type: 'Number',
    iptType: 'number',
    rules: [
      {
        required: true,
        message: '必须填写填写标题行号，用于收集数据！'
      }
    ],
    display: [
      Cond.copy({ key: 'file.length', cmp: '!=', val: 0 }),
      Cond.copy({ key: 'file[0].status', cmp: '!=', val: 'done' })
    ],
    disabled: [Cond.copy({ key: 'loading', cmp: '=', val: true })]
  },
  itfcTable: {
    label: '对接表',
    type: 'Unknown',
    display: [
      Cond.copy({ key: 'file.length', cmp: '!=', val: 0 }),
      Cond.copy({ key: 'file[0].status', cmp: '!=', val: 'done' })
    ]
  },
  advanced: {
    label: '高级',
    type: 'FormGroup',
    display: [
      Cond.copy({ key: 'file.length', cmp: '!=', val: 0 }),
      Cond.copy({ key: 'file[0].status', cmp: '!=', val: 'done' })
    ],
    items: {
      boolMapper: {
        label: '布尔对应值',
        type: 'Unknown'
      },
      dtTmFormat: {
        label: '日期时间格式',
        type: 'Input'
      }
    },
    disabled: [Cond.copy({ key: 'loading', cmp: '=', val: true })]
  }
})
</script>
