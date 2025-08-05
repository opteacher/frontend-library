<script setup lang="ts">
import type { MapperType } from '@/types/mapper';
import type { PropType } from 'vue';

defineProps({
  mapper: {
    type: Object as PropType<MapperType>, required: true
  },
  form: { type: Object, required: true }
})
defineEmits(['update:form'])
</script>

<template>
  <a-input
    v-if="mapper.type === 'Input'"
    class="w-full"
    :placeholder="mapper.placeholder"
    v-model:value="form[mapper.key]"
  />
  <a-input-number
    v-else-if="mapper.type === 'Number'"
    class="w-full"
    :placeholder="mapper.placeholder"
    v-model:value="form[mapper.key]"
  />
  <a-textarea
    v-else-if="mapper.type === 'Textarea'"
    class="w-full"
    :rows="mapper.rows"
    :placeholder="mapper.placeholder"
    v-model:value="form[mapper.key]"
  />
  <a-select
    v-else-if="mapper.type === 'Select'"
    class="w-full"
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
    <a-checkbox
      v-else
      :name="mapper.key"
      v-model:checked="form[mapper.key]"
    >
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
</template>