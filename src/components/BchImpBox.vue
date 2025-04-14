<template>
  <a-button @click="() => emitter.emit('update:visible', true)">
    <template #icon><import-outlined /></template>
    批量导入
  </a-button>
  <FormDialog
    title="导入登记在案的资产"
    width="70vw"
    :new-fun="() => ({ file: [] })"
    :emitter="emitter"
    :mapper="mapper"
    @submit="onSubmit"
  >
    <template #itfcTable="{ formState }">
      <a-form-item-rest>
        <a-form class="mb-2.5" layout="inline">
          <a-form-item>
            <template #label>
              表头行&nbsp;
              <a-tooltip>
                <template #title>其下一行即为数据开始行</template>
                <InfoCircleOutlined />
              </a-tooltip>
            </template>
            <a-input-number
              :min="-1"
              :max="excInf.totalNum"
              v-model:value="excInf.hdRowNos[excInf.actTab]"
              @change="reloadExcel"
            />
          </a-form-item>
          <a-form-item label="绑定参照列">
            <div class="space-x-2">
              <a-tooltip v-for="col in dbInf.cols" :key="col.key">
                <template #title>拖拽到下表列头中绑定</template>
                <c-button
                  size="small"
                  :type="col.key in binds.colors ? binds.colors[col.key] : 'default'"
                  :draggable="true"
                  @dragstart="(e: any) => onColDragStart(e, col)"
                >
                  {{ col.title }}
                </c-button>
              </a-tooltip>
            </div>
          </a-form-item>
        </a-form>
        <a-tabs v-model:activeKey="excInf.actTab" type="editable-card" @change="reloadExcel">
          <a-tab-pane v-for="sheet in excInf.sheets" :key="sheet" :tab="sheet">
            <template #closeIcon>
              <a-tooltip>
                <template #title>关闭工作表代表该表不会导入</template>
                <CloseOutlined />
              </a-tooltip>
            </template>
          </a-tab-pane>
        </a-tabs>
        <a-table
          id="tblItfc"
          :columns="excInf.columns"
          :data-source="excInf.data"
          :scroll="{ x: 'max-content' }"
          :loading="formState.loading"
          size="small"
          :pagination="false"
          bordered
        >
          <template #headerCell="{ column }">
            <div
              class="p-2"
              :class="{
                'bg-slate-600': dbInf.dragon === column.key,
                'text-white': dbInf.dragon === column.key || column.key in binds.colors
              }"
              :style="
                column.key in binds.colors
                  ? {
                      'background-color': colorDict[binds.colors[column.key]]
                    }
                  : undefined
              "
              @drop="e => onColBindDrop(e, column)"
              @dragenter="() => onSetDragonCol(column)"
              @dragleave="() => onSetDragonCol()"
              @dragover="e => e.preventDefault()"
            >
              {{ column.title }}
            </div>
          </template>
          <template #footer>总共{{ excInf.totalNum }}条记录，此处展示10条</template>
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

<script lang="ts" setup name="BchImpBox">
import { CloseOutlined, ImportOutlined, InfoCircleOutlined } from '@ant-design/icons-vue'
import { TinyEmitter as Emitter } from 'tiny-emitter'
import { reactive, watch } from 'vue'
import { type WorkBook, read, utils } from 'xlsx'

import { type Color, Cond, colors, colorDict } from '../types'
import Column from '../types/column'
import Mapper from '../types/mapper'
import { getDftPjt } from '../utils'
import FormDialog from './FormDialog.vue'

const props = defineProps({
  uploadUrl: { type: String, default: `/${getDftPjt()}/api/v1/excel/upload` },
  columns: { type: Array as () => Column[], required: true },
  ignCols: { type: Array, default: () => [] },
  copyFun: { type: Function, required: true }
})
const emit = defineEmits(['refresh', 'submit'])

const emitter = new Emitter()
const dbInf = reactive<{
  cols: Column[]
  dragon: string
}>({
  cols: props.columns,
  dragon: ''
})
const excInf = reactive<{
  actTab: string
  book: WorkBook | null
  sheets: string[]
  columns: Column[]
  data: any[]
  totalNum: number
  hdRowNos: Record<string, number>
}>({
  actTab: '',
  book: null,
  sheets: [],
  columns: [],
  data: [],
  totalNum: 0,
  hdRowNos: {}
})
const binds = reactive<{
  // Record<string(excel表的列索引), string(数据库表的列索引)>
  mapper: Record<string, string>
  // Record<string(excel表的列索引/数据库表的列索引), Color(颜色)>
  colors: Record<string, Color>
}>({
  mapper: {},
  colors: {}
})

watch(
  () => [...props.columns],
  () => {
    dbInf.cols = props.columns
  }
)

async function onSubmit(info: any, next: () => void) {
  emit('submit', info)
  next()
}
function reloadExcel() {
  if (!excInf.book) {
    return
  }
  for (const sname of Object.keys(excInf.book.Sheets)) {
    if (!(sname in excInf.hdRowNos)) {
      excInf.hdRowNos[sname] = 0
    }
  }
  const worksheet = excInf.book.Sheets[excInf.actTab]
  const allData = utils.sheet_to_json<any[]>(worksheet, { header: 1 })
  excInf.totalNum = allData.length
  // 默认使用第一行作为表头
  const hdRowNo = excInf.hdRowNos[excInf.actTab]
  const header =
    hdRowNo !== -1
      ? allData[hdRowNo]
      : [...new Array(allData[0]).keys()].map((nCol: number) => utils.encode_col(nCol))
  excInf.columns.splice(0, excInf.columns.length, ...header.map(prop => new Column(prop, prop)))
  // 表头的下一行为数据开始行
  const begRowNo = hdRowNo + 1
  excInf.data = allData
    .slice(begRowNo, begRowNo + 10)
    .map(item => Object.fromEntries(header.map((hdItm, idx) => [hdItm, item[idx]])))
  return worksheet
}
function onColDragStart(e: DragEvent, col: Column) {
  e.dataTransfer?.setData('text/plain', col.key)
}
function onColBindDrop(e: DragEvent, col: Column) {
  dbInf.dragon = ''
  const exCol = col.key
  const dbCol = e.dataTransfer?.getData('text/plain') as string
  binds.mapper[exCol] = dbCol
  binds.colors[exCol] = colors[Math.floor(Math.random() * colors.length)]
  binds.colors[dbCol] = binds.colors[exCol]
}
function onSetDragonCol(column?: Column) {
  dbInf.dragon = column ? column.key : ''
}

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
    path: props.uploadUrl,
    headers: { authorization: `Bearer ${localStorage.getItem('token')}` },
    onChange: async (form: any, info: any) => {
      form.loading = true
      if (info.file && info.file.status === 'done') {
        const reader = new FileReader()
        reader.readAsArrayBuffer(info.file.originFileObj)
        reader.onload = () => {
          excInf.book = read(reader.result)
          excInf.sheets = excInf.book.SheetNames
          excInf.actTab = excInf.book.SheetNames[0]
          form.worksheet = reloadExcel()
          form.loading = false
        }
      }
    },
    disabled: [new Cond({ key: 'loading', cmp: '=', val: true })]
  },
  itfcTable: {
    label: '对接表',
    type: 'Unknown',
    display: [
      new Cond({ key: 'file.length', cmp: '!=', val: 0 }),
      new Cond({ key: 'file[0].status', cmp: '!=', val: 'done' })
    ]
  },
  advanced: {
    label: '高级',
    type: 'FormGroup',
    display: [
      new Cond({ key: 'file.length', cmp: '!=', val: 0 }),
      new Cond({ key: 'file[0].status', cmp: '!=', val: 'done' })
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
    disabled: [new Cond({ key: 'loading', cmp: '=', val: true })]
  }
})
</script>

<style>
#tblItfc th.ant-table-cell {
  padding: 0 !important;
}
</style>
