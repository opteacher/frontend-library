<template>
  <a-form-item
    v-show="display"
    class="flex-auto"
    :ref="skey"
    :name="skey.indexOf('.') !== -1 ? skey.split('.') : skey"
    :rules="display ? mapper.rules : []"
    :wrapper-col="{ offset: mapper.offset, span: fldWid }"
  >
    <template v-if="mapper.label" #label>
      <a-button v-if="mapper.expable" size="small" @click="() => (expanded = !expanded)">
        {{ mapper.label }}
      </a-button>
      <span v-else>{{ mapper.label }}</span>
      &nbsp;
      <a-tooltip v-if="mapper.desc">
        <template #title>
          <pre>{{ mapper.desc }}</pre>
        </template>
        <InfoCircleOutlined />
      </a-tooltip>
    </template>
    <a-divider v-if="mapper.expable && !expanded" class="m-0 text-sm" orientation="left">
      <arrow-left-outlined />
      点击展开
    </a-divider>
    <div v-else class="flex">
      <slot v-if="chkInSlot('PFX')" :name="skey + 'PFX'" v-bind="{ formState: form }" />
      <div
        class="flex-1"
        :class="{
          'pl-2': chkInSlot('PFX'),
          'pr-2': chkInSlot('SFX'),
          'w-full': !chkInSlot('PFX') && !chkInSlot('SFX')
        }"
      >
        <template v-if="viewOnly">
          <slot v-if="chkInSlot('VW')" :name="skey + 'VW'" v-bind="{ formState: form }" />
          <template
            v-else-if="
              mapper.type === 'Input' ||
              mapper.type === 'Number' ||
              mapper.type === 'Delable' ||
              mapper.type === 'SelOrIpt' ||
              mapper.type === 'DateTime'
            "
          >
            {{ getProp(form, skey) }}
          </template>
          <template v-else-if="mapper.type === 'Password'">
            <div v-if="viewPwd">
              {{ getProp(form, skey) }}
              <span>
                <a-button type="text" @click="onVwPwdClick">
                  <template #icon><eye-invisible-outlined /></template>
                </a-button>
              </span>
            </div>
            <div v-else>
              ●●●●●●●●
              <span>
                <a-button type="text" @click="onVwPwdClick">
                  <template #icon><eye-outlined /></template>
                </a-button>
              </span>
            </div>
          </template>
          <template
            v-else-if="
              mapper.type === 'Textarea' ||
              mapper.type === 'CodeEditor' ||
              mapper.type === 'JsonEditor'
            "
          >
            <pre class="mb-0">{{ getProp(form, skey) }}</pre>
          </template>
          <template v-else-if="mapper.type === 'Select' || mapper.type === 'Cascader'">
            {{ fmtDrpdwnValue(mapper.options, getProp(form, skey)) }}
          </template>
          <template v-else-if="mapper.type === 'Checkbox'">
            {{
              getProp(form, skey)
                ? mapper.chkLabels
                  ? mapper.chkLabels[1]
                  : '是'
                : mapper.chkLabels
                  ? mapper.chkLabels[0]
                  : '否'
            }}
          </template>
          <template v-else-if="mapper.type === 'EditList' || mapper.type === 'UploadFile'">
            <ul class="pl-0 list-none mb-0">
              <li v-for="item in getProp(form, skey)" :key="item">{{ item }}</li>
            </ul>
          </template>
          <template v-else-if="mapper.type === 'Table'">
            <a-table
              v-show="getProp(form, skey) && getProp(form, skey).length"
              :columns="mapper.columns"
              :data-source="getProp(form, skey)"
              :pagination="false"
              size="small"
            />
          </template>
          <template v-else>{{ getProp(form, skey) }}</template>
        </template>
        <slot v-else-if="chkInSlot()" :name="skey" v-bind="{ form }" />
        <FieldItem
          v-else
          :form="form"
          :skey="skey"
          :mapper="mapper"
          @update:fprop="(obj: any) => emit('update:fprop', obj)"
        >
          <template #formItem="{ form, elKey, value }">
            <FormItem
              :form="form"
              :skey="elKey"
              :mapper="value"
              @update:fprop="(values: any) => onFpropChanged(form, values)"
            />
          </template>
          <template #FormDialog>
            <slot name="FormDialog" />
          </template>
        </FieldItem>
      </div>
      <slot v-if="chkInSlot('SFX')" :name="skey + 'SFX'" v-bind="{ formState: form }" />
    </div>
  </a-form-item>
</template>

<script lang="ts" setup name="FormItem">
import {
  InfoCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons-vue'
import { type PropType, computed, ref, useSlots } from 'vue'
import type { OpnType } from '../types'
import { getProp, setProp, validConds } from '../utils'
import { type MapperType } from '../types/mapper'
import FieldItem from './FieldItem.vue'

const props = defineProps({
  form: { type: Object, required: true },
  skey: { type: String, required: true },
  mapper: { type: Object as PropType<MapperType>, required: true },
  lblWid: { type: Number, default: 4 },
  fldWid: { type: Number, default: 20 },
  editable: { type: Boolean, default: true },
  viewOnly: { type: Boolean, default: false }
})
const emit = defineEmits(['update:fprop'])
const display = computed(() => validConds(props.form, props.mapper.display, true))
const onFpropChanged = (formState: any, values: any) =>
  Object.entries(values).map(([k, v]) => setProp(formState, k, v))
const viewPwd = ref(false)
const expanded = ref(false)

function fmtDrpdwnValue(options: OpnType[], value: any | any[]) {
  if (value instanceof Array) {
    const vals = []
    if (!options || !options.length) {
      return value.join(' / ')
    }
    let opns = options
    for (let i = 0; i < value.length; ++i) {
      const opn = opns.find((opn: OpnType) => opn.value === value[i])
      if (opn) {
        opns = opn.children as OpnType[]
        vals.push(opn.label || opn.value)
      } else {
        vals.push(value[i])
      }
      if (i === value.length - 1) {
        break
      }
    }
    return vals.join(' / ')
  } else {
    const opn = options.find((opn: OpnType) => opn.value === value)
    return opn ? opn.label || opn.value : value
  }
}
function chkInSlot(suffix?: string) {
  const key = props.skey + (suffix || '')
  const slotKey = !!useSlots()[key]
  return slotKey && key !== 'default'
}
function onVwPwdClick() {
  viewPwd.value = !viewPwd.value
}
</script>
