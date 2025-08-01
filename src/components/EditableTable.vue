<template>
  <div class="flex flex-col" :class="{ [sclHeight]: sclHeight.startsWith('h-') }">
    <div class="flex justify-between mb-2.5">
      <h3 v-if="title" class="mb-0 ml-2 flex-1">
        <keep-alive v-if="icon">
          <component :is="`AntdIcons.${icon}`" v-bind="{ class: 'text-3xl' }" />
        </keep-alive>
        <slot v-if="$slots.title" name="title" />
        <b v-else>{{ title }}</b>&nbsp;
        <slot v-if="$slots.description" name="description" />
        <span v-else class="text-gray-400 text-sm">{{ description }}</span>
      </h3>
      <a-space>
        <SelColBox v-if="dspCols" :columns="columns" @change="fmtColumns" />
        <template v-if="addable">
          <a-space v-if="imExport">
            <BchExpBox
              :columns="colsState.filter(col => col.dataIndex !== 'opera')"
              :copyFun="genCpyFun(BchExport, () => ({ column: '', compare: '=' }))"
              @submit="(info: any) => onBatchSubmit(info, 'export')"
            />
            <BchImpBox
              :upload-url="(imExport as any).uploadUrl"
              :columns="colsState.filter(col => col.dataIndex !== 'opera')"
              :ignCols="fmtIeIgnCols"
              :copyFun="genCpyFun(BchImport, () => '')"
              @submit="(info: any) => onBatchSubmit(info, 'import')"
            />
          </a-space>
          <a-button type="primary" :loading="loading" @click="onEditClicked()">添加</a-button>
        </template>
        <slot name="extra" />
      </a-space>
    </div>
    <RefreshBox v-if="refshOpns.length" class="mb-2.5" :tblRfsh="refshOpns" @click="refresh" />
    <a-table
      class="flex-1 overflow-hidden"
      :class="{ 'edtble-table': minHeight }"
      :columns="colsState as ColumnType[]"
      :data-source="records.data"
      :size="size"
      :rowClassName="() => 'bg-white'"
      :pagination="pagable ? { total: records.total, pageSize: records.limit } : false"
      v-model:expandedRowKeys="expRowKeys"
      :loading="loading"
      bordered
      :scroll="sclHeight ? { x: 'max-content', y: '100%' } : { x: 'max-content' }"
      :custom-row="
        (record: any) => ({
          onClick: clkable ? () => onRowClick(record) : undefined
        })
      "
      @resize-column="onColWidRsz"
      @change="(pagination: any, filters: any) => refresh(undefined, { pagination, filters })"
      @expand="(expanded: boolean, record: any) => (expanded ? emit('expand', record) : undefined)"
    >
      <template #customFilterIcon="{ column, filtered }">
        <AntdIcons.SearchOutlined
          v-if="column.searchable"
          :style="{ color: filtered ? '@primary-color' : undefined }"
        />
        <AntdIcons.FilterFilled
          v-else
          :style="{ color: filtered ? '@primary-color' : undefined }"
        />
      </template>
      <template
        #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
      >
        <div v-if="column.searchable" class="p-1">
          <a-input
            class="w-47 mb-1 block"
            ref="searchInput"
            :placeholder="`搜索${column.title}`"
            :value="selectedKeys[0]"
            @change="(e: any) => setSelectedKeys(e.target.value ? [e.target.value] : [])"
            @pressEnter="onDoSearch(selectedKeys, confirm, clearFilters, column.dataIndex)"
          />
          <a-button
            class="w-23 mr-1"
            type="primary"
            size="small"
            @click="onDoSearch(selectedKeys, confirm, clearFilters, column.dataIndex)"
          >
            <template #icon><AntdIcons.SearchOutlined /></template>
            搜索
          </a-button>
          <a-button class="w-23" size="small" @click="onSchReset(clearFilters, column.dataIndex)">
            重置
          </a-button>
        </div>
      </template>
      <template #headerCell="{ column }: any">
        <template v-if="$slots[column.dataIndex + 'HD']">
          <slot :name="column.dataIndex + 'HD'" v-bind="{ column }" />
        </template>
        <template v-if="column.dataIndex === 'opera'">
          {{ column.title }}&nbsp;
          <a-button
            v-if="rszCols"
            type="link"
            size="small"
            @click.stop="() => fmtColumns()"
          >
            重置长宽
          </a-button>
        </template>
      </template>
      <template #bodyCell="{ text, column, record }: any">
        <template v-if="column.dataIndex === 'opera'">
          <div class="flex">
            <slot name="operaBefore" v-bind="{ record }" />
            <a-button
              v-if="editable && !disable(record)"
              size="small"
              :type="operaStyle"
              @click.stop="onEditClicked(record)"
            >
              编辑
            </a-button>
            <a-popconfirm
              v-if="delable && !disable(record)"
              title="确定删除该记录吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="onRecordDel(record)"
            >
              <a-button
                size="small"
                danger
                :type="operaStyle"
                @click.stop="(e: any) => e.preventDefault()"
              >
                删除
              </a-button>
            </a-popconfirm>
            <slot name="operaAfter" v-bind="{ record }" />
          </div>
        </template>
        <slot v-else-if="$slots[column.dataIndex]" :name="column.dataIndex" v-bind="{ record }" />
        <CellCard
          v-else
          :cell="getCells(column.dataIndex)"
          :text="getCellTxt(text, column.dict)"
          :mapper="mapper[column.dataIndex]"
          :record="record"
          :keyword="column.dataIndex in searchState ? searchState[column.dataIndex].content : ''"
        />
      </template>
      <template v-if="$slots['expandedRowRender']" #expandedRowRender="{ record }">
        <slot name="expandedRowRender" v-bind="{ record }" />
      </template>
      <template v-if="pagable" #footer>总共&nbsp;{{ records.data.length }}&nbsp;条记录</template>
    </a-table>
    <FormDialog
      v-model:visible="fmDlg.visible"
      v-model:vw-only="fmDlg.vwOnly"
      :width="dlgWidth"
      :new-fun="newFun"
      :object="fmDlg.object"
      :title="title || (editKey ? '编辑项' : '增加项')"
      :emitter="emitter"
      :mapper="mapper"
      @submit="onRecordSave"
    >
      <template
        v-for="pname in Object.keys(mapper).filter((key: any) => $slots[key + 'EDT'])"
        :key="pname"
        #[pname]="{ formState }"
      >
        <slot :name="pname + 'EDT'" v-bind="{ editing: formState, mapper: mapper[pname] }" />
      </template>
      <template
        v-for="pname in Object.keys(mapper).filter((key: any) => $slots[key + 'VW'])"
        :key="pname + 'VW'"
        #[`${pname}VW`]="{ formState }"
      >
        <slot :name="pname + 'VW'" v-bind="{ current: formState, mapper: mapper[pname] }" />
      </template>
    </FormDialog>
  </div>
</template>

<script lang="ts" setup name="EditableTable">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Table as ATable } from 'ant-design-vue'
import * as AntdIcons from '@ant-design/icons-vue'
import { cloneDeep } from 'lodash'
import { TinyEmitter as Emitter } from 'tiny-emitter'
import { v4 as uuid } from 'uuid'
import { computed, onMounted, reactive, ref, useSlots, type PropType } from 'vue'

import Batch from '../types/batch'
import BchExport from '../types/bchExport'
import BchImport from '../types/bchImport'
import { Cells } from '../types/cell'
import Column from '../types/column'
import Mapper from '../types/mapper'
import { pickOrIgnore, setProp, upperFirst, waitFor } from '../utils'
import BchExpBox from './BchExpBox.vue'
import BchImpBox from './BchImpBox.vue'
import CellCard from './CellCard.vue'
import FormDialog from './FormDialog.vue'
import RefreshBox from './RefreshBox.vue'
import SelColBox from './SelColBox.vue'
import type { SizeType } from 'ant-design-vue/es/config-provider'
import type { ColumnType } from 'ant-design-vue/es/table'
import type { ButtonType } from 'ant-design-vue/es/button'

const emit = defineEmits([
  'add',
  'edit',
  'before-save',
  'save',
  'after-save',
  'delete',
  'refresh',
  'expand'
])
const props = defineProps({
  icon: { type: String, default: '' },
  api: { type: Object /* ComAPI */, required: true },
  columns: { type: Array, required: true },
  cells: { type: Array, default: () => [] },
  mapper: { type: Mapper, default: new Mapper() },
  newFun: { type: Function, default: () => ({}) },
  emitter: { type: Emitter, default: new Emitter() },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  size: { type: String as PropType<SizeType>, default: undefined },
  pagable: { type: Boolean, default: false },
  pageSize: { type: Number, default: 10 },
  filter: { type: Function, default: () => true },
  editable: { type: Boolean, default: true },
  addable: { type: Boolean, default: true },
  delable: { type: Boolean, default: true },
  rszCols: { type: Boolean, default: true },
  imExport: { type: [Object, Boolean], default: () => false },
  ieIgnCols: { type: Array, default: () => [] },
  disable: { type: Function, default: () => false },
  clkable: { type: Boolean, default: false },
  refshOpns: { type: Array, default: () => [] },
  mountRefsh: { type: Boolean, default: true },
  operaStyle: { type: String as PropType<ButtonType>, default: 'link' },
  dspCols: { type: Boolean, default: false },
  dlgWidth: { type: String, default: '50vw' },
  sclHeight: { type: String, default: '' },
  minHeight: { type: String, default: '' }
})
const colsState = reactive<Column[]>([])
const records = reactive({
  data: [] as unknown[],
  total: 0,
  offset: 0,
  limit: props.pageSize,
  filters: undefined as any
})
const expRowKeys = ref([] as string[])
const editKey = ref<any>('')
const loading = ref(false)
const searchState = reactive<Record<string, { content: string; reset: Function }>>({})
const fmtIeIgnCols = computed(() =>
  (props.ieIgnCols as string[]).concat('opera').map(col => `col${upperFirst(col)}`)
)
const fmDlg = reactive({
  visible: false,
  vwOnly: false,
  object: props.newFun()
})
const slots = useSlots()

if (props.mountRefsh) {
  onMounted(refresh)
}
if (props.emitter) {
  props.emitter.on('refresh', refresh)
  props.emitter.on('load', (load: boolean) => {
    loading.value = load
  })
  props.emitter.on('update:cprop', (column: Record<string, any>) => {
    for (const [prop, value] of Object.entries(column)) {
      const fstPoi = prop.indexOf('.')
      const colKey = prop.substring(0, fstPoi !== -1 ? fstPoi : prop.length)
      const col = colsState.find(col => col.key === colKey)
      if (!col) {
        return
      }
      setProp(col, prop.substring(fstPoi !== -1 ? fstPoi + 1 : 0), value)
    }
    fmtColumns(colsState)
  })
  props.emitter.on('search', (keywords: object) => {
    Object.entries(keywords).map(([key, value]: any) => {
      if (key in searchState) {
        searchState[key].content = value
      } else {
        searchState[key] = { content: value, reset: () => console.log() }
      }
    })
  })
  if (!props.editable && !props.addable) {
    props.emitter.off('update:visible')
  }
}
fmtColumns()

async function refresh(data?: any[], params?: any) {
  loading.value = true
  const tblBdy = await waitFor('ant-table-body', { getBy: 'class' })
  if (tblBdy) {
    let colHgt = 0
    switch (props.size) {
      case 'small':
        colHgt = 41
        break
      case 'middle':
        colHgt = 48
        break
      case 'large':
      default:
        colHgt = 57
        break
    }
    const layNum =
      Math.max(...props.columns.map((column: any) => (column.group ? column.group.length : 0))) + 1
    if (tblBdy.style) {
      tblBdy.style.top = layNum * colHgt + 'px'
    }
  }
  records.offset = 0
  records.limit = props.pageSize
  records.filters = undefined
  let ignPams = new Set(['data', 'total', 'filters', 'offset', 'limit'])
  if (params) {
    if (params.filters) {
      for (const [key, val] of Object.entries(params.filters)) {
        if (!val) {
          continue
        }
        const column = props.columns.find((col: any) => col.key === key)
        if (!column) {
          continue
        }
        if (!records.filters) {
          records.filters = {}
        }
        records.filters[(column as Column).dataIndex] = val
      }
    }
    if (params.pagination) {
      records.limit = params.pagination.pageSize || records.limit
      if (params.pagination.current) {
        records.offset = (params.pagination.current - 1) * records.limit
      }
      ignPams.delete('offset')
      ignPams.delete('limit')
    }
  } else {
    const keywords = {} as Record<string, string>
    for (const key of Object.keys(searchState)) {
      keywords[key] = searchState[key].content
      onSchReset(searchState[key].reset, key)
      delete searchState[key]
    }
    for (const column of props.columns as Column[]) {
      searchState[column.dataIndex] = {
        content: keywords[column.dataIndex] || '',
        reset: () => console.log()
      }
    }
  }
  records.total = props.api.count ? await props.api.count() : 0
  let orgData = []
  if (data) {
    orgData = data
  } else if (props.api.filter) {
    orgData = await props.api.filter(records.filters)
  } else {
    orgData = await props.api.all({
      axiosConfig: {
        params: Object.assign(pickOrIgnore(records, Array.from(ignPams)), records.filters)
      }
    })
    orgData = orgData.filter((record: any) => {
      for (const [prop, content] of Object.entries(searchState).map(([prop, value]) => [
        prop,
        value.content
      ])) {
        if (!content) {
          continue
        }
        /**
         * @todo 这里应该做类型判断后再做相等或包含判断
         */
        return record[prop] == content
      }
      return true
    })
  }
  records.data = orgData
    .filter(props.filter as (value: any, index: number) => boolean)
    .map((item: any) => cloneDeep(item))
  if (!records.total) {
    records.total = records.data.length
  }
  emit('refresh', records.data, (pcsData: any) => {
    if (typeof pcsData !== 'undefined') {
      records.data = pcsData
    }
  })
  editKey.value = ''
  if (props.emitter) {
    props.emitter.emit('update:visible', false)
  } else {
    fmDlg.visible = false
  }
  loading.value = false
  fmtColumns()
  loading.value = false
}
function onEditClicked(record?: any) {
  emit(record ? 'edit' : 'add', record)
  editKey.value = ''
  if (record) {
    switch (true) {
      case typeof record.key !== 'undefined':
        editKey.value = record.key
        break
      case typeof record.id !== 'undefined':
        editKey.value = record.id
        break
      case typeof record._id !== 'undefined':
        editKey.value = record._id
        break
    }
  }
  if (props.emitter) {
    props.emitter.emit('update:visible', {
      show: true,
      viewOnly: false,
      object: record || props.newFun()
    })
  } else {
    fmDlg.visible = true
    fmDlg.vwOnly = false
    fmDlg.object = record || props.newFun()
  }
}
async function onRecordSave(record: any, reset: Function) {
  loading.value = true
  emit('before-save', record)
  const result =
    editKey.value === '' || editKey.value === -1
      ? await props.api.add(record)
      : await props.api.update({ ...record, key: editKey.value })
  emit('save', record, refresh)
  reset()
  await refresh()
  emit('after-save', result)
}
async function onRecordDel(record: any) {
  loading.value = true
  await props.api.remove(record)
  emit('delete', record, refresh)
  if (props.emitter) {
    props.emitter.emit('update:visible', false)
  } else {
    fmDlg.visible = false
  }
  await refresh()
}
function onRowClick(record: any) {
  if (props.emitter) {
    props.emitter.emit('update:visible', {
      show: true,
      viewOnly: true,
      object: record
    })
  } else {
    fmDlg.visible = true
    fmDlg.vwOnly = true
    fmDlg.object = record
  }
}
async function onBatchSubmit(info: any, opera: 'import' | 'export') {
  loading.value = true
  await props.api.batch[opera](pickOrIgnore(info, ['worksheet']))
  await refresh()
}
function genCpyFun<B extends Batch>(b: { new (): B; copy: Function }, genDft: () => any) {
  return () =>
    Object.assign(
      new b(),
      Object.fromEntries(
        Object.keys(props.newFun()).map((key: string) => [`col${upperFirst(key)}`, genDft()])
      )
    )
}
function onDoSearch(
  selectedKeys: string[],
  confirm: () => void,
  clearFilters: Function,
  dataIndex: string
) {
  confirm()
  searchState[dataIndex].content = selectedKeys[0]
  searchState[dataIndex].reset = clearFilters
}
function onSchReset(clearFilters: Function, dataIndex: string) {
  clearFilters({ confirm: true })
  searchState[dataIndex].content = ''
}
function getCells(key: string) {
  return (props.cells.find((cell: any) => cell.refer === key) || new Cells()) as Cells
}
function getCellTxt(data: any, dist: Record<string, string>) {
  const text = (data || '').toString()
  return dist && text in dist ? dist[text] : text
}
function fmtColumns(columns?: Column[]) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d') as CanvasRenderingContext2D
  context.font = '14px Microsoft YaHei'
  const cols: Column[] = ((columns || props.columns) as Column[])
    .filter((column: Column) => !column.notDisplay)
    .map((column: Column) => {
      let width = column.width
      if (!column.width) {
        const textmetrics = context.measureText(column.title)
        width = textmetrics.width * 2.5
      }
      if (column.filterable) {
        ;(column as any).filters = Array.from(
          new Set(records.data.map((record: any) => record[column.dataIndex]))
        ).map(item => ({
          text: column.dict && typeof column.dict[item] !== 'undefined' ? column.dict[item] : item,
          value: item
        }))
        column.onFilter = (value: string, record: any) => record[column.dataIndex] == value
      }
      column.resizable = props.rszCols || column.resizable
      return {
        customHeaderCell: () => ({
          ...(column.custHdCell || {}),
          style: { width }
        }),
        customCell: () => ({
          ...(column.custCell || {}),
          style: {
            'white-space': 'nowrap',
            'text-overflow': 'ellipsis',
            overflow: 'hidden',
            width
          }
        }),
        width,
        ...pickOrIgnore(column, ['width', 'custHdCell', 'custCell', 'dict', 'notDisplay'])
      }
    })
  if (props.editable || props.delable || slots['opera'] || slots['operaBefore'] || slots['operaBefore']) {
    cols.push(new Column('操作', 'opera', { width: 80, fixed: 'right' }))
  }
  const col4Ist = [] as Column[]
  for (const col of cols) {
    if (!col.group || !col.group.length) {
      col4Ist.push(pickOrIgnore(col, ['group']))
    } else {
      let tmp: Column[] = col4Ist
      for (let i = 0; i < col.group.length; ++i) {
        const group = col.group[i]
        let tmpCol = tmp?.find(citm => citm.title === group)
        if (!tmpCol) {
          tmpCol = new Column(group, '', { key: uuid() })
          tmp.push(tmpCol as Column)
        }
        tmp = tmpCol?.children as Column[]
      }
      tmp.push(pickOrIgnore(col, ['group']))
    }
  }
  colsState.splice(0, colsState.length, ...col4Ist)
  canvas.remove()
}
function onColWidRsz(w: number, col: ColumnType) {
  if (col.resizable) {
    setProp(col, 'width', w)
  }
}
</script>

<style>
.ant-spin-nested-loading {
  @apply h-full;
}

.ant-spin-container {
  @apply h-full flex flex-col;
}

.ant-table {
  @apply flex-1;
}

.ant-table-container {
  @apply h-full relative;
}

.edtble-table .ant-table-container {
  min-height: 18rem;
}

.ant-table-body {
  @apply absolute bottom-0 left-0 right-0;
}

.ant-table-footer {
  @apply border-b-0 !important;
  @apply border-l-0 !important;
  @apply border-r-0 !important;
}
</style>
