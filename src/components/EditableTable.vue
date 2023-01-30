<template>
  <div class="h-full flex flex-col space-y-2.5">
    <div class="flex justify-between">
      <h3 class="mb-0">
        <keep-alive v-if="icon">
          <component :is="icon" v-bind="{ class: 'text-4xl' }" />
        </keep-alive>
        {{ title }}
        <span class="text-gray-400">{{ description }}</span>
      </h3>
      <a-space>
        <SelColBox v-model:columns="cols" />
        <template v-if="addable">
          <a-space v-if="imExpable">
            <BchExpBox
              :columns="cols"
              :copyFun="genCpyFun(BchExport, () => ({ column: '', compare: '=' }))"
              @submit="(info: any) => onBatchSubmit(info, 'export')"
            />
            <BchImpBox
              :columns="cols"
              :copyFun="genCpyFun(BchImport, () => '')"
              @submit="(info: any) => onBatchSubmit(info, 'import')"
            />
          </a-space>
          <a-button type="primary" @click="onEditClicked()">添加</a-button>
        </template>
      </a-space>
    </div>
    <RefreshBox v-if="refOptions.length" :tblRfsh="refOptions" @click="refresh" />
    <a-table
      class="flex-auto"
      :columns="cols"
      :data-source="records.data"
      :size="size"
      :rowClassName="() => 'bg-white'"
      :pagination="false"
      v-model:expandedRowKeys="expRowKeys"
      :loading="loading"
      bordered
      :scroll="sclHeight ? { y: sclHeight } : undefined"
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
            @pressEnter="onDoSearch(selectedKeys, confirm, column.dataIndex)"
          />
          <a-button
            class="w-23 mr-1"
            type="primary"
            size="small"
            @click="onDoSearch(selectedKeys, confirm, column.dataIndex)"
          >
            <template #icon><SearchOutlined /></template>
            搜索
          </a-button>
          <a-button class="w-23" size="small" @click="onSchReset(clearFilters)">重置</a-button>
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
              v-if="editable"
              size="small"
              :disabled="disabled(record, 'edit')"
              @click.stop="onEditClicked(record)"
            >
              编辑
            </a-button>
            <a-popconfirm
              v-if="delable"
              title="确定删除该记录吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="onRecordDel(record)"
            >
              <a-button
                size="small"
                danger
                :disabled="disabled(record, 'delete')"
                @click.stop="(e: any) => e.preventDefault()"
              >
                删除
              </a-button>
            </a-popconfirm>
          </div>
          <div v-if="operaStyle === 'link'" class="flex space-x-1.5">
            <a
              v-if="editable"
              :disabled="disabled(record, 'edit')"
              @click.stop="onEditClicked(record)"
            >
              编辑
            </a>
            <a-popconfirm
              v-if="delable"
              title="确定删除该记录吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="onRecordDel(record.key)"
            >
              <a :disabled="disabled(record, 'delete')" class="text-error" @click.stop="">删除</a>
            </a-popconfirm>
          </div>
        </template>
        <slot v-else-if="chkInSlot(column.key)" :name="column.key" v-bind="{ record }" />
        <template v-else-if="typeof text === 'undefined' || text === null">-</template>
        <template v-else-if="typeof text === 'boolean'">{{ text ? '是' : '否' }}</template>
        <template v-else-if="column.key in mapper">
          <pre v-if="mapper[column.key].type === 'Textarea'" class="mb-0">{{ text }}</pre>
          <template v-else-if="mapper[column.key].type === 'Select'">
            {{ genLstItmLbl(mapper[column.key], text) }}
          </template>
        </template>
        <CellCard
          v-else
          :cell="getCells(column.dataIndex)"
          :text="getCellTxt(text, column.dict)"
          :record="record"
          :search="searchState"
        />
      </template>
      <template v-if="hasExpand()" #expandedRowRender="{ record }">
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
  </div>

  <FormDialog
    v-model:show="editing.show"
    :copy="copy"
    :title="title"
    :emitter="emitter"
    :mapper="editMapper"
    @submit="onRecordSave"
  >
    <template
      v-for="pname in Object.keys(editMapper).filter((key: any) => chkInSlot(key + 'EDT'))"
      :key="pname"
      #[pname]="{ formState }"
    >
      <slot :name="pname + 'EDT'" v-bind="{ editing: formState, mapper: editMapper[pname] }" />
    </template>
  </FormDialog>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineComponent, onMounted, reactive, ref } from 'vue'
import { TinyEmitter as Emitter } from 'tiny-emitter'
import FormDialog from './FormDialog.vue'
import Column from '../types/column'
import Mapper, { MapperType } from '../types/mapper'
import * as antdIcons from '@ant-design/icons-vue/lib/icons'
import SelColBox from './SelColBox.vue'
import { pickOrIgnore, upperFirst } from '../utils'
import Batch from '../types/batch'
import BchExport from '../types/bchExport'
import BchImport from '../types/bchImport'
import RefreshBox from './RefreshBox.vue'
import { Cells } from '../types/cell'
import CellCard from './CellCard.vue'

export default defineComponent({
  name: 'EditableTable',
  emits: ['add', 'edit', 'before-save', 'save', 'delete', 'refresh', 'expand'],
  components: Object.assign(
    {
      FormDialog,
      SelColBox,
      RefreshBox,
      CellCard
    },
    antdIcons
  ),
  props: {
    icon: { type: String, default: '' },
    api: { type: Object /* ComAPI */, required: true },
    columns: { type: Array, required: true },
    cells: { type: Array, default: [] },
    mapper: { type: Mapper, default: new Mapper() },
    copy: { type: Function, default: () => ({ key: '#' }) },
    emitter: { type: Emitter, default: null },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    size: { type: String, default: 'default' },
    pagable: { type: Boolean, default: true },
    numPerPg: { type: Number, default: 100 },
    sclHeight: { type: Number, default: 0 },
    filter: { type: Function, default: () => true },
    editable: { type: Boolean, default: true },
    addable: { type: Boolean, default: true },
    delable: { type: Boolean, default: true },
    imExpable: { type: Boolean, default: false },
    disabled: { type: Function, default: () => false },
    clkable: { type: Boolean, default: true },
    refOptions: { type: Array, default: [] },
    operaStyle: { type: String, default: 'link' }
  },
  setup(props, { emit, slots }) {
    const cols = reactive(
      props.editable || props.delable
        ? props.columns.concat(new Column('操作', 'opera', { width: 100, fixed: 'right' }))
        : props.columns
    )
    const editMapper = reactive(props.mapper)
    const records = reactive({
      data: [] as unknown[],
      offset: 0,
      limit: props.numPerPg
    })
    const expRowKeys = reactive([] as string[])
    const editing = reactive({
      show: false,
      key: ''
    })
    const loading = ref(false)
    const searchState = reactive({
      text: '',
      column: ''
    })

    onMounted(refresh)
    if (props.emitter) {
      props.emitter.on('refresh', refresh)
      props.emitter.on('update:mapper', (mapper: any) => {
        Mapper.copy(mapper, editMapper)
      })
    }

    async function refresh(data?: any[], params?: object) {
      records.data = (
        data ||
        (await props.api.all({
          axiosConfig: { params: Object.assign(pickOrIgnore(records, ['data']), params || {}) }
        }))
      ).filter(props.filter)
      emit('refresh', records.data, (pcsData: any) => {
        records.data = pcsData
      })
      editing.key = ''
      editing.show = false
      loading.value = false
    }
    function onEditClicked(record?: any) {
      emit('add', record)
      editing.key = ''
      if (record) {
        props.emitter.emit('update:data', record)
        editing.key = record.key || ''
      }
      props.emitter.emit('viewOnly', false)
      editing.show = true
    }
    async function onRecordSave(record: any, reset: () => void) {
      loading.value = true
      emit('before-save', record)
      if (editing.key === '') {
        await props.api.add(record)
      } else {
        await props.api.update(record)
      }
      emit('save', record, refresh)
      reset()
      await refresh()
    }
    function onCclClicked() {
      refresh()
    }
    async function onRecordDel(key: unknown) {
      loading.value = true
      await props.api.remove(key)
      emit('delete', key, refresh)
      editing.show = false
      await refresh()
    }
    function hasExpand() {
      for (const value of Object.values(editMapper)) {
        if (value.expanded) {
          return true
        }
      }
      return false
    }
    function isCustomEmpty() {
      for (const value of Object.values(editMapper)) {
        if (value.empty) {
          return true
        }
      }
      return false
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
    function genLstItmLbl(mapItm: MapperType, value: string) {
      if (mapItm.options.map((option: any) => option.value).includes(value)) {
        return mapItm.options.find((option: any) => option.value === value).label
      } else {
        return value
      }
    }
    function chkInSlot(key: string) {
      return slots[key]
    }
    async function onBatchSubmit(info: any, opera: 'import' | 'export') {
      loading.value = true
      await props.api.batch[opera](pickOrIgnore(info, ['worksheet']))
      await refresh()
    }
    function genCpyFun<B extends Batch>(
      b: { new (): B; copy: (src: any, tgt: any) => any },
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
    function onDoSearch(selectedKeys: string[], confirm: () => void, dataIndex: string) {
      confirm()
      searchState.text = selectedKeys[0]
      searchState.column = dataIndex
    }

    function onSchReset(clearFilters: (param: any) => void) {
      clearFilters({ confirm: true })
      searchState.text = ''
    }
    function getCells(key: string) {
      return (props.cells.find((cell: any) => cell.refer === key) || new Cells()) as Cells
    }
    function getCellTxt(text: any, dist: Record<string, string>) {
      return dist && (text || '').toString() in dist
        ? dist[(text || '').toString()]
        : (text || '').toString()
    }
    return {
      Cells,
      BchExport,
      BchImport,

      cols,
      loading,
      editMapper,
      records,
      expRowKeys,
      editing,
      searchState,

      refresh,
      onEditClicked,
      onRecordSave,
      onCclClicked,
      onRecordDel,
      hasExpand,
      onRowExpand,
      isCustomEmpty,
      onRowClick,
      genLstItmLbl,
      chkInSlot,
      onBatchSubmit,
      genCpyFun,
      onDoSearch,
      onSchReset,
      getCells,
      getCellTxt
    }
  }
})
</script>
