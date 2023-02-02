<template>
  <a v-if="pcsCell.ctype === 'Link'" @click.stop="$router.push(fmtHref)">
    <HighLight :text="fmtTxt" :search="keyword" />
  </a>
  <template v-else-if="typeof text === 'undefined' || text === null">-</template>
  <template v-else-if="typeof text === 'boolean'">{{ text ? '是' : '否' }}</template>
  <pre v-else-if="mapper.type === 'Textarea'" class="mb-0">{{ fmtTxt }}</pre>
  <template v-else-if="mapper.type === 'Select'">
    {{ genLstItmLbl(mapper as MapperType, text) }}
  </template>
  <span
    v-else
    :style="{
      color: selected ? '@primary-color' : pcsCell.color
    }"
  >
    <HighLight :text="fmtTxt" :search="keyword" />
  </span>
</template>

<script lang="ts">
import { endsWith, fmtStrByObj } from '../utils'
import { computed, defineComponent } from 'vue'
import dayjs from 'dayjs'
import HighLight from './HighLight.vue'
import Cell, { Cells } from '../types/cell'
import { MapperType } from '../types/mapper'

export default defineComponent({
  name: 'CellCard',
  components: {
    HighLight
  },
  props: {
    cell: { type: Cells, required: true },
    text: { type: String, required: true },
    selected: { type: Boolean, default: false },
    mapper: { type: Object, required: true },
    record: { type: Object, default: null },
    keyword: { type: String, default: '' }
  },
  setup(props) {
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
            case '=':
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
      let ret = props.text
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
            ret = dayjs(props.text).format(pcsCell.value.format.pattern)
          }
      }
      return [
        pcsCell.value.prefix && !props.text.startsWith(pcsCell.value.prefix)
          ? pcsCell.value.prefix
          : '',
        ret,
        pcsCell.value.suffix && !endsWith(props.text, pcsCell.value.suffix)
          ? pcsCell.value.suffix
          : ''
      ].join('')
    })
    const fmtHref = computed(() =>
      fmtStrByObj(/\s?@.+?(?=\s)/g, props.record, pcsCell.value.format.href)
    )
    function genLstItmLbl(mapItm: MapperType, value: string) {
      if (mapItm.options.map((option: any) => option.value).includes(value)) {
        return mapItm.options.find((option: any) => option.value === value).label
      } else {
        return value
      }
    }
    return {
      pcsCell,
      fmtTxt,
      fmtHref,
      endsWith,
      genLstItmLbl
    }
  }
})
</script>
