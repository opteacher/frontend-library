<template>
  <a-upload
    name="file"
    :action="uploadUrl"
    :showUploadList="false"
    :headers="headers"
    @change="onExcelUpload"
  >
    <a-button :loading="uploading" @click.prevent>
      <template #icon><import-outlined /></template>
      批量导入
    </a-button>
  </a-upload>
  <FormDialog
    title="导入登记在案的资产"
    width="70vw"
    :new-fun="() => newOne(BatImp)"
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
              :max="imInf.totalNum"
              v-model:value="imInf.hdRowNos[imInf.actTab]"
              @change="reloadExcel"
            />
          </a-form-item>
          <a-form-item label="绑定参照列">
            <div class="space-x-2">
              <a-tooltip v-for="col in dbInf.cols" :key="col.key">
                <template #title>拖拽到下表列头中绑定</template>
                <a-tag
                  :color="getProp(binds, col.key + '.color', '')"
                  :draggable="true"
                  closable
                  @close.prevent="() => onColUnbindClick(col.key)"
                  @dragstart="(e: any) => onColDragStart(e, col)"
                >
                  {{ col.title }}
                </a-tag>
              </a-tooltip>
            </div>
          </a-form-item>
        </a-form>
        <a-tabs v-model:activeKey="imInf.actTab" type="editable-card" @change="reloadExcel">
          <a-tab-pane v-for="sheet in imInf.sheets" :key="sheet" :tab="sheet">
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
          :columns="imInf.columns"
          :data-source="imInf.data"
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
                'text-white': dbInf.dragon === column.key || column.key in binds
              }"
              :style="getHdColor(column)"
              @drop="e => onColBindDrop(e, column)"
              @dragenter="() => onSetDragonCol(column)"
              @dragleave="() => onSetDragonCol()"
              @dragover="e => e.preventDefault()"
            >
              <template v-if="column.key in binds">
                <a-tooltip>
                  <template #title>
                    {{ getHdDesc(column) }}
                  </template>
                  {{ column.title }}
                  <LoginOutlined />
                </a-tooltip>
                {{ getProp(binds, column.key + '.prop', '') }}
                <a-divider type="vertical" />
                <a-checkbox v-model:checked="binds[column.key].required" class="text-white">
                  不收集空值
                </a-checkbox>
              </template>
              <template v-else>{{ column.title }}</template>
            </div>
          </template>
          <template #footer>总共{{ imInf.totalNum }}条记录，此处展示10条</template>
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
import {
  CloseOutlined,
  ImportOutlined,
  InfoCircleOutlined,
  LoginOutlined
} from '@ant-design/icons-vue'
import { TinyEmitter as Emitter } from 'tiny-emitter'
import { computed, reactive, ref, watch } from 'vue'
import { type WorkBook, read, utils } from 'xlsx'
import { genRandColor } from '../types'
import Column from '../types/column'
import Mapper from '../types/mapper'
import { getDftPjt, newOne, getProp } from '../utils'
import FormDialog from './FormDialog.vue'
import { message, type UploadChangeParam } from 'ant-design-vue'
import type { FileType } from 'ant-design-vue/es/upload/interface'
import BatImp from '../types/batImp'

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
const imInf = reactive<{
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
// Record<string(excel表的列索引), { prop: string(数据库表的列索引); color: 颜色; required: 不为空 }>
const binds = reactive<Record<string, { prop: string; color: string; required: boolean }>>({})
const headers = computed(() => ({ authorization: `Bearer ${localStorage.getItem('token')}` }))
const uploading = ref(false)

watch(
  () => [...props.columns],
  () => {
    dbInf.cols = props.columns
  }
)

async function onSubmit(info: BatImp, next: () => void) {
  emit('submit', BatImp.copy({ ...info, mapper: binds }))
  next()
}
function reloadExcel() {
  if (!imInf.book) {
    return
  }
  for (const sname of Object.keys(imInf.book.Sheets)) {
    if (!(sname in imInf.hdRowNos)) {
      imInf.hdRowNos[sname] = 0
    }
  }
  const worksheet = imInf.book.Sheets[imInf.actTab]
  const allData = utils.sheet_to_json<any[]>(worksheet, { header: 1 })
  imInf.totalNum = allData.length
  // 默认使用第一行作为表头
  const hdRowNo = imInf.hdRowNos[imInf.actTab]
  const header =
    hdRowNo !== -1
      ? allData[hdRowNo]
      : [...new Array(allData[0]).keys()].map((nCol: number) => utils.encode_col(nCol))
  imInf.columns.splice(0, imInf.columns.length, ...header.map(prop => new Column(prop, prop)))
  // 表头的下一行为数据开始行
  const begRowNo = hdRowNo + 1
  imInf.data = allData
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
  const exIdx = Object.keys(binds).indexOf(exCol)
  const colors = Object.values(binds).map(b => b.color)
  const disables = exIdx === -1 ? [colors[colors.length - 1]] : colors.slice(exIdx - 1, exIdx + 1)
  binds[exCol] = { prop: dbCol, color: genRandColor(disables.filter(dsb => dsb)), required: false }
  binds[dbCol] = { prop: '', color: binds[exCol].color, required: false }
}
function onColUnbindClick(dbCol: string) {
  delete binds[dbCol]
  for (const [key, val] of Object.entries(binds)) {
    if (val.prop === dbCol) {
      delete binds[key]
      break
    }
  }
}
function onSetDragonCol(column?: Column) {
  dbInf.dragon = column ? column.key : ''
}
function onExcelUpload(info: UploadChangeParam) {
  uploading.value = true
  if (info.file.status === 'done') {
    const reader = new FileReader()
    reader.readAsArrayBuffer(info.file.originFileObj as FileType)
    reader.onload = () => {
      imInf.book = read(reader.result)
      imInf.sheets = imInf.book.SheetNames
      imInf.actTab = imInf.book.SheetNames[0]
      emitter.emit('update:visible', { show: true, object: { worksheet: reloadExcel() } })
      uploading.value = false
    }
  } else if (info.file.status === 'error') {
    message.error(`${info.file.name} 上传Excel失败！`)
    uploading.value = false
  }
}
function getHdColor(column: Column) {
  return column.key in binds
    ? {
        'background-color': binds[column.key].color
      }
    : undefined
}
function getHdDesc(column: Column) {
  return `上传表的【${column.title}】列填入数据库的【'${getProp(binds, column.key + '.prop')}】字段`
}

const mapper = new Mapper({
  itfcTable: {
    label: '对接表',
    type: 'Unknown'
  },
  advanced: {
    label: '高级',
    type: 'FormGroup',
    items: {
      boolMapper: {
        label: '布尔对应值',
        type: 'Unknown'
      },
      dtTmFormat: {
        label: '日期时间格式',
        type: 'Input'
      }
    }
  }
})
</script>

<style>
#tblItfc th.ant-table-cell {
  padding: 0 !important;
}
</style>
