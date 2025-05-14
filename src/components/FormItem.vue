<template>
  <a-form-item
    v-show="display"
    class="flex-auto"
    :ref="skey"
    :name="skey"
    :rules="mapper.rules"
    :wrapper-col="{ offset: mapper.offset }"
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
      <div class="flex-1" :class="{ 'pl-2': chkInSlot('PFX'), 'pr-2': chkInSlot('SFX'), 'w-full': !chkInSlot('PFX') && !chkInSlot('SFX') }">
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
        <template v-else>
          <a-input
            v-if="mapper.type === 'Input'"
            :value="getProp(form, skey, fieldDftVal(mapper.type))"
            :type="mapper.iptType || 'text'"
            :disabled="disabled"
            :addon-before="mapper.prefix"
            :addon-after="mapper.suffix"
            :placeholder="mapper.placeholder || '请输入'"
            @change="(e: any) => onFieldChanged(e.target.value)"
            @blur="(e: any) => mapper.onBlur && mapper.onBlur(form, e.target.value)"
          />
          <a-input-number
            v-else-if="mapper.type === 'Number'"
            class="w-full"
            type="number"
            :value="getProp(form, skey, fieldDftVal(mapper.type))"
            :placeholder="mapper.placeholder || '请输入'"
            :disabled="disabled"
            :addon-before="mapper.prefix"
            :addon-after="mapper.suffix"
            @change="onFieldChanged"
            @blur="(e: any) => mapper.onBlur && mapper.onBlur(form, e.target.value)"
          />
          <a-input-password
            v-else-if="mapper.type === 'Password'"
            :value="getProp(form, skey, undefined)"
            :placeholder="mapper.placeholder || '请输入'"
            :disabled="disabled"
            @change="(e: any) => onFieldChanged(e.target.value)"
            @blur="(e: any) => mapper.onBlur && mapper.onBlur(form, e.target.value)"
          />
          <IpAddrInput
            v-else-if="mapper.type === 'IpAddress'"
            :disabled="disabled"
            :ip="getProp(form, skey, fieldDftVal(mapper.type))"
            @update:ip="onFieldChanged"
          />
          <a-select
            v-else-if="mapper.type === 'Select'"
            class="w-full"
            :options="mapper.options"
            :value="getProp(form, skey, fieldDftVal(mapper.type))"
            :placeholder="mapper.placeholder || '请选择'"
            :disabled="disabled"
            :allowClear="mapper.allowClear"
            :show-search="mapper.searchable"
            :filter-option="filterOption"
            @dropdownVisibleChange="mapper.onDropdown"
            @change="onFieldChanged"
          >
            <template v-if="mapper.loading" #notFoundContent>
              <a-spin size="small" />
            </template>
          </a-select>
          <template v-else-if="mapper.type === 'Checkbox'">
            <a-checkbox-group
              v-if="mapper.options && mapper.options.length"
              :name="skey"
              :value="getProp(form, skey, fieldDftVal(mapper.type))"
              :options="mapper.options"
              :disabled="disabled"
              @change="(checkeds: any) => onFieldChanged(checkeds)"
            />
            <a-checkbox
              v-else
              :name="skey"
              :checked="getProp(form, skey, fieldDftVal(mapper.type))"
              :disabled="disabled"
              @change="(e: any) => onFieldChanged(e.target.checked)"
            >
              {{
                getProp(form, skey)
                  ? mapper.chkLabels
                    ? mapper.chkLabels[1]
                    : '是'
                  : mapper.chkLabels
                    ? mapper.chkLabels[0]
                    : '否'
              }}&nbsp;
              <a-typography-text type="secondary">
                {{ mapper.placeholder || '请确认' }}
              </a-typography-text>
            </a-checkbox>
          </template>
          <a-space v-else-if="mapper.type === 'Switch'">
            <a-switch
              :checked="getProp(form, skey, fieldDftVal(mapper.type))"
              :disabled="disabled"
              :checked-children="mapper.chkLabels ? mapper.chkLabels[1] : ''"
              :un-checked-children="mapper.chkLabels ? mapper.chkLabels[0] : ''"
              @change="onFieldChanged"
            />
            <span v-if="mapper.placeholder">{{ mapper.placeholder }}</span>
          </a-space>
          <a-radio-group
            v-else-if="mapper.type === 'Radio'"
            class="w-full"
            button-style="solid"
            :disabled="disabled"
            :value="getProp(form, skey, fieldDftVal(mapper.type))"
            @change="(e: any) => onFieldChanged(e.target.value)"
          >
            <template v-if="mapper.style === 'button'">
              <a-tooltip v-for="opn in mapper.options" :key="opn.value" color="#108ee9">
                <template #title>
                  {{ opn.subLabel }}
                </template>
                <a-radio-button
                  class="text-center"
                  :value="opn.value"
                  :style="{ width: 100 / mapper.options.length + '%' }"
                >
                  {{ opn.label }}
                </a-radio-button>
              </a-tooltip>
            </template>
            <template v-else>
              <a-radio v-for="opn in mapper.options" :key="opn.value" :value="opn.value">
                {{ opn.label }}
              </a-radio>
            </template>
          </a-radio-group>
          <a-textarea
            v-else-if="mapper.type === 'Textarea'"
            :value="getProp(form, skey, fieldDftVal(mapper.type))"
            :rows="mapper.maxRows"
            :placeholder="mapper.placeholder || '请输入'"
            :disabled="disabled"
            @change="(e: any) => onFieldChanged(e.target.value)"
            @blur="(e: any) => mapper.onBlur && mapper.onBlur(form, e.target.value)"
          />
          <a-cascader
            v-else-if="mapper.type === 'Cascader'"
            :options="mapper.options"
            :placeholder="mapper.placeholder || '请选择'"
            :value="getProp(form, skey, fieldDftVal(mapper.type))"
            change-on-select
            :disabled="disabled"
            @change="onFieldChanged"
          />
          <a-tooltip v-else-if="mapper.type === 'Button'">
            <template #title>{{ mapper.placeholder || '请点击' }}</template>
            <a-button
              class="w-full"
              :disabled="disabled"
              :danger="mapper.danger"
              :type="mapper.primary ? 'primary' : 'default'"
              :ghost="mapper.ghost"
              :loading="mapper.loading"
              :html-type="mapper.htmlType"
              @click="() => mapper.onClick(form)"
            >
              {{ mapper.inner }}
            </a-button>
          </a-tooltip>
          <a-date-picker
            v-else-if="mapper.type === 'DateTime'"
            class="w-full"
            :format="mapper.format"
            :show-time="mapper.showTime"
            :hour-step="mapper.hourStep"
            :minute-step="mapper.minuteStep"
            :second-step="mapper.secondStep"
            :disabled-time="
              () => ({
                disabledHours: () => mapper.dsbHours
              })
            "
            :disabledDate="mapper.dsbDates"
            :placeholder="mapper.placeholder || '请选择'"
            :disabled="disabled"
            :value="getProp(form, skey, fieldDftVal(mapper.type))"
            @change="onFieldChanged"
          />
          <FormTable
            v-else-if="mapper.type === 'Table'"
            :value="getProp(form, skey, fieldDftVal(mapper.type))"
            :mapper="mapper"
            :addable="validConds(form, mapper.addable, true)"
            :edtable="validConds(form, mapper.edtable, true)"
            :delable="validConds(form, mapper.delable, true)"
            @edit="() => mapper.onEdit && mapper.onEdit(form)"
            @delete="
              (delKey: any, val: any) => {
                mapper.onDeleted && mapper.onDeleted(delKey, val)
                onFieldChanged(val)
              }
            "
          >
            <template #FormDialog>
              <slot name="FormDialog" />
            </template>
          </FormTable>
          <UploadFile
            v-else-if="mapper.type === 'UploadFile'"
            :form="form"
            :path="mapper.path"
            :params="mapper.params"
            :headers="mapper.headers"
            :directory="mapper.directory"
            :value="getProp(form, skey, fieldDftVal(mapper.type))"
            :onBeforeUpload="mapper.onBeforeUpload"
            :onChange="mapper.onChange"
            :disabled="disabled"
            @update:value="onFieldChanged"
          />
          <a-space v-else-if="mapper.type === 'Delable'">
            {{ getProp(form, skey) || '-' }}
            <CloseCircleOutlined @click="mapper.onDeleted(form.key)" />
          </a-space>
          <SelOrIpt
            v-else-if="mapper.type === 'SelOrIpt'"
            :value="getProp(form, skey, fieldDftVal(mapper.type))"
            :options="mapper.options"
            :placeholder="mapper.placeholder"
            v-model:mode="mapper.mode"
            :disabled="disabled"
            @update:value="onFieldChanged"
          />
          <ListSelect
            v-else-if="mapper.type === 'ListSelect'"
            :disabled="disabled"
            :options="mapper.options"
            :height="mapper.height"
            :value="getProp(form, skey, fieldDftVal(mapper.type))"
            @update:value="onFieldChanged"
          />
          <EditList
            v-else-if="mapper.type === 'EditList'"
            :disabled="disabled"
            :newFun="mapper.newFun"
            :flatItem="mapper.flatItem"
            :lblDict="mapper.lblDict"
            :lblProp="mapper.lblProp"
            :subProp="mapper.subProp"
            :inline="mapper.inline"
            :mapper="mapper.mapper"
            :value="getProp(form, skey, fieldDftVal(mapper.type))"
            @added="mapper.onAdded"
            @update:value="onFieldChanged"
          >
            <template #formItem="{ form, elKey, value }">
              <FormItem
                :form="form"
                :skey="elKey"
                :mapper="value"
                @update:fprop="values => onFpropChanged(form, values)"
              />
            </template>
          </EditList>
          <CodeEditor
            v-else-if="mapper.type === 'CodeEditor'"
            :disabled="disabled"
            :lang="mapper.lang"
            :dft-hgt="mapper.height"
            :value="getProp(form, skey, fieldDftVal(mapper.type))"
            @update:value="onFieldChanged"
          />
          <JsonEditor
            v-else-if="mapper.type === 'JsonEditor'"
            :disabled="disabled"
            :mode="mapper.mode"
            :mainMenuBar="mapper.mainMenuBar"
            :navigationBar="mapper.navigationBar"
            :statusBar="mapper.statusBar"
            :value="getProp(form, skey, fieldDftVal(mapper.type))"
            @update:value="onFieldChanged"
          />
          <TagList
            v-else-if="mapper.type === 'TagList'"
            :disabled="disabled"
            :flatItem="mapper.flatItem"
            :lblProp="mapper.lblProp"
            :lblDict="mapper.lblDict"
            :mapper="mapper.mapper"
            :new-fun="mapper.newFun"
            :value="getProp(form, skey, fieldDftVal(mapper.type))"
            @saved="mapper.onSaved"
            @added="mapper.onAdded"
            @update:value="onFieldChanged"
          >
            <template #formItem="{ form, elKey, value }">
              <FormItem
                :form="form"
                :skey="elKey"
                :mapper="value"
                @update:fprop="values => onFpropChanged(form, values)"
              />
            </template>
          </TagList>
          <IconField
            v-else-if="mapper.type === 'IconField'"
            :disabled="disabled"
            :icon="getProp(form, skey, fieldDftVal(mapper.type))"
            @update:icon="onFieldChanged"
          />
          <template v-else>
            {{ getProp(form, skey) }}
          </template>
        </template>
      </div>
      <slot v-if="chkInSlot('SFX')" :name="skey + 'SFX'" v-bind="{ formState: form }" />
    </div>
  </a-form-item>
</template>

<script lang="ts" setup name="FormItem">
import {
  CloseCircleOutlined,
  InfoCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons-vue'
import { type PropType, computed, ref, useSlots } from 'vue'

import type { OpnType } from '../types'
import { fieldDftVal } from '../types/field'
import { getProp, setProp, validConds } from '../utils'
import CodeEditor from './CodeEditor.vue'
import EditList from './EditList.vue'
import FormTable from './FormTable.vue'
import JsonEditor from './JsonEditor.vue'
import ListSelect from './ListSelect.vue'
import SelOrIpt from './SelOrIpt.vue'
import TagList from './TagList.vue'
import UploadFile from './UploadFile.vue'
import IpAddrInput from './IpAddrInput.vue'
import { type MapperType } from '../types/mapper'
import IconField from './IconField.vue'

const props = defineProps({
  form: { type: Object, required: true },
  skey: { type: String, required: true },
  mapper: { type: Object as PropType<MapperType>, required: true },
  lblWid: { type: Number, default: 4 },
  editable: { type: Boolean, default: true },
  viewOnly: { type: Boolean, default: false }
})
const emit = defineEmits(['update:fprop'])
const display = computed(() => validConds(props.form, props.mapper.display, true))
const disabled = computed(() => validConds(props.form, props.mapper.disabled) || !props.editable)
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
function onFieldChanged(newVal: any) {
  if (props.mapper.onChange) {
    props.mapper.onChange(props.form, newVal, props.form[props.skey])
  }
  emit('update:fprop', { [props.skey]: newVal })
}
function chkInSlot(suffix?: string) {
  const key = props.skey + (suffix || '')
  const slotKey = !!useSlots()[key]
  return slotKey && key !== 'default'
}
function onVwPwdClick() {
  viewPwd.value = !viewPwd.value
}
function filterOption(input: string, option: any) {
  return props.mapper.searchable
    ? option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
    : true
}
</script>
