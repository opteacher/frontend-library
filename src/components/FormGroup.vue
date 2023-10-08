<script lang="ts" setup name="FormGroup">
import { MinusOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { FormInstance } from 'ant-design-vue'
import { defineExpose, defineProps, defineEmits, ref } from 'vue'

import Mapper from '../types/mapper'
import { validConds } from '../utils'
import FormItem from './FormItem.vue'

defineProps({
  lblWid: { type: Number, default: 4 },
  mapper: { type: Mapper, required: true },
  form: { type: Object, required: true },
  rules: { type: Object, required: true },
  editable: { type: Boolean, default: true },
  viewOnly: { type: Boolean, default: false }
})
const emit = defineEmits(['update:form'])
const refer = ref<FormInstance>()

defineExpose({ refer })
</script>

<template>
  <a-form
    ref="refer"
    :model="form"
    :rules="rules"
    :label-col="{ span: lblWid }"
    :wrapper-col="{ span: 24 - lblWid }"
  >
    <template v-for="(value, key) in mapper" :key="key">
      <template v-if="value.type === 'FormGroup' && validConds(form, value.display, true)">
        <div
          v-if="value.fold"
          class="border border-solid border-gray-300 pt-7 px-2.5 my-7 relative rounded"
        >
          <a-button
            type="link"
            size="small"
            class="absolute bg-white left-1.5 -top-2.5"
            @click="value.fold = !value.fold"
            :disabled="validConds(form, value.disabled)"
          >
            {{ value.label }}
          </a-button>
          <a-button
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
            :key="k"
            :form="form"
            :skey="k.toString()"
            :mapper="v as Object"
            :editable="editable"
            :viewOnly="viewOnly"
            @update:form="(fm: any) => emit('update:form', fm)"
          >
            <template v-if="k in $slots" #[k]>
              <slot :name="k" v-bind="{ formState: form }" />
            </template>
            <template v-if="`${k}VW` in $slots" #[`${k}VW`]>
              <slot :name="`${k}VW`" v-bind="{ formState: form }" />
            </template>
            <template #FormDialog>
              <slot name="FormDialog" v-bind="{ value: v, key: k }" />
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
        :skey="key as string"
        :mapper="value"
        :editable="editable"
        :viewOnly="viewOnly"
        @update:form="(fm: any) => emit('update:form', fm)"
      >
        <template v-if="key in $slots" #[key]>
          <slot :name="key" v-bind="{ formState: form }" />
        </template>
        <template v-if="`${key}VW` in $slots" #[`${key}VW`]>
          <slot :name="`${key}VW`" v-bind="{ formState: form }" />
        </template>
        <template #FormDialog>
          <slot name="FormDialog" v-bind="{ value, key }" />
        </template>
      </FormItem>
    </template>
  </a-form>
</template>
