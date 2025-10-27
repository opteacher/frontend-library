<template>
  <a-modal
    v-model:open="vsbState"
    :width="fullScreen ? '100%' : width"
    :wrap-class-name="fullScreen ? 'full-modal' : undefined"
    :closable="closable"
    :maskClosable="closable"
    :confirmLoading="!editable || okLoading"
    :footer="viewOnly ? null : undefined"
    @cancel="onCclClick"
  >
    <template #title>
      <a-space align="baseline">
        <keep-alive v-if="icon">
          <component :is="iconState" v-bind="{ class: 'text-xl' }" />
        </keep-alive>
        {{ title }}
        <a-button v-if="operable" type="text" @click="viewOnly = !viewOnly">
          <template #icon>
            <antdIcons.FormOutlined v-if="viewOnly" />
            <antdIcons.EyeOutlined v-else />
          </template>
        </a-button>
      </a-space>
    </template>
    <template #footer>
      <template v-if="$slots['footer']">
        <slot name="footer" v-bind="formState" />
      </template>
      <template v-else>
        <a-button v-if="closable" type="default" @click="onCclClick">取消</a-button>
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
          @submit="(form: any, next: Function) => onSubFormSubmit(key, value, form, next)"
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
import * as antdIcons from '@ant-design/icons-vue/lib/icons'
import Mapper from '../types/mapper'
import { getProp, setProp } from '../utils'
import FormGroup from './FormGroup.vue'
import { cloneDeep } from 'lodash'
import { TinyEmitter as Emitter } from 'tiny-emitter'
import { onMounted, ref, watch, markRaw, type Raw, type PropType, toRef, computed } from 'vue'

type AntdIcons = keyof typeof antdIcons | ''

const emit = defineEmits([
  'initialize',
  'update:visible',
  'update:vwOnly',
  'submit',
  'before-submit'
])
const props = defineProps({
  visible: { type: Boolean, default: false },
  vwOnly: { type: Boolean, default: false },
  width: { type: String, default: '50vw' },
  lblWid: { type: Number, default: 4 },
  lblAlgn: { type: String, default: 'right' },
  title: { type: String, default: 'Form Dialog' },
  icon: { type: String, default: '' },
  newFun: { type: Function, default: () => ({}) },
  object: { type: Object, default: null },
  mapper: { type: Mapper, required: true },
  emitter: { type: Emitter, default: null },
  operable: { type: Boolean, default: false },
  closable: { type: Boolean, default: true },
  fullScreen: { type: Boolean, default: false },
  ignProps: { type: Array as PropType<string[]>, default: [] }
})
const vsbState = ref<boolean>(props.visible)
const iconState = ref<Raw<AntdIcons>>('')
const editable = ref(true)
const viewOnly = ref(false)
const okLoading = ref(false)
const formRef = ref()
const formMapper = toRef(props.mapper)
const formState = ref(updateState())
const formRules = computed(() => 
  Object.fromEntries(
    Object.entries(props.mapper).map(entry => {
      return [entry[0], entry[1].rules]
    })
  )
)
defineExpose({ formRef })

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
  props.emitter.on('delete:mprop', (mkeys: string[]) => {
    mkeys.map(key => delete formMapper.value[key])
  })
  props.emitter.on('viewOnly', (vwOnly: boolean) => {
    viewOnly.value = vwOnly
  })
}
onMounted(() => {
  emit('initialize')
  if (props.icon) {
    iconState.value = markRaw(antdIcons[props.icon as keyof typeof antdIcons]) as any
  }
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
    await formRef.value.refer.validateFields(
      Object.keys(props.mapper).filter(key => !props.ignProps.includes(key))
    )
    emit('submit', formState.value, () => {
      okLoading.value = false
      resetState()
      onDlgClose()
    })
  } catch (e) {
    console.log(e)
  }
}
function onCclClick() {
  resetState()
  onDlgClose()
}
function resetState() {
  if (formState.value.reset) {
    formState.value.reset()
  } else if (formRef.value) {
    formRef.value.refer.resetFields()
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
async function onSubFormSubmit(
  key: string | number,
  mapper: any,
  form: any,
  next: Function
) {
  const value = getProp(formState.value, key.toString())
  value.push(cloneDeep(form))
  mapper.emitter.emit('update:visible', false)
  value.onSaved && await value.onSaved(form, value)
  next()
}
</script>

<style lang="less">
.full-modal {
  .ant-modal {
    max-width: 100%;
    top: 0;
    padding-bottom: 0;
    margin: 0;
  }
  .ant-modal-content {
    display: flex;
    flex-direction: column;
    height: calc(100vh);
  }
  .ant-modal-body {
    flex: 1;
  }
}
</style>
