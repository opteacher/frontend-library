<template>
  <a-modal
    v-model:visible="visible"
    :width="width"
    :confirmLoading="!editable || okLoading"
    :footer="viewOnly ? null : undefined"
    @cancel="onCclClick"
  >
    <template #title>
      {{ title }}
      <a-button v-if="operable" type="text" @click="viewOnly = !viewOnly">
        <template #icon>
          <FormOutlined v-if="viewOnly" />
          <EyeOutlined v-else />
        </template>
      </a-button>
    </template>
    <template #footer>
      <template v-if="$slots['footer']">
        <slot name="footer" v-bind="formState" />
      </template>
      <template v-else>
        <a-button type="default" @click="onCclClick">取消</a-button>
        <a-button type="primary" html-type="submit" @click="onOkClick">确定</a-button>
      </template>
    </template>
    <div class="mb-5">
      <slot name="top" />
    </div>
    <FormGroup
      ref="formRef"
      :copy="copy"
      :object="object"
      :mapper="formMapper"
      :form="formState"
      :rules="formRules"
      :editable="editable"
      :viewOnly="viewOnly"
      :lblWid="lblWid"
    >
      <template #FormDialog="{ value, key }">
        <FormDialog
          :title="value.label"
          :mapper="value.mapper"
          :copy="value.copy"
          :emitter="value.emitter"
          :object="value.editing"
          @submit="
            (form: any, next: Function) => {
              value.onSaved(form, getProp(formState, key as string))
              next()
            }
          "
        />
      </template>
      <template v-for="(_, name) in $slots" :key="name" #[name]>
        <slot :name="name" v-bind="{ formState }" />
      </template>
    </FormGroup>
    <div class="mt-5">
      <slot name="bottom" />
    </div>
  </a-modal>
</template>

<script lang="ts" setup name="FormDialog">
/* eslint-disable @typescript-eslint/no-explicit-any */
import Mapper from '../types/mapper'
import { defineProps, defineEmits, onMounted, reactive, ref, watch } from 'vue'
import { TinyEmitter as Emitter } from 'tiny-emitter'
import FormGroup from './FormGroup.vue'
import { getProp } from '../utils'
import { FormOutlined, EyeOutlined } from '@ant-design/icons-vue'

const emit = defineEmits(['initialize', 'update:show', 'submit'])
const props = defineProps({
  show: { type: Boolean, default: false },
  copy: { type: Function, required: true },
  width: { type: String, default: '50vw' },
  lblWid: { type: Number, default: 4 },
  title: { type: String, default: 'Form Dialog' },
  object: { type: Object, default: null },
  mapper: { type: Mapper, required: true },
  emitter: { type: Emitter, default: null },
  operable: { type: Boolean, default: false }
})
const visible = ref<boolean>(props.show)
const editable = ref(true)
const viewOnly = ref(false)
const okLoading = ref(false)
const formRef = ref()
const formMapper = reactive(props.mapper)
const formState = reactive(props.object || props.copy({}))
const formRules = Object.fromEntries(
  Object.entries(props.mapper).map(entry => {
    return [entry[0], entry[1].rules]
  })
)

if (props.emitter) {
  props.emitter.on('editable', (edtb: boolean) => {
    editable.value = edtb
  })
  props.emitter.on(
    'update:show',
    (args: { show: boolean; object?: Object; viewOnly?: boolean } | boolean) => {
      if (typeof args === 'boolean') {
        visible.value = args
        return
      }
      if (!args.show) {
        visible.value = false
        return
      }
      viewOnly.value = typeof args.viewOnly != 'undefined' ? args.viewOnly : false
      if (args.object) {
        props.copy(args.object, formState, true)
      }
      visible.value = args.show
    }
  )
  props.emitter.on('update:data', (data?: any) => {
    if (data) {
      props.copy(data, formState, true)
    } else if (formState.reset) {
      formState.reset()
    } else {
      props.copy({}, formState, true)
    }
  })
  props.emitter.on('update:mapper', (mapper: any) => {
    Mapper.copy(mapper, formMapper)
  })
  props.emitter.on('viewOnly', (vwOnly: boolean) => {
    viewOnly.value = vwOnly
  })
}
onMounted(() => {
  emit('initialize')
})
watch(
  () => props.show,
  (show: boolean) => {
    visible.value = show
  }
)
watch(
  () => visible.value,
  () => emit('update:show', visible.value)
)

async function onOkClick() {
  try {
    okLoading.value = true
    await formRef.value.refer.validate()
    emit('submit', formState, () => {
      okLoading.value = false
      formRef.value.refer.resetFields()
      formState.reset && formState.reset()
      visible.value = false
      emit('update:show', false)
    })
  } catch (e) {
    console.log(e)
  }
}
function onCclClick() {
  formRef.value.refer.resetFields()
  formState.reset && formState.reset()
  visible.value = false
  emit('update:show', false)
}
</script>
