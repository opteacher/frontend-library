<template>
  <div class="flex flex-col space-y-2.5" :class="{ [sclHeight]: sclHeight.startsWith('h-') }">
    <div class="flex justify-between">
      <h3 class="mb-0 ml-2 flex-1">
        <keep-alive v-if="icon">
          <component :is="`AntdIcons.${icon}`" v-bind="{ class: 'text-3xl' }" />
        </keep-alive>
        {{ title }}&nbsp;
        <span class="text-gray-400 text-sm">{{ description }}</span>
      </h3>
      <a-space>
        <SelColBox v-if="dspCols" :columns="columns" @change="fmtColumns" />
        <template v-if="addable">
          <a-space v-if="imExport">
            <BchExpBox
              :columns="colsState"
              :copyFun="genCpyFun(BchExport, () => ({ column: '', compare: '=' }))"
              @submit="(info: any) => onBatchSubmit(info, 'export')"
            />
            <BchImpBox
              :upload-url="(imExport as any).uploadUrl"
              :columns="colsState"
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
    <RefreshBox v-if="refOptions.length" :tblRfsh="refOptions" @click="refresh" />
    <a-table
      class="flex-1 overflow-hidden"
      :columns="colsState"
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
      @change="(pagination: any, filters: any) => refresh(undefined, { pagination, filters })"
      @expand="(_expanded: unknown, record: any) => onRowExpand(record)"
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
      <template #headerCell="{ column }">
        <template v-if="$slots[column.key + 'HD']">
          <slot :name="column.key + 'HD'" v-bind="{ column }" />
        </template>
      </template>
      <template #bodyCell="{ text, column, record }">
        <template v-if="column.key === 'opera'">
          <div v-if="operaStyle === 'button'" class="flex space-x-1.5">
            <slot name="opera" v-bind="{ record }" />
            <a-button
              v-if="editable && !disable(record)"
              size="small"
              type="primary"
              ghost
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
              <a-button size="small" danger @click.stop="(e: any) => e.preventDefault()">
                删除
              </a-button>
            </a-popconfirm>
          </div>
          <div v-else-if="operaStyle === 'link'" class="flex space-x-1.5">
            <slot name="opera" v-bind="{ record }" />
            <a
              v-if="editable && !disable(record)"
              class="text-primary"
              @click.stop="onEditClicked(record)"
            >
              编辑
            </a>
            <a-popconfirm
              v-if="delable && !disable(record)"
              title="确定删除该记录吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="onRecordDel(record)"
            >
              <a class="text-error" @click.stop="">删除</a>
            </a-popconfirm>
          </div>
        </template>
        <slot v-else-if="$slots[column.key]" :name="column.key" v-bind="{ record }" />
        <CellCard
          v-else
          :cell="getCells(column.dataIndex)"
          :text="getCellTxt(text, column.dict)"
          :mapper="mapper[column.key]"
          :record="record"
          :keyword="column.dataIndex in searchState ? searchState[column.dataIndex].content : ''"
        />
      </template>
      <template v-if="$slots['expandedRowRender']" #expandedRowRender="{ record }">
        <slot name="expandedRowRender" v-bind="{ record }" />
      </template>
      <template #expandIcon="{ record }">
        <AntdIcons.MinusSquareOutlined
          v-if="expRowKeys.includes(record.key)"
          class="cursor-pointer hover:text-primary"
          @click.stop="onRowExpand(record)"
        />
        <AntdIcons.PlusSquareOutlined
          v-else
          class="cursor-pointer hover:text-primary"
          @click.stop="onRowExpand(record)"
        />
      </template>
      <template v-if="pagable" #footer>总共&nbsp;{{ records.data.length }}&nbsp;条记录</template>
    </a-table>
    <FormDialog
      v-model:show="fmDlg.visible"
      v-model:vw-only="fmDlg.vwOnly"
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
import * as AntdIcons from '@ant-design/icons-vue/lib/icons'
import { cloneDeep } from 'lodash'
import { TinyEmitter as Emitter } from 'tiny-emitter'
import { v4 as uuid } from 'uuid'
import { computed, onMounted, reactive, ref, useSlots } from 'vue'

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
  emitter: { type: Emitter, default: null },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  size: { type: String, default: 'default' },
  pagable: { type: Boolean, default: false },
  filter: { type: Function, default: () => true },
  editable: { type: Boolean, default: true },
  addable: { type: Boolean, default: true },
  delable: { type: Boolean, default: true },
  imExport: { type: [Object, Boolean], default: () => false },
  ieIgnCols: { type: Array, default: () => [] },
  disable: { type: Function, default: () => false },
  clkable: { type: Boolean, default: true },
  refOptions: { type: Array, default: () => [] },
  operaStyle: { type: String, default: 'link' },
  dspCols: { type: Boolean, default: false },
  sclHeight: { type: String, default: '' }
})
const colsState = reactive<Column[]>([])
const records = reactive({
  data: [] as unknown[],
  total: 0,
  offset: 0,
  limit: 10, // 跟antd一致
  filters: undefined as any
})
const expRowKeys = reactive([] as string[])
const editKey = ref<string>('')
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

onMounted(refresh)
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
      case 'default':
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
  records.limit = 10
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
    for (const key of Object.keys(searchState)) {
      onSchReset(searchState[key].reset, key)
      delete searchState[key]
    }
    for (const column of props.columns) {
      searchState[(column as Column).dataIndex] = {
        content: '',
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
        params: pickOrIgnore(records, Array.from(ignPams))
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
        return record[prop].includes(content)
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
    props.emitter.emit('update:show', false)
  } else {
    fmDlg.visible = false
  }
  loading.value = false
  fmtColumns()
  loading.value = false
}
function onEditClicked(record?: any) {
  emit('add', record)
  editKey.value = ''
  if (record) {
    editKey.value = record.key || ''
  }
  if (props.emitter) {
    props.emitter.emit('update:show', {
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
    editKey.value === ''
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
    props.emitter.emit('update:show', false)
  } else {
    fmDlg.visible = false
  }
  await refresh()
}
function onRowExpand(record: { key: string }) {
  const expand = !expRowKeys.includes(record.key)
  if (expand) {
    expRowKeys.push(record.key)
  } else {
    expRowKeys.splice(expRowKeys.indexOf(record.key), 1)
  }
  emit('expand', { expand, record })
}
function onRowClick(record: any) {
  if (props.emitter) {
    props.emitter.emit('update:show', {
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
  return (src: any, tgt?: any, force = false) => {
    const devKeys = Object.keys(props.newFun())
    tgt =
      tgt ||
      Object.assign(
        new b(),
        Object.fromEntries(devKeys.map((key: string) => [`col${upperFirst(key)}`, genDft()]))
      )
    b.copy(src, tgt)
    for (const key of devKeys) {
      const colKey = `col${upperFirst(key)}`
      tgt[colKey] = force ? src[colKey] : src[colKey] || tgt[colKey]
    }
    return tgt
  }
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
  if (props.editable || props.delable || slots['opera']) {
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

.ant-table-body {
  @apply absolute bottom-0 left-0 right-0;
}

.ant-table-footer {
  @apply border-b-0 !important;
  @apply border-l-0 !important;
  @apply border-r-0 !important;
}
</style>
