<template>
  <a-form-item v-show="display" class="flex-auto" :ref="skey" :name="skey" :rules="mapState.rules">
    <template v-if="mapState.label" #label>
      {{ mapState.label }}&nbsp;
      <a-tooltip v-if="mapState.desc">
        <template #title>
          <pre>{{ mapState.desc }}</pre>
        </template>
        <InfoCircleOutlined />
      </a-tooltip>
    </template>
    <template v-if="viewOnly">
      <slot v-if="chkInSlot('VW')" :name="skey + 'VW'" v-bind="{ formState }" />
      <template
        v-else-if="
          mapState.type === 'Input' ||
          mapState.type === 'Number' ||
          mapState.type === 'Delable' ||
          mapState.type === 'SelOrIpt' ||
          mapState.type === 'DateTime'
        "
      >
        {{ getProp(formState, skey) }}
      </template>
      <template v-else-if="mapState.type === 'Textarea' || mapState.type === 'CodeEditor'">
        <pre class="mb-0">{{ getProp(formState, skey) }}</pre>
      </template>
      <template v-else-if="mapState.type === 'Select' || mapState.type === 'Cascader'">
        {{ fmtDrpdwnValue(mapState.options, getProp(formState, skey)) }}
      </template>
      <template v-else-if="mapState.type === 'Checkbox'">
        {{
          getProp(formState, skey)
            ? mapState.chkLabels
              ? mapState.chkLabels[1]
              : '是'
            : mapState.chkLabels
            ? mapState.chkLabels[0]
            : '否'
        }}
      </template>
      <template v-else-if="mapState.type === 'EditList' || mapState.type === 'UploadFile'">
        <ul class="pl-0 list-none mb-0">
          <li v-for="item in getProp(formState, skey)" :key="item">{{ item }}</li>
        </ul>
      </template>
      <template v-else-if="mapState.type === 'Table'">
        <a-table
          v-show="getProp(formState, skey) && getProp(formState, skey).length"
          :columns="mapState.columns"
          :data-source="getProp(formState, skey)"
          :pagination="false"
          size="small"
        />
      </template>
      <template v-else>{{ getProp(formState, skey) }}</template>
    </template>
    <slot v-else-if="chkInSlot()" :name="skey" v-bind="{ formState }" />
    <template v-else>
      <a-input
        v-if="mapState.type === 'Input'"
        :value="getProp(formState, skey)"
        :type="mapState.iptType || 'text'"
        :disabled="disabled"
        :addon-before="mapState.prefix"
        :addon-after="mapState.suffix"
        :placeholder="mapState.placeholder || '请输入'"
        @change="(e: any) => onFieldChanged(e.target.value)"
        @blur="(e: any) => mapState.onBlur && mapState.onBlur(formState, e.target.value)"
      />
      <a-input-number
        v-else-if="mapState.type === 'Number'"
        class="w-full"
        type="number"
        :value="getProp(formState, skey)"
        :placeholder="mapState.placeholder || '请输入'"
        :disabled="disabled"
        :addon-before="mapState.prefix"
        :addon-after="mapState.suffix"
        @change="onFieldChanged"
        @blur="(e: any) => mapState.onBlur && mapState.onBlur(formState, e.target.value)"
      />
      <a-input-password
        v-else-if="mapState.type === 'Password'"
        :value="getProp(formState, skey)"
        :placeholder="mapState.placeholder || '请输入'"
        :disabled="disabled"
        @change="(e: any) => onFieldChanged(e.target.value)"
        @blur="(e: any) => mapState.onBlur && mapState.onBlur(formState, e.target.value)"
      />
      <a-select
        v-else-if="mapState.type === 'Select'"
        class="w-full"
        :options="mapState.options"
        :value="getProp(formState, skey) || undefined"
        :placeholder="mapState.placeholder || '请选择'"
        :disabled="disabled"
        :allowClear="mapState.allowClear"
        @dropdownVisibleChange="mapState.onDropdown"
        @change="onFieldChanged"
      >
        <template v-if="mapState.loading" #notFoundContent>
          <a-spin size="small" />
        </template>
      </a-select>
      <a-tooltip v-else-if="mapState.type === 'Checkbox'">
        <template #title>{{ mapState.placeholder || '请确认' }}</template>
        <a-checkbox
          :name="skey"
          :checked="getProp(formState, skey)"
          :disabled="disabled"
          @change="(e: any) => onFieldChanged(e.target.checked)"
        >
          {{
            getProp(formState, skey)
              ? mapState.chkLabels
                ? mapState.chkLabels[1]
                : '是'
              : mapState.chkLabels
              ? mapState.chkLabels[0]
              : '否'
          }}
        </a-checkbox>
      </a-tooltip>
      <a-tooltip v-else-if="mapState.type === 'Switch'">
        <a-switch
          :checked="getProp(formState, skey)"
          :checked-children="mapState.chkLabels ? mapState.chkLabels[1] : ''"
          :un-checked-children="mapState.chkLabels ? mapState.chkLabels[0] : ''"
          @change="onFieldChanged"
        />
      </a-tooltip>
      <a-radio-group
        v-else-if="mapState.type === 'Radio'"
        button-style="solid"
        :disabled="disabled"
        :value="getProp(formState, skey)"
        @change="(e: any) => onFieldChanged(e.target.value)"
      >
        <template v-if="mapState.style === 'button'">
          <a-radio-button v-for="opn in mapState.options" :key="opn.value" :value="opn.value">
            {{ opn.label }}
          </a-radio-button>
        </template>
        <template v-else>
          <a-radio v-for="opn in mapState.options" :key="opn.value" :value="opn.value">
            {{ opn.label }}
          </a-radio>
        </template>
      </a-radio-group>
      <a-textarea
        v-else-if="mapState.type === 'Textarea'"
        :value="getProp(formState, skey)"
        :rows="mapState.maxRows"
        :placeholder="mapState.placeholder || '请输入'"
        :disabled="disabled"
        @change="(e: any) => onFieldChanged(e.target.value)"
        @blur="(e: any) => mapState.onBlur && mapState.onBlur(formState, e.target.value)"
      />
      <a-cascader
        v-else-if="mapState.type === 'Cascader'"
        :options="mapState.options"
        :placeholder="mapState.placeholder || '请选择'"
        :value="getProp(formState, skey)"
        change-on-select
        :disabled="disabled"
        @change="onFieldChanged"
      />
      <a-tooltip v-else-if="mapState.type === 'Button'">
        <template #title>{{ mapState.placeholder || '请点击' }}</template>
        <a-button
          class="w-full"
          :disabled="disabled"
          :danger="mapState.danger"
          :type="mapState.primary ? 'primary' : 'default'"
          ghost
          :loading="mapState.loading"
          @click="() => mapState.onClick(formState)"
        >
          {{ mapState.inner }}
        </a-button>
      </a-tooltip>
      <a-date-picker
        v-else-if="mapState.type === 'DateTime'"
        class="w-full"
        show-time
        :placeholder="mapState.placeholder || '请选择'"
        :disabled="disabled"
        :value="getProp(formState, skey)"
        @change="onFieldChanged"
      />
      <template v-else-if="mapState.type === 'Table'">
        <a-space>
          <a-button
            v-if="validConds(formState, mapState.addable, true)"
            type="primary"
            @click="
              () => {
                mapState.emitter.emit('update:show', { show: true, viewOnly: false })
                mapState.onEdit && mapState.onEdit(formState)
              }
            "
          >
            新增
          </a-button>
          <slot name="FormDialog" />
          <a-typography-text type="secondary">
            <InfoCircleOutlined />
            {{ mapState.placeholder || '点击添加' }}
          </a-typography-text>
        </a-space>
        <a-table
          class="mt-1.5"
          v-if="getProp(formState, skey) && getProp(formState, skey).length"
          :columns="mapState.columns.concat([new Column('操作', 'opera', { width: 80 })])"
          :data-source="getProp(formState, skey)"
          :pagination="false"
          size="small"
          :custom-row="
            (record: any) => ({
              onClick: () => {
                mapState.emitter.emit('update:show', {
                  show: true,
                  object: record,
                  viewOnly: !mapState.editable
                })
                mapState.onEdit(formState)
              }
            })
          "
        >
          <template v-if="validConds(formState, mapState.delable)" #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'opera'">
              <a-popconfirm
                title="确定删除该字段"
                @confirm.stop="mapState.onDeleted(record.key, getProp(formState, skey))"
              >
                <a-button danger size="small" @click.stop="() => {}">删除</a-button>
              </a-popconfirm>
            </template>
          </template>
        </a-table>
      </template>
      <UploadFile
        v-else-if="mapState.type === 'UploadFile'"
        :form="formState"
        :path="mapState.path"
        :params="mapState.params"
        :headers="mapState.headers"
        :directory="mapState.directory"
        :value="getProp(formState, skey)"
        :onBeforeUpload="mapState.onBeforeUpload"
        :onChange="mapState.onChange"
        :disabled="disabled"
        @update:value="onFieldChanged"
      />
      <a-space v-else-if="mapState.type === 'Delable'">
        {{ getProp(formState, skey) || '-' }}
        <CloseCircleOutlined @click="mapState.onDeleted(formState.key)" />
      </a-space>
      <a-input-group v-else-if="mapState.type === 'SelOrIpt'" compact class="flex">
        <a-select
          v-if="mapState.mode === 'select'"
          class="flex-auto"
          :options="mapState.options"
          :value="getProp(formState, skey)"
          :placeholder="mapState.placeholder || '请选择'"
          :disabled="disabled"
          @change="onFieldChanged"
        />
        <a-input
          v-else
          class="flex-auto"
          :placeholder="mapState.placeholder || '请输入'"
          :value="getProp(formState, skey)"
          :disabled="disabled"
          @change="(e: any) => onFieldChanged(e.target.value)"
        />
        <a-button
          @click="
            () => {
              mapState.mode = mapState.mode === 'select' ? 'input' : 'select'
            }
          "
          :disabled="disabled"
        >
          <template #icon>
            <SelectOutlined v-if="mapState.mode === 'select'" />
            <EditOutlined v-else />
          </template>
        </a-button>
      </a-input-group>
      <ListSelect
        v-else-if="mapState.type === 'ListSelect'"
        :options="mapState.options"
        :height="mapState.height"
        :value="getProp(formState, skey)"
        @update:value="onFieldChanged"
      />
      <EditList
        v-else-if="mapState.type === 'EditList'"
        :mapper="mapState"
        :value="getProp(formState, skey)"
        @update:value="onFieldChanged"
      >
        <template #formItem="{ form, elKey, value }">
          <FormItem :form="form" :skey="elKey" :mapper="value" />
        </template>
      </EditList>
      <CodeEditor
        v-else-if="mapState.type === 'CodeEditor'"
        :lang="mapState.lang"
        :value="getProp(formState, skey)"
        @update:value="onFieldChanged"
        :disabled="disabled"
      />
      <TagList
        v-else-if="mapState.type === 'TagList'"
        :mapper="mapState"
        :value="getProp(formState, skey)"
        @update:value="onFieldChanged"
      >
        <template #FormDialog>
          <slot name="FormDialog" />
        </template>
      </TagList>
      <template v-else>
        {{ getProp(formState, skey) }}
      </template>
    </template>
  </a-form-item>
</template>

<script lang="ts" setup name="FormItem">
import {
  CloseCircleOutlined,
  EditOutlined,
  InfoCircleOutlined,
  SelectOutlined
} from '@ant-design/icons-vue'
import { cloneDeep } from 'lodash'
import { computed, defineEmits, defineProps, ref, useSlots, watch } from 'vue'

import type { OpnType } from '../types'
import Column from '../types/column'
import { getProp, setProp, validConds } from '../utils'
import CodeEditor from './CodeEditor.vue'
import EditList from './EditList.vue'
import ListSelect from './ListSelect.vue'
import TagList from './TagList.vue'
import UploadFile from './UploadFile.vue'

const props = defineProps({
  form: { type: Object, required: true },
  skey: { type: String, required: true },
  mapper: { type: Object, required: true },
  editable: { type: Boolean, default: true },
  viewOnly: { type: Boolean, default: false }
})
const emit = defineEmits(['update:form'])
const formState = ref(props.form)
const mapState = ref(props.mapper)
const display = computed(() => validConds(formState.value, mapState.value.display, true))
const disabled = computed(
  () => validConds(formState.value, mapState.value.disabled) || !props.editable
)

watch(
  () => props.mapper,
  () => {
    mapState.value = cloneDeep(props.mapper)
  }
)
watch(
  () => props.form,
  (form: any) => {
    formState.value = cloneDeep(form)
  }
)

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
  setProp(formState.value, props.skey, newVal)
  if (mapState.value.onChange) {
    mapState.value.onChange(formState.value, newVal)
  }
  emit('update:form', formState.value)
}
function chkInSlot(suffix?: string) {
  const key = props.skey + (suffix || '')
  const slotKey = !!useSlots()[key]
  return slotKey && key !== 'default'
}
</script>
