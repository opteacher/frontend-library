<script setup lang="ts">
import * as antdIcons from '@ant-design/icons-vue'
import type { MapperType } from '../types/mapper'
import { computed, type PropType, h } from 'vue'
import { getProp, validConds } from '../utils'
import { fieldDftVal } from '../types/field'
import CodeEditor from './CodeEditor.vue'
import EditList from './EditList.vue'
import FormTable from './FormTable.vue'
import JsonEditor from './JsonEditor.vue'
import ListSelect from './ListSelect.vue'
import SelOrIpt from './SelOrIpt.vue'
import TagList from './TagList.vue'
import UploadFile from './UploadFile.vue'
import IpAddrInput from './IpAddrInput.vue'
import IconField from './IconField.vue'
import CompactInput from './CompactInput.vue'
import ColorSelect from './ColorSelect.vue'
import EleSelField from './EleSelField.vue'

const props = defineProps({
  form: { type: Object, required: true },
  skey: { type: String, required: true },
  editable: { type: Boolean, default: true },
  mapper: { type: Object as PropType<MapperType>, required: true }
})
const emit = defineEmits(['update:fprop'])
const disabled = computed(() => validConds(props.form, props.mapper.disabled) || !props.editable)

function onFieldChanged(newVal: any) {
  if (props.mapper.onChange) {
    props.mapper.onChange(props.form, newVal, props.form[props.skey])
  }
  emit('update:fprop', { [props.skey]: newVal })
}
function filterOption(input: string, option: any) {
  return props.mapper.searchable
    ? option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
    : true
}
function onTblRcdDeleted(key: any, val: any) {
  props.mapper.onDeleted && props.mapper.onDeleted(key, val)
  onFieldChanged(val)
}
</script>

<template>
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
    :visibility-toggle="mapper.visible"
    @change="(e: any) => onFieldChanged(e.target.value)"
    @blur="(e: any) => mapper.onBlur && mapper.onBlur(form, e.target.value)"
  />
  <IpAddrInput
    v-else-if="mapper.type === 'IpAddress'"
    :disabled="disabled"
    :ip="getProp(form, skey, fieldDftVal(mapper.type))"
    @update:ip="onFieldChanged"
  />
  <CompactInput
    v-else-if="mapper.type === 'CompactInput'"
    :disabled="disabled"
    :placeholders="mapper.placeholders"
    :splitLetter="mapper.splitLetter"
    :value="getProp(form, skey, fieldDftVal(mapper.type))"
    @update:value="onFieldChanged"
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
    <a-typography-text v-if="mapper.placeholder" type="secondary">
      {{ mapper.placeholder }}
    </a-typography-text>
  </a-space>
  <a-radio-group
    v-else-if="mapper.type === 'Radio'"
    class="w-full"
    button-style="solid"
    :disabled="disabled"
    :value="getProp(form, skey, fieldDftVal(mapper.type))"
    @change="(e: any) => onFieldChanged(e.target.value)"
  >
    <a-tooltip v-for="opn in mapper.options" :key="opn.value">
      <template #title>
        {{ opn.subLabel }}
      </template>
      <a-radio-button
        v-if="mapper.style === 'button'"
        class="text-center"
        :value="opn.value"
        :style="{ width: 100 / mapper.options.length + '%' }"
      >
        {{ opn.label }}
      </a-radio-button>
      <a-radio v-else-if="mapper.style === 'circle'" :value="opn.value">
        {{ opn.label }}
      </a-radio>
    </a-tooltip>
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
      :class="{ 'w-full': mapper.fullWid }"
      :disabled="disabled"
      :danger="mapper.danger"
      :type="mapper.primary ? 'primary' : mapper.dashed ? 'dashed' : 'default'"
      :ghost="mapper.ghost"
      :loading="typeof mapper.loading === 'function' ? mapper.loading() : mapper.loading"
      :html-type="mapper.htmlType"
      @click="() => mapper.onClick(form)"
    >
      <template v-if="mapper.icon" #icon>
        <keep-alive>
          <component :is="getProp(antdIcons, mapper.icon)" />
        </keep-alive>
      </template>
      {{ mapper.inner }}
    </a-button>
  </a-tooltip>
  <div
    v-else-if="mapper.type === 'Buttons'"
    class="flex"
    :class="{
      'flex-col': mapper.orientation === 'vertical',
      'space-x-2': mapper.orientation === 'horizontal'
    }"
  >
    <template v-for="btnMapper in mapper.buttons">
      <a-tooltip>
        <template #title>{{ btnMapper.placeholder || '请点击' }}</template>
        <a-button
          :class="{ 'flex-1': btnMapper.fullWid }"
          :disabled="disabled"
          :danger="btnMapper.danger"
          :type="btnMapper.primary ? 'primary' : btnMapper.dashed ? 'dashed' : 'default'"
          :ghost="btnMapper.ghost"
          :loading="
            typeof btnMapper.loading === 'function' ? btnMapper.loading() : btnMapper.loading
          "
          :html-type="btnMapper.htmlType"
          @click="() => btnMapper.onClick(form)"
        >
          <template v-if="btnMapper.icon" #icon>
            <keep-alive>
              <component :is="getProp(antdIcons, btnMapper.icon)" />
            </keep-alive>
          </template>
          {{ btnMapper.inner }}
        </a-button>
      </a-tooltip>
    </template>
  </div>
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
    @delete="onTblRcdDeleted"
  >
    <template v-for="name in Object.keys($slots)" #[name]="params">
      <slot :name="name" v-bind="params" />
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
    <antdIcons.CloseCircleOutlined @click="mapper.onDeleted(form.key)" />
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
    :label="mapper.label"
    :lblDict="mapper.lblDict"
    :lblProp="mapper.lblProp"
    :subProp="mapper.subProp"
    :inline="mapper.inline"
    :mapper="mapper.mapper"
    :disRmvIdxs="mapper.disRmvIdxs"
    :value="getProp(form, skey, fieldDftVal(mapper.type))"
    @click:add="mapper.onAddClick"
    @submit:add="mapper.onAddSubmit"
    @update:value="onFieldChanged"
  >
    <template v-for="name in Object.keys($slots)" #[name]="params">
      <slot :name="name" v-bind="params" />
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
    <template v-for="name in Object.keys($slots)" #[name]="params">
      <slot :name="name" v-bind="params" />
    </template>
  </TagList>
  <IconField
    v-else-if="mapper.type === 'IconField'"
    :disabled="disabled"
    :icon="getProp(form, skey, fieldDftVal(mapper.type))"
    @update:icon="onFieldChanged"
  />
  <ColorSelect
    v-else-if="mapper.type === 'ColorSelect'"
    :color="getProp(form, skey, fieldDftVal(mapper.type))"
    :preset="mapper.preset"
    @update:color="onFieldChanged"
  />
  <EleSelField
    v-else-if="mapper.type === 'PageEleSel'"
    :form="form"
    :prop="skey"
    :id-all="mapper.idAll"
    :emitter="mapper.emitter"
    :seled-stop="mapper.seledStop"
    @selEleClear="mapper.onSelEleClear"
    @selEleStart="mapper.onSelEleStart"
    @eleIdenChange="mapper.onEleIdenChange"
    @eleSelected="(prop: string, form: any) => onFieldChanged(getProp(form, prop))"
  />
  <a-steps
    v-else-if="mapper.type === 'Steps'"
    :current="-1"
    :direction="mapper.direction"
    :items="[
      ...mapper.items,
      mapper.addable ? {
        title: '添加新步骤',
        icon: h(antdIcons.PlusCircleOutlined),
        onClick: () => {
          console.log('add new step')
        }
      } : undefined
    ].filter(i => i)"
  />
  <template v-else>
    {{ getProp(form, skey) }}
  </template>
</template>
