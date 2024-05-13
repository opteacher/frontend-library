<template>
  <a-form-item v-show="display" class="flex-auto" :ref="skey" :name="skey" :rules="mapper.rules">
    <template v-if="mapper.label" #label>
      {{ mapper.label }}&nbsp;
      <a-tooltip v-if="mapper.desc">
        <template #title>
          <pre>{{ mapper.desc }}</pre>
        </template>
        <InfoCircleOutlined />
      </a-tooltip>
    </template>
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
          mapper.type === 'Textarea' || mapper.type === 'CodeEditor' || mapper.type === 'JsonEditor'
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
        :value="getProp(form, skey)"
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
        :value="getProp(form, skey)"
        :placeholder="mapper.placeholder || '请输入'"
        :disabled="disabled"
        :addon-before="mapper.prefix"
        :addon-after="mapper.suffix"
        @change="onFieldChanged"
        @blur="(e: any) => mapper.onBlur && mapper.onBlur(form, e.target.value)"
      />
      <a-input-password
        v-else-if="mapper.type === 'Password'"
        :value="getProp(form, skey)"
        :placeholder="mapper.placeholder || '请输入'"
        :disabled="disabled"
        @change="(e: any) => onFieldChanged(e.target.value)"
        @blur="(e: any) => mapper.onBlur && mapper.onBlur(form, e.target.value)"
      />
      <IpAddrInput
        v-else-if="mapper.type === 'IpAddress'"
        :disabled="disabled"
        :ip="getProp(form, skey)"
        @update:ip="onFieldChanged"
      />
      <a-select
        v-else-if="mapper.type === 'Select'"
        class="w-full"
        :options="mapper.options"
        :value="getProp(form, skey) || undefined"
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
          :value="getProp(form, skey, false)"
          :options="mapper.options"
          :disabled="disabled"
          @change="(checkeds: any) => onFieldChanged(checkeds)"
        />
        <a-checkbox
          v-else
          :name="skey"
          :checked="getProp(form, skey, false)"
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
      <a-tooltip v-else-if="mapper.type === 'Switch'">
        <a-switch
          :checked="getProp(form, skey)"
          :disabled="disabled"
          :checked-children="mapper.chkLabels ? mapper.chkLabels[1] : ''"
          :un-checked-children="mapper.chkLabels ? mapper.chkLabels[0] : ''"
          @change="onFieldChanged"
        />
      </a-tooltip>
      <a-radio-group
        v-else-if="mapper.type === 'Radio'"
        class="w-full"
        button-style="solid"
        :disabled="disabled"
        :value="getProp(form, skey)"
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
        :value="getProp(form, skey)"
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
        :value="getProp(form, skey)"
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
          ghost
          :loading="mapper.loading"
          @click="() => mapper.onClick(form)"
        >
          {{ mapper.inner }}
        </a-button>
      </a-tooltip>
      <a-date-picker
        v-else-if="mapper.type === 'DateTime'"
        class="w-full"
        show-time
        :format="mapper.format"
        :hourStep="mapper.hourStep"
        :minuteStep="mapper.minuteStep"
        :secondStep="mapper.secondStep"
        :disabledTime="
          () => ({
            disabledHours: () => mapper.dsbHours
          })
        "
        :placeholder="mapper.placeholder || '请选择'"
        :disabled="disabled"
        :value="getProp(form, skey)"
        @change="onFieldChanged"
      />
      <FormTable
        v-else-if="mapper.type === 'Table'"
        :value="getProp(form, skey)"
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
        :value="getProp(form, skey)"
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
        :value="getProp(form, skey)"
        :options="mapper.options"
        :placeholder="mapper.placeholder"
        :mode="mapper.mode"
        :disabled="disabled"
        @update:value="onFieldChanged"
      />
      <ListSelect
        v-else-if="mapper.type === 'ListSelect'"
        :disabled="disabled"
        :options="mapper.options"
        :height="mapper.height"
        :value="getProp(form, skey)"
        @update:value="onFieldChanged"
      />
      <EditList
        v-else-if="mapper.type === 'EditList'"
        :mapper="mapper"
        :value="getProp(form, skey)"
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
        class="h-80"
        :disabled="disabled"
        :lang="mapper.lang"
        :value="getProp(form, skey)"
        @update:value="onFieldChanged"
      />
      <JsonEditor
        v-else-if="mapper.type === 'JsonEditor'"
        :disabled="disabled"
        :value="getProp(form, skey)"
        @update:value="onFieldChanged"
      />
      <TagList
        v-else-if="mapper.type === 'TagList'"
        :mapper="mapper"
        :value="getProp(form, skey)"
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
      <template v-else>
        {{ getProp(form, skey) }}
      </template>
    </template>
  </a-form-item>
</template>

<script lang="ts" setup name="FormItem">
import {
  CloseCircleOutlined,
  InfoCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons-vue'
import { computed, ref, useSlots } from 'vue'

import type { OpnType } from '../types'
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

const props = defineProps({
  form: { type: Object, required: true },
  skey: { type: String, required: true },
  mapper: { type: Object, required: true },
  editable: { type: Boolean, default: true },
  viewOnly: { type: Boolean, default: false }
})
const emit = defineEmits(['update:fprop'])
const display = computed(() => validConds(props.form, props.mapper.display, true))
const disabled = computed(() => validConds(props.form, props.mapper.disabled) || !props.editable)
const onFpropChanged = (formState: any, values: any) =>
  Object.entries(values).map(([k, v]) => setProp(formState, k, v))
const viewPwd = ref(false)

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
  emit('update:fprop', { [props.skey]: newVal })
  if (props.mapper.onChange) {
    props.mapper.onChange(props.form, newVal)
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
function filterOption(input: string, option: any) {
  return props.mapper.searchable
    ? option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
    : true
}
</script>
