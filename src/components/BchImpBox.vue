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
        <a-button
          class="mb-2.5"
          :disabled="!formState.worksheet"
          @click="onOrderFillClick(formState)"
        >
          顺序填入
          <template #icon><arrow-right-outlined /></template>
        </a-button>
        <a-table
          :columns="genDspColumns(formState)"
          :data-source="genDspRecords(formState)"
          :scroll="{ x: 'max-content' }"
          :loading="formState.loading"
          size="small"
          :pagination="false"
          bordered
        >
          <template #headerCell="{ column }">
            {{ column.title }}&nbsp;
            <arrow-down-outlined />
            <a-select
              class="mt-0.5 min-w-100"
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
  <FormDialog
    title="顺序填入列"
    v-model:show="orderFill.visible"
    :copy="(src: any, tgt?: any) => {
      tgt = tgt || { startCol: 'A', form: null }
      tgt.startCol = src.startCol || tgt.startCol
      tgt.form = src.form || tgt.form
      return tgt
    }"
    :emitter="orderFill.emitter"
    :mapper="
      new Mapper({
        startCol: {
          label: '开始列',
          type: 'Input'
        }
      })
    "
    @submit="onOrderFillSubmit"
  />
</template>

<script lang="ts">
import { defineComponent, reactive, ref, watch } from 'vue'
import FormDialog from './FormDialog.vue'
import { TinyEmitter as Emitter } from 'tiny-emitter'
import Mapper from '@/types/mapper'
import { read } from 'xlsx'
import { Cond } from '@/types'
import { charInc, upperFirst } from '@/utils'
import Column from '@/types/column'
import { ImportOutlined, ArrowRightOutlined, ArrowDownOutlined } from '@ant-design/icons-vue'
import { genDspColumns, genDspRecords } from '@/utils'
import Device from '@/types/device'

export default defineComponent({
  name: 'BatchImportBox',
  components: {
    FormDialog,
    ImportOutlined,
    ArrowRightOutlined,
    ArrowDownOutlined
  },
  emits: ['refresh', 'submit'],
  props: {
    columns: { type: Array, required: true },
    copyFun: { type: Function, required: true }
  },
  setup(props, { emit }) {
    const emitter = new Emitter()
    const visible = ref(false)
    const cols = reactive(props.columns.map(col => Column.copy(col)))
    const orderFill = reactive({
      visible: false,
      emitter: new Emitter()
    })

    watch(
      () => props.columns,
      () => cols.splice(0, cols.length, ...props.columns.map(col => Column.copy(col)))
    )

    async function onSubmit(info: any, next: () => void) {
      console.log(info)
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
    function onOrderFillClick(formState: any) {
      orderFill.visible = true
      orderFill.emitter.emit('update:data', { form: formState })
    }
    function getSelCol(formState: any, selColKey: string) {
      const selCol = Object.entries(formState).find(([_, colKey]) => colKey === selColKey)
      return selCol ? selCol[0] : undefined
    }
    function onOrderFillSubmit(info: any, next: () => void) {
      if (!info.form.worksheet) {
        return
      }
      const ignKeys = Object.keys(new Device()).map(prop => `col${upperFirst(prop)}`)
      const usdVals = Object.values(info.form).filter(val => val)
      let begColNo = info.startCol
      for (const colKey of Object.keys(info.form).filter(
        col => col.startsWith('col') && !ignKeys.includes(col)
      )) {
        if (!info.form[colKey]) {
          while (usdVals.includes(begColNo)) {
            begColNo = charInc(begColNo)
          }
          info.form[colKey] = begColNo
          begColNo = charInc(begColNo)
        }
      }
      console.log(info.form)
      next()
    }
    return {
      Mapper,

      visible,
      emitter,
      mapper,
      cols,
      orderFill,

      onSubmit,
      getSelCol,
      upperFirst,
      genDspColumns,
      genDspRecords,
      onBdPropSelect,
      onOrderFillClick,
      onOrderFillSubmit
    }
  }
})

const mapper = new Mapper({
  file: {
    label: '上传在案资产',
    type: 'Upload',
    rules: [
      {
        required: true,
        message: '必须选择要上传的Excel文件！'
      }
    ],
    path: '/police-assets/api/v1/excel/upload',
    headers: { authorization: `Bearer ${localStorage.getItem('token')}` },
    onChange: async (form: any, file: any) => {
      form.loading = true
      if (file.status === 'done') {
        const reader = new FileReader()
        reader.readAsArrayBuffer(file.originFileObj)
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
    type: 'Group',
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
