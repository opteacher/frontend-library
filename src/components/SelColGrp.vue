<template>
  <a-checkbox
    :checked="chkSelState(columns, true)"
    :indeterminate="indSelCols"
    @change="onAllColsChange"
  >
    <b>{{ group }}</b>
  </a-checkbox>
  <a-checkbox-group
    :value="selCols"
    :options="columns.map((column: any) => ({
      label: column.title, value: column.key
    }))"
    @change="onDspColSelect"
  />
  <a-divider class="my-2" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import Column from '../types/column'

const props = defineProps({
  group: { type: String, required: true },
  columns: { type: Array, required: true },
  selCols: { type: Array, required: true },
  chkSelState: { type: Function, required: true }
})
const indSelCols = ref<boolean>(false)

function onAllColsChange(e: { target: { checked: boolean } }) {
  ;(props.columns as Column[]).map((column: Column) => {
    column.notDisplay = !e.target.checked
  })
  indSelCols.value = false
}
function onDspColSelect(checkeds: string[]) {
  ;(props.columns as Column[]).map((column: Column) => {
    column.notDisplay = !checkeds.includes(column.key)
  })
  indSelCols.value = props.chkSelState(props.columns, false)
}
</script>
