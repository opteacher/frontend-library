<template>
  <div class="h-full flex flex-col">
    <a-page-header :class="thdClass" v-if="showHeader">
      <template v-if="icon" #avatar>
        <keep-alive>
          <component :is="icon" v-bind="{ class: 'text-xl mr-3' }" />
        </keep-alive>
      </template>
      <template #title>
        <slot v-if="$slots.title" name="title" />
        <a-typography-title v-else class="mb-0" :level="4">{{ title }}</a-typography-title>
      </template>
      <template #subTitle>
        <slot v-if="$slots.description" name="description" />
        <a-typography-text v-else type="secondary">{{ description }}</a-typography-text>
      </template>
      <template #extra>
        <SelColBox v-if="dspCols" :columns="columns" @change="fmtColumns" />
        <a-space>
          <BatExpBox
            v-if="expable"
            :upload-url="(imExport as any).uploadUrl"
            :columns="colsState.filter(col => col.dataIndex !== 'opera')"
            :copyFun="genCpyFun(BatExp, () => ({ column: '', compare: '=' }))"
            @submit="(info: any) => onBatchSubmit(info, 'export')"
          />
          <BatImpBox
            v-if="addable && impable"
            :upload-url="(imExport as any).uploadUrl"
            :columns="colsState.filter(col => col.dataIndex !== 'opera')"
            :ignCols="fmtIeIgnCols"
            :copyFun="genCpyFun(BatImp, () => '')"
            @submit="(info: any) => onBatchSubmit(info, 'import')"
          />
          <a-button
            v-if="addable && editMode === 'form'"
            ref="addBtnRef"
            type="primary"
            :loading="loading"
            @click="onEditClicked()"
          >
            添加
          </a-button>
        </a-space>
        <slot name="extra" />
      </template>
      <template #tags>
        <slot name="tags" />
      </template>
    </a-page-header>
    <RefreshBox
      v-if="refOpns.length"
      class="mb-2.5"
      :tblRfsh="refOpns"
      @click="refresh"
      :emitter="emitter"
    />
    <div class="flex-1 flex">
      <slot name="left" v-bind="{ height: tableHgt }" />
      <a-table
        ref="tableRef"
        class="edit-table flex-1 overflow-hidden"
        :class="{ [tableClass]: true, 'no-rounded': !rounded }"
        :columns="colsState as ColumnType[]"
        :data-source="records.data"
        :size="size"
        :rowClassName="() => 'bg-white'"
        :pagination="
          pagable ? { showSizeChanger: true, total: records.total, pageSize: records.limit } : false
        "
        v-model:expandedRowKeys="expRowKeys"
        :loading="loading"
        :bordered="bordered"
        :scroll="{ x: 'max-content', y: tbodyHgt + 'px' }"
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
            <a-button v-if="rszCols" type="link" size="small" @click.stop="() => fmtColumns()">
              重置长宽
            </a-button>
          </template>
        </template>
        <template #bodyCell="{ text, column, record }: any">
          <template v-if="column.dataIndex === 'opera'">
            <slot name="operaBefore" v-bind="{ record }" />
            <template v-if="fmDlg.editing && fmDlg.object.key === record.key">
              <a-button size="small" type="link" @click="onEditFormSubmit">确定</a-button>
              <a-button size="small" type="text" @click="onEditFormCancel">取消</a-button>
            </template>
            <template v-else>
              <a-button
                v-if="
                  !disable(record) && (typeof editable === 'function' ? editable(record) : editable)
                "
                size="small"
                :type="operaStyle"
                @click.stop="onEditClicked(record)"
              >
                编辑
              </a-button>
              <a-popconfirm
                v-if="
                  !disable(record) && (typeof delable === 'function' ? delable(record) : delable)
                "
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
            </template>
            <slot name="operaAfter" v-bind="{ record }" />
          </template>
          <slot v-else-if="$slots[column.dataIndex]" :name="column.dataIndex" v-bind="{ record }" />
          <DirectField
            v-else-if="fmDlg.editing && fmDlg.object.key === record.key"
            :mapper="getProp(mapper, column.dataIndex)"
            :form="fmDlg.object"
            :emitter="emitter"
            @update:form="onEditFormUpdate"
          />
          <CellCard
            v-else
            :cell="getCells(column.dataIndex)"
            :text="getCellTxt(text, column, record)"
            :mapper="getProp(mapper, column.dataIndex)"
            :record="record"
            :keyword="column.dataIndex in searchState ? searchState[column.dataIndex].content : ''"
          />
        </template>
        <template v-if="$slots['expandedRowRender']" #expandedRowRender="{ record }">
          <slot name="expandedRowRender" v-bind="{ record }" />
        </template>
        <template v-if="isDrctAdd && !fmDlg.addForm" #footer>
          <a-tooltip>
            <template #title>添加记录</template>
            <a-button
              class="w-full border-0 h-auto rounded-t-none py-3"
              :class="{ 'rounded-b-none': !rounded }"
              type="text"
              @click="() => (fmDlg.addForm = true)"
            >
              <template #icon><AntdIcons.PlusOutlined /></template>
            </a-button>
          </a-tooltip>
        </template>
        <template v-if="isDrctAdd && fmDlg.addForm" #summary>
          <a-table-summary fixed>
            <a-table-summary-row>
              <a-table-summary-cell v-for="[key, value] in Object.entries(mapper)" :index="key">
                <DirectField
                  :mapper="value"
                  :form="fmDlg.object"
                  :emitter="emitter"
                  @update:form="onEditFormUpdate"
                />
              </a-table-summary-cell>
              <a-table-summary-cell>
                <a-button size="small" type="link" @click="onAddFormSubmit">确定</a-button>
                <a-button size="small" type="text" @click="onAddFormCancel">取消</a-button>
              </a-table-summary-cell>
            </a-table-summary-row>
          </a-table-summary>
        </template>
      </a-table>
      <slot name="right" v-bind="{ height: tableHgt }" />
    </div>
    <FormDialog
      v-if="needFmDlg"
      ref="fmDlgRef"
      v-model:visible="fmDlg.visible"
      v-model:vw-only="fmDlg.vwOnly"
      :width="dlgWidth"
      :full-screen="dlgFullScrn"
      :new-fun="newFun"
      :object="fmDlg.object"
      :title="title || (editKey ? '编辑项' : '增加项')"
      :emitter="emitter"
      :mapper="mapper"
      @submit="onRecordSave"
    >
      <template
        v-for="pname in Object.keys(mapper).filter((key: any) => $slots[key + 'EDT'])"
        #[pname]="{ formState }: any"
      >
        <slot :name="pname + 'EDT'" v-bind="{ editing: formState, mapper: mapper[pname] }" />
      </template>
      <template
        v-for="pname in Object.keys(mapper).filter((key: any) => $slots[key + 'VW'])"
        #[`${pname}VW`]="{ formState }: any"
      >
        <slot :name="pname + 'VW'" v-bind="{ current: formState, mapper: mapper[pname] }" />
      </template>
    </FormDialog>
    <a-tour
      :arrow="false"
      v-model:current="tourOpns.current"
      :open="tourOpns.open"
      :steps="tourSteps"
      @close="() => (tourOpns.open = false)"
    />
  </div>
</template>

<script lang="ts" setup name="EditableTable">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Table as ATable, type TourProps, Tour as ATour, notification } from 'ant-design-vue'
import * as AntdIcons from '@ant-design/icons-vue'
import { cloneDeep } from 'lodash'
import { TinyEmitter as Emitter } from 'tiny-emitter'
import { v4 as uuid } from 'uuid'
import {
  computed,
  onMounted,
  reactive,
  ref,
  useSlots,
  watch,
  type PropType,
  type FunctionalComponent,
  nextTick
} from 'vue'

import Batch from '../types/batch'
import BatExp from '../types/batExp'
import BatImp from '../types/batImp'
import { Cells } from '../types/cell'
import Column from '../types/column'
import Mapper from '../types/mapper'
import { pickOrIgnore, setProp, upperFirst, waitFor, getProp, type RequestOptions } from '../utils'
import BatExpBox from './BatExpBox.vue'
import BatImpBox from './BatImpBox.vue'
import CellCard from './CellCard.vue'
import FormDialog from './FormDialog.vue'
import RefreshBox from './RefreshBox.vue'
import SelColBox from './SelColBox.vue'
import type { SizeType } from 'ant-design-vue/es/config-provider'
import type { ColumnType } from 'ant-design-vue/es/table'
import type { ButtonType } from 'ant-design-vue/es/button'
import DirectField from './DirectField.vue'
import { type WorkSheet, utils, write } from 'xlsx'

const emit = defineEmits([
  'add',
  'edit',
  'before-save',
  'save',
  'after-save',
  'delete',
  'refresh',
  'expand',
  'form-open',
  'form-close'
])
const props = defineProps({
  icon: { type: Function as PropType<FunctionalComponent>, default: null },
  api: {
    type: Object as PropType<{
      add?: (form: any) => Promise<any>
      remove?: (record: any) => Promise<any>
      update?: (record: any) => Promise<any>
      all: (options?: RequestOptions) => Promise<any[]>
      filter?: (filters: any) => Promise<any[]>
      count?: () => Promise<number>
      batch?: Record<'import' | 'export', (info: BatImp | BatExp) => Promise<any>>
    }> /* ComAPI */,
    required: true
  },
  columns: { type: Array as PropType<Column[]>, required: true },
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
  editable: { type: [Boolean, Function], default: true },
  addable: { type: Boolean, default: true },
  delable: { type: [Boolean, Function], default: true },
  rszCols: { type: Boolean, default: true },
  imExport: { type: [Object, Boolean], default: () => false },
  ieIgnCols: { type: Array, default: () => [] },
  disable: { type: Function, default: () => false },
  clkable: { type: Boolean, default: false },
  refOpns: { type: Array as PropType<('manual' | 'auto')[]>, default: () => [] },
  mountRefsh: { type: Boolean, default: true },
  operaStyle: { type: String as PropType<ButtonType>, default: 'link' },
  dspCols: { type: Boolean, default: false },
  dlgWidth: { type: String, default: '50vw' },
  dlgFullScrn: { type: Boolean, default: false },
  editMode: { type: String as PropType<'direct' | 'form'>, default: 'form' },
  selable: { type: Boolean, default: false },
  tourSteps: { type: Array as PropType<TourProps['steps']>, default: [] },
  tableClass: { type: String, default: '' },
  bordered: { type: Boolean, default: true },
  rounded: { type: Boolean, default: true },
  needFmDlg: { type: Boolean, default: true },
  thdClass: { type: String, default: '' }
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
  editing: false,
  object: props.newFun(),
  addForm: false
})
const slots = useSlots()
const addBtnRef = ref<HTMLElement | null>(null)
const tableRef = ref<HTMLElement | null>(null)
const fmDlgRef = ref<HTMLElement | null>(null)
defineExpose({ addBtnRef, fmDlgRef, tableRef })
const tourOpns = reactive({
  current: 0,
  open: false
})
const showHeader = computed(
  () =>
    props.icon ||
    props.title ||
    props.description ||
    props.imExport ||
    (props.addable && props.editMode === 'form') ||
    slots.title ||
    slots.description ||
    slots.extra ||
    slots.tags
)
const isDrctAdd = computed(
  () => props.editMode === 'direct' && props.addable && props.columns.length
)
const tbodyHgt = ref(0)
const tableHgt = ref(0)
const expable = computed(() => {
  switch (typeof props.imExport) {
    case 'object':
      return props.imExport.expable
    case 'boolean':
      return props.imExport
    default:
      return false
  }
})
const impable = computed(() => {
  switch (typeof props.imExport) {
    case 'object':
      return props.imExport.impable
    case 'boolean':
      return props.imExport
    default:
      return false
  }
})

if (props.mountRefsh) {
  onMounted(refresh)
}
if (props.emitter) {
  props.emitter.on('refresh', refresh)
  props.emitter.on('load', (load: boolean) => {
    loading.value = load
  })
  props.emitter.on('update:columns', fmtColumns)
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
  props.emitter.on('update:tour', (visible: boolean) => (tourOpns.open = visible))
}
watch(
  () => fmDlg.visible,
  () => (fmDlg.visible ? emit('form-open') : emit('form-close'))
)
fmtColumns()

async function refresh(data?: any[], params?: any) {
  loading.value = true
  records.offset = 0
  records.limit = props.pageSize
  records.filters = undefined
  let ignPams = new Set(['data', 'total', 'filters', 'offset', 'limit'])
  if (props.pagable) {
    ignPams.delete('offset')
    ignPams.delete('limit')
  }
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
  fmtColumns()
  // 计算表体的高度
  nextTick(async () => {
    const edtTbl = await waitFor('edit-table', { getBy: 'class' })
    if (edtTbl) {
      const theader = await waitFor('ant-table-header', { getBy: 'class' })
      const tfooter = await waitFor('ant-table-footer', { getBy: 'class' })
      tbodyHgt.value =
        edtTbl?.scrollHeight -
        (theader?.clientHeight || 0) -
        (tfooter?.clientHeight || 0) -
        (props.pagable ? 64 : 0)
      tableHgt.value = (await waitFor('ant-spin-nested-loading', { getBy: 'class' }).then(
        el => el?.offsetHeight
      )) as number
    }
  })
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
  if (props.editMode === 'direct') {
    fmDlg.editing = true
    fmDlg.object = cloneDeep(record)
  } else if (props.emitter) {
    props.emitter.emit('update:visible', {
      show: true,
      viewOnly: false,
      object: record ? cloneDeep(record) : props.newFun()
    })
  } else {
    fmDlg.visible = true
    fmDlg.vwOnly = false
    fmDlg.object = record ? cloneDeep(record) : props.newFun()
  }
}
async function onRecordSave(record: any, reset: Function) {
  loading.value = true
  emit('before-save', record)
  if (props.emitter && props.editMode === 'direct') {
    try {
      await new Promise((resolve, reject) =>
        props.emitter.emit('check:rules', (checked: boolean) => (checked ? resolve('') : reject()))
      )
    } catch (e) {
      loading.value = false
      return
    }
  }
  let result = null
  if (editKey.value === '' || editKey.value === -1) {
    props.api.add ? await props.api.add(record) : undefined
  } else {
    props.api.update ? await props.api.update({ ...record, key: editKey.value }) : undefined
  }
  emit('save', record, refresh)
  reset()
  await refresh()
  emit('after-save', result)
}
async function onRecordDel(record: any) {
  if (!props.api.remove) {
    return
  }
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
async function onBatchSubmit(info: BatImp | BatExp, opera: 'import' | 'export') {
  loading.value = true
  const data = pickOrIgnore(info, ['worksheet'])
  if (props.api.batch && opera in props.api.batch) {
    await props.api.batch[opera](data)
  } else if (opera === 'import' && props.api.add) {
    const allData = utils.sheet_to_json<any[]>(info.worksheet as WorkSheet, {
      header: 1
    })
    const colDict = Object.entries(info.mapper).map(([key, value]) => [
      allData[info.hdRowNo].indexOf(key),
      value.prop
    ]) as [number, string][]
    const reqDict = Object.fromEntries(
      Object.entries(info.mapper).map(([_colNam, prop]) => [prop.prop, prop.required])
    )
    const records = allData
      .slice(info.dtRowNo)
      .map(record =>
        Object.fromEntries(
          colDict.map(([idx, prop]) => {
            if (reqDict[prop]) {
              return record[idx] ? [prop, record[idx]] : [prop]
            } else {
              return [prop, record[idx]]
            }
          })
        )
      )
      .filter(
        record => !Object.entries(reqDict).some(([prop, required]) => required && !record[prop])
      )
    if (props.api.add) {
      for (const record of records) {
        props.api.add(record)
      }
    } else {
      notification.error({
        message: '批量导入既为定义接口，也没事新增接口！'
      })
      return
    }
  } else if (opera === 'export') {
    const records = await props.api
      .all({
        axiosConfig: { params: { selCols: (info as BatExp).filterCols } }
      })
      .then(records =>
        records.map(record =>
          Object.fromEntries(
            Object.entries(record).filter(([prop]) => (info as BatExp).filterCols.includes(prop))
          )
        )
      )
    const workbook = utils.book_new()
    const worksheet = utils.json_to_sheet(records)
    utils.sheet_add_aoa(worksheet, [props.columns.map(col => col.title)], { origin: 'A1' })
    utils.book_append_sheet(workbook, worksheet, 'Sheet1')
    const fileName = ((props.imExport as any)['expName'] || props.title || 'test') + '.xlsx'
    const data = write(workbook, { type: 'array', bookType: 'xlsx' })
    const blob = new Blob([data], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.download = fileName
    a.href = url
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
  }
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
function getCellTxt(text: string, column: Column, record: any) {
  const txt = text ? text : getProp(record, column.dataIndex)
  return column.dict && txt in column.dict ? column.dict[txt] : txt || ''
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
  if (
    props.editable ||
    props.delable ||
    slots['opera'] ||
    slots['operaBefore'] ||
    slots['operaBefore']
  ) {
    cols.push(new Column('操作', 'opera', { width: 150, fixed: 'right' }))
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
function onAddFormCancel() {
  fmDlg.object = props.newFun()
  fmDlg.addForm = false
}
async function onAddFormSubmit() {
  await onRecordSave(fmDlg.object, onAddFormCancel)
}
function onEditFormCancel() {
  fmDlg.editing = false
  fmDlg.object = props.newFun()
}
async function onEditFormSubmit() {
  await onRecordSave(fmDlg.object, onEditFormCancel)
}
function onEditFormUpdate(vals: any) {
  Object.entries(vals).map(([key, val]) => setProp(fmDlg.object, key, val))
}
</script>

<style>
.edit-table .ant-table {
  margin: 0 !important;
}
.edit-table .ant-table-footer {
  @apply text-center;
}
.edit-table .ant-table-footer {
  padding: 0 !important;
}

.no-rounded table {
  @apply rounded-none;
}
.no-rounded table > thead > tr:first-child > *:first-child {
  border-radius: 0 !important;
}
.no-rounded table > thead > tr:first-child > *:last-child {
  border-radius: 0 !important;
}
.no-rounded .ant-table-footer {
  @apply rounded-none;
}

.ant-tabs-nav {
  margin-bottom: 0 !important;
}
</style>
