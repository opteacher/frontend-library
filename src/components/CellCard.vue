<template>
  <!-- cell type -->
  <a v-if="pcsCell.ctype === 'Link'" class="no-underline" :href="fmtHref">
    <HighLight :text="fmtTxt" :search="keyword" />
  </a>
  <pre v-else-if="pcsCell.ctype === 'Textarea'" class="mb-0">{{ fmtTxt }}</pre>
  <!-- text type -->
  <template v-else-if="typeof text === 'undefined' || text === null">-</template>
  <template v-else-if="typeof text === 'boolean'">{{ text ? '是' : '否' }}</template>
  <!-- mapper type -->
  <template v-else-if="mapper.type === 'Select'">
    {{
      mapper.options.map((opn: any) => opn.value).includes(text)
        ? mapper.options.find((opn: any) => opn.value === text).label
        : text
    }}
  </template>
  <span v-else :class="{ 'text-primary': selected }">
    {{ fmtTxt }}
  </span>
</template>

<script lang="ts" setup name="CellCard">
import { endsWith, fmtStrByObj } from '../utils'
import { computed } from 'vue'
import dayjs from 'dayjs'
import HighLight from './HighLight.vue'
import Cell, { Cells } from '../types/cell'

const props = defineProps({
  cell: { type: Cells, required: true },
  text: { type: String, required: true },
  selected: { type: Boolean, default: false },
  mapper: { type: Object, default: () => ({}) },
  record: { type: Object, default: null },
  keyword: { type: String, default: '' }
})
const pcsCell = computed<Cell>((): Cell => {
  const ret = props.cell
  if (ret.cdCell) {
    for (const [cond, cell] of Object.entries(ret.cdCell)) {
      const conds = cond.split('_')
      const prop = conds[0]
      const cmp = conds[1]
      const tgtVal = conds[2]
      const srcVal = props.record[prop]
      switch (cmp) {
        case '==':
          if (srcVal == tgtVal) {
            return cell as Cell
          }
          break
        case '!=':
          if (srcVal != tgtVal) {
            return cell as Cell
          }
          break
        case '>':
          if (srcVal > tgtVal) {
            return cell as Cell
          }
          break
        case '>=':
          if (srcVal >= tgtVal) {
            return cell as Cell
          }
          break
        case '<':
          if (srcVal < tgtVal) {
            return cell as Cell
          }
          break
        case '<=':
          if (srcVal <= tgtVal) {
            return cell as Cell
          }
          break
      }
    }
  }
  return ret as Cell
})
const fmtTxt = computed(() => {
  let ret = props.text.toString()
  switch (pcsCell.value.ctype) {
    case 'Number':
      if (pcsCell.value.format.fix > 0) {
        ret = Number.parseFloat(ret).toFixed(pcsCell.value.format.fix)
      }
      if (pcsCell.value.format.unit) {
        ret += pcsCell.value.format.unit
      }
      break
    case 'DateTime':
      if (pcsCell.value.format.pattern) {
        ret = dayjs(ret).format(pcsCell.value.format.pattern)
      }
  }
  return [
    pcsCell.value.prefix && !ret.startsWith(pcsCell.value.prefix)
      ? pcsCell.value.prefix
      : '',
    ret,
    pcsCell.value.suffix && !endsWith(ret, pcsCell.value.suffix)
      ? pcsCell.value.suffix
      : ''
  ].join('')
})
const fmtHref = computed(() =>
  fmtStrByObj(/\s?@.+?(?=\s)/g, props.record, pcsCell.value.format.href)
)
</script>
