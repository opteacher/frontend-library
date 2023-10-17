<template>
  <a-button @click="selColsVsb = true">
    <template #icon>
      <insert-row-above-outlined />
    </template>
    选择列
  </a-button>
  <a-modal v-model:visible="selColsVsb" title="选择显示的列" width="50vw" :footer="null">
    <a-checkbox :checked="allSelCols" :indeterminate="indSelCols" @change="onAllColsChange">
      <b>批量选择</b>
    </a-checkbox>
    <a-divider class="my-2" />
    <SelColGrp
      v-for="group in groups"
      :key="group"
      :group="group"
      :columns="getColsByGrp(group)"
      :selCols="dspCols"
      :chkSelState="chkSelState"
    />
    <a-checkbox-group
      :value="dspCols"
      :options="colsState
        .filter((column: Column) => !column.group.length)
        .map((column: any) => ({ label: column.title, value: column.key }))"
      @change="onDspColSelect"
    />
  </a-modal>
</template>

<script lang="ts" setup name="SelColBox">
import { InsertRowAboveOutlined } from '@ant-design/icons-vue'
import { computed, onMounted, reactive, ref, watch } from 'vue'

import Column from '../types/column'
import SelColGrp from './SelColGrp.vue'

const emit = defineEmits(['change'])
const props = defineProps({
  columns: { type: Array, required: true }
})
const colsState = reactive<Column[]>(props.columns as Column[])
const selColsVsb = ref(false)
const allSelCols = ref(true)
const indSelCols = ref(false)
const groups = ref<string[]>([])
const dspCols = computed<string[]>(() =>
  colsState.filter((column: Column) => !column.notDisplay).map((column: Column) => column.key)
)

onMounted(refresh)
watch(() => [...props.columns], refresh)

function refresh() {
  colsState.splice(0, colsState.length, ...(props.columns as Column[]))
  groups.value.splice(
    0,
    groups.value.length,
    ...Array.from(
      new Set(
        colsState
          .filter((col: Column) => col.group && col.group.length)
          .map((col: Column) => col.group[0])
      )
    )
  )
  allSelCols.value = chkSelState(colsState, true)
  indSelCols.value = chkSelState(colsState, false)
}
function getColsByGrp(grp: string) {
  return colsState.filter((column: Column) => column.group.length && column.group[0] === grp)
}
function chkSelState(cols: Column[], allSel: boolean) {
  return cols.reduce(
    (prev: boolean, col: Column) => (allSel ? prev && !col.notDisplay : prev || col.notDisplay),
    allSel
  )
}
function onAllColsChange(e: { target: { checked: boolean } }) {
  colsState.map((column: Column) => {
    column.notDisplay = !e.target.checked
  })
  allSelCols.value = e.target.checked
  indSelCols.value = false
  emit('change', colsState)
}
function onDspColSelect(checkeds: string[]) {
  colsState
    .filter((col: Column) => !col.group.length)
    .map((column: Column) => {
      column.notDisplay = !checkeds.includes(column.key)
    })
  indSelCols.value = chkSelState(colsState, false)
  emit('change', colsState)
}
</script>
