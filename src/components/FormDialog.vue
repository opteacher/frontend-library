<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :width="width"
    :confirmLoading="!editable || okLoading"
    :footer="viewOnly ? null : undefined"
    @cancel="onCclClick"
  >
    <template #footer>
      <template v-if="$slots['footer']">
        <slot name="footer" v-bind="formState" />
      </template>
      <template v-else>
        <a-button type="default" @click="onCclClick">取消</a-button>
        <a-button type="primary" @click="onOkClick">确定</a-button>
      </template>
    </template>
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
          v-model:show="value.show"
          :mapper="value.mapper"
          :copy="value.copy"
          :emitter="value.emitter"
          :object="value.editing"
          @submit="(form: any) => value.onSaved(form, form[key])"
        />
      </template>
      <template v-for="key in Object.keys(mapper)" #[key]="{ formState }">
        <slot :name="key" v-bind="{ formState }" />
      </template>
    </FormGroup>
  </a-modal>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import Column from '../types/column'
import Mapper from '../types/mapper'
import { defineComponent, onMounted, reactive, ref, watch } from 'vue'
import { TinyEmitter as Emitter } from 'tiny-emitter'
import FormGroup from './FormGroup.vue'

export default defineComponent({
  name: 'FormDialog',
  components: {
    FormGroup
  },
  props: {
    show: { type: Boolean, default: false },
    copy: { type: Function, required: true },
    width: { type: String, default: '50vw' },
    lblWid: { type: Number, default: 4 },
    title: { type: String, default: 'Form Dialog' },
    object: { type: Object, default: null },
    mapper: { type: Mapper, required: true },
    emitter: { type: Emitter, default: null }
  },
  emits: ['initialize', 'update:show', 'submit'],
  setup(props, { emit }) {
    const visible = ref(props.show)
    const editable = ref(true)
    const viewOnly = ref(false)
    const okLoading = ref(false)
    const formRef = ref()
    const formMapper = reactive(props.mapper)
    const formState = reactive(props.copy(props.object || {}))
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
        (args: { show: boolean; cpyRcd?: Function; viewOnly?: boolean }) => {
          if (!args.show) {
            visible.value = false
            return
          }
          viewOnly.value = typeof args.viewOnly != 'undefined' ? args.viewOnly : false
          if (args.cpyRcd) {
            args.cpyRcd(formState)
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
        visible.value = props.show
        if (show && props.object) {
          props.copy(props.object, formState)
        }
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
    return {
      Column,

      visible,
      formRef,
      formState,
      formRules,
      formMapper,
      editable,
      viewOnly,
      okLoading,

      onOkClick,
      onCclClick
    }
  }
})
</script>
