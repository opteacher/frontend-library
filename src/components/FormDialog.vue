<template>
  <a-modal
    v-model:open="vsbState"
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
      :mapper="formMapper"
      v-model:form="formState"
      :rules="formRules"
      :editable="editable"
      :viewOnly="viewOnly"
      :lblWid="lblWid"
      :lblAlgn="lblAlgn"
      @update:fprop="values => Object.entries(values).map(([k, v]) => setProp(formState, k, v))"
    >
      <template #FormDialog="{ value, key }">
        <FormDialog
          :title="value.label"
          :width="value.width"
          :mapper="value.mapper"
          :emitter="value.emitter"
          :newFun="value.newFun"
          :object="value.editing"
          :operable="value.editable"
          @submit="(form: any, next: Function) => onFormSubmit(key, value, form, next)"
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
import { getProp, setProp } from '../utils'
import FormGroup from './FormGroup.vue'
import { EyeOutlined, FormOutlined } from '@ant-design/icons-vue'
import { cloneDeep } from 'lodash'
import { TinyEmitter as Emitter } from 'tiny-emitter'
import { onMounted, ref, watch } from 'vue'

const emit = defineEmits(['initialize', 'update:visible', 'update:vwOnly', 'submit'])
const props = defineProps({
  visible: { type: Boolean, default: false },
  vwOnly: { type: Boolean, default: false },
  width: { type: String, default: '50vw' },
  lblWid: { type: Number, default: 4 },
  lblAlgn: { type: String, default: 'right' },
  title: { type: String, default: 'Form Dialog' },
  newFun: { type: Function, default: () => ({}) },
  object: { type: Object, default: null },
  mapper: { type: Mapper, required: true },
  emitter: { type: Emitter, default: null },
  operable: { type: Boolean, default: false }
})
const vsbState = ref<boolean>(props.visible)
const editable = ref(true)
const viewOnly = ref(false)
const okLoading = ref(false)
const formRef = ref()
const formMapper = ref<Mapper>(props.mapper)
const formState = ref(updateState())
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
    'update:visible',
    (args: { show: boolean; object?: Object; viewOnly?: boolean } | boolean) => {
      if (typeof args === 'boolean') {
        vsbState.value = args
        if (!args) {
          formRef.value?.refer.resetFields()
          resetState()
        }
        return
      }
      if (!args.show) {
        vsbState.value = false
        formRef.value?.refer.resetFields()
        resetState()
        return
      }
      viewOnly.value = typeof args.viewOnly != 'undefined' ? args.viewOnly : false
      if (args.object) {
        formState.value = cloneDeep(args.object)
      }
      vsbState.value = args.show
    }
  )
  props.emitter.on('update:data', (data?: any) => {
    if (data) {
      formState.value = cloneDeep(data)
    } else if (formState.value.reset) {
      formState.value.reset()
    } else {
      formState.value = props.newFun()
    }
  })
  props.emitter.on('update:dprop', (data: Record<string, any>) => {
    for (const [prop, value] of Object.entries(data)) {
      setProp(formState.value, prop, value)
    }
  })
  props.emitter.on('update:mapper', (mapper: any) => {
    formMapper.value = cloneDeep(mapper)
  })
  props.emitter.on('update:mprop', (mapper: Record<string, any>) => {
    for (const [prop, value] of Object.entries(mapper)) {
      setProp(formMapper.value, prop, value)
    }
  })
  props.emitter.on('viewOnly', (vwOnly: boolean) => {
    viewOnly.value = vwOnly
  })
}
onMounted(() => {
  emit('initialize')
})
watch(
  () => props.visible,
  (show: boolean) => {
    vsbState.value = show
    if (show && !props.emitter) {
      formState.value = updateState()
    }
  }
)
watch(
  () => vsbState.value,
  (newVsb: boolean) => {
    emit('update:visible', vsbState.value)
    if (newVsb && props.emitter) {
      props.emitter.emit('show', formState.value)
    }
  }
)
watch(
  () => props.vwOnly,
  (vwOnly: boolean) => {
    viewOnly.value = vwOnly
  }
)
watch(
  () => viewOnly,
  () => emit('update:vwOnly', viewOnly.value)
)
watch(
  () => props.object,
  (obj: any) => {
    formState.value = cloneDeep(obj)
  }
)

async function onOkClick() {
  try {
    okLoading.value = true
    await formRef.value.refer.validate()
    emit('submit', formState.value, () => {
      okLoading.value = false
      formRef.value.refer.resetFields()
      resetState()
      onDlgClose()
    })
  } catch (e) {
    console.log(e)
  }
}
function onCclClick() {
  formRef.value.refer.resetFields()
  resetState()
  onDlgClose()
}
function resetState() {
  if (formState.value.reset) {
    formState.value.reset()
  } else {
    formState.value = props.newFun()
  }
}
function onDlgClose() {
  vsbState.value = false
  emit('update:visible', false)
  for (const value of Object.values(formMapper.value)) {
    if (typeof value.fold !== 'undefined') {
      value.fold = false
    }
  }
}
function updateState() {
  return props.object ? cloneDeep(props.object) : props.newFun()
}
async function onFormSubmit(key: string | number, value: any, form: any, next: Function) {
  await value.onSaved(form, getProp(formState.value, key as string))
  next()
}
</script>
