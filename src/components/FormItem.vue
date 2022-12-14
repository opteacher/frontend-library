<template>
  <a-form-item v-show="display" :ref="skey" :name="skey" :rules="valState.rules">
    <template v-if="valState.label" #label>
      {{ valState.label }}&nbsp;
      <a-tooltip v-if="valState.desc">
        <template #title>{{ valState.desc }}</template>
        <InfoCircleOutlined />
      </a-tooltip>
    </template>
    <template v-if="viewOnly">
      <template
        v-if="
          valState.type === 'Input' ||
          valState.type === 'Number' ||
          valState.type === 'Delable' ||
          valState.type === 'SelOrIpt' ||
          valState.type === 'DateTime'
        "
      >
        {{ getProp(formState, skey) }}
      </template>
      <template v-else-if="valState.type === 'Textarea' || valState.type === 'CodeEditor'">
        <pre class="mb-0">{{ getProp(formState, skey) }}</pre>
      </template>
      <template v-else-if="valState.type === 'Select' || valState.type === 'Cascader'">
        {{ fmtDrpdwnValue(valState.options, getProp(formState, skey)) }}
      </template>
      <template v-else-if="valState.type === 'Checkbox'">
        {{
          getProp(formState, skey)
            ? valState.chkLabels
              ? valState.chkLabels[1]
              : '是'
            : valState.chkLabels
            ? valState.chkLabels[0]
            : '否'
        }}
      </template>
      <template v-else-if="valState.type === 'EditList'">
        <ul class="pl-0 list-none mb-0">
          <li v-for="item in getProp(formState, skey)" :key="item">{{ item }}</li>
        </ul>
      </template>
      <template v-else-if="valState.type === 'Table'">
        <a-table
          v-show="getProp(formState, skey) && getProp(formState, skey).length"
          :columns="valState.columns"
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
        v-if="valState.type === 'Input'"
        :value="getProp(formState, skey)"
        :type="valState.iptType || 'text'"
        :disabled="disabled"
        :addon-before="valState.prefix"
        :addon-after="valState.suffix"
        :placeholder="valState.placeholder || '请输入'"
        @change="(e: any) => onFieldChanged(e.target.value)"
        @blur="(e: any) => valState.onBlur && valState.onBlur(formState, e.target.value)"
      />
      <a-input-number
        v-else-if="valState.type === 'Number'"
        class="w-full"
        type="number"
        :value="getProp(formState, skey)"
        :placeholder="valState.placeholder || '请输入'"
        :disabled="disabled"
        :addon-before="valState.prefix"
        :addon-after="valState.suffix"
        @change="(val: any) => onFieldChanged(val)"
        @blur="(e: any) => valState.onBlur && valState.onBlur(formState, e.target.value)"
      />
      <a-input-password
        v-else-if="valState.type === 'Password'"
        :value="getProp(formState, skey)"
        :placeholder="valState.placeholder || '请输入'"
        :disabled="disabled"
        @change="(e: any) => onFieldChanged(e.target.value)"
        @blur="(e: any) => valState.onBlur && valState.onBlur(formState, e.target.value)"
      />
      <a-select
        v-else-if="valState.type === 'Select'"
        class="w-full"
        :options="valState.options"
        :value="getProp(formState, skey)"
        :placeholder="valState.placeholder || '请选择'"
        :disabled="disabled"
        @dropdownVisibleChange="valState.onDropdown"
        @change="(val: any) => onFieldChanged(val)"
      >
        <template v-if="valState.loading" #notFoundContent>
          <a-spin size="small" />
        </template>
      </a-select>
      <a-tooltip v-else-if="valState.type === 'Checkbox'">
        <template #title>{{ valState.placeholder || '请确认' }}</template>
        <a-checkbox
          :name="skey"
          :checked="getProp(formState, skey)"
          :disabled="disabled"
          @change="(e: any) => onFieldChanged(e.target.checked)"
        >
          {{
            getProp(formState, skey)
              ? valState.chkLabels
                ? valState.chkLabels[1]
                : '是'
              : valState.chkLabels
              ? valState.chkLabels[0]
              : '否'
          }}
        </a-checkbox>
      </a-tooltip>
      <a-tooltip v-else-if="valState.type === 'Switch'">
        <a-switch
          :checked="getProp(formState, skey)"
          :checked-children="valState.chkLabels ? valState.chkLabels[1] : ''"
          :un-checked-children="valState.chkLabels ? valState.chkLabels[0] : ''"
          @change="onFieldChanged"
        />
      </a-tooltip>
      <a-textarea
        v-else-if="valState.type === 'Textarea'"
        :value="getProp(formState, skey)"
        :rows="valState.maxRows"
        :placeholder="valState.placeholder || '请输入'"
        :disabled="disabled"
        @change="(e: any) => onFieldChanged(e.target.value)"
        @blur="(e: any) => valState.onBlur && valState.onBlur(formState, e.target.value)"
      />
      <a-cascader
        v-else-if="valState.type === 'Cascader'"
        :options="valState.options"
        :placeholder="valState.placeholder || '请选择'"
        :value="getProp(formState, skey)"
        change-on-select
        :disabled="disabled"
        @change="(e: any) => onFieldChanged(e)"
      />
      <a-tooltip v-else-if="valState.type === 'Button'">
        <template #title>{{ valState.placeholder || '请点击' }}</template>
        <a-button
          class="w-full"
          :disabled="disabled"
          :danger="valState.danger"
          :type="valState.primary ? 'primary' : 'default'"
          ghost
          :loading="valState.loading"
          @click="() => valState.onClick(formState)"
        >
          {{ valState.inner }}
        </a-button>
      </a-tooltip>
      <a-date-picker
        v-else-if="valState.type === 'DateTime'"
        class="w-full"
        show-time
        :placeholder="valState.placeholder || '请选择'"
        :disabled="disabled"
        :value="getProp(formState, skey)"
      />
      <template v-else-if="valState.type === 'Table'">
        <a-space>
          <a-button
            v-if="validConds(formState, valState.addable)"
            type="primary"
            @click="
              () => {
                valState.emitter.emit('viewOnly', false)
                valState.show = true
                valState.onEdit(formState)
              }
            "
          >
            新增
          </a-button>
          <slot name="FormDialog" />
          <a-typography-text type="secondary">
            <InfoCircleOutlined />
            {{ valState.placeholder || '点击添加' }}
          </a-typography-text>
        </a-space>
        <a-table
          class="mt-1.5"
          v-show="getProp(formState, skey) && getProp(formState, skey).length"
          :columns="valState.columns.concat([new Column('操作', 'opera', { width: 80 })])"
          :data-source="getProp(formState, skey)"
          :pagination="false"
          size="small"
          :custom-row="
                  (record: any) => ({
                    onClick: () => {
                      valState.emitter.emit('viewOnly', !valState.edtable)
                      valState.show = true
                      valState.emitter.emit('update:data', record)
                      valState.onEdit(formState)
                    }
                  })
                "
        >
          <template v-if="validConds(formState, valState.delable)" #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'opera'">
              <a-popconfirm
                title="确定删除该字段"
                @confirm.stop="valState.onDeleted(record.key, getProp(formState, skey))"
              >
                <a-button danger size="small" @click.stop="() => {}">删除</a-button>
              </a-popconfirm>
            </template>
          </template>
        </a-table>
      </template>
      <UploadFile
        v-else-if="valState.type === 'UploadFile'"
        :form="formState"
        :path="valState.path"
        :headers="valState.headers"
        :value="getProp(formState, skey)"
        :onBeforeUpload="valState.onBeforeUpload"
        :onChange="valState.onChange"
        :disabled="disabled"
        @update:value="(val: any) => setProp(formState, skey, val)"
      />
      <a-space v-else-if="valState.type === 'Delable'">
        {{ getProp(formState, skey) || '-' }}
        <CloseCircleOutlined @click="valState.onDeleted(formState.key)" />
      </a-space>
      <a-input-group v-else-if="valState.type === 'SelOrIpt'" compact class="flex">
        <a-select
          v-if="valState.mode === 'select'"
          class="flex-auto"
          :options="valState.options"
          :value="getProp(formState, skey)"
          :placeholder="valState.placeholder || '请选择'"
          :disabled="disabled"
          @change="(val: any) => onFieldChanged(val)"
        />
        <a-input
          v-else
          class="flex-auto"
          :placeholder="valState.placeholder || '请输入'"
          :value="getProp(formState, skey)"
          :disabled="disabled"
          @change="(e: any) => onFieldChanged(e.target.value)"
        />
        <a-button
          @click="
            () => {
              valState.mode = valState.mode === 'select' ? 'input' : 'select'
            }
          "
          :disabled="disabled"
        >
          <template #icon>
            <SelectOutlined v-if="valState.mode === 'select'" />
            <EditOutlined v-else />
          </template>
        </a-button>
      </a-input-group>
      <a-form-item-rest v-else-if="valState.type === 'ListSelect'">
        <a-list
          item-layout="horizontal"
          :data-source="valState.options"
          size="small"
          bordered
          class="overflow-y-auto"
          :style="{
            'max-height': `${valState.height}px`
          }"
        >
          <template #renderItem="{ item: option }">
            <a-list-item>
              <a-list-item-meta :description="option.subTitle">
                <template #title>
                  <a v-if="option.href" :href="option.href">{{ option.title }}</a>
                  <p class="mb-0" v-else>{{ option.title }}</p>
                </template>
                <template #avatar>
                  <a-avatar :src="option.avatar">
                    <template v-if="!option.avatar" #icon>
                      <AppstoreOutlined />
                    </template>
                  </a-avatar>
                </template>
              </a-list-item-meta>
              <template #actions>
                <a-checkbox
                  :checked="getProp(formState, skey).includes(option.key)"
                  @change="(e: any) => onLstSelChecked(e.target.checked, skey as string, option.key)"
                />
              </template>
            </a-list-item>
          </template>
        </a-list>
      </a-form-item-rest>
      <EditList
        v-else-if="valState.type === 'EditList'"
        :field="valState"
        :value="getProp(formState, skey)"
        @update:value="onFieldChanged"
      >
        <template #formItem="{ form, skey, value }">
          <FormItem :form="form" :skey="skey" :value="value" />
        </template>
      </EditList>
      <CodeEditor
        v-else-if="valState.type === 'CodeEditor'"
        :lang="valState.lang"
        :value="getProp(formState, skey)"
        @update:value="(val: string) => setProp(formState, skey, val)"
        :disabled="disabled"
      />
      <TagList
        v-else-if="valState.type === 'TagList'"
        :field="valState"
        :value="getProp(formState, skey)"
        @update:value="(val: string) => setProp(formState, skey, val)"
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

<script lang="ts">
import type { OpnType } from '../types'
import Column from '../types/column'
import { computed, defineComponent, reactive, watch } from 'vue'
import {
  InfoCircleOutlined,
  CloseCircleOutlined,
  SelectOutlined,
  EditOutlined,
  AppstoreOutlined
} from '@ant-design/icons-vue'
import { getCopy } from '../types/mapper'
import CodeEditor from './CodeEditor.vue'
import UploadFile from './UploadFile.vue'
import TagList from './TagList.vue'
import EditList from './EditList.vue'
import { validConds, getProp, setProp } from '../utils'

export default defineComponent({
  name: 'FormItem',
  components: {
    InfoCircleOutlined,
    CloseCircleOutlined,
    SelectOutlined,
    EditOutlined,
    AppstoreOutlined,

    UploadFile,
    CodeEditor,
    TagList,
    EditList
  },
  props: {
    form: { type: Object, required: true },
    skey: { type: String, required: true },
    value: { type: Object, required: true },
    editable: { type: Boolean, default: true },
    viewOnly: { type: Boolean, default: false }
  },
  setup(props, { slots }) {
    const formState = reactive(props.form)
    const valState = reactive(props.value)
    const display = computed(() => validConds(formState, valState.display, true))
    const disabled = computed(() => validConds(formState, valState.disabled) || !props.editable)

    watch(
      () => props.value,
      () => {
        getCopy(props.value, valState)
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
    function onLstSelChecked(chk: boolean, propKey: string, opnKey: string) {
      const selKeys = formState[propKey].map((itm: any) => itm.key)
      if (chk) {
        if (!selKeys.includes(opnKey)) {
          formState[propKey].push(opnKey)
        }
      } else {
        formState[propKey].splice(selKeys.indexOf(opnKey), 1)
      }
    }
    function onFieldChanged(newVal: any) {
      setProp(formState, props.skey, newVal)
      if (valState.onChange) {
        valState.onChange(formState, newVal)
      }
    }
    function chkInSlot() {
      return slots[props.skey] && props.skey !== 'default'
    }
    return {
      Column,

      formState,
      valState,
      display,
      disabled,

      getProp,
      setProp,
      validConds,
      fmtDrpdwnValue,
      onLstSelChecked,
      onFieldChanged,
      chkInSlot
    }
  }
})
</script>
