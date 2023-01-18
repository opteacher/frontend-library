<template>
  <div class="h-full flex flex-col">
    <div class="flex justify-between mb-2.5">
      <h3 class="mb-0">
        <keep-alive v-if="icon">
          <component :is="icon" v-bind="{ class: 'text-4xl' }" />
        </keep-alive>
        {{ title }}
        <span class="text-gray-400">{{ description }}</span>
      </h3>
      <a-button v-if="addable" type="primary" @click="onEditClicked()">添加</a-button>
    </div>
    <a-table
      class="flex-auto"
      :columns="cols"
      :data-source="records.data"
      :size="size"
      :rowClassName="() => 'bg-white'"
      :pagination="false"
      v-model:expandedRowKeys="expRowKeys"
      bordered
      :scroll="sclHeight ? { y: sclHeight } : undefined"
      :custom-row="
      (record: any) => ({
        onClick: clkable ? () => onRowClick(record) : undefined
      })
    "
      @expand="(_expanded: unknown, record: any) => onRowExpand(record)"
    >
      <template #headerCell="{ column }">
        <template v-if="$slots[column.key + 'HD']">
          <slot :name="column.key + 'HD'" v-bind="{ column }" />
        </template>
      </template>
      <template #bodyCell="{ text, column, record }">
        <template v-if="column.key === 'opera'">
          <div class="flex space-x-1.5">
            <a v-if="disabled(record, 'edit')" disabled @click.stop="">编辑</a>
            <a v-else-if="edtable" @click.stop="onEditClicked(record)">编辑</a>
            <a v-if="disabled(record, 'delete')" disabled @click.stop="">删除</a>
            <a-popconfirm
              v-else-if="delable"
              title="确定删除该记录吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="onRecordDel(record.key)"
            >
              <a class="text-error" @click.stop="">删除</a>
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
        <template v-else>{{ text }}</template>
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
import { defineComponent, onMounted, reactive } from 'vue'
import { TinyEmitter as Emitter } from 'tiny-emitter'
import FormDialog from './FormDialog.vue'
import Column from '../types/column'
import Mapper, { MapperType } from '../types/mapper'
import * as antdIcons from '@ant-design/icons-vue/lib/icons'

export default defineComponent({
  name: 'EditableTable',
  emits: ['add', 'edit', 'before-save', 'save', 'delete', 'refresh', 'expand'],
  components: Object.assign(
    {
      FormDialog
    },
    antdIcons
  ),
  props: {
    icon: { type: String, default: '' },
    api: { type: Object /* ComAPI */, required: true },
    columns: { type: Array, required: true },
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
    edtable: { type: Boolean, default: true },
    addable: { type: Boolean, default: true },
    delable: { type: Boolean, default: true },
    disabled: { type: Function, default: () => false },
    clkable: { type: Boolean, default: true }
  },
  setup(props, { emit, slots }) {
    const cols =
      props.edtable || props.delable
        ? props.columns.concat(new Column('操作', 'opera', { width: 100 }))
        : props.columns
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

    onMounted(refresh)
    if (props.emitter) {
      props.emitter.on('refresh', refresh)
      props.emitter.on('update:mapper', (mapper: any) => {
        Mapper.copy(mapper, editMapper)
      })
    }

    async function refresh(data?: any[]) {
      records.data = (data || (await props.api.all(records.offset, records.limit))).filter(
        props.filter
      )
      emit('refresh', records.data, (pcsData: any) => {
        records.data = pcsData
      })
      editing.key = ''
      editing.show = false
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
    return {
      cols,
      editMapper,
      records,
      expRowKeys,
      editing,

      onEditClicked,
      onRecordSave,
      onCclClicked,
      onRecordDel,
      hasExpand,
      onRowExpand,
      isCustomEmpty,
      onRowClick,
      genLstItmLbl,
      chkInSlot
    }
  }
})
</script>
