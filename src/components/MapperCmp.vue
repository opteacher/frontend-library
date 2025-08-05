<script setup lang="ts">
import type { MapperType } from '@/types/mapper'
import { TinyEmitter } from 'tiny-emitter'
import { ref, type PropType } from 'vue'

const props = defineProps({
  mapper: {
    type: Object as PropType<MapperType>,
    required: true
  },
  form: { type: Object, required: true },
  emitter: { type: TinyEmitter, default: null }
})
defineEmits(['update:form'])
const errMsgs = ref<string[]>([])

if (props.emitter) {
  props.emitter.on('check:rules', (callback: Function) => {
    errMsgs.value = []
    for (const rule of props.mapper.rules) {
      if (rule.required && !props.form[props.mapper.key]) {
        errMsgs.value.push(rule?.message as string)
      }
    }
    callback(errMsgs.value.length === 0)
  })
}
</script>

<template>
  <a-input
    v-if="mapper.type === 'Input'"
    class="w-full"
    :status="errMsgs.length ? 'error' : undefined"
    :placeholder="mapper.placeholder"
    v-model:value="form[mapper.key]"
  />
  <a-input-number
    v-else-if="mapper.type === 'Number'"
    class="w-full"
    :status="errMsgs.length ? 'error' : undefined"
    :placeholder="mapper.placeholder"
    v-model:value="form[mapper.key]"
  />
  <a-textarea
    v-else-if="mapper.type === 'Textarea'"
    class="w-full"
    :status="errMsgs.length ? 'error' : undefined"
    :rows="mapper.rows"
    :placeholder="mapper.placeholder"
    v-model:value="form[mapper.key]"
  />
  <a-select
    v-else-if="mapper.type === 'Select'"
    class="w-full"
    :status="errMsgs.length ? 'error' : undefined"
    :options="mapper.options"
    :placeholder="mapper.placeholder"
    v-model:value="form[mapper.key]"
  />
  <a-radio-group
    v-else-if="mapper.type === 'Radio'"
    class="w-full"
    button-style="solid"
    v-model:value="form[mapper.key]"
  >
    <template v-if="mapper.style === 'button'">
      <a-tooltip v-for="opn in mapper.options" :key="opn.value" color="#108ee9">
        <template #title>
          {{ opn.subLabel }}
        </template>
        <a-radio-button
          class="text-center"
          :value="opn.value"
          :style="{ width: 100 / mapper.options.length + '%' }"
        >
          {{ opn.label }}
        </a-radio-button>
      </a-tooltip>
    </template>
    <template v-else>
      <a-radio v-for="opn in mapper.options" :key="opn.value" :value="opn.value">
        {{ opn.label }}
      </a-radio>
    </template>
  </a-radio-group>
  <template v-else-if="mapper.type === 'Checkbox'">
    <a-checkbox-group
      v-if="mapper.options && mapper.options.length"
      :name="mapper.key"
      v-model:value="form[mapper.key]"
      :options="mapper.options"
    />
    <a-checkbox v-else :name="mapper.key" v-model:checked="form[mapper.key]">
      {{
        form[mapper.key]
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
      v-model:checked="form[mapper.key]"
      :checked-children="mapper.chkLabels ? mapper.chkLabels[1] : ''"
      :un-checked-children="mapper.chkLabels ? mapper.chkLabels[0] : ''"
    />
    <span v-if="mapper.placeholder">{{ mapper.placeholder }}</span>
  </a-space>
  <UploadFile
    v-else-if="mapper.type === 'UploadFile'"
    :form="form"
    :path="mapper.path"
    :params="mapper.params"
    :headers="mapper.headers"
    :directory="mapper.directory"
    v-model:value="form[mapper.key]"
    :onBeforeUpload="mapper.onBeforeUpload"
  />
  <ul class="list-none ps-0">
    <li v-for="msg in errMsgs">
      <a-typography-text type="danger">{{ msg }}</a-typography-text>
    </li>
  </ul>
</template>
