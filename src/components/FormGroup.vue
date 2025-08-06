<script lang="ts" setup name="FormGroup">
import { MinusOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { type FormInstance } from 'ant-design-vue'
import { type PropType, ref } from 'vue'

import Mapper from '../types/mapper'
import { validConds } from '../utils'
import FormItem from './FormItem.vue'

const props = defineProps({
  lblWid: { type: Number, default: 4 },
  lblAlgn: { type: String, default: 'right' },
  layout: { type: String as PropType<'horizontal' | 'vertical' | 'inline'>, default: 'horizontal' },
  mapper: { type: Mapper, required: true },
  form: { type: Object, required: true },
  rules: { type: Object, default: null },
  editable: { type: Boolean, default: true },
  viewOnly: { type: Boolean, default: false }
})
const emit = defineEmits(['update:fprop'])
const refer = ref<FormInstance>()
const formRules =
  props.rules ||
  Object.fromEntries(
    Object.entries(props.mapper).map(entry => {
      return [entry[0], entry[1].rules]
    })
  )

defineExpose({ refer })
</script>

<template>
  <a-form
    ref="refer"
    :model="form"
    :rules="formRules"
    :layout="layout"
    :label-col="layout === 'horizontal' ? { span: lblWid } : undefined"
    :wrapper-col="layout === 'horizontal' ? { span: 24 - lblWid } : undefined"
    :label-align="lblAlgn"
  >
    <template v-for="(value, key) in mapper">
      <template v-if="value.type === 'FormGroup' && validConds(form, value.display, true)">
        <div
          v-if="!value.canFold || value.fold"
          class="border border-solid border-gray-300 pt-7 px-2.5 my-7 relative rounded"
        >
          <a-button
            type="link"
            size="small"
            class="absolute bg-white left-1.5 -top-2.5"
            @click="value.fold = !value.fold"
            :disabled="validConds(form, value.disabled) || !value.canFold"
          >
            {{ value.label }}
          </a-button>
          <a-button
            v-if="value.canFold"
            type="link"
            size="small"
            class="absolute bg-white -right-3 -top-3"
            @click="value.fold = !value.fold"
            :disabled="validConds(form, value.disabled)"
          >
            <template #icon><minus-outlined /></template>
          </a-button>
          <FormItem
            v-for="(v, k) in value.items"
            :form="form"
            :skey="value.prefix ? [key, k.toString()].join('.') : k.toString()"
            :mapper="v"
            :editable="editable"
            :viewOnly="viewOnly"
            :lblWid="lblWid"
            @update:fprop="(fm: any) => emit('update:fprop', fm)"
          >
            <template #FormDialog>
              <slot name="FormDialog" v-bind="{ value: v, key: k }" />
            </template>
            <template v-for="name in Object.keys($slots).filter(k => k !== 'FormDialog')" #[name]>
              <slot :name="name" v-bind="{ formState: form }" />
            </template>
          </FormItem>
        </div>
        <div v-else class="border-t border-b-0 border-solid border-gray-300 my-7 relative">
          <a-button
            type="link"
            size="small"
            class="absolute bg-white left-1.5 -top-3"
            @click="value.fold = !value.fold"
          >
            {{ value.label }}
          </a-button>
          <a-button
            type="link"
            size="small"
            class="absolute bg-white -right-3 -top-3"
            @click="value.fold = !value.fold"
          >
            <template #icon><plus-outlined /></template>
          </a-button>
        </div>
      </template>
      <FormItem
        v-else
        :form="form"
        :skey="key.toString()"
        :mapper="value"
        :editable="editable"
        :viewOnly="viewOnly"
        :lblWid="lblWid"
        @update:fprop="(fm: any) => emit('update:fprop', fm)"
      >
        <template #FormDialog>
          <slot name="FormDialog" v-bind="{ value, key }" />
        </template>
        <template v-for="name in Object.keys($slots).filter(k => k !== 'FormDialog')" #[name]>
          <slot :name="name" v-bind="{ formState: form }" />
        </template>
      </FormItem>
    </template>
  </a-form>
</template>
