<template>
  <div
    class="flex flex-col space-y-2.5"
    :class="{ [sclHeight]: sclHeight.startsWith('h-') }"
  >
    <div class="flex justify-between">
      <h3 class="mb-0 ml-2 flex-1">
        <keep-alive v-if="icon">
          <component :is="icon" v-bind="{ class: 'text-3xl' }" />
        </keep-alive>
        {{ title }}&nbsp;
        <span class="text-gray-400 text-sm">{{ description }}</span>
      </h3>
      <a-space>
        <SelColBox v-if="dspCols" :columns="columns" @change="fmtColumns" />
        <template v-if="addable">
          <a-space v-if="imExpable">
            <BchExpBox
              :columns="colsState"
              :copyFun="genCpyFun(BchExport, () => ({ column: '', compare: '=' }))"
              @submit="(info: any) => onBatchSubmit(info, 'export')"
            />
            <BchImpBox
              :columns="colsState"
              :ignCols="fmtIeIgnCols"
              :copyFun="genCpyFun(BchImport, () => '')"
              @submit="(info: any) => onBatchSubmit(info, 'import')"
            />
          </a-space>
          <a-button type="primary" @click="onEditClicked()">添加</a-button>
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
        <search-outlined
          v-if="column.searchable"
          :style="{ color: filtered ? '@primary-color' : undefined }"
        />
        <filter-filled v-else :style="{ color: filtered ? '@primary-color' : undefined }" />
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
            <template #icon><SearchOutlined /></template>
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
              <a-button
                size="small"
                danger
                @click.stop="(e: any) => e.preventDefault()"
              >
                删除
              </a-button>
            </a-popconfirm>
          </div>
          <div v-else-if="operaStyle === 'link'" class="flex space-x-1.5">
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
          :mapper="mapper[column.key] || {}"
          :record="record"
          :keyword="column.dataIndex in searchState ? searchState[column.dataIndex].content : ''"
        />
      </template>
      <template v-if="$slots['expandedRowRender']" #expandedRowRender="{ record }">
        <slot name="expandedRowRender" v-bind="{ record }" />
      </template>
      <template #expandIcon="{ record }">
        <minus-square-outlined
          v-if="expRowKeys.includes(record.key)"
          class="cursor-pointer hover:text-primary"
          @click.stop="onRowExpand(record)"
        />
        <plus-square-outlined
          v-else
          class="cursor-pointer hover:text-primary"
          @click.stop="onRowExpand(record)"
        />
      </template>
    </a-table>
    <FormDialog
      v-model:show="editing.show"
      :copy="copy"
      :title="title || undefined"
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
    </FormDialog>
  </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import { TinyEmitter as Emitter } from 'tiny-emitter'
import FormDialog from './FormDialog.vue'
import Column from '../types/column'
import Mapper from '../types/mapper'
import * as antdIcons from '@ant-design/icons-vue/lib/icons'
import SelColBox from './SelColBox.vue'
import { pickOrIgnore, upperFirst, waitFor } from '../utils'
import Batch from '../types/batch'
import BchExport from '../types/bchExport'
import BchImport from '../types/bchImport'
import RefreshBox from './RefreshBox.vue'
import { Cells } from '../types/cell'
import CellCard from './CellCard.vue'
import BchImpBox from './BchImpBox.vue'
import BchExpBox from './BchExpBox.vue'

export default defineComponent({
  name: 'EditableTable',
  emits: ['add', 'edit', 'before-save', 'save', 'after-save', 'delete', 'refresh', 'expand'],
  components: Object.assign(
    {
      FormDialog,
      SelColBox,
      RefreshBox,
      CellCard,
      BchImpBox,
      BchExpBox
    },
    antdIcons
  ),
  props: {
    icon: { type: String, default: '' },
    api: { type: Object /* ComAPI */, required: true },
    columns: { type: Array, required: true },
    cells: { type: Array, default: () => [] },
    mapper: { type: Mapper, default: new Mapper() },
    copy: { type: Function, default: () => ({ key: '#' }) },
    emitter: { type: Emitter, default: null },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    size: { type: String, default: 'default' },
    pagable: { type: Boolean, default: false },
    filter: { type: Function, default: () => true },
    editable: { type: Boolean, default: true },
    addable: { type: Boolean, default: true },
    delable: { type: Boolean, default: true },
    imExpable: { type: Boolean, default: false },
    ieIgnCols: { type: Array, default: () => [] },
    disable: { type: Function, default: () => false },
    clkable: { type: Boolean, default: true },
    refOptions: { type: Array, default: () => [] },
    operaStyle: { type: String, default: 'link' },
    dspCols: { type: Boolean, default: false },
    sclHeight: { type: String, default: '' }
  },
  setup(props, { emit }) {
    const colsState = reactive<Column[]>([])
    const records = reactive({
      data: [] as unknown[],
      total: 0,
      offset: 0,
      limit: 10, // 跟antd一致
      filters: undefined as any
    })
    const expRowKeys = reactive([] as string[])
    const editing = reactive({
      show: false,
      key: ''
    })
    const loading = ref(false)
    const searchState = reactive<Record<string, { content: string; reset: Function }>>(
      {}
    )
    const fmtIeIgnCols = computed(() =>
      (props.ieIgnCols as string[]).concat('opera').map(col => `col${upperFirst(col)}`)
    )

    onMounted(refresh)
    if (props.emitter) {
      props.emitter.on('refresh', refresh)
    }
    fmtColumns()

    async function refresh(data?: any[], params?: any) {
      loading.value = true
      waitFor('ant-table-body', { getBy: 'class' }).then(tblBdy => {
        if (!tblBdy) {
          return
        }
        switch (props.size) {
          case 'small':
            tblBdy.style.top = '41px'
            break
          case 'middle':
            tblBdy.style.top = '48px'
            break
          case 'default':
          case 'large':
          default:
            tblBdy.style.top = '57px'
            break
        }
      })
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
      const orgData =
        data ||
        (records.filters
          ? await props.api.filter(records.filters)
          : await props.api.all({
              axiosConfig: {
                params: pickOrIgnore(records, Array.from(ignPams))
              }
            }))
      records.data = orgData.filter(props.filter)
      if (!records.total) {
        records.total = records.data.length
      }
      emit('refresh', records.data, (pcsData: any) => {
        if (typeof pcsData !== 'undefined') {
          records.data = pcsData
        }
      })
      editing.key = ''
      editing.show = false
      loading.value = false
      fmtColumns()

      loading.value = false
    }
    function onEditClicked(record?: any) {
      emit('add', record)
      editing.key = ''
      props.emitter.emit('update:data', record)
      if (record) {
        editing.key = record.key || ''
      }
      props.emitter.emit('viewOnly', false)
      editing.show = true
    }
    async function onRecordSave(record: any, reset: Function) {
      loading.value = true
      emit('before-save', record)
      const result = editing.key === ''
        ? await props.api.add(record)
        : await props.api.update(record)
      emit('save', record, refresh)
      reset()
      await refresh()
      emit('after-save', result)
    }
    function onCclClicked() {
      refresh()
    }
    async function onRecordDel(record: any) {
      loading.value = true
      await props.api.remove(record)
      emit('delete', record, refresh)
      editing.show = false
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
      props.emitter.emit('viewOnly', true)
      props.emitter.emit('update:data', record)
      editing.show = true
    }
    async function onBatchSubmit(info: any, opera: 'import' | 'export') {
      loading.value = true
      await props.api.batch[opera](pickOrIgnore(info, ['worksheet']))
      await refresh()
    }
    function genCpyFun<B extends Batch>(
      b: { new (): B; copy: Function },
      genDft: () => any
    ) {
      return (src: any, tgt?: any, force = false) => {
        const devKeys = Object.keys(props.copy({}))
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
      const cols = (columns || props.columns) as Column[]
      colsState.splice(
        0,
        colsState.length,
        ...(props.editable || props.delable
          ? cols.concat(new Column('操作', 'opera', { width: 80, fixed: 'right' }))
          : cols
        )
          .filter((column: Column) => !column.notDisplay)
          .map((column: Column) => {
            if (column.dataIndex === 'opera') {
              return column
            }
            const textmetrics = context.measureText(column.title)
            const minWidth = textmetrics.width << 1
            const style = !column.width ? { 'min-width': `${minWidth}px` } : {}
            column.customHeaderCell = () => ({ style })
            column.customCell = () => ({
              style: Object.assign({
                'white-space': 'nowrap',
                'text-overflow': 'ellipsis',
                overflow: 'hidden'
              }, style)
            })
            return column
          })
      )
      canvas.remove()
    }
    return {
      Cells,
      BchExport,
      BchImport,

      colsState,
      loading,
      records,
      expRowKeys,
      editing,
      searchState,
      fmtIeIgnCols,

      refresh,
      onEditClicked,
      onRecordSave,
      onCclClicked,
      onRecordDel,
      onRowExpand,
      onRowClick,
      onBatchSubmit,
      genCpyFun,
      onDoSearch,
      onSchReset,
      getCells,
      getCellTxt,
      fmtColumns
    }
  }
})
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
</style>
