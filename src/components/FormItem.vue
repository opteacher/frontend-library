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
      <slot v-if="chkInSlot('VW')" :name="skey + 'VW'" v-bind="{ formState }" />
      <template
        v-else-if="
          mapper.type === 'Input' ||
          mapper.type === 'Number' ||
          mapper.type === 'Delable' ||
          mapper.type === 'SelOrIpt' ||
          mapper.type === 'DateTime'
        "
      >
        {{ getProp(formState, skey) }}
      </template>
      <template v-else-if="mapper.type === 'Textarea' || mapper.type === 'CodeEditor'">
        <pre class="mb-0">{{ getProp(formState, skey) }}</pre>
      </template>
      <template v-else-if="mapper.type === 'Select' || mapper.type === 'Cascader'">
        {{ fmtDrpdwnValue(mapper.options, getProp(formState, skey)) }}
      </template>
      <template v-else-if="mapper.type === 'Checkbox'">
        {{
          getProp(formState, skey)
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
          <li v-for="item in getProp(formState, skey)" :key="item">{{ item }}</li>
        </ul>
      </template>
      <template v-else-if="mapper.type === 'Table'">
        <a-table
          v-show="getProp(formState, skey) && getProp(formState, skey).length"
          :columns="mapper.columns"
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
        v-if="mapper.type === 'Input'"
        :value="getProp(formState, skey)"
        :type="mapper.iptType || 'text'"
        :disabled="disabled"
        :addon-before="mapper.prefix"
        :addon-after="mapper.suffix"
        :placeholder="mapper.placeholder || '请输入'"
        @change="(e: any) => onFieldChanged(e.target.value)"
        @blur="(e: any) => mapper.onBlur && mapper.onBlur(formState, e.target.value)"
      />
      <a-input-number
        v-else-if="mapper.type === 'Number'"
        class="w-full"
        type="number"
        :value="getProp(formState, skey)"
        :placeholder="mapper.placeholder || '请输入'"
        :disabled="disabled"
        :addon-before="mapper.prefix"
        :addon-after="mapper.suffix"
        @change="onFieldChanged"
        @blur="(e: any) => mapper.onBlur && mapper.onBlur(formState, e.target.value)"
      />
      <a-input-password
        v-else-if="mapper.type === 'Password'"
        :value="getProp(formState, skey)"
        :placeholder="mapper.placeholder || '请输入'"
        :disabled="disabled"
        @change="(e: any) => onFieldChanged(e.target.value)"
        @blur="(e: any) => mapper.onBlur && mapper.onBlur(formState, e.target.value)"
      />
      <a-select
        v-else-if="mapper.type === 'Select'"
        class="w-full"
        :options="mapper.options"
        :value="getProp(formState, skey) || undefined"
        :placeholder="mapper.placeholder || '请选择'"
        :disabled="disabled"
        :allowClear="mapper.allowClear"
        @dropdownVisibleChange="mapper.onDropdown"
        @change="onFieldChanged"
      >
        <template v-if="mapper.loading" #notFoundContent>
          <a-spin size="small" />
        </template>
      </a-select>
      <a-tooltip v-else-if="mapper.type === 'Checkbox'">
        <template #title>{{ mapper.placeholder || '请确认' }}</template>
        <a-checkbox
          :name="skey"
          :checked="getProp(formState, skey, false)"
          :disabled="disabled"
          @change="(e: any) => onFieldChanged(e.target.checked)"
        >
          {{
            getProp(formState, skey)
              ? mapper.chkLabels
                ? mapper.chkLabels[1]
                : '是'
              : mapper.chkLabels
              ? mapper.chkLabels[0]
              : '否'
          }}
        </a-checkbox>
      </a-tooltip>
      <a-tooltip v-else-if="mapper.type === 'Switch'">
        <a-switch
          :checked="getProp(formState, skey)"
          :checked-children="mapper.chkLabels ? mapper.chkLabels[1] : ''"
          :un-checked-children="mapper.chkLabels ? mapper.chkLabels[0] : ''"
          @change="onFieldChanged"
        />
      </a-tooltip>
      <a-radio-group
        v-else-if="mapper.type === 'Radio'"
        button-style="solid"
        :disabled="disabled"
        :value="getProp(formState, skey)"
        @change="(e: any) => onFieldChanged(e.target.value)"
      >
        <template v-if="mapper.style === 'button'">
          <a-radio-button v-for="opn in mapper.options" :key="opn.value" :value="opn.value">
            {{ opn.label }}
          </a-radio-button>
        </template>
        <template v-else>
          <a-radio v-for="opn in mapper.options" :key="opn.value" :value="opn.value">
            {{ opn.label }}
          </a-radio>
        </template>
      </a-radio-group>
      <a-textarea
        v-else-if="mapper.type === 'Textarea'"
        :value="getProp(formState, skey)"
        :rows="mapper.maxRows"
        :placeholder="mapper.placeholder || '请输入'"
        :disabled="disabled"
        @change="(e: any) => onFieldChanged(e.target.value)"
        @blur="(e: any) => mapper.onBlur && mapper.onBlur(formState, e.target.value)"
      />
      <a-cascader
        v-else-if="mapper.type === 'Cascader'"
        :options="mapper.options"
        :placeholder="mapper.placeholder || '请选择'"
        :value="getProp(formState, skey)"
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
          @click="() => mapper.onClick(formState)"
        >
          {{ mapper.inner }}
        </a-button>
      </a-tooltip>
      <a-date-picker
        v-else-if="mapper.type === 'DateTime'"
        class="w-full"
        show-time
        :placeholder="mapper.placeholder || '请选择'"
        :disabled="disabled"
        :value="getProp(formState, skey)"
        @change="onFieldChanged"
      />
      <template v-else-if="mapper.type === 'Table'">
        <a-space>
          <a-button
            v-if="validConds(formState, mapper.addable, true)"
            type="primary"
            @click="
              () => {
                mapper.emitter.emit('update:show', { show: true, viewOnly: false })
                mapper.onEdit && mapper.onEdit(formState)
              }
            "
          >
            新增
          </a-button>
          <slot name="FormDialog" />
          <a-typography-text type="secondary">
            <InfoCircleOutlined />
            {{ mapper.placeholder || '点击添加' }}
          </a-typography-text>
        </a-space>
        <a-table
          class="mt-1.5"
          v-if="getProp(formState, skey) && getProp(formState, skey).length"
          :columns="mapper.columns.concat([new Column('操作', 'opera', { width: 80 })])"
          :data-source="getProp(formState, skey)"
          :pagination="false"
          size="small"
          :custom-row="
            (record: any) => ({
              onClick: () => {
                mapper.emitter.emit('update:show', {
                  show: true,
                  object: record,
                  viewOnly: !mapper.editable
                })
                mapper.onEdit && mapper.onEdit(formState)
              }
            })
          "
        >
          <template v-if="validConds(formState, mapper.delable)" #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'opera'">
              <a-popconfirm
                title="确定删除该字段"
                @confirm.stop="
                  mapper.onDeleted && mapper.onDeleted(record.key, getProp(formState, skey))
                "
              >
                <a-button danger size="small" @click.stop="() => {}">删除</a-button>
              </a-popconfirm>
            </template>
          </template>
        </a-table>
      </template>
      <UploadFile
        v-else-if="mapper.type === 'UploadFile'"
        :form="formState"
        :path="mapper.path"
        :params="mapper.params"
        :headers="mapper.headers"
        :directory="mapper.directory"
        :value="getProp(formState, skey)"
        :onBeforeUpload="mapper.onBeforeUpload"
        :onChange="mapper.onChange"
        :disabled="disabled"
        @update:value="onFieldChanged"
      />
      <a-space v-else-if="mapper.type === 'Delable'">
        {{ getProp(formState, skey) || '-' }}
        <CloseCircleOutlined @click="mapper.onDeleted(formState.key)" />
      </a-space>
      <SelOrIpt
        v-else-if="mapper.type === 'SelOrIpt'"
        :value="getProp(formState, skey)"
        :options="mapper.options"
        :placeholder="mapper.placeholder"
        :mode="mapper.mode"
        :disabled="disabled"
      />
      <ListSelect
        v-else-if="mapper.type === 'ListSelect'"
        :options="mapper.options"
        :height="mapper.height"
        :value="getProp(formState, skey)"
        @update:value="onFieldChanged"
      />
      <EditList
        v-else-if="mapper.type === 'EditList'"
        :mapper="mapper"
        :value="getProp(formState, skey)"
        @update:value="onFieldChanged"
      >
        <template #formItem="{ form, elKey, value }">
          <FormItem :form="form" :skey="elKey" :mapper="value" />
        </template>
      </EditList>
      <CodeEditor
        v-else-if="mapper.type === 'CodeEditor'"
        :lang="mapper.lang"
        :value="getProp(formState, skey)"
        @update:value="onFieldChanged"
        :disabled="disabled"
      />
      <TagList
        v-else-if="mapper.type === 'TagList'"
        :mapper="mapper"
        :value="getProp(formState, skey)"
        @update:value="onFieldChanged"
      >
        <template #formItem="{ form, elKey, value }">
          <FormItem :form="form" :skey="elKey" :mapper="value" />
        </template>
      </TagList>
      <template v-else>
        {{ getProp(formState, skey) }}
      </template>
    </template>
  </a-form-item>
</template>

<script lang="ts" setup name="FormItem">
import { CloseCircleOutlined, InfoCircleOutlined } from '@ant-design/icons-vue'
import { cloneDeep } from 'lodash'
import { computed, ref, useSlots, watch } from 'vue'

import type { OpnType } from '../types'
import Column from '../types/column'
import { getProp, setProp, validConds } from '../utils'
import CodeEditor from './CodeEditor.vue'
import EditList from './EditList.vue'
import ListSelect from './ListSelect.vue'
import SelOrIpt from './SelOrIpt.vue'
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
const display = computed(() => validConds(formState.value, props.mapper.display, true))
const disabled = computed(
  () => validConds(formState.value, props.mapper.disabled) || !props.editable
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
  if (props.mapper.onChange) {
    props.mapper.onChange(formState.value, newVal)
  }
  emit('update:form', formState.value)
}
function chkInSlot(suffix?: string) {
  const key = props.skey + (suffix || '')
  const slotKey = !!useSlots()[key]
  return slotKey && key !== 'default'
}
</script>
