<template>
  <a-button @click="() => emitter.emit('update:visible', true)">
    <template #icon><export-outlined /></template>
    批量导出
  </a-button>
  <FormDialog
    title="导出登记在案的资产"
    width="80vw"
    :lblWid="3"
    :newFun="copyFun"
    :emitter="emitter"
    :mapper="mapper"
    @submit="onSubmit"
    @update:visible="resetAllChk"
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
            <a-input-number :min="-1" :max="formState.totalNum" v-model:value="formState.hdRowNo" />
          </a-form-item>
          <a-form-item label="数据行">
            <a-input-number :min="-1" :max="formState.totalNum" v-model:value="formState.dtRowNo" />
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
            <div
              class="p-2"
              :class="{
                'bg-slate-600': dbInf.dragon === column.key,
                'text-white': dbInf.dragon === column.key || column.key in binds.colors
              }"
              :style="
                column.key in binds.colors
                  ? {
                      'background-color': clrMap[binds.colors[column.key]]
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
        :options="dbInf.cols.map((col: any) => ({ label: col.title, value: col.dataIndex }))"
      />
    </template>
  </FormDialog>
</template>

<script lang="ts" setup name="BchExpBox">
import Mapper from '../types/mapper'
import { onMounted, reactive, watch } from 'vue'
import FormDialog from './FormDialog.vue'
import { TinyEmitter as Emitter } from 'tiny-emitter'
import { ExportOutlined, InfoCircleOutlined } from '@ant-design/icons-vue'
import Column from '../types/column'
import { read, utils } from 'xlsx'
import { Color, Cond, clrMap, colors } from '../types'
import { getDftPjt } from '../utils'
import { genDspColumns, genDspRecords } from '../utils'
import Batch from '../types/batch'

const emit = defineEmits(['submit'])
const props = defineProps({
  columns: { type: Array as () => Column[], required: true },
  copyFun: { type: Function, required: true }
})
const emitter = new Emitter()
const dbInf = reactive<{
  cols: Column[]
  dragon: string
}>({
  cols: props.columns,
  dragon: ''
})
const allChk = reactive({
  indeterminate: true,
  checkAll: true
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

onMounted(resetAllChk)
watch(
  () => props.columns.length,
  () => {
    dbInf.cols.splice(0, dbInf.cols.length, ...props.columns)
    resetAllChk()
  }
)

function resetAllChk() {
  emitter.emit('update:dprop', { filterCols: dbInf.cols.map(col => col.dataIndex) })
  allChk.checkAll = true
  allChk.indeterminate = false
}
function onAllChkChange(e: any) {
  emitter.emit('update:dprop', {
    filterCols: e.target.checked ? dbInf.cols.map(col => col.dataIndex) : []
  })
}
async function onSubmit(info: any, next: () => void) {
  info.ttlMap = Object.fromEntries(props.columns.map(col => [col.dataIndex, col.title]))
  emit('submit', info)
  next()
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
    label: '上传参照文档',
    type: 'UploadFile',
    desc: '没有参照文档，则导出所有设备',
    path: `/${getDftPjt()}/api/v1/excel/upload`,
    headers: { authorization: `Bearer ${localStorage.getItem('token')}` },
    onChange: (form: any, info: any) => {
      form.loading = true
      if (info.file.status === 'done') {
        const reader = new FileReader()
        reader.readAsArrayBuffer(info.file.originFileObj)
        reader.onload = () => {
          const workbook = read(reader.result)
          form.worksheet = workbook.Sheets[workbook.SheetNames[0]]
          const allData = utils.sheet_to_json<any[]>(form.worksheet, { header: form.hdRowNo })
          form.totalNum = allData.length
          form.loading = false
        }
      }
    }
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
